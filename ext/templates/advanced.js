// Scratch3 unsandboxed extension template

(function(Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
      throw new Error('This extension must run unsandboxed');
    }
  
    const vm = Scratch.vm;
    let canvas = vm.runtime.renderer.canvas;
    const packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
  
    class exampleunsandboxedext {
      constructor() {
        this.stagewidth = Scratch.vm.runtime.stageWidth;
        this.stageheight = Scratch.vm.runtime.stageHeight;
        
        this.reloadpallet = () => {
          Scratch.vm.extensionManager.refreshBlocks();
        };
        
        this.stageadd = (elm) => {
          const stage = canvas;
          stage.parentElement.appendChild(elm);
        };
  
        vm.runtime.on('PROJECT_LOADED', () => {
          console.log("project loaded");
        });
        
        vm.runtime.on('PROJECT_START', () => {
          canvas = vm.runtime.renderer.canvas;
          console.log("project started");
        });
  
        // Scratch.vm.extensionManager.loadExtensionURL("url");
      }
  
      getInfo() {
        return {
          id: 'exampleunsandboxedext',
          name: 'Example Unsandboxed Extension',
          blocks: [
            {
              opcode: 'func',
              blockType: Scratch.BlockType.COMMAND,
              text: 'a block [VAL]',
              arguments: {
                VAL: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'REEEEEEEEEE',
                },
              },
            }
          ]
        };
      }
  
      func(args) {
        console.log(args);
      }
  
    }
    Scratch.extensions.register(new exampleunsandboxedext());
  })(Scratch);
  