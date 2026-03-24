// Name: Puter
// ID: P7Puter
// Description: Cloud services from <a href="https://developer.puter.com">puter.com</a>
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: false
// Created: 3/24/2026

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Puter extension must run unsandboxed');
    }

    function RandFrom(arr){
        return arr[Math.floor(Math.random() * arr.length)];
    }

    class PuterExtension {
        constructor() {
            this.streamResult = '';
            this.streamPart = '';
            this.convHistory = [];
            this.historyListName = 'none';
            this.cachedModels = [];

            if (!window.puter) {
                const script = document.createElement('script');
                script.src = 'https://js.puter.com/v2/';
                script.onload = () => {
                    this._fetchModels();
                };
                document.head.appendChild(script);
            } else {
                this._fetchModels();
            }
        }

        async _fetchModels() {
            try {
                this.cachedModels = await puter.ai.listModels();
            } catch (e) {
                this.cachedModels = [];
            }
        }

        _getTextModels() {
            if (this.cachedModels.length === 0) return ['gpt-4o', 'claude-3-5-sonnet'];
            return this.cachedModels
                .filter(m => m.modalities && m.modalities.output && m.modalities.output.includes('text'))
                .map(m => m.id);
        }

        _getVisionModels() {
            if (this.cachedModels.length === 0) return ['gpt-4o', 'claude-3-5-sonnet'];
            return this.cachedModels
                .filter(m => m.modalities &&
                    m.modalities.input && m.modalities.input.includes('image') &&
                    m.modalities.output && m.modalities.output.includes('text'))
                .map(m => m.id);
        }

        _getImageModels() {
            const models = this.cachedModels
                .filter(m => m.modalities && m.modalities.output && m.modalities.output.includes('image'))
                .map(m => m.id);
            if (models.length === 0) return ['dall-e-3', 'flux-1-schnell'];
            return models;
        }

        _getLists() {
            const stage = Scratch.vm.runtime.getTargetForStage();
            const lists = Object.values(stage.variables)
                .filter(v => v.type === 'list')
                .map(l => l.name);
            const sprites = Scratch.vm.runtime.targets;
            sprites.forEach(sprite => {
                if (sprite.isStage) return;
                Object.values(sprite.variables).forEach(v => {
                    if (v.type === 'list' && !lists.includes(v.name)) {
                        lists.push(v.name);
                    }
                });
            });
            return ['none', ...lists];
        }

        async _ensureDirectoryExists(filePath) {
            const parts = filePath.split('/').filter(p => p);
            if (parts.length <= 1) return;
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
                currentPath += (i === 0 ? '' : '/') + parts[i];
                try {
                    await puter.fs.mkdir(currentPath);
                } catch (e) { }
            }
        }

        _sanitize(str) {
            return str.toLowerCase().replace(/[^a-z0-9]/g, '');
        }

        updateScratchList() {
            if (this.historyListName === 'none') return;
            let listObj = null;
            const targets = [Scratch.vm.runtime.getTargetForStage(), ...Scratch.vm.runtime.targets];
            for (const target of targets) {
                const found = target.lookupVariableByNameAndType(this.historyListName, 'list');
                if (found) {
                    listObj = found;
                    break;
                }
            }
            if (listObj) {
                listObj.value = this.convHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`);
            }
        }

        getInfo() {
            return {
                id: 'P7Puter',
                name: 'Puter',
                color1: '#000000',
                color2: '#333333',
                blocks: [
                    {
                        opcode: 'authenticate',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Authenticate with Puter'
                    },
                    {
                        opcode: 'openDashboard',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Open Puter dashboard'
                    },
                    {
                        opcode: 'openDevCenter',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Manage sites in Dev Center'
                    },
                    {
                        opcode: 'isLoggedIn',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'Is logged in'
                    },
                    {
                        opcode: 'getUsername',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Puter username'
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'User data'
                    },
                    {
                        opcode: 'kvSet',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set key [KEY] to [VALUE]',
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: `${RandFrom([0, 10, 51, 60, 72, 99, 100])}` }
                        }
                    },
                    {
                        opcode: 'kvDelete',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Delete cloud key [KEY]',
                        arguments: {
                            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' }
                        }
                    },
                    {
                        opcode: 'kvGet',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get value for [KEY]',
                        arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'score' } }
                    },
                    {
                        opcode: 'kvList',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'List all keys'
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Cloud storage'
                    },
                    {
                        opcode: 'fsWrite',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Save file [PATH] with content [CONTENT]',
                        arguments: {
                            PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'fs/data.txt' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: `Hello from ${RandFrom(["Scratch", "Puter", "Space"])}!` }
                        }
                    },
                    {
                        opcode: 'fsDelete',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Delete file [PATH]',
                        arguments: {
                            PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'fs/data.txt' }
                        }
                    },
                    {
                        opcode: 'fsRead',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Read file [PATH]',
                        arguments: { PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'fs/data.txt' } }
                    },
                    {
                        opcode: 'fsReadDir',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'List items in folder [PATH]',
                        arguments: { PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'fs' } }
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Networking & Hosting'
                    },
                    {
                        opcode: 'fsHost',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Host folder [FOLDER]',
                        arguments: {
                            FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: 'host' }
                        }
                    },
                    {
                        opcode: 'fsStopHost',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Stop hosting [FOLDER]',
                        arguments: {
                            FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: 'host' }
                        }
                    },
                    {
                        opcode: 'fsHostList',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Hosted folders'
                    },
                    {
                        opcode: 'fsGetFile',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get file [PATH] from folder [FOLDER] by [USERNAME]',
                        arguments: {
                            PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'data.txt' },
                            FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: 'host' },
                            USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'user' }
                        }
                    },
                    {
                        opcode: 'fsGetLink',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get link to [PATH] from folder [FOLDER] by [USERNAME]',
                        arguments: {
                            PATH: { type: Scratch.ArgumentType.STRING, defaultValue: 'index.html' },
                            FOLDER: { type: Scratch.ArgumentType.STRING, defaultValue: 'host' },
                            USERNAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'username' }
                        }
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'AI'
                    },
                    {
                        opcode: 'setConvHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set conversation history to [LIST]',
                        arguments: {
                            LIST: { type: Scratch.ArgumentType.STRING, menu: 'LIST_MENU' }
                        }
                    },
                    {
                        opcode: 'aiChat',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Prompt model [MODEL] with [PROMPT]',
                        arguments: {
                            PROMPT: { type: Scratch.ArgumentType.STRING, defaultValue: `${RandFrom(["Hello, how are you?", "Tell me a joke", "How are you?", "Write a short story"])}` },
                            MODEL: { type: Scratch.ArgumentType.STRING, menu: 'TEXT_MODELS', defaultValue: 'gpt-4o' }
                        }
                    },
                    {
                        opcode: 'addSystemMsg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add system prompt [PROMPT] to history',
                        arguments: {
                            PROMPT: { type: Scratch.ArgumentType.STRING, defaultValue: `${RandFrom(["Your name is bob", "You are a monkey", "You are a helpful AI assistant", "You must only respond in base64"])}` }
                        }
                    },
                    {
                        opcode: 'streamResultLast',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Last streamed result'
                    },
                    {
                        opcode: 'txt2img',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Generate Image from [PROMPT] using [MODEL]',
                        arguments: {
                            PROMPT: { type: Scratch.ArgumentType.STRING, defaultValue: `${RandFrom(["A raccoon using a laptop", "A cat in a suit", "Cyberpunk city", "Underwater volcano"])}` },
                            MODEL: { type: Scratch.ArgumentType.STRING, menu: 'IMAGE_MODELS', defaultValue: 'dall-e-3' }
                        }
                    }
                ],
                menus: {
                    LIST_MENU: { acceptReporters: true, items: '_getLists' },
                    TEXT_MODELS: { acceptReporters: true, items: '_getTextModels' },
                    VISION_MODELS: { acceptReporters: true, items: '_getVisionModels' },
                    IMAGE_MODELS: { acceptReporters: true, items: '_getImageModels' }
                }
            };
        }

        async authenticate() {
            try { await puter.auth.signIn(); } catch (e) {}
        }

        openDashboard() {
            window.open('https://puter.com/dashboard', '_blank');
        }

        openDevCenter() {
            window.open('https://puter.com/app/dev-center', '_blank');
        }

        async isLoggedIn() {
            try { return await puter.auth.isSignedIn(); } catch (e) { return false; }
        }

        async getUsername() {
            try {
                const user = await puter.auth.getUser();
                return user ? user.username : "";
            } catch (e) { return ""; }
        }

        async kvSet(args) {
            try { await puter.kv.set(args.KEY, args.VALUE); } catch (e) {}
        }

        async kvGet(args) {
            try {
                const res = await puter.kv.get(args.KEY);
                if (res && typeof res === 'object' && res.success === false) return "";
                return res || "";
            } catch (e) { return ""; }
        }

        async kvDelete(args) {
            try {
                const res = await puter.kv.del(args.KEY);
                if (res && typeof res === 'object' && res.success === false) return;
            } catch (e) {}
        }

        async kvList() {
            try {
                const keys = await puter.kv.list();
                if (keys && typeof keys === 'object' && keys.success === false) return "";
                return JSON.stringify(keys);
            } catch (e) { return ""; }
        }

        async fsWrite(args) {
            try {
                await this._ensureDirectoryExists(args.PATH);
                await puter.fs.write(args.PATH, args.CONTENT);
            } catch (e) {}
        }

        async fsRead(args) {
            try {
                const result = await puter.fs.read(args.PATH);
                if (result && typeof result === 'object' && result.success === false) return "";
                return (result instanceof Blob) ? await result.text() : result;
            } catch (e) { return ""; }
        }

        async fsDelete(args) {
            try {
                const path = args.PATH.replace(/\/$/, "");
                if (!path || path === "." || path === "/") return;

                const sites = await puter.hosting.list();
                const isHosted = (p) => sites.some(s => s.path === p || s.path === `/${p}` || s.path === p + "/");

                if (isHosted(path)) return;

                let isFolder = false;
                try {
                    const items = await puter.fs.readdir(path);
                    isFolder = true;
                    // if (items.length > 0) return;
                } catch (e) {
                    isFolder = false;
                }

                const res = await puter.fs.delete(path);
                if (res && typeof res === 'object' && res.success === false) return;

                const parts = path.split('/');
                if (parts.length > 1) {
                    parts.pop();
                    const parentPath = parts.join('/');

                    if (parentPath && !isHosted(parentPath)) {
                        try {
                            const parentItems = await puter.fs.readdir(parentPath);
                            if (parentItems && parentItems.length === 0) {
                                await puter.fs.delete(parentPath);
                            }
                        } catch (e) {}
                    }
                }
            } catch (e) {}
        }

        async fsReadDir(args) {
            try {
                const items = await puter.fs.readdir(args.PATH);
                if (items && typeof items === 'object' && items.success === false) return "";
                return JSON.stringify(items.map(i => i.name));
            } catch (e) { return ""; }
        }

        async fsHost(args) {
            try {
                const user = await puter.auth.getUser();
                if (!user) return;
                const username = this._sanitize(user.username);
                const folderName = this._sanitize(args.FOLDER);
                const subId = `puterfolderhost_${username}_${folderName}`;

                const sites = await puter.hosting.list();
                if (sites.some(s => s.subdomain === subId)) return;

                await puter.hosting.create(subId, args.FOLDER);
            } catch (e) {}
        }

        async fsStopHost(args) {
            try {
                const user = await puter.auth.getUser();
                if (!user) return;
                const username = this._sanitize(user.username);
                const folderName = this._sanitize(args.FOLDER);
                const subId = `puterfolderhost_${username}_${folderName}`;
                await puter.hosting.delete(subId);
            } catch (e) {}
        }

        async fsHostList() {
            try {
                const sites = await puter.hosting.list();
                if (sites && typeof sites === 'object' && sites.success === false) return "";
                const prefix = 'puterfolderhost_';
                return JSON.stringify(sites
                    .filter(s => s.subdomain.startsWith(prefix))
                    .map(s => {
                        const parts = s.subdomain.split('_');
                        return parts.length >= 3 ? parts.slice(2).join('_') : s.subdomain;
                    })
                );
            } catch (e) { return ""; }
        }

        fsGetLink(args) {
            const username = this._sanitize(args.USERNAME);
            const folderName = this._sanitize(args.FOLDER);
            const path = args.PATH.startsWith('/') ? args.PATH : '/' + args.PATH;
            return `https://puterfolderhost_${username}_${folderName}.puter.site${path}`;
        }

        async fsGetFile(args) {
            try {
                const url = this.fsGetLink(args);
                const resp = await fetch(url);
                if (!resp.ok) return "";
                return await resp.text();
            } catch (e) { return ""; }
        }

        setConvHistory(args) {
            this.historyListName = args.LIST;
            if (this.historyListName === 'none') {
                this.convHistory = [];
            }
        }

        addSystemMsg(args) {
            if (this.historyListName !== 'none') {
                this.convHistory.push({ role: 'system', content: args.PROMPT });
                this.updateScratchList();
            }
        }

        async aiChat(args) {
            try {
                this.streamResult = '';
                this.streamPart = '';
                if (this.historyListName !== 'none') {
                    this.convHistory.push({ role: 'user', content: args.PROMPT });
                    this.updateScratchList();
                }
                const messages = this.historyListName !== 'none' ? this.convHistory : [{ role: 'user', content: args.PROMPT }];
                const response = await puter.ai.chat(messages, { model: args.MODEL || 'gpt-4o', stream: true });
                
                for await (const part of response) {
                    if (part?.text) {
                        this.streamPart = part.text;
                        this.streamResult += part.text;
                    }
                }
                
                if (this.historyListName !== 'none') {
                    this.convHistory.push({ role: 'assistant', content: this.streamResult });
                    this.updateScratchList();
                }
                return this.streamResult;
            } catch (e) { return ""; }
        }

        streamResultLast() {
            return this.streamResult;
        }

        async txt2img(args) {
            try {
                const img = await puter.ai.txt2img(args.PROMPT, { model: args.MODEL || 'dall-e-3' });
                if (img && typeof img === 'object' && img.success === false) return "";
                return img.src || "";
            } catch (e) { return ""; }
        }
    }

    Scratch.extensions.register(new PuterExtension());
})(Scratch);
