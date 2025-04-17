// TouchMaster - Manage touch inputs (work in progress)
// Made by pooiod7

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class P7OnscreenInputs {
		constructor() {
            this.setVars = () => {
                this.stagewidth = Scratch.vm.runtime.stageWidth;
                this.stageheight = Scratch.vm.runtime.stageHeight;
                this.canvas = Scratch.vm.runtime.renderer.canvas;
            };

			this.stageadd = (elm) => {
                this.setVars();
				this.canvas.parentElement.appendChild(elm);
			};

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				console.log("project loaded");
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				this.canvas = Scratch.vm.runtime.renderer.canvas;
				console.log("project started");
			});

			Scratch.vm.runtime.on('PROJECT_STOP_ALL', () => {
				console.log("project stopped");
			});
		}

		getInfo() {
			return {
				id: 'P7OnscreenInputs',
				name: 'Onscreen Inputs',
				blocks: [
                    {
                        opcode: 'whenPressed',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when [BUTTON] button pressed',
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING
                            },
                        }
                    },
                    {
                        opcode: 'isButtonPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[BUTTON] button pressed?',
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING
                            },
                        }
                    },

                    {
                        opcode: 'setVisibility',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set buttons to be [VIS]',
                        arguments: {
                            VIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'visOptions'
                            }
                        }
                    },

                    {
                        opcode: 'setButtonCostume',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [BUTTON] button image to current costume',
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'buttonOptions'
                            },
                            IMG: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    }
				],
                menus: {
                    visOptions: {
                        items: ['showing', 'hidden']
                    }
                }
			};
		}

		func(args) {
			console.log(args);
		}
	}
	Scratch.extensions.register(new P7OnscreenInputs());
})(Scratch);
