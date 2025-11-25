// Name: Console
// ID: P7Console
// Description: An easy to use console system.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: false
// Created: 11/25/2025
// Notes: Based on <a href="https://github.com/pooiod/Advanced-Console">pooiod/Advanced-Console</a>

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class P7ConsoleExtension {
        constructor() {
            this.runtime = Scratch.vm.runtime;
            this.elements = null;
            this.settings = {
                starter: ">",
                showVoid: false,
                maxSuggestions: 3
            };
            this.autocompleteList = [];
            
            this._triggeringCommand = null;

            this.runtime.on('PROJECT_LOADED', () => {
                this.initConsole({STARTER:this.settings.starter,MAX:this.settings.maxSuggestions});
            });
        }

        getInfo() {
            return {
                id: 'P7Console',
                name: 'Console',
                color1: '#333333',
                blocks: [
                    {
                        opcode: 'initConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Init Console | Starter: [STARTER] | Max Sug: [MAX]',
                        arguments: {
                            STARTER: { type: Scratch.ArgumentType.STRING, defaultValue: this.settings.starter },
                            VOID: { type: Scratch.ArgumentType.BOOLEAN, defaultValue: this.settings.showVoid },
                            MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: this.settings.maxSuggestions }
                        }
                    },
                    {
                        opcode: 'setConsoleSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set console size to [WIDTH] x [HEIGHT]',
                        arguments: {
                            WIDTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: '50' },
                            HEIGHT: { type: Scratch.ArgumentType.NUMBER, defaultValue: '40' }
                        }
                    },

                    {
                        opcode: 'showConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Show Console'
                    },
                    {
                        opcode: 'hideConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Hide Console'
                    },
                    {
                        opcode: 'toggleConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Toggle Console'
                    },

                    "---",

                    {
                        opcode: 'logText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Text Log [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello World' }
                        }
                    },
                    {
                        opcode: 'warnText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Text Warn [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Warning' }
                        }
                    },
                    {
                        opcode: 'errorText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Text Error [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Error' }
                        }
                    },

                    {
                        opcode: 'logPretty',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Pretty Log [TEXT]',
                        arguments: {
                            TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Text with |color: lightblue;| color|clear|!' }
                        }
                    },

                    {
                        opcode: 'clearConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Clear Console'
                    },

                    "---",

                    {
                        opcode: 'onCommand',
                        blockType: Scratch.BlockType.HAT,
                        text: 'When console command [NAME] run',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'command1' }
                        },
                        isEdgeActivated: false
                    },

                    {
                        opcode: 'getInput',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Received input',
                        disableMonitor: true
                    },
                    {
                        opcode: 'getInputsToList',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set list [LIST] to received inputs',
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'allLists',
                                defaultValue: 'my list'
                            }
                        }
                    },

                    {
                        opcode: 'returnResult',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Return [VALUE] to console',
                        isTerminal: true,
                        arguments: {
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
                        }
                    },

                    "---",

                    {
                        opcode: 'getCommands',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Commands',
                        disableMonitor: true
                    }
                ],
                menus: {
                    allLists: {
                        acceptReporters: true,
                        items: '_getLists'
                    }
                }
            };
        }

        initConsole(args) {
            if (this.elements && this.elements.shadowHost) {
                this.elements.shadowHost.remove();
                this.elements = null;
            }

            this.settings.starter = args.STARTER || "";
            this.settings.showVoid = false; //args.VOID;
            this.settings.maxSuggestions = args.MAX || 5;
            this.autocompleteList = []; 

            this._createDOM();
        }

        setConsoleSize(args) {
            this.initConsole({STARTER:this.settings.starter,MAX:this.settings.maxSuggestions});

            if (this.elements && this.elements.maindiv) {
                const width = parseFloat(args.WIDTH);
                const height = parseFloat(args.HEIGHT);
                this.elements.maindiv.style.width = `${width}%`;
                this.elements.maindiv.style.height = `${height}%`;
                this.elements.autocompleteDiv.style.width = `${width}%`;
            }
        }

        showConsole() {
            if (!this.elements) this.initConsole({STARTER:this.settings.starter,MAX:this.settings.maxSuggestions});

            if (this.elements && this.elements.shadowHost && this.elements.textarea) {
                this.autocompleteList = this._scanCommands();
                this.elements.shadowHost.style.display = "block";
                this.elements.textarea.value = this.settings.starter;
                this.elements.textarea.focus();
            }
        }

        hideConsole() {
            if (this.elements && this.elements.shadowHost && this.elements.textarea) {
                this.elements.shadowHost.style.display = "none";
                this.elements.textarea.value = "";
                this.elements.textarea.blur();
            }
        }

        toggleConsole() {
            if (!this.elements) this.initConsole({STARTER:this.settings.starter,MAX:this.settings.maxSuggestions});

            if (this.elements && this.elements.shadowHost) {
                if (this.elements.shadowHost.style.display === "none") {
                    this.showConsole();
                } else {
                    this.hideConsole();
                }
            }
        }

        logText(args) {
            this._rawLog(args.TEXT);
        }

        warnText(args) {
            this._prettyLog("|color:#fff066;|" + args.TEXT);
        }

        errorText(args) {
            this._prettyLog("|color:pink;|" + args.TEXT);
        }

        logPretty(args) {
            this._prettyLog(args.TEXT);
        }

        clearConsole() {
            if (this.elements && this.elements.topDiv) {
                this.elements.topDiv.innerHTML = "";
            }
        }

        onCommand(args) {
            if (!this._triggeringCommand) return false;
            return args.NAME === this._triggeringCommand;
        }

        getInput(args, util) {
            if (util.thread.customData && util.thread.customData.consoleSession) {
                return util.thread.customData.consoleSession.args;
            }
            return "";
        }

        getCommands() {
            return this._scanCommands().join(", ");
        }

        getInputsToList(args, util) {
            const rawInput = this.getInput(args, util);
            if (!rawInput) return;

            const matches = rawInput.match(/"([^"]*)"|'([^']*)'|([^\s"']+)/g) || [];
            const parsedList = matches.map(match => {
                if ((match.startsWith('"') && match.endsWith('"')) || (match.startsWith("'") && match.endsWith("'"))) {
                    return match.slice(1, -1);
                }
                return match;
            });

            const listName = args.LIST;
            const target = util.target;
            const stage = this.runtime.getTargetForStage();
            
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

            if (listVar) {
                listVar.value = parsedList;
                if (listVar._monitorUpToDate !== undefined) listVar._monitorUpToDate = false;
            }
        }

        returnResult(args, util) {
            if (util.thread.customData && util.thread.customData.consoleSession) {
                const session = util.thread.customData.consoleSession;
                if (session.resolve) {
                    session.resolve(args.VALUE);
                    session.resolve = null; 
                }
            }
        }

        // ----------------------------------------------------------------

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
            return listArray.length > 0 ? listArray : [''];
        }

        _scanCommands() {
            const commands = new Set();

            if (!this.runtime || !this.runtime.targets) return Array.from(commands);

            this.runtime.targets.forEach(target => {
                if (!target.blocks) return;
                const blocks = target.blocks._blocks;

                for (const id in blocks) {
                    const block = blocks[id];
                    if (block.opcode === 'P7Console_onCommand') {
                        const inputs = block.inputs;
                        if (inputs && inputs.NAME) {
                            const childId = inputs.NAME.block;
                            const childBlock = blocks[childId];
                            if (childBlock && childBlock.fields && childBlock.fields.TEXT) {
                                const val = childBlock.fields.TEXT.value;
                                if (val) {
                                    commands.add(this.settings.starter + val.replace(/ /g, "_"));
                                }
                            }
                        }
                    }
                }
            });

            return Array.from(commands);
        }

        _Stringify(value, space = 2) {
            if (typeof value === 'string') return "|white-space: pre;|" + value.replace(/\n/g, '<br>');
            if (value instanceof Promise) return "|color:lightblue|Promise";
            try {
                return "|white-space: pre;|" + JSON.stringify(value, null, space).replace(/\n/g, '<br>');
            } catch (e) {
                return String(value);
            }
        }

        _executeCommand(inputString) {
            return new Promise((resolve) => {
                let raw = inputString;
                if (raw.startsWith(this.settings.starter)) {
                    raw = raw.substring(this.settings.starter.length);
                }

                const parts = raw.trim().split(/\s+/);
                const commandName = parts[0];
                const argsString = raw.substring(commandName.length).trim();

                if (!commandName) {
                    resolve(null);
                    return;
                }

                this._triggeringCommand = commandName;
                const threads = this.runtime.startHats('P7Console_onCommand');
                this._triggeringCommand = null;

                if (threads.length === 0) {
                    resolve("|color:orange;|Command not found: " + commandName);
                    return;
                }

                let handled = false;
                threads.forEach(thread => {
                    thread.customData = thread.customData || {};
                    thread.customData.consoleSession = {
                        command: commandName,
                        args: argsString,
                        resolve: (val) => {
                            if (!handled) {
                                handled = true;
                                resolve(val);
                            }
                        }
                    };
                });
            });
        }

        _prettyPrint(text) {
            const styleCommands = [];
            let formattedText = '';

            if (typeof text !== 'string') text = String(text);

            if (text.startsWith('<!DOCTYPE html>') || /<!DOCTYPE\s+html/i.test(text)) {
                return `<iframe style="background:white;border:none;height:30vh;width:calc(${this.elements.maindiv.style.width} - 13px);" src="data:text/html;charset=utf-8,${encodeURIComponent(text.replace(/\\n/g, "\n"))}"></iframe>`;
            }

            if (text.startsWith("img:")) {
                const url = text.slice(4).trim();
                return `<img src="${url}" style="max-width:100%;max-height:30vh;">`;
            }

            if (text.startsWith("video:")) {
                const url = text.slice(6).trim();
                return `<video src="${url}" controls style="max-width:100%;max-height:30vh;"></video>`;
            }

            if (text.startsWith("audio:")) {
                const url = text.slice(6).trim();
                return `<audio src="${url}" controls></audio>`;
            }

            const parts = text.replace(/(?<!\\)\\\|/g, '│').replace("\n", '<br>').split(/(\|[^|]+\|)/);

            parts.forEach(part => {
                if (part.startsWith('|') && part.endsWith('|')) {
                    const command = part.slice(1, -1);
                    if (command === 'clear') {
                        styleCommands.length = 0;
                    } else {
                        styleCommands.push(command);
                    }
                } else {
                    const styleString = styleCommands.join('; ');
                    const styledPart = `<span style="${styleString}">${part}</span>`;
                    formattedText += styledPart;
                }
            });

            return formattedText;
        }

        _rawLog(content) {
            this.initConsole({STARTER:this.settings.starter,MAX:this.settings.maxSuggestions});
            if (!this.elements || !this.elements.topDiv) return;

            if (content === undefined || content === null || content === "") {
                if(this.settings.showVoid) this._prettyLog("|color:lightgrey;|Void");
                return;
            }

            const newDiv = document.createElement('div');
            newDiv.innerText = typeof content === 'string' ? content : JSON.stringify(content);
            this.elements.topDiv.appendChild(newDiv);
            
            this._scrollToBottom();
        }

        _prettyLog(content) {
            this.initConsole({STARTER:this.settings.starter,MAX:this.settings.maxSuggestions});
            if (!this.elements || !this.elements.topDiv) return;

            if (content) {
                const newDiv = document.createElement('div');
                newDiv.innerHTML = this._prettyPrint(content);
                this.elements.topDiv.appendChild(newDiv);
                this._scrollToBottom();
            } else if (this.settings.showVoid) {
                const newDiv = document.createElement('div');
                newDiv.innerHTML = this._prettyPrint("|color:lightgrey;|Undefined");
                this.elements.topDiv.appendChild(newDiv);
                this._scrollToBottom();
            }
        }

        _scrollToBottom() {
            if (this.elements && this.elements.topDiv) {
                const atBottom = this.elements.topDiv.scrollHeight - this.elements.topDiv.scrollTop <= this.elements.topDiv.clientHeight + 50;
                if (atBottom) {
                    this.elements.topDiv.scrollTop = this.elements.topDiv.scrollHeight;
                }
            }
        }

        // ----------------------------------------------------------------

        _createDOM() {
            var els = {};

            els.shadowHost = document.createElement('div');
            els.shadowHost.style.position = 'fixed';
            els.shadowHost.style.top = '0';
            els.shadowHost.style.left = '0';
            els.shadowHost.style.width = '100%';
            els.shadowHost.style.height = '100%';
            els.shadowHost.style.display = "none";
            els.shadowHost.style.zIndex = '999999999999999999999999999999999999999999';
            els.shadowHost.style.fontFamily = '"Roboto", "Helvetica Neue", Arial, sans-serif';
            els.shadowRoot = els.shadowHost.attachShadow({ mode: 'open' });
            document.body.appendChild(els.shadowHost);

            els.shadowHost.onclick = (event) => {
                if (event.target === els.shadowHost && els.shadowRoot.activeElement !== els.textarea) {
                    this.hideConsole();
                }
            };

            els.maindiv = document.createElement('div');
            els.maindiv.style.position = 'absolute';
            els.maindiv.style.top = '50%';
            els.maindiv.style.left = '50%';
            els.maindiv.style.width = '50%';
            els.maindiv.style.height = '40%';
            els.maindiv.style.transform = 'translate(-50%, -50%)';
            els.maindiv.style.border = "1px solid black";
            els.maindiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            els.maindiv.style.display = 'flex';
            els.maindiv.style.flexDirection = 'column';
            els.maindiv.style.justifyContent = 'space-between';

            els.shadowRoot.appendChild(els.maindiv);

            els.topDiv = document.createElement('div');
            els.topDiv.style.flexGrow = '1';
            els.topDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            els.topDiv.style.color = "white";
            els.topDiv.style.overflow = 'auto';
            els.topDiv.style.maxHeight = 'calc(100% - 40px)';
            els.topDiv.style.padding = "5px";
            els.topDiv.style.scrollbarWidth = "thin";
            els.topDiv.style.scrollbarColor = "#555 #111";

            els.maindiv.appendChild(els.topDiv);

            els.textarea = document.createElement('textarea');
            els.textarea.style.position = 'relative';
            els.textarea.style.width = '100%';
            els.textarea.style.minHeight = '2em';
            els.textarea.style.height = els.textarea.style.minHeight;
            els.textarea.style.maxHeight = '5em';
            els.textarea.style.resize = 'none';
            els.textarea.style.overflow = 'hidden';
            els.textarea.style.border = 'none';
            els.textarea.style.borderTop = '1px solid black';
            els.textarea.style.outline = 'none';
            els.textarea.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            els.textarea.style.boxSizing = 'border-box';
            els.textarea.style.margin = '0';
            els.textarea.style.padding = '5px';
            els.textarea.style.fontFamily = 'inherit';
            els.textarea.style.fontSize = 'inherit';
            els.textarea.style.color = "white";

            els.maindiv.appendChild(els.textarea);

            els.autocompleteDiv = document.createElement('div');
            els.autocompleteDiv.style.position = 'absolute';
            els.autocompleteDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            els.autocompleteDiv.style.color = 'white';
            els.autocompleteDiv.style.border = '1px solid #fff';
            els.autocompleteDiv.style.maxHeight = '100px';
            els.autocompleteDiv.style.overflowY = 'auto';
            els.autocompleteDiv.style.zIndex = '1000';
            els.autocompleteDiv.style.width = '50%';
            els.autocompleteDiv.style.left = "50%";
            els.autocompleteDiv.style.top = "70%";
            els.autocompleteDiv.style.border = "1px solid black";
            els.autocompleteDiv.style.transform = 'translateX(-50%)';
            els.autocompleteDiv.style.display = 'none';

            els.shadowRoot.appendChild(els.autocompleteDiv);

            this.elements = els;

            let currentIndex = -1;

            const updateAutocomplete = () => {
                if (!this.elements || !this.elements.textarea) return;

                const input = this.elements.textarea.value.trim();

                if (this.autocompleteList.length > 0 && input && input !== this.settings.starter) {
                    this.elements.autocompleteDiv.style.top = (this.elements.maindiv.offsetTop + (this.elements.maindiv.offsetHeight / 2) - 1) + 'px';
                    const suggestions = this.autocompleteList
                        .filter(item => item.startsWith(input))
                        .slice(0, this.settings.maxSuggestions);

                    this.elements.autocompleteDiv.innerHTML = '';
                    currentIndex = -1;

                    suggestions.forEach((suggestion) => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.innerText = suggestion;
                        suggestionItem.style.padding = '5px';
                        suggestionItem.style.cursor = 'pointer';
                        suggestionItem.addEventListener('click', () => {
                            if (this.elements && this.elements.textarea) {
                                this.elements.textarea.value = suggestion.replace(/\[.*?\]/g, '"_"');
                                this.elements.autocompleteDiv.style.display = 'none';
                                this.elements.textarea.focus();
                            }
                        });
                        this.elements.autocompleteDiv.appendChild(suggestionItem);
                    });

                    this.elements.autocompleteDiv.style.display = suggestions.length > 0 ? 'block' : 'none';
                } else {
                    this.elements.autocompleteDiv.style.display = 'none';
                }
            };

            const updateTextArea = () => {
                if (!this.elements || !this.elements.textarea) return;

                if (!this.elements.textarea.value.includes(this.settings.starter)) {
                    this.elements.textarea.value = this.settings.starter + this.elements.textarea.value;
                }
                const maxHeightSingle = 20;
                const maxHeightMulti = 80;
                if (this.elements.textarea.value.split('\n').length < 2 && this.elements.textarea.value.length < 80) {
                    this.elements.textarea.style.height = maxHeightSingle + 'px';
                } else {
                    this.elements.textarea.style.transition = 'height 0.2s ease';
                    this.elements.textarea.style.height = maxHeightMulti + 'px';
                }
                updateAutocomplete();
            };

            els.textarea.addEventListener('input', () => {
                updateTextArea();
            });

            els.textarea.addEventListener('keydown', (event) => {
                if (!this.elements || !this.elements.textarea) return;

                // Manual Backspace handling because scratch3 prevents default
                if (event.key === 'Backspace') {
                    event.preventDefault();

                    const el = this.elements.textarea;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const text = el.value;

                    let newValue;
                    let newCursor;

                    if (start !== end) {
                        newValue = text.slice(0, start) + text.slice(end);
                        newCursor = start;
                    } else if (start > 0) {
                        if (event.ctrlKey) {
                            const leftText = text.slice(0, start);
                            const lastSpaceIndex = leftText.lastIndexOf(' ');
                            const deleteTo = lastSpaceIndex !== -1 ? lastSpaceIndex : 0;
                            newValue = text.slice(0, deleteTo) + text.slice(end);
                            newCursor = deleteTo;
                        } else {
                            newValue = text.slice(0, start - 1) + text.slice(end);
                            newCursor = start - 1;
                        }
                    } else {
                        return;
                    }

                    el.value = newValue;
                    el.setSelectionRange(newCursor, newCursor);

                    updateTextArea();

                    return;
                }

                if (event.key === 'Tab') {
                    event.preventDefault();
                    const suggestions = this.elements.autocompleteDiv.children;
                    if (suggestions.length > 0) {
                        currentIndex = (currentIndex + (event.shiftKey ? -1 : 1) + suggestions.length) % suggestions.length;
                        Array.from(suggestions).forEach((s, i) => {
                            s.style.backgroundColor = i === currentIndex ? 'rgba(255,255,255,0.2)' : 'transparent';
                        });
                        this.elements.textarea.value = suggestions[currentIndex].innerText.replace(/\[.*?\]/g, '"_"');
                        this.elements.autocompleteDiv.style.display = 'none';
                    }
                } else if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    const val = this.elements.textarea.value.trim();
                    if (val && val !== this.settings.starter) {
                        const displayDiv = document.createElement('div');
                        displayDiv.innerText = val;
                        this.elements.topDiv.appendChild(displayDiv);
                        this._scrollToBottom();

                        this.elements.textarea.value = this.settings.starter;
                        updateTextArea();
                        
                        this._executeCommand(val)
                            .then(result => {
                                this._prettyLog(this._Stringify(result));
                            })
                            .catch(err => {
                                console.error(err);
                                this._prettyLog("|color:pink;|Error: " + err);
                            });
                    }
                }
            });
        }
    }

    Scratch.extensions.register(new P7ConsoleExtension());
})(Scratch);
