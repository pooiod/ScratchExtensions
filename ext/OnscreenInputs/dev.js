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
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
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
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            }
                        }
                    },

                    {
                        opcode: 'setButtonCostume',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [ID] button image to current costume',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            }
                        }
                    },

                    {
                        opcode: 'setInputButtonImage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set [BUTTON] button image to [IMG]',
                        hideFromPalette: true,
                        arguments: {
                            BUTTON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            },
                            IMG: {
                                type: Scratch.ArgumentType.STRING
                            }
                        }
                    },

                    {
                        opcode: 'moveButton',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Move button [ID] to x: [X] y: [Y]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Button1"
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0"
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0"
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

                    { blockType: Scratch.BlockType.LABEL, text: "Classes" },

                    {
                        opcode: 'setClass',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set css of class [CLASS] to [CSS]',
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

        setVisibility({ VIS }) {
            if (VIS == "hidden") {
                setCSS(`Element {
    display: none;
}`, "OnscreenInput");
            } else {
                setCSS(`Element {
    z-index: 9999;
    touch-action: none;
    position: absolute;
    user-select: none;
    transform:;
}`, "OnscreenInput");
            }
        }

        removeElm({ ID }) {
            if (document.getElementById(ID) && document.getElementById(ID).classList.contains("OnscreenInput")) {
                document.getElementById(ID).remove();
            }
        }

        setClass({ CLASS, CSS }) {
            setCSS(CSS, CLASS);
        }
        removeClass({ CLASS }) {
            setCSS("", CLASS);
        }


        removeButton(args) {
            return this.removeElm(args);
        }
		addButton({ ID, CLASS }) {
            this.setVars();

            if (document.getElementById(ID)) {
                if (document.getElementById(ID).classList.contains("OnscreenInput")) {
                    document.getElementById(ID).remove();
                } else {
                    conole.warn("Page already has an element with that ID", document.getElementById(ID));
                    return;
                }
            }

            var button = document.createElement("BUTTON");
            button.id = ID;
            button.style.top = "50%";
            button.style.left = "50%";
            button.classList.add("OnscreenInput", CLASS || "Default");
            this.stageadd(button);
		}

        moveButton({ X, Y, ID }) {
            this.setVars();

            if (document.getElementById(ID) && document.getElementById(ID).tagName === "BUTTON" && document.getElementById(ID).classList.contains("OnscreenInput")) {
                document.getElementById(ID).style.left = ((X + (this.stagewidth / 2)) / this.stagewidth) * 100 + "%";
                document.getElementById(ID).style.top = 100 - ((Y + (this.stageheight / 2)) / this.stageheight) * 100 + "%";
            }

            console.log(X)
            console.log(this.stagewidth)
            console.log(document.getElementById(ID).style.left);
        }

        setInputButtonImage({ ID, IMG }) {
            if (document.getElementById(ID) && document.getElementById(ID).tagName === "BUTTON" && document.getElementById(ID).classList.contains("OnscreenInput")) {
                document.getElementById(ID).style.backgroundImage = `url(${IMG})`;
            }
        }

        setButtonCostume({ ID, COSTUME }, util) {
            const sprite = util.target.sprite;
            const costumeName = COSTUME;
      
            let selectedCostume;
            if (!costumeName || costumeName === 'current') {
                selectedCostume = sprite.costumes_[util.target.currentCostume];
            } else {
                selectedCostume = sprite.costumes_.find(costume => costume.name === costumeName);
                if (!selectedCostume) selectedCostume = sprite.costumes_[util.target.currentCostume];
            }

            function uint8ArrayToBase64(uint8Array) {
                let binary = '';
                const len = uint8Array.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                return window.btoa(binary);
            }

            if (selectedCostume) {
                const costumeData = selectedCostume.asset.data;
                const mimeType = selectedCostume.asset.assetType.contentType;
        
                if (costumeData) {
                    const base64Data = uint8ArrayToBase64(costumeData);
                    var img = `data:${mimeType};base64,${base64Data}`;
                    this.setInputButtonImage({ ID: ID, IMG: img });
                }
            }
        }
	}
	Scratch.extensions.register(new P7OnscreenInputs());
})(Scratch);
