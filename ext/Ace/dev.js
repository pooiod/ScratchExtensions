// Ace editor

(function (Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
      throw new Error('Ace editor must run unsandboxed');
    }
  
    const vm = Scratch.vm;
    const canvas = vm.runtime.renderer.canvas;
  
    let editorElement = null;
    let externalCSSLink = null;
    let aceEditorInstance = null;
    var contextMenuData = "[]";
  
    function stageAdd(elm) {
      const stage = document.querySelector('canvas');
      if (stage) {
        stage.parentElement.appendChild(elm);
      } else {
        console.error('Stage not found (how?)');
      }
    }
    
    function fixurl(inputString) {
      if (inputString.startsWith('/')) {
        return 'https://pooiod7.neocities.org/projects/scratch/extensions/external-files/ace' + inputString;
      }
      return inputString;
    }
  
    class AceEditor {
      constructor() {
        this.stagewidth = Scratch.vm.runtime.stageWidth;
        this.stageheight = Scratch.vm.runtime.stageHeight;
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
          menuIconURI: 'https://pooiod7.neocities.org/projects/scratch/extensions/external-files/ace-favicon.png',
          color1: '#2486d4',
          color2: '#0e62a5',
          blocks: [
            {
              opcode: 'addAceEditor',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Add Editor',
            },
            {
              opcode: 'removeAceEditor',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Remove Editor',
            },
            {
              opcode: 'setAceEditorSize',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set Editor Size width: [WIDTH] height: [HEIGHT]',
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
              opcode: 'setCSSViaURL',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set theme URL [URL]',
              arguments: {
                URL: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue:
                    '/default.css',
                },
              },
            },
            {
              opcode: 'getEditorContent',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Editor content',
            },
            {
              opcode: 'getSelectedContent',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Selected content',
            },
            {
              opcode: 'setEditorContent',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set Editor Content to [CONTENT]',
              arguments: {
                CONTENT: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: '',
                },
              },
            },
            {
              opcode: 'setEditorCursorPosition',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set Cursor Position [ROW] [COLUMN]',
              arguments: {
                ROW: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 0,
                },
                COLUMN: {
                  type: Scratch.ArgumentType.NUMBER,
                  defaultValue: 0,
                },
              },
            },
            {
              opcode: 'setEditorOptions',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set Editor Options to [OPTIONS]',
              arguments: {
                OPTIONS: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue:
                    `{ "enableBasicAutocompletion": true, "enableLiveAutocompletion": false, "copyWithEmptySelection": false, "highlightActiveLine": true, "showInvisibles": false, "scrollPastEnd": true, "showGutter": true, "fontSize": "13px", "tabSize": 2, "wrap": false }`,                          
                },
              },
            },
            {
              opcode: 'loadFileIntoEditor',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Load File from URL [URL]',
              arguments: {
                URL: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'https://example.com',
                },
              },
            },
            {
              opcode: 'addContextItem',
              hideFromPalette: true, // wip
              blockType: Scratch.BlockType.COMMAND,
              text: 'Add contect item [NAME] with function [FUNCTION]',
              arguments: {
                NAME: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'alert "e"',
                },
                FUNCTION: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: `alert("e");`,
                },
              },
            },
            {
              opcode: 'setEditorSyntaxLanguage',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set Syntax Language to [LANGUAGE]',
              arguments: {
                LANGUAGE: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'javascript',
                },
              },
            },
          ],
        };
      }
  
      addAceEditor() {
        this.removeAceEditor(); // Remove existing editor if any
  
        // Add Ace library dynamically
        const aceScript = document.createElement('script');
        aceScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js';
        aceScript.onload = () => {
          editorElement = document.createElement('div');
          editorElement.id = 'editor';
          editorElement.style.position = 'absolute';
          editorElement.style.width = '60%'; // Default width
          editorElement.style.height = '55%'; // Default height
          editorElement.style.left = '20%'; // Default x
          editorElement.style.top = '20%'; // Default y
          stageAdd(editorElement);
  
  // contextMenuData = [
  //   {
  //     label: 'Undo',
  //     action: function () {
  //       document.execCommand('undo');
  //     },
  //   },
  //   {
  //     label: 'Alert hello',
  //     action: function () {
  //       alert("hello");
  //     },
  //   },
  //   {
  //     label: 'Redo',
  //     action: function () {
  //       document.execCommand('redo');
  //     },
  //   },
  //   // Add more items to the contextMenuData array as needed
  // ];
  
  // var aceContextMenu = document.createElement('div');
  // aceContextMenu.id = 'AceContextMenu'; // Assign an ID
  // aceContextMenu.style.position = 'absolute';
  // aceContextMenu.style.backgroundColor = '#f1f1f1';
  // aceContextMenu.style.border = '1px solid #d4d4d4';
  // aceContextMenu.style.padding = '8px';
  // aceContextMenu.style.display = 'none';
  // aceContextMenu.style.zIndex = '9999';
  
  // // Helper function to create context menu items from the data
  // function createMenuItem(itemData) {
  //   var menuItem = document.createElement('div');
  //   menuItem.innerHTML = itemData.label;
  //   menuItem.style.cursor = 'pointer';
  
  //   menuItem.addEventListener('click', function () {
  //     itemData.action();
  //     aceContextMenu.style.display = 'none';
  //   });
  
  //   aceContextMenu.appendChild(menuItem);
  // }
  
  // // Function to update context menu items based on the provided data
  // function updateContextMenu() {
  //   // Clear existing menu items
  //   while (aceContextMenu.firstChild) {
  //     aceContextMenu.removeChild(aceContextMenu.firstChild);
  //   }
  
  //   // Create menu items from contextMenuData
  //   contextMenuData.forEach(function (itemData) {
  //     createMenuItem(itemData);
  //   });
  // }
  
  // editorElement.addEventListener('contextmenu', function (event) {
  //   event.preventDefault();
  //   aceContextMenu.style.left = event.pageX + 'px';
  //   aceContextMenu.style.top = event.pageY + 'px';
  
  //   // Update the context menu items before displaying
  //   updateContextMenu();
  
  //   aceContextMenu.style.display = 'block';
  // });
  
  // document.addEventListener('click', function (event) {
  //   if (!aceContextMenu.contains(event.target)) {
  //     aceContextMenu.style.display = 'none';
  //   }
  // });
  
  // document.body.appendChild(aceContextMenu);
  
          const editor = ace.edit('editor');
          this.setupAceEditor(editor);
        };
        document.head.appendChild(aceScript);
  
        // Apply default CSS
        this.setCSSViaURL({
          URL:
            'https://pooiod7.neocities.org/projects/scratch/extensions/external-files/ace/default.css',
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
        // Remove existing CSS link
        if (externalCSSLink) {
          externalCSSLink.remove();
        }
  
        // Add new CSS link dynamically
        externalCSSLink = document.createElement('link');
        externalCSSLink.rel = 'stylesheet';
        externalCSSLink.href = fixurl(args.URL);
        document.head.appendChild(externalCSSLink);
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
          aceEditorInstance.selection.moveCursorTo(args.ROW, args.COLUMN);
        }
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
    if (args && args.NAME) {
      let actionFunction;
  
      try {
        // Create a function from the provided code string
        actionFunction = new Function(args.FUNCTION);
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
  
      loadFileIntoEditor(args) {
        if (aceEditorInstance) {
          const proxyUrl = 'https://api.allorigins.win/raw?url=';
          const fileUrl = args.URL;
  
          return fetch(fileUrl)
            .then((response) => response.text())
            .then((data) => {
              aceEditorInstance.setValue(data);
              return true;
            })
            .catch((error) => { // can't get file, try with proxy
              fetch(proxyUrl + encodeURIComponent(fileUrl))
                .then((response) => response.text())
                .then((data) => {
                  aceEditorInstance.setValue(data);
                  return true;
                })
                .catch((error) => { // can't use proxy
                  aceEditorInstance.setValue(`Error loading file! 
  `, error);
                  console.error('Error loading file! ', error);
                  return false;
                });
            });
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