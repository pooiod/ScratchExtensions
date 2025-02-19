// Elemental Images (v2.3.1) by pooiod7

(function (Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	function fixurl(inputString) {
		if (inputString.startsWith('s/')) {
			return 'https://pooiod7.neocities.org/projects/scratch/extensions/extras/image' + inputString;
		}
		return inputString;
	}

	// Store image elements by ID
	const imageElements = {};

	class ElementalImagesExtension {
		constructor() {
			this.idCounter = 0;
			this.stagewidth = 480;
			this.stageheight = 360;
			this.canvas = Scratch.vm.runtime.renderer.canvas;
		}

		getInfo() {
			return {
				id: 'elementalimages',
				name: 'Elemental Images',
				color1: '#FF9700',
				color2: '#ab6500',
				color3: '#cf7a00',
				blocks: [

					//---------------- Setter blocks

					{
						opcode: 'createImage',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create Image with ID [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},
					{
						opcode: 'setImageSource',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Source to [SRC]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							SRC: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 's/duck-dance.gif',
							},
						},
					},
					{
						opcode: 'setImagePosition',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Position X: [X] Y: [Y]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							X: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: 0,
							},
							Y: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: 0,
							},
						},
					},
					{
						opcode: 'setImageSize',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Size Width: [WIDTH] Height: [HEIGHT]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							WIDTH: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: 100,
							},
							HEIGHT: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: 100,
							},
						},
					},
					{
						opcode: 'setImageCSS',
						hideFromPalette: true, // hidden for being too buggy :( 
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] CSS to [CSS]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							CSS: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'filter: grayscale(100%);',
							},
						},
					},
					{
						opcode: 'setImageRendering',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Rendering to [RENDERING]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							RENDERING: {
								type: Scratch.ArgumentType.STRING,
								menu: 'RENDERING_MENU',
								defaultValue: 'auto',
							},
						},
					},
					{
						opcode: 'setImageFilter',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Filter to [FILTER]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							FILTER: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'blur(1px)',
							},
						},
					},
					{
						opcode: 'setImageFit',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Fit to [FIT]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							FIT: {
								type: Scratch.ArgumentType.STRING,
								menu: 'FIT_MENU',
								defaultValue: 'fill',
							},
						},
					},
					{
						opcode: 'setLayer',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set Image [ID] Layer to [LAYER]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
							LAYER: {
								type: Scratch.ArgumentType.NUMBER,
								defaultValue: 1,
							},
						},
					},
					{
						opcode: 'deleteImage',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Delete Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},

					//---------------- Reporter blocks

					{
						opcode: 'getImageURL',
						blockType: Scratch.BlockType.REPORTER,
						text: 'URL of Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},
					{
						opcode: 'getImageX',
						blockType: Scratch.BlockType.REPORTER,
						text: 'X position of Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},
					{
						opcode: 'getImageY',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Y position of Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},

					{
						opcode: 'getImageWidth',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Width of Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},
					{
						opcode: 'getImageHeight',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Height of Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},
					{
						opcode: 'getImageLayer',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Layer of Image [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'image1',
							},
						},
					},
				],
				menus: {
					RENDERING_MENU: {
						acceptReporters: false,
						items: ['auto', 'crisp-edges', 'pixelated'],
					},
					FIT_MENU: {
						acceptReporters: false,
						items: ['fill', 'contain', 'cover', 'none', 'scale-down'],
					},
				},
			};
		}

		//--------------------------------------- Code for the blocks ----------

		updatesizevars() {
			this.stagewidth = Scratch.vm.runtime.stageWidth;
			this.stageheight = Scratch.vm.runtime.stageHeight;
			this.canvas = Scratch.vm.runtime.renderer.canvas;
		}

		deleteImage({ ID }) {
			const imageElement = imageElements[ID];

			if (imageElement) {
				imageElement.parentElement.removeChild(imageElement);
				delete imageElements[ID];
			}
		}

		createImage({ ID }) {
			const imageElement = document.createElement('img');
			imageElement.id = ID;

			this.updatesizevars();

			this.deleteImage({ "ID": ID })
			if (imageElements[ID]) {
				console.error(`Image "${ID}" did not remove before creation.`);
				return;
			}

			imageElement.src = defaultpng;

			imageElement.style.position = 'absolute';
			imageElement.style.imageRendering = 'auto';
			imageElement.style.pointerEvents = 'none';

			imageElement.style.left = (50) - 10 + '%'; // x - (width / 2)
			imageElement.style.bottom = (50) - 14 + '%'; // y - (height / 2)
			imageElement.style.width = 20 + '%';
			imageElement.style.height = 28 + '%';

			const stage = this.canvas;
			if (stage) {
				stage.parentElement.appendChild(imageElement);
				imageElements[ID] = imageElement;
			} else {
				console.error('Stage element not found (how?)');
			}
		}

		setImageSource({ ID, SRC }) {
			const imageElement = imageElements[ID];

			if (imageElement) {
				imageElement.src = fixurl(SRC);
			}
		}

		setImagePosition({ ID, X, Y }) {
			const imageElement = imageElements[ID];
			X -= (this.getImageWidth({ ID:ID })/2);
			Y -= (this.getImageHeight({ ID:ID })/2);

			this.updatesizevars();

			if (imageElement) {
				imageElement.style.left = ((X / this.stagewidth + 0.5) * 100) + '%';
				imageElement.style.bottom = ((Y / this.stageheight + 0.5) * 100) + '%';
			}
		}

		setImageFilter({ ID, FILTER }) {
			const imageElement = imageElements[ID];
			if (imageElement) {
				imageElement.style.filter = FILTER;
			}
		}

		setImageSize({ ID, WIDTH, HEIGHT }) {
			const imageElement = imageElements[ID];

			this.updatesizevars();

			if (imageElement) {
				imageElement.style.width = ((WIDTH / this.stagewidth) * 100) + '%';
				imageElement.style.height = ((HEIGHT / this.stageheight) * 100) + '%';
			}
		}

		setImageCSS({ ID, CSS }) {
			const imageElement = imageElements[ID];

			if (imageElement) {
				imageElement.style.cssText = CSS;
			}
		}

		setImageFit({ ID, FIT }) {
			const imageElement = imageElements[ID];
			if (imageElement) {
				imageElement.style.objectFit = FIT;
			}
		}

		setImageRendering({ ID, RENDERING }) {
			const imageElement = imageElements[ID];
			if (imageElement) {
				imageElement.style.imageRendering = RENDERING;
			}
		}

		setLayer({ ID, LAYER }) {
			const imageElement = imageElements[ID];

			if (imageElement) {
				imageElement.style.zIndex = LAYER;
			}
		}

		//---------------- Reporter blocks

		getImageX({ ID }) {
			const imageElement = imageElements[ID];

			this.updatesizevars();

			if (imageElement) {
				const stage = this.canvas;
				if (stage) {
					const stageRect = stage.getBoundingClientRect();
					const imageRect = imageElement.getBoundingClientRect();
					const xPercent = (((imageRect.left - stageRect.left) / stageRect.width) - 0.5) * this.stagewidth;
					return Math.round(xPercent);
				}
			}
			return 0;
		}

		getImageY({ ID }) {
			const imageElement = imageElements[ID];

			this.updatesizevars();

			if (imageElement) {
				const stage = this.canvas;
				if (stage) {
					const stageRect = stage.getBoundingClientRect();
					const imageRect = imageElement.getBoundingClientRect();
					const yPercent = (((stageRect.bottom - imageRect.bottom) / stageRect.height) - 0.5) * this.stageheight;
					return Math.round(yPercent);
				}
			}
			return 0;
		}

		getImageWidth({ ID }) {
			const imageElement = imageElements[ID];

			this.updatesizevars();

			if (imageElement) {
				const stage = this.canvas;
				if (stage) {
					const stageRect = stage.getBoundingClientRect();
					const imageRect = imageElement.getBoundingClientRect();
					const widthPercent = (imageRect.width / stageRect.width) * this.stagewidth;
					return Math.round(widthPercent);
				}
			}
			return 0;
		}

		getImageHeight({ ID }) {
			const imageElement = imageElements[ID];

			this.updatesizevars();

			if (imageElement) {
			const stage = this.canvas;
				if (stage) {
					const stageRect = stage.getBoundingClientRect();
					const imageRect = imageElement.getBoundingClientRect();
					const heightPercent = (imageRect.height / stageRect.height) * this.stageheight;
					return Math.round(heightPercent);
				}
			}
			return 0;
		}

		getImageLayer({ ID }) {
			const imageElement = imageElements[ID];

			if (imageElement) {
				const zIndex = parseInt(imageElement.style.zIndex, 10);
				return isNaN(zIndex) ? 0 : zIndex;
			}

			return 0;
		}

		getImageURL({ ID }) {
			const imageElement = imageElements[ID];

			if (imageElement) {
				return imageElement.src;
			} else {
				return "";
			}
		}

	}

	Scratch.extensions.register(new ElementalImagesExtension());
})(Scratch);

// The first image you will see
var defaultpng = "https://cdn2.scratch.mit.edu/get_image/user/30177353_600x600.png";
