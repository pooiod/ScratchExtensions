// Name: ScratchX Loader
// ID: P7ScratchXLoader
// Updated: 1/12/2026
// Description: Slightly more advanced ScratchX extension support
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: true
// Created: 1/12/2026
// Notes: This extension is made for TurboWarp, but works in PenguinMod

/** Todo:
Add proper support for multi-lenguage extensions
Make extensions not leak into window context
Make it so an extension can be loaded again after removal
Add the ability to load .sbx projects instead of just extensions
Figure out how to properly remove extension blocks from the workspace
Make jquery and jszip not leak into window context
Do more testing and bug fixing
*/

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    const vm = Scratch.vm;
    const EXTENSION_ID = 'P7ScratchXLoader';

    window.ScriptsScratchX = window.ScriptsScratchX || {};

    let loaderInstance = null;

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    if (!window.JSZip) {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    }

    let jQueryLoadPromise = Promise.resolve();
    if (!window.jQuery) {
        jQueryLoadPromise = loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.4/jquery.min.js');
    }

    class ScratchXLoader {
        constructor() {
            loaderInstance = this;
            this.shimScratchExtensions();
            this.runtimeData = {};

            if (!vm.runtime.extensionStorage[EXTENSION_ID]) {
                vm.runtime.extensionStorage[EXTENSION_ID] = {
                    savedExtensions: [], // This is to prevent projects from refusing to load when the extension url goes down (just like ScratchX)
                    ghostExtensions: [] // I couldn't get extension blocks to remove from the workspace, so I added ghost blocks
                };
            }

            this.loadFromStorage();

            vm.runtime.on('PROJECT_LOADED', () => {
                this.loadFromStorage();
            });

            setInterval(() => {
                this.checkStatuses();
            }, 1000);

            setInterval(() => {
                this.checkGhostUsage();
            }, 10000);
        }

        checkStatuses() {
            let changed = false;
            const storage = vm.runtime.extensionStorage[EXTENSION_ID];
            if (!storage) return;

            storage.savedExtensions.forEach(ext => {
                const rt = this.runtimeData[ext.id];
                if (!rt) return;

                const scriptInfo = window.ScriptsScratchX[ext.url];
                const isScriptLoaded = scriptInfo && scriptInfo.loaded;

                const newScriptStatus = isScriptLoaded ? 'loaded' : (rt.scriptStatus === 'error' ? 'error' : 'loading');

                if (rt.scriptStatus !== newScriptStatus) {
                    rt.scriptStatus = newScriptStatus;
                    if (isScriptLoaded && scriptInfo.obj) {
                        rt.obj = scriptInfo.obj;
                    }
                    changed = true;
                }

                if (rt.obj && typeof rt.obj._getStatus === 'function') {
                    try {
                        const s = rt.obj._getStatus();
                        if (rt.extStatus !== s.status || rt.statusMsg !== s.msg) {
                            rt.extStatus = s.status;
                            rt.statusMsg = s.msg;
                            changed = true;
                        }
                    } catch (e) { }
                }
            });

            if (changed) {
                vm.extensionManager.refreshBlocks();
            }
        }

        checkGhostUsage() {
            const storage = vm.runtime.extensionStorage[EXTENSION_ID];
            if (!storage || !storage.ghostExtensions || storage.ghostExtensions.length === 0) return;

            const usedOpcodes = new Set();
            const targets = vm.runtime.targets;
            for (let t = 0; t < targets.length; t++) {
                const blocks = targets[t].blocks._blocks;
                for (const blockId in blocks) {
                    if (blocks.hasOwnProperty(blockId)) {
                        usedOpcodes.add(blocks[blockId].opcode);
                    }
                }
            }

            let changed = false;
            for (let i = storage.ghostExtensions.length - 1; i >= 0; i--) {
                const ext = storage.ghostExtensions[i];
                const safeName = ext.name.replace(/[^a-zA-Z0-9]/g, '');

                if (ext.descriptor && ext.descriptor.blocks) {
                    for (let b = ext.descriptor.blocks.length - 1; b >= 0; b--) {
                        const blockDesc = ext.descriptor.blocks[b];
                        if (blockDesc.length > 2) {
                            const funcName = blockDesc[2];
                            const opcode = `${safeName}_${funcName}`;
                            const fullOpcode = `${EXTENSION_ID}_${opcode}`;

                            if (!usedOpcodes.has(fullOpcode)) {
                                ext.descriptor.blocks.splice(b, 1);
                                changed = true;
                            }
                        } else {
                            ext.descriptor.blocks.splice(b, 1);
                            changed = true;
                        }
                    }
                }

                if (!ext.descriptor || !ext.descriptor.blocks || ext.descriptor.blocks.length === 0) {
                    storage.ghostExtensions.splice(i, 1);
                    changed = true;
                }
            }

            if (changed) {
                vm.extensionManager.refreshBlocks();
            }
        }

        loadFromStorage() {
            this.runtimeData = {};

            const storage = vm.runtime.extensionStorage[EXTENSION_ID];
            if (!storage) return;

            if (!storage.ghostExtensions) storage.ghostExtensions = [];

            if (storage.savedExtensions && storage.savedExtensions.length > 0) {
                storage.savedExtensions.forEach(ext => {
                    this.runtimeData[ext.id] = {
                        scriptStatus: 'loading',
                        extStatus: 1,
                        obj: null
                    };
                });
            }

            vm.extensionManager.refreshBlocks();

            setTimeout(() => {
                if (storage.savedExtensions && storage.savedExtensions.length > 0) {
                    storage.savedExtensions.forEach(ext => {
                        this.loadExtensionURL(ext.url, ext.id);
                    });
                }
            }, 100);
        }

        getInfo() {
            const storage = vm.runtime.extensionStorage[EXTENSION_ID] || { savedExtensions: [], ghostExtensions: [] };

            const blocks = [
                {
                    opcode: 'openLoader',
                    blockType: Scratch.BlockType.BUTTON,
                    text: 'Load ScratchX Extension',
                    func: 'openLoader'
                }
            ];

            storage.savedExtensions.forEach(ext => {
                const rt = this.runtimeData[ext.id] || { scriptStatus: 'loading' };

                let statusIcon = '⚪';
                const scriptData = window.ScriptsScratchX[ext.url];
                const isLoaded = scriptData && scriptData.loaded;

                if (!isLoaded && rt.scriptStatus !== 'error') statusIcon = '⚫';
                else if (rt.scriptStatus === 'error') statusIcon = '🔴';
                else {
                    if (rt.extStatus === 2) statusIcon = '🟢';
                    else if (rt.extStatus === 1) statusIcon = '🟡';
                    else statusIcon = '🔴';
                }

                let activeColor = '#4b4a60';
                if (rt.scriptStatus === 'error') activeColor = '#ff4d4d';

                const menuOpcode = `extensionMenu_${ext.id}`;
                if (!this[menuOpcode]) {
                    this[menuOpcode] = () => this.openExtensionMenu(ext, rt);
                }

                blocks.push({
                    opcode: menuOpcode,
                    blockType: Scratch.BlockType.BUTTON,
                    text: `${statusIcon} ${ext.name}`,
                    hideFromPalette: ext.name == 'Loading...',
                    func: menuOpcode
                });

                if (ext.descriptor && ext.descriptor.blocks) {
                    const generatedBlocks = ext.descriptor.blocks.map(blockDesc =>
                        this.convertBlock(blockDesc, ext, rt, activeColor, false)
                    );

                    generatedBlocks.forEach(b => {
                        if (b) blocks.push(b);
                    });
                }
            });

            if (storage.ghostExtensions) {
                storage.ghostExtensions.forEach(ext => {
                    if (ext.descriptor && ext.descriptor.blocks) {
                        const generatedBlocks = ext.descriptor.blocks.map(blockDesc =>
                            this.convertBlock(blockDesc, ext, { scriptStatus: 'error' }, '#ff4d4d', true)
                        );
                        generatedBlocks.forEach(b => {
                            if (b) blocks.push(b);
                        });
                    }
                });
            }

            return {
                id: EXTENSION_ID,
                name: 'ScratchX Extensions',
                color1: '#4b4a60',
                blocks: blocks,
                menus: this.getAllMenus()
            };
        }

        getAllMenus() {
            const storage = vm.runtime.extensionStorage[EXTENSION_ID] || { savedExtensions: [], ghostExtensions: [] };
            const menus = {};

            const processExt = (ext) => {
                if (ext.descriptor && ext.descriptor.menus) {
                    const safeName = ext.name.replace(/[^a-zA-Z0-9]/g, '');
                    for (const menuName in ext.descriptor.menus) {
                        menus[`${safeName}_${menuName}`] = {
                            acceptReporters: true,
                            items: ext.descriptor.menus[menuName]
                        };
                    }
                }
            };

            storage.savedExtensions.forEach(processExt);
            if (storage.ghostExtensions) storage.ghostExtensions.forEach(processExt);

            return menus;
        }

        convertBlock(blockDesc, extData, rtData, color, isGhost) {
            if (blockDesc.length === 1 && blockDesc[0] === '-') {
                if (isGhost) return null;
                return "---";
            }

            const safeExtName = extData.name.replace(/[^a-zA-Z0-9]/g, '');
            const typeCode = blockDesc[0];
            const text = blockDesc[1];
            const funcName = blockDesc[2];
            const defaults = blockDesc.slice(3);
            const opcode = `${safeExtName}_${funcName}`;

            let argCount = 0;
            const argRegex = /%([\w.]+)/g;
            while (argRegex.exec(text) !== null) argCount++;

            if (!this[opcode]) {
                this[opcode] = (args, util) => {
                    if (isGhost) return "";

                    const checkAndExecute = () => {
                        const scriptData = window.ScriptsScratchX[extData.url];

                        if (!scriptData || !scriptData.loaded) {
                            return new Promise(resolve => {
                                const checkInterval = setInterval(() => {
                                    const currentScriptData = window.ScriptsScratchX[extData.url];
                                    if (currentScriptData && currentScriptData.loaded) {
                                        clearInterval(checkInterval);
                                        resolve(execute(currentScriptData.obj));
                                    } else if (rtData.scriptStatus === 'error') {
                                        clearInterval(checkInterval);
                                        resolve("");
                                    }
                                }, 100);
                            });
                        }
                        return execute(scriptData.obj);
                    };

                    const execute = (obj) => {
                        const argValues = [];
                        for (let i = 0; i < argCount; i++) argValues.push(args[`ARG${i}`]);

                        if (typeCode === 'w') {
                            return new Promise(resolve => {
                                argValues.push(resolve);
                                try {
                                    if (obj && obj[funcName]) {
                                        obj[funcName].apply(obj, argValues);
                                    } else {
                                        resolve();
                                    }
                                } catch (e) { console.error(e); resolve(); }
                            });
                        } else {
                            try {
                                if (obj && obj[funcName]) {
                                    return obj[funcName].apply(obj, argValues);
                                }
                                return "";
                            } catch (e) { console.error(e); return ""; }
                        }
                    };

                    return checkAndExecute();
                };
            }

            const typeMap = {
                ' ': Scratch.BlockType.COMMAND,
                'w': Scratch.BlockType.COMMAND,
                'r': Scratch.BlockType.REPORTER,
                'R': Scratch.BlockType.BOOLEAN,
                'h': Scratch.BlockType.HAT,
                'b': Scratch.BlockType.BOOLEAN
            };

            let blockType = typeMap[typeCode];
            let blockShape = undefined;
            let isUnknown = false;

            // Try to match original ScratchX behavior for unknown block types
            if (!blockType) {
                if (typeof Scratch.BlockShape !== 'undefined') {
                    blockType = Scratch.BlockType.COMMAND;
                    blockShape = Scratch.BlockShape.SQUARE;
                } else {
                    blockType = Scratch.BlockType.BUTTON;
                    isUnknown = true;
                }
            }

            const args = {};
            const regex = /%([\w.]+)/g;
            let match;
            let argIndex = 0;
            let formattedText = text;

            while ((match = regex.exec(text)) !== null) {
                const tag = match[1];
                const argName = `ARG${argIndex}`;
                formattedText = formattedText.replace(match[0], `[${argName}]`);

                let argDef = {
                    type: Scratch.ArgumentType.STRING,
                    defaultValue: defaults[argIndex] !== undefined ? defaults[argIndex] : ''
                };
                if (tag === 'n') argDef.type = Scratch.ArgumentType.NUMBER;
                if (tag === 'b') argDef.type = Scratch.ArgumentType.BOOLEAN;
                if (tag.includes('.')) {
                    const parts = tag.split('.');
                    if (parts[0] === 'm') argDef.menu = `${safeExtName}_${parts[1]}`;
                }
                args[argName] = argDef;
                argIndex++;
            }

            const blockDef = {
                opcode: opcode,
                blockType: blockType,
                text: formattedText,
                arguments: args,
                color1: color,
                hideFromPalette: isGhost
            };

            if (blockShape) blockDef.blockShape = blockShape;
            if (isUnknown) blockDef.func = opcode;

            return blockDef;
        }

        loadExtensionURL(url, existingId = null) {
            const storage = vm.runtime.extensionStorage[EXTENSION_ID];

            if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
                url = url.replace('http://', 'https://');
            }

            if (!existingId && storage.ghostExtensions) {
                const ghostIndex = storage.ghostExtensions.findIndex(e => e.url === url);
                if (ghostIndex > -1) {
                    storage.ghostExtensions.splice(ghostIndex, 1);
                    vm.extensionManager.refreshBlocks();
                }
            }

            if (!existingId && storage.savedExtensions.find(e => e.url === url)) return;

            const id = existingId || ('ext_' + Date.now() + Math.random().toString(36).substr(2, 5));

            if (!this.runtimeData[id]) {
                this.runtimeData[id] = { scriptStatus: 'loading', extStatus: 1, obj: null };
            }

            if (!window.ScriptsScratchX[url]) {
                window.ScriptsScratchX[url] = { loaded: false, obj: null };
            }

            if (!existingId) {
                storage.savedExtensions.push({
                    id: id,
                    name: "Loading...",
                    url: url,
                    descriptor: { blocks: [], menus: {} }
                });
                vm.extensionManager.refreshBlocks();
            }

            jQueryLoadPromise.then(() => {
                if (window.ScriptsScratchX[url].loaded) {
                    this.runtimeData[id].scriptStatus = 'loaded';
                    this.runtimeData[id].obj = window.ScriptsScratchX[url].obj;
                    return;
                }

                const script = document.createElement('script');
                script.src = url;

                script.onerror = () => {
                    const rt = this.runtimeData[id];
                    rt.scriptStatus = 'error';
                    const ext = storage.savedExtensions.find(e => e.id === id);
                    if (ext) ext.name = 'Failed: ' + url.split('/').pop();

                    vm.extensionManager.refreshBlocks();
                };

                document.body.appendChild(script);
            });
        }

        shimScratchExtensions() {
            window.ScratchExtensions = {
                register: (name, descriptor, extObject) => {
                    let url = document.currentScript ? document.currentScript.src : null;
                    if (url) {
                        window.ScriptsScratchX[url] = {
                            loaded: true,
                            name: name,
                            obj: extObject,
                            descriptor: descriptor
                        };
                    }
                    this.handleRegistration(name, descriptor, extObject, url);
                },
                notify: (name, msg) => console.log(`[${name}] ${msg}`),
                loadExternalJS: (url) => {
                    if (url.startsWith('http://') && !url.includes('localhost')) url = url.replace('http://', 'https://');
                    loadScript(url).catch(e => console.error(e));
                }
            };
        }

        handleRegistration(name, descriptor, extObject, url) {
            console.log(`Registered: ${name}`);

            const storage = vm.runtime.extensionStorage[EXTENSION_ID];
            let extEntry;

            if (url) {
                extEntry = storage.savedExtensions.find(e => e.url === url);
            }

            if (!extEntry) {
                extEntry = storage.savedExtensions.find(e => e.name === name || e.name === 'Loading...');
            }

            if (extEntry) {
                extEntry.name = name;
                extEntry.descriptor = descriptor;

                const rt = this.runtimeData[extEntry.id];
                rt.obj = extObject;
                rt.scriptStatus = 'loaded';

                if (url) {
                    window.ScriptsScratchX[extEntry.url] = {
                        loaded: true,
                        obj: extObject,
                        name: name
                    };
                }

                vm.extensionManager.refreshBlocks();
            }
        }

        openExtensionMenu(ext, rt) {
            const existing = document.getElementById('sx-context-menu');
            if (existing) existing.remove();

            const e = window.event;
            const x = e ? e.clientX : window.innerWidth / 2;
            const y = e ? e.clientY : window.innerHeight / 2;

            const menu = document.createElement('div');
            menu.id = 'sx-context-menu';
            menu.style.cssText = `
                position: fixed; top: ${y + 10}px; left: ${x}px;
                background: white; border: 1px solid #ccc; border-radius: 8px;
                padding: 15px; z-index: 10000; font-family: sans-serif;
                min-width: 200px; display: flex; flex-direction: column; gap: 8px;
            `;

            let currentMsg = rt.statusMsg;
            let currentStatus = rt.extStatus;

            if (rt.obj && typeof rt.obj._getStatus === 'function') {
                try {
                    const s = rt.obj._getStatus();
                    currentMsg = s.msg;
                    currentStatus = s.status;
                } catch (e) { }
            }

            const scriptData = window.ScriptsScratchX[ext.url];
            const isLoaded = scriptData && scriptData.loaded;

            let statusColor = '#ffffff';
            let statusText = 'Loading...';

            if (!isLoaded && rt.scriptStatus !== 'error') {
                statusColor = '#000000';
                statusText = 'Downloading...';
            } else if (rt.scriptStatus === 'error') {
                statusColor = '#ff4d4d';
                statusText = 'Error Loading Script';
            } else {
                statusText = currentMsg || 'Ready';
                if (currentStatus === 2) statusColor = '#4dff4d';
                else if (currentStatus === 1) statusColor = '#ffd94d';
                else statusColor = '#ff4d4d';
            }

            const btnStyle = `padding: 8px; background: white; color: #333; border: 1px solid #aaa; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; width: 100%; text-align: center; transition: background 0.2s;`;

            menu.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${statusColor}; border: 1px solid #ddd;"></div>
                    <strong style="font-size: 14px; color: #333;">${ext.name}</strong>
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Status: ${statusText}</div>
                
                ${ext.descriptor.url ? `<button id="sx-info-btn" style="${btnStyle}">About Extension</button>` : ''}
                
                <button id="sx-source-btn" style="${btnStyle}">View Source Code</button>
                
                <button id="sx-remove-btn" style="${btnStyle}">Remove Extension</button>
            `;

            document.body.appendChild(menu);

            const buttons = menu.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.onmouseenter = () => btn.style.background = '#f5f5f5';
                btn.onmouseleave = () => btn.style.background = 'white';
            });

            if (document.getElementById('sx-info-btn')) {
                document.getElementById('sx-info-btn').onclick = () => window.open(ext.descriptor.url, '_blank');
            }

            document.getElementById('sx-source-btn').onclick = () => {
                window.open(ext.url, '_blank');
                menu.remove();
            };

            document.getElementById('sx-remove-btn').onclick = () => {
                this.removeExtension(ext.id);
                menu.remove();
            };

            setTimeout(() => {
                const closeHandler = (ev) => {
                    if (!menu.contains(ev.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeHandler);
                    }
                };
                document.addEventListener('click', closeHandler);
            }, 50);
        }

        removeExtension(id) {
            const storage = vm.runtime.extensionStorage[EXTENSION_ID];
            const index = storage.savedExtensions.findIndex(e => e.id === id);

            if (index > -1) {
                const ext = storage.savedExtensions[index];
                const rt = this.runtimeData[id];

                if (rt && rt.obj && rt.obj._shutdown) {
                    try { rt.obj._shutdown(); } catch (e) { }
                }

                const safeName = ext.name.replace(/[^a-zA-Z0-9]/g, '');
                const usedBlockDescriptors = [];
                const usedOpcodes = new Set();
                const targets = vm.runtime.targets;

                for (let t = 0; t < targets.length; t++) {
                    const blocks = targets[t].blocks._blocks;
                    for (const blockId in blocks) {
                        if (blocks.hasOwnProperty(blockId)) {
                            usedOpcodes.add(blocks[blockId].opcode);
                        }
                    }
                }

                if (ext.descriptor && ext.descriptor.blocks) {
                    for (const blockDesc of ext.descriptor.blocks) {
                        const funcName = blockDesc[2];
                        const opcode = `${safeName}_${funcName}`;
                        const fullOpcode = `${EXTENSION_ID}_${opcode}`;
                        if (usedOpcodes.has(fullOpcode)) {
                            usedBlockDescriptors.push(blockDesc);
                        }
                    }
                }

                storage.savedExtensions.splice(index, 1);
                delete this.runtimeData[id];
                delete this[`extensionMenu_${id}`];

                if (usedBlockDescriptors.length > 0) {
                    if (!storage.ghostExtensions) storage.ghostExtensions = [];
                    const ghostExt = JSON.parse(JSON.stringify(ext));
                    ghostExt.descriptor.blocks = usedBlockDescriptors;
                    storage.ghostExtensions.push(ghostExt);
                }

                vm.extensionManager.refreshBlocks();
            }
        }

        async loadSBX(file) {
            if (!window.JSZip) { alert("Loading JSZip..."); return; }
            try {
                const zip = new window.JSZip();
                const content = await zip.loadAsync(file);
                const json = JSON.parse(await content.files['project.json'].async('string'));

                if (json.info && json.info.savedExtensions) {
                    json.info.savedExtensions.forEach(ext => {
                        if (ext.javascriptURL) this.loadExtensionURL(ext.javascriptURL);
                    });
                } else { alert("No extensions found in SBX."); }
            } catch (e) { console.error(e); alert("Invalid SBX."); }
        }

        openLoader() {
            if (document.getElementById('sx-modal-overlay')) return;
            const modal = document.createElement('div');
            modal.innerHTML = `<!-- this ui was mostly generated by a script that pulled from the actual ScratchX ui -->
                <style>@media (max-width: 600px) { .modal-inner { flex-direction: column !important; } }</style>
                <div id="sx-modal-overlay" style="font-family: 'Source Sans Pro', sans-serif; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999;">
                    <div class="modal-inner" style="display: flex; gap: 20px; max-width: 900px; width: 100%; padding: 20px;">
                        <div style="flex: 1; background: white; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; text-align: center;">
                            <section style="background: #3f5975; color: white; padding: 40px 20px;">
                                <div style="width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; background: #18ba37;">
                                    <img src="https://yyf.mubilop.com/file/6f630060/file.png" style="width: 36px;">
                                </div>
                                <h2>Load From Project</h2>
                                <p>Choose a .sbx file</p>
                            </section>
                            <section style="padding: 24px;">
                                <input type="file" id="sx-file-input" accept=".sbx,.zip" style="display: none;">
                                <button id="sx-browse-btn" style="padding: 8px 16px; border-radius: 5px; cursor: pointer; background: #18ba37; color: white; border: none; font-size: 16px;">Browse</button>
                            </section>
                        </div>
                        <div style="flex: 1; background: white; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; text-align: center;">
                            <section style="background: #3f5975; color: white; padding: 40px 20px;">
                                <div style="width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px; display: flex; justify-content: center; align-items: center; background: #21b4f0;">
                                    <img src="https://yyf.mubilop.com/file/a92286bd/link.png" style="width: 36px;">
                                </div>
                                <h2>Open Extension URL</h2>
                                <p>Paste web address</p>
                            </section>
                            <section style="padding: 24px;">
                                <div style="display: flex; gap: 5px;">
                                    <input type="text" id="sx-url-input" placeholder="paste url..." style="flex: 1; padding: 8px; border: 1px solid #dfe3e7; border-radius: 5px;">
                                    <button id="sx-url-btn" style="padding: 8px 16px; border-radius: 5px; cursor: pointer; background: #21b4f0; color: white; border: none; font-size: 16px;">Open</button>
                                </div>
                            </section>
                        </div>
                        <div style="position: absolute; top: 20px; right: 20px;">
                            <button id="sx-close-btn" style="background: none; border: none; color: white; font-size: 30px; cursor: pointer;">&times;</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const overlay = document.getElementById('sx-modal-overlay');
            const close = () => modal.remove();
            overlay.onclick = (e) => { if (e.target === overlay) close(); };
            document.getElementById('sx-close-btn').onclick = close;

            const fileInput = document.getElementById('sx-file-input');
            document.getElementById('sx-browse-btn').onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                if (e.target.files.length > 0) {
                    this.loadSBX(e.target.files[0]);
                    close();
                }
            };

            const urlInput = document.getElementById('sx-url-input');
            document.getElementById('sx-url-btn').onclick = () => {
                if (urlInput.value) {
                    this.loadExtensionURL(urlInput.value);
                    close();
                }
            };
        }
    }

    Scratch.extensions.register(new ScratchXLoader());
})(Scratch);
