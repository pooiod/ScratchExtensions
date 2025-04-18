// Onscreen Inputs (work in progress) - by pooiod7

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    function setCSS(rawcss, id) {
        var css = rawcss.replace(/Element/g, `.OnscreenInput.${id}`)
            .replace(/button-size:/g, "width:")
            .replace(/transform:/g, "transform: translate(-50%, -50%)");

        if (document.getElementById(id) && document.getElementById(id).tagName === "STYLE" && document.getElementById(id).classList.contains("OnscreenInputStyle")) {
            document.getElementById(id).textContent = css;
            document.getElementById(id).setAttribute("raw", rawcss);
            if (!css) {
                document.getElementById(id).remove();
            }
        } else {
            const style = document.createElement('style');
            style.classList.add("OnscreenInputStyle");
            style.setAttribute("raw", rawcss);
            style.id = id;
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    setCSS(`Element {
    z-index: 9999;
    touch-action: none;
    position: absolute;
    user-select: none;
    transform:;
}`, "OnscreenInput");

    setCSS(`buttonElement {
    button-size: 20%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 4px solid rgba(75, 75, 75, 0.2);
    background-color: rgba(46, 46, 46, 0.6);
    color: #fff;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: transform 0.1s ease, background-color 0.1s ease;
}

buttonElement:hover {
    transform: scale(0.97);
}

buttonElement:active {
    transform: scale(0.9);
    background-color: rgba(29, 29, 29, 0.8);
}`, "Default");

	class P7OnscreenInputs {
		constructor() {
            this.setVars = () => {
                this.stagewidth = Scratch.vm.runtime.stageWidth;
                this.stageheight = Scratch.vm.runtime.stageHeight;
                this.canvas = Scratch.vm.runtime.renderer.canvas;
            };

			this.stageadd = (elm) => {
                this.setVars();
                this.canvas.parentElement.style.containerType = "size";
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
                color1: "#4b4a60",
                color2: "#383747",
				blocks: [
                    {
                        opcode: 'setVisibility',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set inputs to be [VIS]',
                        arguments: {
                            VIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'visOptions'
                            }
                        }
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "Buttons" },

                    {
                        opcode: 'addButton',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add button [ID] with class [CLASS]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            },
                            CLASS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Default"
                            }
                        }
                    },

                    {
                        opcode: 'removeButton',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove button [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'whenPressed',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when [BUTTON] button pressed',
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            },
                        }
                    },

                    {
                        opcode: 'isButtonPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'button [BUTTON] pressed?',
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            },
                        }
                    },

                    {
                        opcode: 'isButtonHovered',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'button [BUTTON] hovered?',
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            },
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
                    },

                    {
                        opcode: 'setButtonImage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [BUTTON] button image to current costume',
                        hideFromPalette: true,
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'buttonOptions'
                            },
                            IMG: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },


                    { blockType: Scratch.BlockType.LABEL, text: "Classes" },

                    {
                        opcode: 'addClass',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add class [CLASS] with css [CSS]',
                        arguments: {
                            CLASS: {
                                type: Scratch.ArgumentType.STRING
                            },
                            CSS: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },
                    {
                        opcode: 'removeClass',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove class [CLASS]',
                        arguments: {
                            CLASS: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },
				],
                menus: {
                    visOptions: {
                        items: ['showing', 'hidden']
                    }
                }
			};
		}

        removeElm({ ID }) {
            if (document.getElementById(ID).classList.contains("OnscreenInput")) {
                document.getElementById(ID).remove();
            }
        }

        removeButton(args) {
            return this.removeElm(args);
        }
		addButton({ ID, CLASS }) {
            this.setVars();

            if (document.getElementById(ID)) {
                return;
            }

            var button = document.createElement("BUTTON");
            button.id = ID;
            button.style.top = "50%";
            button.style.left = "50%";
            button.classList.add("OnscreenInput", CLASS || "Default");
            this.stageadd(button);
		}
	}
	Scratch.extensions.register(new P7OnscreenInputs());
})(Scratch);
