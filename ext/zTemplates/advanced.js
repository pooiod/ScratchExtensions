// Scratch3 advanced extension template

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class exampleunsandboxedext {
		constructor() {
			this.stagewidth = Scratch.vm.runtime.stageWidth;
			this.stageheight = Scratch.vm.runtime.stageHeight;
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
			this.canvas = Scratch.vm.runtime.renderer.canvas;

			this.reloadpallet = () => {
				Scratch.vm.extensionManager.refreshBlocks();
			};

			this.stageadd = (elm) => {
				Scratch.vm.runtime.renderer.canvas.parentElement.appendChild(elm);
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

		func(args, util) {
			console.log(args);
		}
	}
	Scratch.extensions.register(new exampleunsandboxedext());
})(Scratch);
