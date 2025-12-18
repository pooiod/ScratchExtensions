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
            this._persistentMemory = {};
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
                        opcode: 'runNoReturn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'run JS [CODE]',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'window.persistent.myData = 123;'
                            }
                        }
                    },
                    {
                        opcode: 'onFunction',
                        blockType: Scratch.BlockType.HAT,
                        text: 'Handle function [NAME]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'command1' },
                        },
                        isEdgeActivated: false
                    },
                    {
                        opcode: 'getInputsToList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set list [LIST] to received inputs',
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'allLists'
                            }
                        }
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
                        acceptReporters: false,
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
            const sandboxTarget = Object.assign({}, DEFAULT_GLOBALS, this._customGlobals);

            sandboxTarget.persistent = this._persistentMemory;
            
            sandboxTarget.SetWaitTime = (ms) => {
                const val = parseInt(ms);
                if (!isNaN(val) && val > 0) {
                    this._timeout = val;
                }
            };

            const availableFunctions = this._scanFunctions();
            availableFunctions.forEach(funcName => {
                sandboxTarget[funcName] = (...args) => {
                    return this._runScratchFunction(funcName, args);
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
                return `Error: ${err.message}`;
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
                            console.log(childBlock.fields)
                            if (childBlock?.fields?.TEXT?.value) {
                                functions.add(childBlock.fields.TEXT.value);
                            } else if (childBlock.fields.VARIABLE) {
                                const varcontent = target.lookupVariableById(childBlock.fields.VARIABLE.id);
                                if (varcontent) {
                                    console.log(varcontent)
                                    functions.add(varcontent.value);
                                }
                            }
                        }
                    }
                }
            });

            return Array.from(functions);
        }

        _runScratchFunction(commandName, args) {
            return new Promise((resolve) => {
                if (!commandName) {
                    resolve("");
                    return;
                }

                this._triggeringFunction = commandName;
                const threads = this.runtime.startHats('P7JSParser_onFunction');
                this._triggeringFunction = null;

                if (threads.length === 0) {
                    resolve(`Function not found: ${commandName}`);
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
                        resolve("Timeout");
                    }
                }, this._timeout);
            });
        }

        async runAndReturn(args) {
            const result = this._executeIsolated(args.CODE);

            try {
                const val = result instanceof Promise ? await result : result;
                if (val === undefined) return 'undefined';
                if (val === null) return 'null';
                if (typeof val === 'object') return JSON.stringify(val);
                return String(val);
            } catch (err) {
                return err.toString();
            }
        }

        async runNoReturn(args) {
            return this.runAndReturn(args);
        }

        onFunction(args) {
            if (!this._triggeringFunction) return false;
            return args.NAME === this._triggeringFunction;
        }

        getInput(util) {
            if (util.thread.customData && util.thread.customData.ParserDataJS) {
                return util.thread.customData.ParserDataJS.args;
            }
            return [];
        }

        getInputsToList(args, util) {
            console.log(args)
            const listName = args.LIST;
            console.log(listName)
            if (!listName || listName === 'Select a list') return;

            const rawInput = this.getInput(util);
            const inputs = Array.isArray(rawInput) ? rawInput : [rawInput];

            const target = util.target;
            const stage = this.runtime.getTargetForStage();
            console.log(target, stage)

            let listVar = null;
            if (target && target.variables) {
                for (const id in target.variables) {
                    if (target.variables[id].name === listName && target.variables[id].type === 'list') {
                        listVar = target.variables[id];
                        break;
                    }
                }
            }
            if (!listVar && stage && stage.variables) {
                for (const id in stage.variables) {
                    if (stage.variables[id].name === listName && stage.variables[id].type === 'list') {
                        listVar = stage.variables[id];
                        break;
                    }
                }
            }
            console.log(listVar)
            console.log(inputs)

            if (listVar) {
                listVar.value = inputs;
                if (listVar._monitorUpToDate !== undefined) listVar._monitorUpToDate = false;
            }
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

        // Scratch.vm.runtime._primitives.P7JSParser_addObject(name, object)
        addObject(name, obj) {
            if (name && obj !== null) {
                this._customGlobals[name] = obj;
            }
        }
        removeObject(name) {
            if (name) {
                delete this._customGlobals[name];
            }
        }
    }

    Scratch.extensions.register(new JSParser());
})(Scratch);
