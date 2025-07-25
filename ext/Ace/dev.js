// Ace editor (Updated Jun 10, 2025)

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('Ace editor must run unsandboxed');
    }

    let editorElement = null;
    let externalCSSLink = null;
    let aceEditorInstance = null;
    var contextMenuData = [];

    var icon = `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22166%22%20height%3D%22166%22%20viewBox%3D%220%200%20166%20166%22%3E%3Cg%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M5%2083C5%2039.922%2039.922%205%2083%205s78%2034.922%2078%2078-34.922%2078-78%2078S5%20126.078%205%2083z%22%20fill%3D%22%2355aade%22%20stroke%3D%22%234c99c9%22%20stroke-width%3D%2210%22%2F%3E%3Cpath%20d%3D%22M100.183%2055.1s1.018-5.808%204.874-10.73c3.313-4.228%208.943-7.858%2015.254-5.947%204.381%201.105%2010.099%207.816%203.518%2011.621-7.29%204.214-7.319%205.899-7.319%205.899l-2.83%2029.38s4.116%201.475%204.038%205.483c-.09%204.721-4.826%208.93-4.826%208.93l.787%207.088s1.895.894%203.362-.307c.85-.695%209.915-9.031%209.915-9.031s7.472-7.322%208.39-.55c.627%204.625-7.99%2012.639-7.99%2012.639s-10.309%2011.22-20.734%2013.288c-11.439%202.269-11.832-7.1-11.832-7.1l.041-11.938-17.38.616s-7.754%2013.951-17.772%2019.654c-19.324%2011-27.93-3.296-28.896-11.32-1.737-17.36%2011.044-19.43%2013.557-19.464%205.126-.071%206.808%203.712%206.808%203.712l20.59-.45zm-4.287%2039.184%202.631-23.559-13.36%2023.722zM51.814%20113.2c6.778-.1%2011.075-7.65%2011.075-7.65l-14.42.021s-.991%207.692%203.345%207.629%22%20fill%3D%22%23fff%22%20stroke%3D%22%23000%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E`;

    const style = document.createElement('style');
    style.innerHTML = `
        .ace-editor .ace_marker-layer .ace_selection {
            background: #ccc;
        }
        #AceContextMenu {
            background: #f1f1f1;
            border: 1px solid #d4d4d4;
            position: absolute;
            z-index: 9999;
            padding: 5px;
            overflow: auto;
        }
        #AceContextMenuItem {
            padding: 3px;
        }
    `;
    document.head.appendChild(style);

    function stageAdd(elm) {
        Scratch.vm.runtime.renderer.canvas.parentElement.appendChild(elm);
    }

    function fixurl(inputString) {
        if (inputString.startsWith('/')) {
            return 'https://p7scratchextensions.pages.dev/ext/Ace/themes' + inputString;
        }
        return inputString;
    }

    class AceEditor {
        constructor() {
            this.lastran = ''; 
        }

        setupAceEditor(editor) {
            aceEditorInstance = editor;

            editor.setTheme({ cssClass: 'ace-editor', isDark: false });
            editor.container.style.lineHeight = 1.5;
            editor.renderer.updateFontSize();

            setInterval(() => editor.resize(), 1000);

            const defaultOptions = {
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
            };

            editor.setOptions(defaultOptions);
        }

        getInfo() {
            return {
                id: 'p7AceEditor',
                name: 'Ace',
                // menuIconURI: icon,
                color1: '#2486d4',
                color2: '#0e62a5',
                blocks: [
                    {
                        opcode: 'active',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'Editor active',
                    },

                    {
                        opcode: 'addAceEditor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add editor',
                    },
                    {
                        opcode: 'removeAceEditor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove editor',
                    },

                    {
                        opcode: 'setAceEditorSize',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set editor size to width: [WIDTH] height: [HEIGHT]',
                        arguments: {
                            WIDTH: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 80,
                            },
                            HEIGHT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 70,
                            },
                        },
                    },
                    {
                        opcode: 'setAceEditorPosition',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Move editor to x: [X] y: [Y]',
                        arguments: {
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10,
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 15,
                            },
                        },
                    },

                    {
                        opcode: 'setEditorCursorPosition',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '[CLEAR] cursor and set position to x: [COLUMN] y: [ROW]',
                        arguments: {
                            ROW: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0,
                            },
                            COLUMN: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0,
                            },
                            CLEAR: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'cursorMenu',
                            },
                        },
                    },
                    {
                        opcode: 'getEditorCursorPosition',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Cursor position',
                    },

                    {
                        opcode: 'getSelectedContent',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Selected content',
                    },

                    {
                        opcode: 'getEditorContent',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Editor content',
                    },

                    {
                        opcode: 'setEditorContent',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set editor content to [CONTENT]',
                        arguments: {
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '',
                            },
                        },
                    },
                    {
                        opcode: 'loadFileIntoEditor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Load file from URL [URL]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://example.com',
                            },
                        },
                    },

                    {
                        opcode: 'setCSSViaURL',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set theme URL [URL]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '/default.css',
                            },
                        },
                    },

                    {
                        opcode: 'setEditorOptions',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set editor options to [OPTIONS]',
                        arguments: {
                            OPTIONS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `{ "enableBasicAutocompletion": true, "enableLiveAutocompletion": false, "copyWithEmptySelection": false, "highlightActiveLine": true, "showInvisibles": false, "scrollPastEnd": true, "showGutter": true, "fontSize": "13px", "tabSize": 2, "wrap": false }`,
                            },
                        },
                    },
                    {
                        opcode: 'setEditorSyntaxLanguage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set syntax language to [LANGUAGE]',
                        arguments: {
                            LANGUAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'javascript',
                            },
                        },
                    },

                    {
                        opcode: 'exportHistory',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Export history',
                        disableMonitor: true,
                    },
                    {
                        opcode: 'importHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Import history [JSON]',
                        arguments: {
                            JSON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}',
                            },
                        },
                    },

                    {
                        opcode: 'addContextItem',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add context item [NAME] with function [FUNCTION]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'function 1',
                            },
                            FUNCTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `function1`,
                            },
                        },
                    },
                    {
                        opcode: 'removeContextItem',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove context item [NAME]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'function 1',
                            },
                        },
                    },
                    {
                        blockType: Scratch.BlockType.HAT,
                        opcode: 'doContextItem',
                        text: 'When context item [FUNC] is clicked',
                        shouldRestartExistingThreads: true,
                        isEdgeActivated: false,
                        arguments: {
                            FUNC: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'function1',
                            },
                        }
                    },

                    {
                        blockType: Scratch.BlockType.HAT,
                        opcode: 'whenTyped',
                        text: 'When editor content is changed',
                        shouldRestartExistingThreads: true,
                        isEdgeActivated: false,
                    },
                ],
                menus: {
                    cursorMenu: ["Pick up", "Drag"],
                }
            };
        }

        active() {
            return editorElement && editorElement.parentElement == Scratch.vm.runtime.renderer.canvas.parentElement ? true : false;
        }

        async addAceEditor() {
            this.removeAceEditor();

            await new Promise((resolve, reject) => {
                const aceScript = document.createElement('script');
                aceScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js';
                aceScript.onload = resolve;
                aceScript.onerror = reject;
                document.head.appendChild(aceScript);
            });

            editorElement = document.createElement('div');
            editorElement.id = 'editor';
            editorElement.style.position = 'absolute';
            editorElement.style.width = '0%';
            editorElement.style.height = '0%';
            editorElement.style.left = '100%';
            editorElement.style.top = '100%';
            stageAdd(editorElement);

            contextMenuData = [
                {
                    label: 'Undo',
                    action: function () {
                        document.execCommand('undo');
                    },
                },
                {
                    label: 'Redo',
                    action: function () {
                        document.execCommand('redo');
                    },
                },
                {
                    label: 'Copy',
                    action: function () {
                        document.execCommand('copy');
                    },
                },
                {
                    label: 'Paste',
                    action: function () {
                        navigator.clipboard.readText().then(text => {
                            aceEditorInstance.insert(text);
                        }).catch(err => {
                            console.error('Failed to read clipboard contents: ', err);
                        });
                    },
                },
                {
                    label: 'Cut',
                    action: function () {
                        document.execCommand('cut');
                    },
                }
            ];

            const aceContextMenu = document.createElement('div');
            aceContextMenu.id = 'AceContextMenu';
            aceContextMenu.style.display = 'none';

            function createMenuItem(itemData) {
                const menuItem = document.createElement('div');
                menuItem.id = 'AceContextMenuItem';
                menuItem.innerHTML = itemData.label;
                menuItem.style.cursor = 'pointer';

                menuItem.addEventListener('click', function () {
                    aceEditorInstance.focus();
                    itemData.action();
                    aceContextMenu.style.display = 'none';
                });

                aceContextMenu.appendChild(menuItem);
            }

            function updateContextMenu() {
                while (aceContextMenu.firstChild) {
                    aceContextMenu.removeChild(aceContextMenu.firstChild);
                }

                contextMenuData.forEach(function (itemData) {
                    createMenuItem(itemData);
                });
            }

            editorElement.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                aceContextMenu.style.left = event.pageX + 'px';
                aceContextMenu.style.top = event.pageY + 'px';

                updateContextMenu();

                aceContextMenu.style.display = 'block';
            });

            document.addEventListener('click', function (event) {
                if (!aceContextMenu.contains(event.target)) {
                    aceContextMenu.style.display = 'none';
                }
            });

            document.body.appendChild(aceContextMenu);

            const editor = ace.edit('editor');
            this.setupAceEditor(editor);

            aceEditorInstance.getSession().on('change', function(delta) {
                Scratch.vm.runtime.startHats('p7AceEditor_whenTyped');
            });

            this.setCSSViaURL({
                URL: 'https://p7scratchextensions.pages.dev/ext/Ace/themes/default.css',
            });
        }

        removeAceEditor() {
            if (editorElement) {
                editorElement.remove();
                aceEditorInstance = null;
            }
        }

        setAceEditorSize(args) {
            if (editorElement) {
                editorElement.style.width = `${args.WIDTH}%`;
                editorElement.style.height = `${args.HEIGHT}%`;
            }
        }

        setAceEditorPosition(args) {
            if (editorElement) {
                editorElement.style.left = `${args.X}%`;
                editorElement.style.top = `${args.Y}%`;
            }
        }

        setCSSViaURL(args) {
            if (externalCSSLink) {
                externalCSSLink.remove();
            }

            externalCSSLink = document.createElement('link');
            externalCSSLink.rel = 'stylesheet';
            externalCSSLink.href = fixurl(args.URL);
            document.head.appendChild(externalCSSLink);
        }

        whenTyped() {
            return true;
        }

        getEditorContent() {
            return aceEditorInstance ? aceEditorInstance.getValue() : '';
        }

        getSelectedContent() {
            return aceEditorInstance ? aceEditorInstance.getSelectedText() : '';
        }

        setEditorContent(args) {
            if (aceEditorInstance) {
                aceEditorInstance.setValue(args.CONTENT);
            }
        }

        setEditorCursorPosition(args) {
            if (aceEditorInstance) {
                console.log(args.CLEAR, args.CLEAR.toLowerCase().includes("ra"))
                if (!args.CLEAR.toLowerCase().includes("ra")) {
                    aceEditorInstance.selection.moveCursorTo(args.ROW, args.COLUMN);
                    aceEditorInstance.clearSelection();
                } else {
                    aceEditorInstance.selection.selectTo(args.ROW, args.COLUMN);
                }
            }
        }

        getEditorCursorPosition() {
            if (aceEditorInstance) {
                const cursorPosition = aceEditorInstance.getCursorPosition();
                return `${cursorPosition.row}, ${cursorPosition.column}`;
            }
        }

        exportHistory() {
            if (!aceEditorInstance) return "{}";
 
            const undoManager = aceEditorInstance.session.getUndoManager();
            return JSON.stringify({
                undo: undoManager.$undoStack,
                redo: undoManager.$redoStack
            });
        }

        importHistory(args) {
            const data = JSON.parse(args.JSON || "{}");
            const undoManager = aceEditorInstance.session.getUndoManager();
            undoManager.$doc = aceEditorInstance.session;
            undoManager.$undoStack = data.undo || [];
            undoManager.$redoStack = data.redo || [];
        }

        setEditorOptions(args) {
            try {
                const options = JSON.parse(args.OPTIONS);
                if (aceEditorInstance) {
                    aceEditorInstance.setOptions(options);
                }
            } catch (error) {
                console.error('Invalid JSON format for options:', error.message);
            }
        }

        addContextItem(args) {
            if (!aceEditorInstance) return;

            if (args && args.NAME) {
                let actionFunction;

                try {
                    actionFunction = () => {
                        Scratch.vm.runtime.startHats('p7AceEditor_doContextItem');
                        this.lastran = args.FUNCTION;
                    }
                } catch (error) {
                    console.error('Error creating function:', error);
                    return;
                }

                contextMenuData.push({
                    label: args.NAME,
                    action: actionFunction,
                });
            } else {
                console.error('Invalid arguments. Please provide NAME and FUNCTION.');
            }
        }

        removeContextItem(args) {
            if (!aceEditorInstance) return;
            if (args && args.NAME) {
                contextMenuData = contextMenuData.filter(item => item.label !== args.NAME);
            }
        }

        doContextItem({ FUNC }) {
            return this.lastran == FUNC;
        }

        async loadFileIntoEditor(args) {
            if (!aceEditorInstance) return;
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const fileUrl = args.URL;

            try {
                const response = await fetch(fileUrl);
                const data = await response.text();
                aceEditorInstance.setValue(data);
                return true;
            } catch {
                try {
                    const response = await fetch(proxyUrl + encodeURIComponent(fileUrl));
                    const data = await response.text();
                    aceEditorInstance.setValue(data);
                    return true;
                } catch (error) {
                    aceEditorInstance.setValue(`Error loading file!`);
                    console.error('Error loading file!', error);
                    return false;
                }
            }
        }

        setEditorSyntaxLanguage(args) {
            if (aceEditorInstance) {
                const language = args.LANGUAGE.toLowerCase();
                aceEditorInstance.getSession().setMode(`ace/mode/${language}`);
            }
        }
    }

    Scratch.extensions.register(new AceEditor());
})(Scratch);
