// Scratch3 advanced extension template

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class P7Splats {
		constructor() {
			this.stagewidth = Scratch.vm.runtime.stageWidth;
			this.stageheight = Scratch.vm.runtime.stageHeight;
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
			this.canvas = Scratch.vm.runtime.renderer.canvas;

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				console.log("project loaded");
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				canvas = Scratch.vm.runtime.renderer.canvas;
				console.log("project started");
			});

			Scratch.vm.runtime.on('PROJECT_STOP', () => {
				console.log("project stopped");
			});
		}

		getInfo() {
			return {
				id: 'P7Splats',
				name: 'Splats',
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
	Scratch.extensions.register(new P7Splats());
})(Scratch);
