// Name: JavaScript Parser
// ID: P7JSParser
// Description: An extension for managing a sandboxed JavaScript instance.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: true
// Created: 12/18/2025
// Notes: Super buggy, work in progress

(function(Scratch) {
    'use strict';

    const vm = Scratch.vm;

    var DEFAULT_GLOBALS = {
        Object,
        Function,
        Boolean,
        Symbol,
        Error,
        Number,
        BigInt,
        Math,
        Date,
        String,
        RegExp,
        Array,
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        BigInt64Array,
        BigUint64Array,
        Map,
        Set,
        WeakMap,
        WeakSet,
        ArrayBuffer,
        DataView,
        Promise,
        Proxy,
        Reflect,
        JSON,
        Intl,
        console,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        isNaN,
        isFinite,
        parseInt,
        parseFloat,
        encodeURI,
        decodeURI,
        encodeURIComponent,
        decodeURIComponent
    };

    function loadLib(url, sandboxed = true) {
        return new Promise((resolve, reject) => {

            function guessName(url, keys) {
                const base = url.split('/').pop().split('.')[0].toLowerCase();
                let best = null;
                let score = -1;
                for (const k of keys) {
                    const kl = k.toLowerCase();
                    let s = 0;
                    if (kl === base) s = 100;
                    else if (kl.includes(base) || base.includes(kl)) s = 80;
                    else {
                        for (let i = 0; i < Math.min(kl.length, base.length); i++) {
                            if (kl[i] === base[i]) s++;
                            else break;
                        }
                    }
                    if (s > score) {
                        score = s;
                        best = k;
                    }
                }
                return best || keys[0] || null;
            }

            const wait = (ms) => new Promise(r => setTimeout(r, ms));

            function setupNetworkMonitor(win) {
                let activeRequests = 0;
                let onIdleResolve = null;
                const originalFetch = win.fetch;

                win.fetch = function(...args) {
                    activeRequests++;
                    return originalFetch.apply(this, args).finally(() => {
                        activeRequests--;
                        if (activeRequests === 0 && onIdleResolve) {
                            onIdleResolve();
                        }
                    });
                };

                return {
                    waitForIdle: () => {
                        return new Promise(r => {
                            if (activeRequests === 0) r();
                            else onIdleResolve = r;
                        });
                    },
                    restore: () => {
                        win.fetch = originalFetch;
                    }
                };
            }

            const iframeMode = sandboxed;

            let win;
            let iframe = null;

            if (iframeMode) {
                iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                if (sandboxed) iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-presentation';
                document.body.appendChild(iframe);
                win = iframe.contentWindow;
            } else {
                win = window;
            }

            const netMon = setupNetworkMonitor(win);
            
            const before = new Set(Object.getOwnPropertyNames(win));
            
            const script = win.document.createElement('script');
            script.src = url;

            script.onload = async () => {
                try {
                    await netMon.waitForIdle();
                    
                    await wait(200);

                    netMon.restore();

                    const after = Object.getOwnPropertyNames(win);
                    var addedKeys = [];
                    const added = {};
                    for (const k of after) {
                        if (!before.has(k)) {
                            added[k] = win[k];
                            addedKeys.push(k);
                        }
                    }

                    var name = guessName(url, addedKeys);

                    if (iframeMode && iframe) {
                        iframe.id = `LoadedLib-${name}`;
                    }

                    if (!sandboxed && addedKeys.length === 0) {
                        netMon.restore();
                        script.remove();
                        loadLib(url, true).then(({ added2, name2, lib }) => {
                            const realAdded = {};
                            if (!added2) {
                                deloadLib(name, true);
                                throw new Error('Library failed to load');
                            }
                            for (const k of Object.keys(added2)) {
                                realAdded[k] = window[k];
                            }
                            added = realAdded;
                            name = name2;
                        });
                        deloadLib(name, true);
                    }

                    script.onerror = () => {
                        netMon.restore();
                        script.remove();
                        reject(new Error('Library failed to start'));
                    };

                    script.id = `LoadedScript-${name}`;
                    resolve({ added, name, lib: added[name] });
                } catch (err) {
                    reject(err);
                }
            };

            script.onerror = e => {
                netMon.restore();
                reject(e);
            };

            win.document.head.appendChild(script);
        });
    }

    function deloadLib(input, ignoreUnsandboxed) {
        if (input === "all") {
            const iframes = document.querySelectorAll("iframe[id^='LoadedLib-']");
            iframes.forEach(f => f.remove());
            if (!ignoreUnsandboxed) {
                const scripts = document.querySelectorAll("script[id^='LoadedScript-']");
                scripts.forEach(script => {
                    loadLib(script.src, true).then(({ added, name, lib }) => {
                        for (const k of Object.keys(added)) {
                            delete window[k];
                        }
                    });
                    script.remove();
                });
            }
        } else {
            const id = `LoadedLib-${input}`;
            const iframe = document.getElementById(id);
            if (iframe) iframe.remove();
            if (!ignoreUnsandboxed) {
                const sid = `LoadedScript-${input}`;
                const script = document.getElementById(sid);
                if (script) {
                    loadLib(script.src, true).then(({ added, name, lib }) => {
                        for (const k of Object.keys(added)) {
                            delete window[k];
                        }
                    });
                    script.remove();
                }
            }
        }
    }

    class JSParser {
        constructor() {
            this.Persistent = {};
            this._triggeringFunction = null;
            this._customGlobals = {};
            this._timeout = 30000;
            this.sandboxedTiemout = null;

            vm.runtime.on('PROJECT_LOADED', () => {
                this.deloadLib("all");
            });
        }

        get runtime() {
            return vm.runtime;
        }

        getInfo() {
            return {
                id: 'P7JSParser',
                name: 'JavaScript Parser',
                color1: '#4a4a4a',
                blocks: [
                    {
                        opcode: 'runNoReturn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'run JS [CODE]',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'data.myData = 123;'
                            }
                        }
                    },

                    {
                        opcode: 'runAndReturn',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'run JS [CODE] and return',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Math.random();'
                            }
                        }
                    },
                    {
                        opcode: 'runAndReturnBool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'run JS [CODE] and return',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Math.random() >= 0.5;'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'listToNLString',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get list [LIST] as code',
                        hideFromPalette: !Scratch.extensions.isPenguinMod, // This block does not work in TurboWarp
                        disableMonitor: true,
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'allLists'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'setMem',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Send data [TEXT] as [VAR]',
                        arguments: {
                            VAR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myData'
                            },
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '123'
                            }
                        }
                    },
                    {
                        opcode: 'removeMem',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove [VAR] from data',
                        arguments: {
                            VAR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myData'
                            }
                        }
                    },
                    {
                        opcode: 'getMem',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get [VAR] from data',
                        disableMonitor: true,
                        arguments: {
                            VAR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'myData'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'onFunction',
                        blockType: Scratch.BlockType.HAT,
                        text: 'Handle function [NAME] with [functionInputs]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'function1' },
                            functionInputs: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        },
                        isEdgeActivated: false,
                        hideFromPalette: true
                    },

                    {
                        blockType: Scratch.BlockType.XML,
                        xml: `
                            <block type="P7JSParser_onFunction">
                                <value name="NAME">
                                    <shadow type="text">
                                        <field name="TEXT">function1</field>
                                    </shadow>
                                </value>
                                <value name="functionInputs">
                                    <block type="P7JSParser_getInputsToArray"/>
                                </value>
                            </block>
                        `
                    },

                    {
                        opcode: 'getInputsToList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set list [LIST] to received inputs',
                        hideFromPalette: !Scratch.extensions.isPenguinMod, // This block does not work in TurboWarp
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'allLists'
                            }
                        }
                    },
                    {
                        opcode: 'getInputsToArray',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Received inputs',
                        hideFromPalette: true
                    },

                    {
                        opcode: 'returnResult',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Return string [VALUE]',
                        isTerminal: true,
                        arguments: {
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },

                    "---",

                    // Possibly dangerous blocks
                    {
                        opcode: 'addLib',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Load library [URL]',
                        arguments: {
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://p7scratchextensions.pages.dev/ext/BoxedPhysics/aslib.js' },
                            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'loadTypes' }
                        }
                    },
                    {
                        opcode: 'removeLib',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove library [LIB]',
                        arguments: {
                            LIB: { type: Scratch.ArgumentType.STRING, defaultValue: 'all' }
                        }
                    },
                ],
                menus: {
                    allLists: {
                        acceptReporters: true,
                        items: '_getLists'
                    },
                    loadTypes: {
                        items: [
                            { text: 'Sandboxed', value: "1" },
                            { text: 'Unsandboxed', value: "0" }
                        ]
                    }
                }
            };
        }

        _getLists() {
            const lists = new Set();
            if (this.runtime && this.runtime.targets) {
                this.runtime.targets.forEach(target => {
                    if (target.variables) {
                        for (const id in target.variables) {
                            if (target.variables[id].type === 'list') {
                                lists.add(target.variables[id].name);
                            }
                        }
                    }
                });
            }
            const listArray = Array.from(lists);
            return listArray.length > 0 ? listArray : ['Select a list'];
        }

        _executeIsolated(code) {
            // Detatch main globals so they reset every time
            const sandboxTarget = Object.assign({}, DEFAULT_GLOBALS, this._customGlobals);

            // Persistent mem can be changed
            sandboxTarget.data = this.Persistent;

            // Allow changing max execution time
            sandboxTarget.SetMaxExecutionTime = (ms) => {
                const val = parseInt(ms);
                if (!isNaN(val) && val > 0) {
                    this._timeout = val;
                }
            };

            const availableFunctions = this._scanFunctions();
            availableFunctions.forEach(funcName => {
                sandboxTarget[funcName] = (...args) => {
                    return this.RunFunction(funcName, args);
                };
            });

            const proxy = new Proxy(sandboxTarget, {
                has: (target, key) => true,
                get: (target, key, receiver) => {
                    if (key === Symbol.unscopables) return undefined;
                    if (['window', 'self', 'globalThis'].includes(key)) return receiver;
                    return target[key];
                },
                set: (target, key, value) => {
                    if (['window', 'self', 'globalThis'].includes(key)) return false;
                    target[key] = value;
                    return true;
                }
            });

            code = code.replace(/\[nl\]/g, '\n');

            try {
                const runner = new Function('__scope__', `
                    with(__scope__) {
                        return (async function() {
                            "use strict";
                            try {
                                ${code}
                            } catch (err) {
                                const match = err.stack.match(/<anonymous>:(\\d+):\\d+/);
                                let lineNumber = match ? parseInt(match[1], 10) - 7 : 1;
                                return \`Error: \${err.message} at line \${lineNumber}\`;
                            }
                        }).call(__scope__);
                    }
                `);

                return runner(proxy);
            } catch (err) {
                console.error(err);
                return `Internal error: ${err.message}`;
            }
        }

        _scanFunctions() {
            const functions = new Set();
            if (!this.runtime || !this.runtime.targets) return [];

            this.runtime.targets.forEach(target => {
                if (!target.blocks) return;
                const blocks = target.blocks._blocks;

                for (const id in blocks) {
                    const block = blocks[id];
                    if (block.opcode === 'P7JSParser_onFunction') {
                        const inputs = block.inputs;
                        if (inputs?.NAME?.block) {
                            const childId = inputs.NAME.block;
                            const childBlock = blocks[childId];
                            if (childBlock?.fields?.TEXT?.value) {
                                functions.add(childBlock.fields.TEXT.value);
                            } else if (childBlock.fields.VARIABLE) {
                                const varcontent = target.lookupVariableById(childBlock.fields.VARIABLE.id);
                                if (varcontent) {
                                    functions.add(varcontent.value);
                                }
                            } else if (childBlock.fields.LIST) {
                                const listId = childBlock.fields.LIST.id;
                                const listName = childBlock.fields.LIST.value;

                                let listVar = target.lookupVariableById(listId);

                                if (!listVar) {
                                    const stage = this.runtime.getTargetForStage();
                                    if (stage && stage.variables) {
                                        if (stage.variables[listId]) {
                                            listVar = stage.variables[listId];
                                        } 
                                        else {
                                            for (const id in stage.variables) {
                                                if (stage.variables[id].name === listName && stage.variables[id].type === 'list') {
                                                    listVar = stage.variables[id];
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                                if (listVar && Array.isArray(listVar.value)) {
                                    listVar.value.forEach(item => {
                                        functions.add(item);
                                    });
                                }
                            }
                        }
                    }
                }
            });

            return Array.from(functions);
        }

        RunFunction(commandName, args) {
            return new Promise((resolve) => {
                if (!commandName) {
                    resolve("");
                    return;
                }

                this._triggeringFunction = commandName;
                const threads = this.runtime.startHats('P7JSParser_onFunction');
                this._triggeringFunction = null;

                if (threads.length === 0) {
                    // resolve(`Uncaught TypeError: ${commandName} is not a function`);
                    resolve(`Uncaught ReferenceError: ${commandName} is not defined`);
                    return;
                }

                const availableFunctions = this._scanFunctions();
                if (!availableFunctions.includes(commandName)) {
                    resolve(`Uncaught ReferenceError: ${commandName} is not defined`);
                    return;
                }

                let handled = false;
                threads.forEach(thread => {
                    thread.customData = thread.customData || {};
                    thread.customData.ParserDataJS = {
                        command: commandName,
                        args: args,
                        resolve: (val) => {
                            if (!handled) {
                                handled = true;
                                resolve(val);
                            }
                        }
                    };
                });

                setTimeout(() => {
                    if (!handled) {
                        handled = true;
                        resolve("RangeError: Execution timeout");
                    }
                }, this._timeout);
            });
        }

        async runAndReturn(args, util) {
            const blockId = util.thread.peekStack();
            const target = util.target;
            const blocks = target.blocks;
            const currentBlock = blocks.getBlock(blockId);

            if (currentBlock && currentBlock.inputs.CODE && currentBlock.inputs.CODE.block) {
                const connectedBlockId = currentBlock.inputs.CODE.block;
                const connectedBlock = blocks.getBlock(connectedBlockId);

                if (connectedBlock && connectedBlock.opcode === 'data_listcontents') {
                    const listField = connectedBlock.fields.LIST;
                    const listVar = target.lookupVariableById(listField.id);

                    args.CODE = listVar.value.join('[nl]');
                }
            }

            const result = this._executeIsolated("return " + args.CODE);

            try {
                var val = result instanceof Promise ? await result : result;
                if (val === undefined) return 'undefined';
                if (val === null) return 'null';
                if (typeof val === 'object') return JSON.stringify(val);
                return String(val);
            } catch (err) {
                return err.toString();
            }
        }

        async runAndReturnBool(args, util) {
            const blockId = util.thread.peekStack();
            const target = util.target;
            const blocks = target.blocks;
            const currentBlock = blocks.getBlock(blockId);

            if (currentBlock && currentBlock.inputs.CODE && currentBlock.inputs.CODE.block) {
                const connectedBlockId = currentBlock.inputs.CODE.block;
                const connectedBlock = blocks.getBlock(connectedBlockId);

                if (connectedBlock && connectedBlock.opcode === 'data_listcontents') {
                    const listField = connectedBlock.fields.LIST;
                    const listVar = target.lookupVariableById(listField.id);

                    args.CODE = listVar.value.join('[nl]');
                }
            }

            return (await this._executeIsolated("return " + args.CODE)) ? true : false;
        }

        async runNoReturn(args, util) {
            const blockId = util.thread.peekStack();
            const target = util.target;
            const blocks = target.blocks;
            const currentBlock = blocks.getBlock(blockId);

            if (currentBlock && currentBlock.inputs.CODE && currentBlock.inputs.CODE.block) {
                const connectedBlockId = currentBlock.inputs.CODE.block;
                const connectedBlock = blocks.getBlock(connectedBlockId);

                if (connectedBlock && connectedBlock.opcode === 'data_listcontents') {
                    const listField = connectedBlock.fields.LIST;
                    const listVar = target.lookupVariableById(listField.id);

                    args.CODE = listVar.value.join('[nl]');
                }
            }

            return this._executeIsolated(args.CODE);
        }

        setMem(args) {
            if (args.VAR && args.TEXT !== null) {
                this.Persistent[args.VAR] = args.TEXT;
            }
        }

        removeMem(args) {
            if (args.VAR) {
                delete this.Persistent[args.VAR];
            }
        }

        getMem(args) {
            if (args.VAR && args.VAR in this.Persistent) {
                var data = this.Persistent[args.VAR];
                try {
                    if (data === undefined) return 'undefined';
                    if (data === null) return 'null';
                    if (typeof data === 'object') return JSON.stringify(data);
                    return String(data);
                } catch (err) {
                    return err.toString();
                }
            }
            return '';
        }

        onFunction(args, util) {
            if (!this._triggeringFunction) return false;
            var nameArg = args.NAME;

            const blockId = util.thread.peekStack();
            const target = util.target;
            const blocks = target.blocks;
            const currentBlock = blocks.getBlock(blockId);

            if (currentBlock && currentBlock.inputs.NAME && currentBlock.inputs.NAME.block) {
                const connectedBlockId = currentBlock.inputs.NAME.block;
                const connectedBlock = blocks.getBlock(connectedBlockId);

                if (connectedBlock && connectedBlock.opcode === 'data_listcontents') {

                    const listField = connectedBlock.fields.LIST;
                    const listVar = target.lookupVariableById(listField.id);

                    if (listVar && listVar.value) {
                        return listVar.value.includes(this._triggeringFunction);
                    }
                }
            }

            if (Array.isArray(nameArg)) {
                return nameArg.includes(this._triggeringFunction);
            }

            if (typeof nameArg === 'string' && nameArg.trim().startsWith('[') && nameArg.trim().endsWith(']')) {
                try {
                    const parsedList = JSON.parse(nameArg);
                    if (Array.isArray(parsedList)) {
                        return parsedList.includes(this._triggeringFunction);
                    }
                } catch (e) {}
            }

            return nameArg === this._triggeringFunction;
        }

        getInput(util) {
            if (util.thread.customData && util.thread.customData.ParserDataJS) {
                return util.thread.customData.ParserDataJS.args;
            }
            return [];
        }

        getInputsToList(args, util) {
            const listName = args.LIST;
            if (!listName || listName === 'Select a list') return;

            const rawInput = this.getInput(util);
            const inputs = Array.isArray(rawInput) ? rawInput : [rawInput];

            const target = util.target;
            const stage = this.runtime.getTargetForStage();

            let listVar = util.target.lookupVariableByNameAndType(listName, "list");

            if (listVar) {
                listVar.value = inputs;
                if (listVar._monitorUpToDate !== undefined) listVar._monitorUpToDate = false;
            }
        }
        getInputsToArray(_, util) {
            const rawInput = this.getInput(util);
            const inputs = Array.isArray(rawInput) ? rawInput : [rawInput];

            return JSON.stringify(inputs);
        }

        returnResult(args, util) {
            if (util.thread.customData && util.thread.customData.ParserDataJS) {
                const session = util.thread.customData.ParserDataJS;
                if (session.resolve) {
                    session.resolve(args.VALUE);
                    session.resolve = null; 
                }
            }
        }

        listToNLString(args, util) {
            const listName = args.LIST;
            if (!listName || listName === 'Select a list') return '';
            const listVar = util.target.lookupVariableByNameAndType(listName, 'list');
            if (!listVar || !Array.isArray(listVar.value)) return '';
            return listVar.value.join('[nl]');
        }

        async addLib(args) {
            var { URL, TYPE } = args;

            if (!Scratch.canFetch(URL)) {
                console.error(`Denied loading load library from ${URL}`);
                return;
            }

            const sandboxed = TYPE != 0;
            if (!this.sandboxedTiemout) {
                if (!await Scratch.canUnsandbox()) {
                    console.error("Denied unsandboxed permission");
                    return;
                } else {
                    clearTimeout(this.sandboxedTiemout);
                    this.sandboxedTiemout = setTimeout(() => {
                        this.sandboxedTiemout = null;
                    }, 5000); // Unsandboxed permission only lasts 5 seconds
                }
            }

            return loadLib(URL, sandboxed).then(({ added, name, lib }) => {
                if (Object.keys(added).length > 1) {
                    this.addObject(name, added, false);
                } else {
                    this.addObject(name, lib, false);
                }
                console.log(`Loaded library ${URL} as ${name}`, added);
            }).catch(err => {
                console.error(`Failed to load library ${URL}:`, err);
            });
        }

        removeLib(args) {
            var { LIB } = args;
            if (LIB === "all") {
                const iframes = document.querySelectorAll("iframe[id^='LoadedLib-']");
                iframes.forEach(frame => {
                    var name = frame.id.replace('LoadedLib-', '');
                    this.removeObject(name, false);
                });
                const scripts = document.querySelectorAll("script[id^='LoadedScript-']");
                scripts.forEach(script => {
                    var name = script.id.replace('LoadedScript-', '');
                    this.removeObject(name, false);
                });
                deloadLib("all");
            } else {
                this.removeObject(LIB, false);
                deloadLib(LIB);
                this.removeObject(LIB, false);
            }
        }

        // Scratch.vm.runtime._primitives.P7JSParser_addObject(name, object, false)
        // Scratch.vm.runtime._primitives.P7JSParser_removeObject(name, false)
        // Scratch.vm.runtime._primitives.P7JSParser_getObject(name, false)
        addObject(name, obj, canChange) {
            if (name && obj !== null) {
                this[canChange ? "Persistent" : "_customGlobals"][name] = obj;
            }
        }
        removeObject(name, canChange) {
            if (name) {
                delete this[canChange ? "Persistent" : "_customGlobals"][name];
            }
        }
        getObject(name, canChange) {
            return this[canChange ? "Persistent" : "_customGlobals"][name] = obj;
        }
    }

    Scratch.extensions.register(new JSParser());

    window.JSParser = {
        addObject: (a1, a2, a3) => {
            Scratch.vm.runtime._primitives.P7JSParser_addObject(a1, a2, a3);
        },
        removeObject: (a1, a2) => {
            Scratch.vm.runtime._primitives.P7JSParser_removeObject(a1, a2);
        },
        getObject: (a1, a2) => {
            Scratch.vm.runtime._primitives.P7JSParser_getObject(a1, a2);
        }
    };

    // Replace block on use
    setTimeout(() => {
        if (!ScratchBlocks || !ScratchBlocks.Blocks.P7JSParser_onFunction) {
            return;
        }

        const originalInit = ScratchBlocks.Blocks.P7JSParser_onFunction.init;

        ScratchBlocks.Blocks.P7JSParser_onFunction.init = function() {
            if (originalInit) {
                originalInit.call(this);
            }

            this.setOnChange(function() {
                if (!this.workspace || this.isInFlyout) return;
                if (this.workspace.isDragging()) return;

                const input = this.getInput('functionInputs');
                if (input && !input.connection.targetConnection) {
                    ScratchBlocks.Events.disable();
                    try {
                        const newBlock = this.workspace.newBlock("P7JSParser_getInputsToArray");
                        newBlock.initSvg();
                        newBlock.render();
                        newBlock.outputConnection.connect(input.connection);
                    } finally {
                        ScratchBlocks.Events.enable();
                    }
                }
            });
        };
    }, 100);
})(Scratch);
