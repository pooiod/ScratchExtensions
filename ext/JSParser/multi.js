(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must be run unsandboxed.');
    }

    const vm = Scratch.vm;
    const runtime = vm.runtime;
    const ID = 'P7JSParserMulti';
    const BASE_URL = 'https://p7scratchextensions.pages.dev/ext/JSParser/main.js';

    class P7JSParserMulti {
        constructor() {
            this.baseCode = null;
            this.instances = [];
            this.isLoaded = false;
            this.validOpcodes = new Set();
            this.loadPromise = new Promise((resolve) => {
                this._resolveLoad = resolve;
            });

            this._loadFromStorage();
            this._fetchBaseCode();

            window.JSParser = window.JSParser || {};

            runtime.on('PROJECT_LOADED', () => {
                this._loadFromStorage();
                if (this.baseCode) this._rehydrateAll();
            });
        }

        _loadFromStorage() {
            try {
                const stored = runtime.extensionStorage[ID];
                if (stored) {
                    const data = JSON.parse(stored);
                    this.instances = data.instances || [];
                    if (data.baseCode) {
                        this.baseCode = data.baseCode;
                        this.isLoaded = true;
                    }
                }
            } catch (e) {
                this.instances = [];
            }
        }

        _saveToStorage() {
            try {
                runtime.extensionStorage[ID] = JSON.stringify({
                    baseCode: this.baseCode,
                    instances: this.instances.map(inst => ({
                        name: inst.name,
                        blocks: inst.blocks,
                        menus: inst.menus
                    }))
                });
            } catch (e) { }
        }

        async _fetchBaseCode() {
            try {
                const response = await fetch(BASE_URL);
                if (response.ok) {
                    this.baseCode = await response.text();
                    this.isLoaded = true;
                    this._saveToStorage();
                    await this._rehydrateAll();
                    if (this._resolveLoad) this._resolveLoad();
                } else if (this.baseCode) {
                    this.isLoaded = true;
                    await this._rehydrateAll();
                    if (this._resolveLoad) this._resolveLoad();
                }
            } catch (e) {
                if (this.baseCode) {
                    this.isLoaded = true;
                    await this._rehydrateAll();
                    if (this._resolveLoad) this._resolveLoad();
                }
            }

            if (this.instances.length === 0 && this.isLoaded) {
                this._createInstanceFromCode("VM1", false);
            }
        }

        async _rehydrateAll() {
            for (const inst of this.instances) {
                await this._createInstanceFromCode(inst.name, true);
            }
            this._refresh(true);
        }

        _refresh(hardRefresh = false) {
            if (vm.extensionManager && vm.extensionManager.refreshBlocks) {
                vm.extensionManager.refreshBlocks();
            }
            if (hardRefresh) {
                vm.emitWorkspaceUpdate();
            }
        }

        _isVMInWorkspace(name) {
            const prefix = ID + '_' + name + '_';
            return runtime.targets.some(target => {
                const blocksObject = target.blocks._blocks;
                for (const blockId in blocksObject) {
                    const block = blocksObject[blockId];
                    if (block && block.opcode && block.opcode.startsWith(prefix)) {
                        return true;
                    }
                }
                return false;
            });
        }

        async _showPrompt(title) {
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                Object.assign(overlay.style, {
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.24)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                });

                const modal = document.createElement('div');
                Object.assign(modal.style, {
                    backgroundColor: 'white', padding: '20px', borderRadius: '10px',
                    width: '300px', textAlign: 'center'
                });

                const label = document.createElement('div');
                label.innerText = title;
                label.style.marginBottom = '15px';
                label.style.fontWeight = 'bold';

                const input = document.createElement('input');
                input.type = 'text';
                Object.assign(input.style, {
                    width: '100%', padding: '8px', marginBottom: '15px',
                    border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box'
                });

                const btnRow = document.createElement('div');
                btnRow.style.display = 'flex';
                btnRow.style.justifyContent = 'space-between';

                const okBtn = document.createElement('button');
                okBtn.innerText = 'OK';
                Object.assign(okBtn.style, {
                    padding: '8px 16px', border: 'none', borderRadius: '4px',
                    cursor: 'pointer', backgroundColor: '#4c97ff', color: 'white'
                });

                const cancelBtn = document.createElement('button');
                cancelBtn.innerText = 'Cancel';
                Object.assign(cancelBtn.style, {
                    padding: '8px 16px', border: 'none', borderRadius: '4px',
                    cursor: 'pointer', backgroundColor: '#eee', color: 'black'
                });

                const close = (val) => {
                    document.body.removeChild(overlay);
                    resolve(val);
                };

                okBtn.onclick = () => close(input.value);
                cancelBtn.onclick = () => close(null);
                input.onkeydown = (e) => { if (e.key === 'Enter') okBtn.click(); if (e.key === 'Escape') cancelBtn.click(); };

                modal.append(label, input, btnRow);
                btnRow.append(cancelBtn, okBtn);
                overlay.append(modal);
                document.body.appendChild(overlay);
                input.focus();
            });
        }

        getInfo() {
            const blocks = [{
                func: 'loadNewVM',
                blockType: Scratch.BlockType.BUTTON,
                text: 'Add new vm'
            }];

            for (const inst of this.instances) {
                if (this.instances.length > 1 || inst.name !== "VM1") blocks.push({ blockType: Scratch.BlockType.LABEL, text: `${inst.name}` });

                const removeFunc = `removeVM_${inst.name}`;
                this[removeFunc] = () => this._removeVM(inst.name);
                blocks.push({ func: removeFunc, blockType: Scratch.BlockType.BUTTON, text: `Remove ${inst.name}`, hideFromPalette: this.instances.length === 1 });

                if (inst.blocks) {
                    for (const b of inst.blocks) {
                        if (typeof b !== 'object' || b.blockType === Scratch.BlockType.LABEL) {
                            blocks.push(b);
                            continue;
                        }

                        const newBlock = { ...b };
                        const op = b.originalOpcode || b.opcode || b.func;
                        const newOp = `${inst.name}_${op}`;

                        if (newBlock.text && this.instances.length > 1) newBlock.text = `${inst.name}: ${newBlock.text}`;
                        if (b.opcode) newBlock.opcode = newOp;
                        else if (b.func) newBlock.func = newOp;

                        if (this.isLoaded && !this.validOpcodes.has(op)) {
                            Object.assign(newBlock, { color1: '#ff0000', color2: '#ff0000', color3: '#ff0000' });
                        }

                        if (!this[newOp]) {
                            this[newOp] = async (args, util) => {
                                await this.loadPromise;
                                if (typeof this[newOp] === 'function') return this[newOp](args, util);
                            };
                        }
                        blocks.push(newBlock);
                    }
                }
            }

            return {
                id: ID,
                name: 'JavaScript Parser',
                color1: '#4a4a4a',
                blocks: blocks,
                menus: this._collectMenus()
            };
        }

        _collectMenus() {
            const menus = {};
            for (const inst of this.instances) {
                if (inst.menus) {
                    for (const [key, value] of Object.entries(inst.menus)) {
                        menus[`${inst.name}_${key}`] = value;
                    }
                }
            }
            return menus;
        }

        _removeVM(name) {
            if (this._isVMInWorkspace(name)) {
                alert(`Cannot remove VM "${name}": To delete a VM, first remove all uses of its blocks.`);
                return;
            }
            this.instances = this.instances.filter(i => i.name !== name);
            this._saveToStorage();
            this._refresh(true);
        }

        async loadNewVM() {
            const raw = await this._showPrompt('Enter VM Name:');
            if (!raw) return;
            let name = String(raw).replace(/[^a-zA-Z0-9]/g, '');
            if (/^\d/.test(name)) name = 'v' + name;
            if (!name || this.instances.some(i => i.name === name)) return;
            if (!this.isLoaded) return;
            this._createInstanceFromCode(name, false);
        }

        async _createInstanceFromCode(name, isRehydrating) {
            if (!this.baseCode) return;
            let code = this.baseCode
                .replace(/P7JSParser/g, `${ID}_${name}`)
                .replace(/window\.JSParser/g, `window.JSParser["${name}"]`);

            const self = this;
            return new Promise((resolve) => {
                const fakeScratch = {
                    ...Scratch,
                    extensions: {
                        unsandboxed: true,
                        register: (instance) => {
                            const info = instance.getInfo();
                            if (self.validOpcodes.size === 0 && info.blocks) {
                                info.blocks.forEach(b => { if (b.opcode || b.func) self.validOpcodes.add(b.opcode || b.func); });
                            }

                            const mapped = (info.blocks || []).map(b => {
                                if (typeof b !== 'object' || b.blockType === Scratch.BlockType.LABEL) return b;
                                const nb = { ...b };
                                const op = b.opcode || b.func;
                                nb.originalOpcode = op;
                                if (op) {
                                    const nOp = `${name}_${op}`;
                                    if (typeof instance[op] === 'function') self[nOp] = instance[op].bind(instance);
                                }
                                if (nb.arguments) {
                                    for (const a of Object.values(nb.arguments)) { if (a.menu) a.menu = `${name}_${a.menu}`; }
                                }
                                return nb;
                            });

                            const data = { name, blocks: mapped, menus: info.menus || {} };
                            const idx = self.instances.findIndex(i => i.name === name);
                            if (idx > -1) self.instances[idx] = data;
                            else self.instances.push(data);

                            if (!isRehydrating) self._saveToStorage();
                            self._refresh();
                            resolve();
                        }
                    }
                };
                try { new Function('Scratch', `(function(){\n${code}\n})()`)(fakeScratch); } catch (e) { resolve(); }
            });
        }
    }

    Scratch.extensions.register(new P7JSParserMulti());
})(Scratch);
