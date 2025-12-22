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

    class JSParser {
        constructor() {
            this.Persistent = {};
            this._triggeringFunction = null;
            this._customGlobals = {};
            this._timeout = 30000;
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
                                defaultValue: 'return Math.random();'
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
                                defaultValue: 'return Math.random() >= 0.5;'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'setMem',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set persistent [VAR] to [TEXT]',
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
                        text: 'Remove persistent [VAR]',
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
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'command1' },
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
                                        <field name="TEXT">command1</field>
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
                        hideFromPalette: !Scratch.extensions.isPenguinMod,
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
                ],
                menus: {
                    allLists: {
                        acceptReporters: true,
                        items: '_getLists'
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
            // Detatch main globals so they can't be changed
            const sandboxTarget = Object.assign({}, DEFAULT_GLOBALS, this._customGlobals);

            // persistent mem can be changed
            sandboxTarget.data = this.Persistent;

            sandboxTarget.SetWaitTime = (ms) => {
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

            try {
                const runner = new Function('__scope__', `
                    with(__scope__) {
                        return (async function() { 
                            "use strict";
                            ${code} 
                        }).call(__scope__);
                    }
                `);

                return runner(proxy);

            } catch (err) {
                return `${err.message}`;
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

        async runAndReturn(args) {
            const result = this._executeIsolated(args.CODE);

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

        async runAndReturnBool(args) {
            return (await this._executeIsolated(args.CODE)) ? true : false;
        }

        async runNoReturn(args) {
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

        // Scratch.vm.runtime._primitives.P7JSParser_addObject(name, object, false)
        // Scratch.vm.runtime._primitives.P7JSParser_removeObject(name, false)
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
    }

    Scratch.extensions.register(new JSParser());

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
