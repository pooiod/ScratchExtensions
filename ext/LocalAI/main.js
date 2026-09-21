// Name: Local AI
// ID: P7BoxPhys
// Description: Use local text models from inside your browser.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: false
// Updated: 9/21/2026
// Created: 9/18/2026

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Local AI won\'t work in the sandbox!');
    }

    let webllm = null;
    let engine = null;
    let initAbortController = null;
    let isPenguinmod = Scratch.BlockShape && Scratch.BlockShape.SQUARE;
    const prefillsizechunk = (navigator.deviceMemory >= 10 ? navigator.deviceMemory / 2 : 5) * 512;

    let currentModelId = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
    let loadingStatus = "Loading";
    let isEngineReady = false;
    let modelLoadFailed = false;
    let loadProgressPercent = 0;

    let lastFullResponse = "";
    let lastStreamChunk = "";
    let cancelStreamFlag = false;

    let ModelMenu = [{
        text: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
        value: 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
    }];
    let modelMetadataMap = {};

    function updateModelMenu() {
        const keys = Object.keys(modelMetadataMap);
        if (keys.length > 0) {
            ModelMenu = keys.map(id => ({
                text: id,
                value: id
            }));
        }
    }

    async function fetchStuffs() {
        if (webllm) return webllm;
        try {
            loadingStatus = "Fetching WebLLM library";
            webllm = await import("https://esm.run/@mlc-ai/web-llm");

            if (webllm.prebuiltAppConfig && webllm.prebuiltAppConfig.model_list) {
                const apiModels = webllm.prebuiltAppConfig.model_list;

                modelMetadataMap = {};
                apiModels.forEach(item => {
                    modelMetadataMap[item.model_id] = item;
                });
                updateModelMenu();

                loadingStatus = `Ready`;
            }
            return webllm;
        } catch (err) {
            loadingStatus = "Fetch failed: " + err.message;
            throw err;
        }
    }

    fetchStuffs().catch(() => {});

    function autoSelectModel(category, sizePreference, minContext) {
        let availableVRAM = prefillsizechunk;
        if (navigator.deviceMemory) {
            availableVRAM = navigator.deviceMemory * 512;
        }

        const models = Object.values(modelMetadataMap);
        if (models.length === 0) return 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

        const cat = String(category).toLowerCase();
        const sizePref = String(sizePreference).toLowerCase();
        const requiredContext = Number(minContext) || 0;

        let filtered = models.filter(m => {
            const id = (m.model_id || "").toLowerCase();
            const vram = m.vram_required_MB || 0;
            const lowRes = Boolean(m.low_resource_required);
            const context = m.context_window_size || m.max_window_size || 0;

            if (requiredContext > 0 && context > 0 && context < requiredContext) {
                return false;
            }

            let matchesCat = true;
            if (cat === 'chat') {
                matchesCat = id.includes('instruct') || id.includes('chat') || id.includes('llama') || id.includes('qwen') || id.includes('gemma');
            } else if (cat === 'code') {
                matchesCat = id.includes('code') || id.includes('coder') || id.includes('starcoder') || id.includes('deepseek');
            } else if (cat === 'math') {
                matchesCat = id.includes('math') || id.includes('reason');
            } else if (cat === 'roleplay') {
                matchesCat = id.includes('hermes') || id.includes('vicuna') || id.includes('wizard') || id.includes('roleplay');
            } else if (cat === 'vision') {
                matchesCat = id.includes('vision') || id.includes('vl') || id.includes('phi3.5');
            }

            if (!matchesCat) return false;

            if (sizePref === 'small') return vram <= 2048 || lowRes;
            if (sizePref === 'medium') return vram > 2048 && vram <= 4096;
            if (sizePref === 'large') return vram > 4096;
            if (sizePref === 'low_vram') return lowRes || vram <= 1500;

            return true;
        });

        if (filtered.length === 0) filtered = models;

        const suitable = filtered.filter(m => (m.vram_required_MB || 0) <= availableVRAM);
        if (suitable.length > 0) {
            suitable.sort((a, b) => (b.vram_required_MB || 0) - (a.vram_required_MB || 0));
            return suitable[0].model_id;
        }

        filtered.sort((a, b) => (a.vram_required_MB || 0) - (b.vram_required_MB || 0));
        return filtered[0].model_id;
    }

    function getTargetList(listName, util) {
        if (!util || !util.target) return null;
        const stage = util.runtime.getTargetForStage();
        let targetList = stage ? stage.lookupVariableByNameAndType(listName, 'list') : null;
        if (!targetList && util.target) {
            targetList = util.target.lookupVariableByNameAndType(listName, 'list');
        }
        return targetList;
    }

    function getListContents(listName, util) {
        const list = getTargetList(listName, util);
        return list ? list.value : [];
    }

    function setListContents(listName, newArray, util) {
        const list = getTargetList(listName, util);
        if (list && Array.isArray(list.value)) {
            list.value = newArray;
            if (list._monitorUpToDate !== undefined) {
                list._monitorUpToDate = false;
            }
        }
    }

    function addToList(listName, text, util) {
        const list = getTargetList(listName, util);
        if (list && Array.isArray(list.value)) {
            list.value.push(text);
            if (list._monitorUpToDate !== undefined) {
                list._monitorUpToDate = false;
            }
        }
    }

    function getImageContents(uri, maxDim = 128) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const sourceWidth = img.width || 1;
                const sourceHeight = img.height || 1;
                const landscape = sourceWidth >= sourceHeight;
                const targetWidth = landscape ? 128 : 96;
                const targetHeight = landscape ? 96 : 128;
                const ratio = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
                const drawWidth = Math.max(1, Math.round(sourceWidth * ratio));
                const drawHeight = Math.max(1, Math.round(sourceHeight * ratio));
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(
                    img,
                    Math.round((targetWidth - drawWidth) / 2),
                    Math.round((targetHeight - drawHeight) / 2),
                    drawWidth,
                    drawHeight
                );
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => resolve(null);
            img.src = uri;
        });
    }

    async function getCostumeContents(costumeName, util) {
        if (!util || !util.target || !util.target.sprite || !Array.isArray(util.target.sprite.costumes)) return null;
        const target = util.target;
        const costumeObj = target.sprite.costumes.find(c => c.name === costumeName);
        if (!costumeObj) return null;

        if (costumeObj.asset) {
            const format = costumeObj.dataFormat;
            if (format === 'svg') {
                const svgText = costumeObj.asset.decodeText();
                return new Promise((resolve) => {
                    const img = new Image();
                    const svgBlob = new Blob([svgText], {
                        type: 'image/svg+xml;charset=utf-8'
                    });
                    const url = URL.createObjectURL(svgBlob);
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let w = img.width || 128;
                        let h = img.height || 128;
                        if (w > 128 || h > 128) {
                            const ratio = Math.min(128 / w, 128 / h);
                            w = Math.round(w * ratio);
                            h = Math.round(h * ratio);
                        }
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        URL.revokeObjectURL(url);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.onerror = () => {
                        URL.revokeObjectURL(url);
                        resolve(null);
                    };
                    img.src = url;
                });
            } else {
                const base64 = costumeObj.asset.encodeDataURI();
                return base64;
            }
        }
        return null;
    }

    async function getImageSource(input, util) {
        const str = String(input).trim();
        if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/')) {
            return await getImageContents(str);
        }
        const costumeURI = await getCostumeContents(str, util);
        if (costumeURI) {
            return await getImageContents(costumeURI);
        }
        return null;
    }

    async function parseConfigAndHistory(listName, util) {
        const rawLines = getListContents(listName, util);
        let configs = {};
        let systemPrompt = "You are a helpful assistant.";
        const conversation = [];
        let pendingImages = [];

        if (rawLines.length > 0) {
            try {
                configs = JSON.parse(String(rawLines[0]));
            } catch (e) {
                configs = {};
            }
        }

        if (rawLines.length > 1) {
            systemPrompt = String(rawLines[1]);
        }

        for (let i = 2; i < rawLines.length; i++) {
            const str = String(rawLines[i]);
            if (str.startsWith("[USER]: ")) {
                const text = str.replace("[USER]: ", "");
                if (pendingImages.length > 0) {
                    const contentArray = pendingImages.map(url => ({
                        type: "image_url",
                        image_url: {
                            url: url
                        }
                    }));
                    contentArray.push({
                        type: "text",
                        text: text
                    });
                    conversation.push({
                        role: "user",
                        content: contentArray
                    });
                    pendingImages = [];
                } else {
                    conversation.push({
                        role: "user",
                        content: text
                    });
                }
            } else if (str.startsWith("[ASSISTANT]: ")) {
                conversation.push({
                    role: "assistant",
                    content: str.replace("[ASSISTANT]: ", "")
                });
            } else if (str.startsWith("[SYSTEM]: ")) {
                conversation.push({
                    role: "system",
                    content: str.replace("[SYSTEM]: ", "")
                });
            } else if (str.startsWith("[IMAGE]: ")) {
                const imgRef = str.replace("[IMAGE]: ", "");
                const resolved = await getImageSource(imgRef, util);
                if (resolved) {
                    pendingImages.push(resolved);
                }
            }
        }

        return {
            configs,
            systemPrompt,
            conversation,
            pendingImages
        };
    }

    class LocalAI {
        getInfo() {
            return {
                id: 'P7LocalAI',
                name: 'Local AI',
                color1: "#ff4c4c",
                color2: '#f03e3e',
                blocks: [{
                        opcode: 'loadModelToRam',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'load model [MODEL]',
                        arguments: {
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'MODEL_MENU',
                                defaultValue: 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
                            }
                        }
                    },
                    {
                        opcode: 'loadCustomModelURL',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'load model ID [MODEL_ID] from URL [URL]',
                        arguments: {
                            MODEL_ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Llama-2-13b-chat-hf-q4f16_1-MLC'
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Llama-2-13b-chat-hf-q4f16_1_cs1k-webgpu.wasm'
                            }
                        }
                    },
                    {
                        opcode: 'unloadModel',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'deload model'
                    },
                    {
                        opcode: 'getAutoModelMultiFilter',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'auto-select model from category [CATEGORY] with size [SIZE] and min context [MIN_CONTEXT] tokens',
                        arguments: {
                            CATEGORY: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'CATEGORY_MENU',
                                defaultValue: 'chat'
                            },
                            SIZE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'SIZE_MENU',
                                defaultValue: 'any'
                            },
                            MIN_CONTEXT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: prefillsizechunk
                            }
                        }
                    },
                    {
                        opcode: 'getModelData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get metadata [FIELD] for model [MODEL]',
                        arguments: {
                            FIELD: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'METADATA_FIELD_MENU',
                                defaultValue: 'context_window_size'
                            },
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'MODEL_MENU',
                                defaultValue: 'Llama-3.2-1B-Instruct-q4f16_1-MLC'
                            }
                        }
                    },
                    {
                        opcode: 'getAllModelData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get all models'
                    },
                    {
                        opcode: 'getTokenLength',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'length of [TEXT] in tokens',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, world!'
                            }
                        }
                    },

                    '---',

                    {
                        opcode: 'initChatList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'start chat in list [LIST_NAME]',
                        arguments: {
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'setConfigs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set configs for chat [LIST_NAME] max tokens [MAX_TOKENS] stop tokens [STOPS] system prompt [SYSTEM]',
                        arguments: {
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            },
                            MAX_TOKENS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: prefillsizechunk
                            },
                            STOPS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            SYSTEM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'You are a helpful AI assistant.'
                            }
                        }
                    },

                    '---',

                    {
                        opcode: 'sendTextPrompt',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'send prompt [PROMPT] in chat [LIST_NAME]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Tell me a short story.'
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'sendListPrompt',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'send multi-line prompt [PROMPT_LIST] to chat [LIST_NAME]',
                        arguments: {
                            PROMPT_LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'continueText',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'continue text [TEXT] with configs from [LIST_NAME]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Once upon a time, '
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'cancelStream',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'stop generating text'
                    },

                    '---',

                    {
                        opcode: 'addImageToHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add image [IMAGE] as context to chat [LIST_NAME]',
                        arguments: {
                            IMAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'http://p7scratchextensions.pages.dev/extras/images/Raccoon.svg'
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'addCostumeToHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add costume [COSTUME] as context to chat [LIST_NAME]',
                        arguments: {
                            COSTUME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'COSTUME_MENU'
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'addMessageToHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add context [TEXT] from [ROLE] to chat [LIST_NAME]',
                        arguments: {
                            ROLE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'ROLE_MENU',
                                defaultValue: 'user'
                            },
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello!'
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'clearChatHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear chat history in list [LIST_NAME]',
                        arguments: {
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'exportChatToString',
                        blockType: Scratch.BlockType.REPORTER,
                        hideFromPalette: isPenguinmod,
                        text: 'export chat from list [LIST_NAME]',
                        arguments: {
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },
                    {
                        opcode: 'importChatFromString',
                        blockType: Scratch.BlockType.COMMAND,
                        hideFromPalette: isPenguinmod,
                        text: 'import chat [DATA] to list [LIST_NAME]',
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            },
                            LIST_NAME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'TARGET_LIST_MENU'
                            }
                        }
                    },

                    '---',

                    {
                        opcode: 'getLastResponse',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last AI response'
                    },
                    {
                        opcode: 'getLastStreamChunk',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last streamed chunk'
                    },
                    {
                        opcode: 'getLoadProgress',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'model load progress'
                    },
                    {
                        opcode: 'didModelFail',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'model failed to load?'
                    },
                    {
                        opcode: 'isReady',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'AI ready?'
                    },
                    {
                        opcode: 'getStatus',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'AI status'
                    }
                ],
                menus: {
                    MODEL_MENU: {
                        acceptReporters: true,
                        items: '_getModelsMenu'
                    },
                    CATEGORY_MENU: {
                        acceptReporters: true,
                        items: [{
                                text: 'instruct',
                                value: 'chat'
                            },
                            {
                                text: 'coding',
                                value: 'code'
                            },
                            {
                                text: 'math & reasoning',
                                value: 'math'
                            },
                            {
                                text: 'roleplay & conversational',
                                value: 'roleplay'
                            },
                            {
                                text: 'vision & multimodal',
                                value: 'vision'
                            },
                            {
                                text: 'any category',
                                value: 'all'
                            }
                        ]
                    },
                    SIZE_MENU: {
                        acceptReporters: true,
                        items: [{
                                text: 'any size',
                                value: 'any'
                            },
                            {
                                text: 'small (≤ 2GB VRAM)',
                                value: 'small'
                            },
                            {
                                text: 'medium (2GB–4GB VRAM)',
                                value: 'medium'
                            },
                            {
                                text: 'large (> 4GB VRAM)',
                                value: 'large'
                            },
                            {
                                text: 'low',
                                value: 'low_vram'
                            }
                        ]
                    },
                    TARGET_LIST_MENU: {
                        acceptReporters: true,
                        items: '_getListsMenu'
                    },
                    COSTUME_MENU: {
                        acceptReporters: true,
                        items: '_getCostumesMenu'
                    },
                    METADATA_FIELD_MENU: {
                        acceptReporters: true,
                        items: [{
                                text: 'Context Window Size',
                                value: 'context_window_size'
                            },
                            {
                                text: 'VRAM (MB)',
                                value: 'vram_required_MB'
                            },
                            {
                                text: 'Low Resource',
                                value: 'low_resource_required'
                            },
                            {
                                text: 'Model URL',
                                value: 'model_lib'
                            },
                            {
                                text: 'JSON',
                                value: 'raw_json'
                            }
                        ]
                    },
                    ROLE_MENU: {
                        acceptReporters: true,
                        items: [{
                                text: 'user',
                                value: 'user'
                            },
                            {
                                text: 'assistant',
                                value: 'assistant'
                            },
                            {
                                text: 'system',
                                value: 'system'
                            }
                        ]
                    }
                }
            };
        }

        _getModelsMenu() {
            return ModelMenu;
        }

        _getListsMenu() {
            const runtime = Scratch.vm && Scratch.vm.runtime;
            if (!runtime) return ['list'];

            const lists = new Set();
            const targets = runtime.targets || [];

            for (const target of targets) {
                if (target.variables) {
                    for (const id in target.variables) {
                        const v = target.variables[id];
                        if (v.type === 'list') {
                            lists.add(v.name);
                        }
                    }
                }
            }

            return lists.size > 0 ? Array.from(lists) : ['list'];
        }

        _getCostumesMenu() {
            const runtime = Scratch.vm && Scratch.vm.runtime;
            let costumes = [];

            if (runtime) {
                if (runtime.editingTarget && runtime.editingTarget.sprite && Array.isArray(runtime.editingTarget.sprite.costumes)) {
                    costumes = runtime.editingTarget.sprite.costumes;
                } else if (runtime.targets) {
                    for (const target of runtime.targets) {
                        if (!target.isStage && target.sprite && Array.isArray(target.sprite.costumes)) {
                            costumes = target.sprite.costumes;
                            break;
                        }
                    }
                }
            }

            if (costumes.length === 0) return [{
                text: 'costume1',
                value: 'costume1'
            }];
            return costumes.map(c => ({
                text: c.name,
                value: c.name
            }));
        }

        async loadModelToRam(args) {
            this.unloadModel();

            currentModelId = args.MODEL;
            isEngineReady = false;
            modelLoadFailed = false;
            loadProgressPercent = 0;
            loadingStatus = `Preparing engine for ${currentModelId}`;

            initAbortController = new AbortController();

            try {
                const lib = await fetchStuffs();
                loadingStatus = `Loading ${currentModelId} into VRAM`;

                const engineConfig = {
                    initProgressCallback: (progress) => {
                        if (initAbortController && initAbortController.signal.aborted) {
                            throw new Error("Model loading cancelled by user.");
                        }
                        loadingStatus = progress.text;
                        if (progress.progress !== undefined) {
                            loadProgressPercent = Math.round(progress.progress * 100);
                        }
                    }
                };

                if (lib.prebuiltAppConfig && lib.prebuiltAppConfig.model_list) {
                    engineConfig.appConfig = {
                        model_list: lib.prebuiltAppConfig.model_list.map(m => {
                            if (m.model_id === currentModelId) {
                                return Object.assign({}, m, {
                                    overrides: Object.assign({}, m.overrides || {}, {
                                        prefill_chunk_size: prefillsizechunk
                                    })
                                });
                            }
                            return m;
                        })
                    };
                }

                engine = await lib.CreateMLCEngine(
                    currentModelId,
                    engineConfig
                );

                if (initAbortController && initAbortController.signal.aborted) {
                    if (engine && typeof engine.unload === 'function') {
                        await engine.unload();
                    }
                    engine = null;
                    throw new Error("Model loading cancelled by user.");
                }

                isEngineReady = true;
                modelLoadFailed = false;
                loadProgressPercent = 100;
                loadingStatus = `Active Model: ${currentModelId}`;
            } catch (err) {
                isEngineReady = false;
                modelLoadFailed = true;
                loadingStatus = `Load Error: ${err.message}`;
            } finally {
                initAbortController = null;
            }
        }

        async loadCustomModelURL(args) {
            this.unloadModel();

            const customModelId = String(args.MODEL_ID || 'CustomModel').trim();
            const customUrl = String(args.URL || '').trim();

            currentModelId = customModelId;
            isEngineReady = false;
            modelLoadFailed = false;
            loadProgressPercent = 0;
            loadingStatus = `Preparing custom model ${customModelId}`;

            initAbortController = new AbortController();

            try {
                const lib = await fetchStuffs();
                loadingStatus = `Loading custom model`;

                const engineConfig = {
                    initProgressCallback: (progress) => {
                        if (initAbortController && initAbortController.signal.aborted) {
                            throw new Error("Model loading cancelled by user.");
                        }
                        loadingStatus = progress.text;
                        if (progress.progress !== undefined) {
                            loadProgressPercent = Math.round(progress.progress * 100);
                        }
                    },
                    appConfig: {
                        model_list: [{
                            model_id: customModelId,
                            model_url: customUrl,
                            overrides: {
                                prefill_chunk_size: prefillsizechunk
                            }
                        }]
                    }
                };

                if (!modelMetadataMap[customModelId]) {
                    modelMetadataMap[customModelId] = {
                        model_id: customModelId,
                        model_url: customUrl,
                        context_window_size: prefillsizechunk
                    };
                    updateModelMenu();
                }

                engine = await lib.CreateMLCEngine(
                    customModelId,
                    engineConfig
                );

                if (initAbortController && initAbortController.signal.aborted) {
                    if (engine && typeof engine.unload === 'function') {
                        await engine.unload();
                    }
                    engine = null;
                    throw new Error("Model loading cancelled by user.");
                }

                isEngineReady = true;
                modelLoadFailed = false;
                loadProgressPercent = 100;
                loadingStatus = `Active Model: ${currentModelId}`;
            } catch (err) {
                isEngineReady = false;
                modelLoadFailed = true;
                loadingStatus = `Load Error: ${err.message}`;
            } finally {
                initAbortController = null;
            }
        }

        cancelModelLoading() {
            this.unloadModel();
        }

        async unloadModel() {
            if (initAbortController) {
                initAbortController.abort();
                initAbortController = null;
            }
            if (engine) {
                try {
                    if (typeof engine.unload === 'function') {
                        await engine.unload();
                    }
                } catch (e) {}
                engine = null;
            }
            isEngineReady = false;
            modelLoadFailed = false;
            loadProgressPercent = 0;
            loadingStatus = "Model unloaded.";
        }

        cancelStream() {
            cancelStreamFlag = true;
            if (engine && typeof engine.interruptGenerate === 'function') {
                try {
                    engine.interruptGenerate();
                } catch (e) {}
            }
        }

        getAutoModelMultiFilter(args) {
            return autoSelectModel(
                args.CATEGORY,
                args.SIZE,
                args.MIN_CONTEXT
            );
        }

        getModelData(args) {
            const modelId = args.MODEL;
            const field = args.FIELD;
            const meta = modelMetadataMap[modelId];

            if (!meta) return "Metadata not fetched or model unavailable";
            if (field === 'raw_json') return JSON.stringify(meta);

            if (field === 'context_window_size') {
                const ctx = meta.context_window_size || meta.max_window_size;
                return ctx !== undefined ? String(ctx) : "Unknown context size";
            }

            return meta[field] !== undefined ? String(meta[field]) : "Field unavailable";
        }

        getAllModelData() {
            const raw = JSON.stringify(modelMetadataMap);
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    const keys = Object.keys(parsed);
                    if (keys.length > 0) {
                        modelMetadataMap = parsed;
                        updateModelMenu();
                    }
                }
            } catch (e) {}
            return raw;
        }

        async getTokenLength(args) {
            const text = String(args.TEXT || '');
            if (engine && engine.pipeline && typeof engine.pipeline.tokenize === 'function') {
                try {
                    const tokens = await engine.pipeline.tokenize(text);
                    return tokens.length;
                } catch (e) {}
            }
            return Math.ceil(text.length / 4);
        }

        initChatList(args, util) {
            const defaultConfigJSON = JSON.stringify({
                max_tokens: prefillsizechunk,
                stop: []
            });

            const defaultSystem = `You are a helpful, concise AI assistant.\n\nAnswer the user's questions accurately and clearly.\nFollow the user's instructions and preferences.\nAsk a clarifying question when necessary.\nBe honest when you are uncertain or lack information.\nKeep responses concise unless the user asks for more detail.\nDo not invent facts, sources, or capabilities.\nUse a friendly and natural tone.\n\nDo not use markdown, bbcode, html, LaTex, or other formatting. Write responses as plain text.`;

            setListContents(args.LIST_NAME, [defaultConfigJSON, defaultSystem], util);
        }

        setConfigs(args, util) {
            const contents = getListContents(args.LIST_NAME, util);

            const maxTokens = Number(args.MAX_TOKENS) || prefillsizechunk;
            const stopsInput = String(args.STOPS || '').trim();

            const stopArray = stopsInput ?
                stopsInput.split(',').map(s => s.trim()).filter(s => s.length > 0) :
                [];

            const configObj = {
                max_tokens: maxTokens,
                stop: stopArray
            };

            const configJSON = JSON.stringify(configObj);
            const systemPrompt = String(args.SYSTEM || "");

            if (contents.length < 2) {
                if (systemPrompt != "") {
                    setListContents(args.LIST_NAME, [configJSON, systemPrompt], util);
                } else {
                    setListContents(args.LIST_NAME, [configJSON, "You are a helpful AI assistant."], util);
                }
            } else {
                contents[0] = configJSON;
                if (systemPrompt != "") contents[1] = systemPrompt;
                setListContents(args.LIST_NAME, contents, util);
            }
        }

        async addImageToHistory(args, util) {
            const input = String(args.IMAGE || '').trim();
            if (!input) return;

            if (input.startsWith('http://') || input.startsWith('https://') || input.startsWith('data:image/')) {
                const validUri = await getImageContents(input, 64);
                if (validUri) {
                    addToList(args.LIST_NAME, `[IMAGE]: ${input}`, util);
                }
            } else {
                const costumeURI = await getCostumeContents(input, util);
                if (costumeURI) {
                    const validUri = await getImageContents(costumeURI, 64);
                    if (validUri) {
                        addToList(args.LIST_NAME, `[IMAGE]: ${input}`, util);
                    }
                }
            }
        }

        async addCostumeToHistory(args, util) {
            const costumeName = String(args.COSTUME || '').trim();
            if (!costumeName) return;

            const dataURI = await getCostumeContents(costumeName, util);
            if (dataURI) {
                const validUri = await getImageContents(dataURI, 128);
                if (validUri) {
                    addToList(args.LIST_NAME, `[IMAGE]: ${costumeName}`, util);
                }
            }
        }

        async sendTextPrompt(args, util) {
            return await this._executeStreamingPrompt(
                args.PROMPT,
                args.LIST_NAME,
                util
            );
        }

        async sendListPrompt(args, util) {
            const promptLines = getListContents(args.PROMPT_LIST, util);
            const combinedPrompt = promptLines.join("\n");

            if (!combinedPrompt.trim()) {
                const err = `Error: List [${args.PROMPT_LIST}] is empty.`;
                lastFullResponse = err;
                return err;
            }

            return await this._executeStreamingPrompt(
                combinedPrompt,
                args.LIST_NAME,
                util
            );
        }

        async _executeStreamingPrompt(userPrompt, listName, util) {
            if (!isEngineReady || !engine) {
                const err = "Error: Model must be loaded into VRAM first.";
                lastFullResponse = err;
                return err;
            }

            loadingStatus = "Generating response";
            lastStreamChunk = "";
            lastFullResponse = "";
            cancelStreamFlag = false;

            const {
                configs,
                systemPrompt,
                conversation,
                pendingImages
            } = await parseConfigAndHistory(listName, util);

            let userContent;
            if (pendingImages.length > 0) {
                userContent = pendingImages.map(url => ({
                    type: "image_url",
                    image_url: {
                        url: url
                    }
                }));
                userContent.push({
                    type: "text",
                    text: userPrompt
                });
            } else {
                userContent = userPrompt;
            }

            const fullMessages = [{
                    role: "system",
                    content: systemPrompt
                },
                ...conversation,
                {
                    role: "user",
                    content: userContent
                }
            ];

            try {
                const requestPayload = {
                    messages: fullMessages,
                    stream: true,
                    temperature: 0.7
                };

                if (configs.max_tokens) requestPayload.max_tokens = configs.max_tokens;
                if (Array.isArray(configs.stop) && configs.stop.length > 0) {
                    requestPayload.stop = configs.stop;
                }

                const asyncChunkStream = await engine.chat.completions.create(requestPayload);

                for await (const chunk of asyncChunkStream) {
                    if (cancelStreamFlag) break;
                    const delta = chunk.choices[0]?.delta?.content || "";
                    if (delta) {
                        lastStreamChunk = delta;
                        lastFullResponse += delta;
                    }
                }

                addToList(listName, `[USER]: ${userPrompt}`, util);
                addToList(listName, `[ASSISTANT]: ${lastFullResponse}`, util);

                loadingStatus = `Active Model: ${currentModelId}`;
                return lastFullResponse;
            } catch (err) {
                const errorMsg = `Execution Error: ${err.message}`;
                lastFullResponse = errorMsg;
                loadingStatus = errorMsg;
                return errorMsg;
            }
        }

        async continueText(args, util) {
            if (!isEngineReady || !engine) {
                const err = "Error: Model must be loaded into VRAM first.";
                lastFullResponse = err;
                return err;
            }

            loadingStatus = "Continuing text";
            lastStreamChunk = "";
            lastFullResponse = "";
            cancelStreamFlag = false;

            const {
                configs
            } = await parseConfigAndHistory(args.LIST_NAME, util);

            try {
                const requestPayload = {
                    messages: [{
                        role: "user",
                        content: args.TEXT
                    }],
                    stream: true,
                    temperature: 0.8
                };

                if (configs.max_tokens) requestPayload.max_tokens = configs.max_tokens;
                if (Array.isArray(configs.stop) && configs.stop.length > 0) {
                    requestPayload.stop = configs.stop;
                }

                const asyncChunkStream = await engine.chat.completions.create(requestPayload);

                for await (const chunk of asyncChunkStream) {
                    if (cancelStreamFlag) break;
                    const delta = chunk.choices[0]?.delta?.content || "";
                    if (delta) {
                        lastStreamChunk = delta;
                        lastFullResponse += delta;
                    }
                }

                loadingStatus = `Active Model: ${currentModelId}`;
                return lastFullResponse;
            } catch (err) {
                const errorMsg = `Execution Error: ${err.message}`;
                lastFullResponse = errorMsg;
                loadingStatus = errorMsg;
                return errorMsg;
            }
        }

        addMessageToHistory(args, util) {
            const role = String(args.ROLE).toUpperCase();
            addToList(args.LIST_NAME, `[${role}]: ${args.TEXT}`, util);
        }

        clearChatHistory(args, util) {
            const contents = getListContents(args.LIST_NAME, util);
            const configHeader = contents.slice(0, 2);
            setListContents(args.LIST_NAME, configHeader, util);
        }

        exportChatToString(args, util) {
            const contents = getListContents(args.LIST_NAME, util);
            return JSON.stringify(contents);
        }

        importChatFromString(args, util) {
            try {
                const parsed = JSON.parse(args.DATA);
                if (Array.isArray(parsed)) {
                    setListContents(args.LIST_NAME, parsed, util);
                }
            } catch (err) {}
        }

        getLastResponse() {
            return lastFullResponse;
        }

        getLastStreamChunk() {
            return lastStreamChunk;
        }

        getLoadProgress() {
            return loadProgressPercent;
        }

        didModelFail() {
            return modelLoadFailed;
        }

        getStatus() {
            return loadingStatus;
        }

        isReady() {
            return isEngineReady;
        }
    }

    Scratch.extensions.register(new LocalAI());
})(Scratch);
