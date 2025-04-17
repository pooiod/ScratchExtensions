// based on https://github.com/CST1229/turbowarp-extensions/blob/extendable-blocks/extensions/CST1229/extendableblocks.js

(function (Scratch) {
	"use strict";

	if (!Scratch.extensions.unsandboxed) {
		throw new Error("This extension must be run unsandboxed");
	}

	const exId = "extendableTemplate";

	class ExtendableBlocks {
		getInfo() {
			return {
				id: exId,
				name: "Extendable Blocks",
				blocks: [
					{
						opcode: "extendJoin",
						blockType: Scratch.BlockType.REPORTER,
						text: "join",
						arguments: {},
						mutator: `cst_extendable_${exId}`,
						extensions: [`cst_extendable_${exId}_string`],
						disableMonitor: true,
					},
					{
						opcode: "extendArray",
						blockType: Scratch.BlockType.REPORTER,
						text: "create json array",
						arguments: {},
						mutator: `cst_extendable_${exId}`,
						extensions: [`cst_extendable_${exId}_string`],
						disableMonitor: true,
					}
				],
			};
		}

		extendJoin(args) {
			const prefix = "ARG";
			let string = "";
			for (let i = 0; prefix + i in args; i++) {
				string += Scratch.Cast.toString(args[prefix + i]);
			}
			return string;
		}
		
		extendArray(args, util) {
			const prefix = "ARG";
			const array = [];

			if (util.thread.isCompiled) {
				args = this.fixCompilerArgs(args, util, prefix);
			}

			for (let i = 0; prefix + i in args; i++) {
				array.push(args[prefix + i]);
			}

			try {
				return JSON.stringify(array);
			} catch (e) {
				return "[]";
			}
		}







		// The compiler does some weird stuff with arguments
		fixCompilerArgs(args, util, prefix = "") {
			// Copy the object just in case
			args = Object.assign({}, args);

			const blocks = util.target.blocks;
			// In the compiler, thread.peekStack works for reporter blocks
			const block = blocks.getBlock(util.thread.peekStack());
			if (!block) return args;
			for (const key in args) {
				if (key.toString().startsWith(prefix)) {
					const input = block.inputs[key];
					if (!input) continue;
					const inputBlock = blocks.getBlock(input.block);
					const shadowBlock = blocks.getBlock(input.shadow);
					if (
						shadowBlock?.opcode === "text" &&
						(!inputBlock || inputBlock?.opcode === "text")
					) {
						args[key] = Scratch.Cast.toString(args[key]);
					}
				}
			}
			return args;
		}

		joinWith(args, util) {
			const prefix = "ARG";
			const mutation = this.getCurrentMutation(args, util);
			const inputCount = Scratch.Cast.toNumber(mutation?.inputcount);
			const joiner = Scratch.Cast.toString(args[prefix + inputCount]);
			if (inputCount <= 0) return "";

			let string = "";
			for (let i = 0; i < inputCount; i++) {
				string += Scratch.Cast.toString(args[prefix + i]);
				if (i + 1 < inputCount) {
					string += joiner;
				}
			}
			return string;
		}


		runBranch(args, util) {
			util.startBranch(Scratch.Cast.toNumber(args.BRANCH));
		}

		getCurrentMutation(args, util) {
			return (
				args.mutation ||
				util.target.blocks.getBlock(util.thread.peekStack())?.mutation ||
				Scratch.vm.runtime.flyoutBlocks.getBlock(util.thread.peekStack())
					?.mutation
			);
		}
	}

	const runtime = Scratch.vm.runtime;
	const cbfsb = runtime._convertBlockForScratchBlocks.bind(runtime);
	runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
		const res = cbfsb(blockInfo, categoryInfo);
		if (blockInfo.mutator) {
			res.json.mutator = blockInfo.mutator;
		}
		return res;
	};

	function patchSB() {
		const ScratchBlocks = window?.ScratchBlocks;
		if (!ScratchBlocks) return;

		Scratch.vm.removeListener("EXTENSION_ADDED", patchSB);
		Scratch.vm.removeListener("BLOCKSINFO_UPDATE", patchSB);

		const leftArrowIcon = `data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwIDEzIiB0cmFuc2Zvcm09InNjYWxlKC0xLCAxKSI+PHBhdGggZD0iTTMuNjUuMTQ1YTIuNDEgMi40MSAwIDAgMSAxLjcyLjcxbDMuOTIgMy45MmEyLjQ1IDIuNDUgMCAwIDEgMCAzLjQ1bC0zLjkyIDMuOTFhMi40MiAyLjQyIDAgMCAxLTEuNzIuNzIgMi40OCAyLjQ4IDAgMCAxLTEuNzMtLjcxYy0uMjQtLjI5LS43MS0uNzItLjcxLTUuNjUgMC00LjkzLjQ2LTUuMzkuNzEtNS42NGEyLjQ0IDIuNDQgMCAwIDEgMS43My0uNzF6IiBmaWxsPSIjMjMxZjIwIiBvcGFjaXR5PSIuMSIvPjxwYXRoIGQ9Ik04Ljk4NSA2LjUxYTEuNDMgMS40MyAwIDAgMS0uNDIgMWwtMy45MiAzLjk0YTEuNDQgMS40NCAwIDAgMS0yIDBjLS41Ni0uNTYtLjU2LTkuMzEgMC05Ljg3YTEuNDQgMS40NCAwIDAgMSAyIDBsMy45MiAzLjkyYTEuNDMgMS40MyAwIDAgMSAuNDIgMS4wMXoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=`;
		const rightArrowIcon = `data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwIDEzIj48cGF0aCBkPSJNMy42NS4xNDVhMi40MSAyLjQxIDAgMCAxIDEuNzIuNzFsMy45MiAzLjkyYTIuNDUgMi40NSAwIDAgMSAwIDMuNDVsLTMuOTIgMy45MWEyLjQyIDIuNDIgMCAwIDEtMS43Mi43MiAyLjQ4IDIuNDggMCAwIDEtMS43My0uNzFjLS4yNC0uMjktLjcxLS43Mi0uNzEtNS42NSAwLTQuOTMuNDYtNS4zOS43MS01LjY0YTIuNDQgMi40NCAwIDAgMSAxLjczLS43MXoiIGZpbGw9IiMyMzFmMjAiIG9wYWNpdHk9Ii4xIi8+PHBhdGggZD0iTTguOTg1IDYuNTFhMS40MyAxLjQzIDAgMCAxLS40MiAxbC0zLjkyIDMuOTRhMS40NCAxLjQ0IDAgMCAxLTIgMGMtLjU2LS41Ni0uNTYtOS4zMSAwLTkuODdhMS40NCAxLjQ0IDAgMCAxIDIgMGwzLjkyIDMuOTJhMS40MyAxLjQzIDAgMCAxIC40MiAxLjAxeiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==`;
		const arrowWidth = 16;
		const arrowHeight = 32;

		class FieldImageButton extends ScratchBlocks.FieldImage {
			constructor(src, width, height, callback, opt_alt, flip_rtl, noPadding) {
				super(src, width, height, opt_alt, flip_rtl);
				this._callback = callback.bind(this);
				this.noPadding = noPadding;
			}
			init() {
				if (this.fieldGroup_) return;
				super.init();
				this.mouseDownWrapper_ = ScratchBlocks.bindEventWithChecks_(
					this.getSvgRoot(),
					"mousedown",
					this,
					this.onMouseDown_
				);
				this.getSvgRoot().style.cursor = "pointer";
			}
			showEditor_() {
				if (this._callback) {
					this._callback();
				}
			}
			getSize() {
				if (!this.size_.width) {
					this.render_();
				}
				if (!this.noPadding) return this.size_;
				return new this.size_.constructor(
					Math.max(1, this.size_.width - ScratchBlocks.BlockSvg.SEP_SPACE_X),
					this.size_.height
				);
			}
			EDITABLE = true;
		}

		ScratchBlocks.Extensions.registerMutator(
			`cst_extendable_${exId}`,
			{
				domToMutation(xmlElement) {
					this.inputCount = Math.floor(
						Number(xmlElement.getAttribute("inputcount"))
					);
					this.inputCount = Math.min(
						Math.max(this.minInputs, this.inputCount),
						this.maxInputs
					);
					if (isNaN(this.inputCount) || !Number.isFinite(this.inputCount))
						this.inputCount = this.minInputs;
					this.prevInputCount = this.inputCount;
					// HACK: fixes alt+drag duplicate not adding blocks inside
					this.updateDisplay_(true);
				},
				mutationToDom() {
					const container = document.createElement("mutation");
					container.setAttribute("inputcount", this.inputCount.toString());
					return container;
				},

				isExtendableInput(input) {
					return (
						input.name.startsWith("ARROW_") ||
						this.extendableDefs.some((def) => input.name.startsWith(def.id)) ||
						this.extendableDefsStart.some((def) =>
							input.name.startsWith(def.id)
						) ||
						this.extendableDefsEnd.some((def) => input.name.startsWith(def.id))
					);
				},

				// Disconnects all blocks in extendable inputs and returns them.
				disconnectOldBlocks_() {
					const connectionMap = {};
					const hasEndBlocks = this.extendableDefsEnd.length > 0;
					const hasStartBlocks = this.extendableDefsStart.length > 0;
					const prevEndIndex =
						this.prevInputCount + (this.extendableDefsStart.length > 0);

					// Reattach end blocks when inputs are added/removed
					const reattachMap = Object.create(null);
					if (hasEndBlocks) {
						for (const def of this.extendableDefsEnd) {
							const input = this.getInput(
								this.getExtendableInput(def.id, prevEndIndex)
							);
							if (input && input.connection) {
								reattachMap[input.name] = def.id;
							}
						}
					}

					for (const input of this.inputList) {
						if (input.connection && this.isExtendableInput(input)) {
							const target = input.connection.targetBlock();
							const saveInfo = {
								shadow: input.connection.getShadowDom(),
								block: target,
							};

							let name = input.name;
							if (reattachMap[name]) {
								name = this.getExtendableInput(
									reattachMap[name],
									this.inputCount + hasStartBlocks
								);
								if (connectionMap[name]) {
									connectionMap["$UNUSED" + name] = connectionMap[name];
									delete connectionMap[name];
								}
							}

							if (connectionMap[name]) {
								connectionMap["$UNUSED" + name] = saveInfo;
							} else {
								connectionMap[name] = saveInfo;
							}

							// Remove the shadow DOM, then disconnect the block.	Otherwise a shadow
							// block will respawn instantly, and we'd have to remove it when we remove
							// the input.
							input.connection.setShadowDom(null);
							if (target) {
								input.connection.disconnect();
							}
						}
					}
					return connectionMap;
				},

				removeAllInputs_() {
					this.inputList = this.inputList.filter((input) => {
						if (
							this.isExtendableInput(input) ||
							(input.type === ScratchBlocks.DUMMY_INPUT && this.clearLabels)
						) {
							input.dispose();
							return false;
						}
						return true;
					});
				},

				// Creates a shadow input for an extendable definition.
				attachShadow_(input, def) {
					if (!def.shadowType) return;
					ScratchBlocks.Events.disable();
					let newBlock;
					try {
						newBlock = this.workspace.newBlock(def.shadowType);
						newBlock.setFieldValue(def.shadowDefault, def.shadowField);
						newBlock.setShadow(true);
						if (!this.isInsertionMarker()) {
							newBlock.initSvg();
							newBlock.render(false);
						}
					} finally {
						ScratchBlocks.Events.enable();
					}
					if (ScratchBlocks.Events.isEnabled()) {
						ScratchBlocks.Events.fire(
							new ScratchBlocks.Events.BlockCreate(newBlock)
						);
					}
					if (newBlock.outputConnection)
						newBlock.outputConnection.connect(input.connection);
					else newBlock.previousConnection.connect(input.connection);
				},
				buildShadowDom_(def) {
					const shadowDom = document.createElement("shadow");
					shadowDom.setAttribute("type", def.shadowType);
					const fieldDom = document.createElement("field", null);
					fieldDom.setAttribute("name", def.shadowField);
					shadowDom.appendChild(fieldDom);
					return shadowDom;
				},

				// Populates an argument.
				// Puts existing blocks back in or creates new ones.
				populateArgument_(connectionMap, id, input, def) {
					let oldBlock = null;
					let oldShadow = null;

					if (connectionMap && id in connectionMap) {
						const saveInfo = connectionMap[id];
						oldBlock = saveInfo["block"];
						oldShadow = saveInfo["shadow"];
					}

					if (connectionMap && oldBlock) {
						// Reattach the old block and shadow DOM.
						connectionMap[id] = null;
						if (oldBlock.outputConnection)
							oldBlock.outputConnection.connect(input.connection);
						else oldBlock.previousConnection.connect(input.connection);
						if (def.shadowType) {
							const shadowDom = oldShadow || this.buildShadowDom_(def);
							input.connection.setShadowDom(shadowDom);
						}
					} else {
						this.attachShadow_(input, def);
					}
				},

				// Removes unused inputs from the VM
				cleanInputs() {
					const target = Scratch.vm.editingTarget;
					if (!target) return;
					const blocks = this.isInFlyout
						? Scratch.vm.runtime.flyoutBlocks
						: target.blocks;
					const vmBlock = blocks.getBlock(this.id);
					if (!vmBlock) return;

					const usedInputs = new Set(this.inputList.map((i) => i?.name));

					const inputs = vmBlock.inputs;
					for (const name of Object.keys(inputs)) {
						const input = inputs[name];
						if (!usedInputs.has(name)) {
							blocks.deleteBlock(input.block);
							blocks.deleteBlock(input.shadow);
							delete inputs[name];
						}
					}
				},

				// Gets an argument name for a prefix + index.
				getExtendableInput(prefix, index) {
					let id = prefix;
					// Special handling for substacks,
					// as their names matter for execution
					if (prefix === "SUBSTACK") {
						index += 1;
						if (index > 1) id += index;
					} else {
						id += index;
					}
					return id;
				},

				// The internal create input function.
				addInput_(def, i, connectionMap = null) {
					const id = this.getExtendableInput(def.id, i);
					const input = this.appendInput_(def.type, id);
					if (def.type === ScratchBlocks.DUMMY_INPUT) {
						input.appendField(def.check);
					} else {
						if (def.check) {
							input.setCheck(def.check);
						}
						this.populateArgument_(connectionMap, id, input, def);
					}
				},

				// The "user create input" function.
				insertInput() {
					ScratchBlocks.Events.setGroup(true);
					const oldMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
					this.inputCount++;

					this.updateDisplay_();

					// i have no idea if this is the correct way or not
					const newMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
					const ev = new ScratchBlocks.Events.BlockChange(
						this,
						"mutation",
						null,
						oldMutation,
						newMutation
					);
					ScratchBlocks.Events.fire(ev);
					ScratchBlocks.Events.setGroup(false);
				},
				// The "user delete input" function.
				deleteInput() {
					ScratchBlocks.Events.setGroup(true);
					const oldMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
					this.inputCount--;
					const plusInputs = this.extendableDefsStart.length > 0 ? 1 : 0;

					for (const def of this.extendableDefs) {
						this.removeInput(
							this.getExtendableInput(def.id, this.inputCount + plusInputs)
						);
					}
					this.updateDisplay_();

					const newMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
					const ev = new ScratchBlocks.Events.BlockChange(
						this,
						"mutation",
						null,
						oldMutation,
						newMutation
					);
					ScratchBlocks.Events.fire(ev);
					ScratchBlocks.Events.setGroup(false);

					this.cleanInputs();
				},

				createAllInputs_(connectionMap) {
					let index = 0;
					if (this.extendableDefsStart.length > 0) {
						for (const def of this.extendableDefsStart)
							this.addInput_(def, index, connectionMap);
						index++;
					}
					for (let i = 0; i < this.inputCount; i++) {
						for (const def of this.extendableDefs)
							this.addInput_(def, index, connectionMap);
						index++;
					}
					return index;
				},

				addArrowButtons_() {
					if (this.inputCount > this.minInputs) {
						const leftInput = this.appendDummyInput("ARROW_LEFT");
						const leftArrow = new FieldImageButton(
							leftArrowIcon,
							arrowWidth,
							arrowHeight,
							function () {
								this.sourceBlock_.deleteInput();
							},
							"Remove input",
							true,
							this.inputCount < this.maxInputs
						);
						leftInput.appendField(leftArrow);
					}
					if (this.inputCount < this.maxInputs) {
						const rightInput = this.appendDummyInput("ARROW_RIGHT");
						const rightArrow = new FieldImageButton(
							rightArrowIcon,
							arrowWidth,
							arrowHeight,
							function () {
								this.sourceBlock_.insertInput();
							},
							"Add input",
							true,
							false
						);
						rightInput.appendField(rightArrow);
					}
				},

				// Updates this block's inputs.
				updateDisplay_(force) {
					// HACK: prevent weird stray inputs from appearing in the top left corner
					if (
						!this.isInsertionMarker() &&
						!force &&
						this.workspace?.currentGesture_?.isDraggingBlock_ &&
						this.workspace?.currentGesture_?.targetBlock_.type === this.type
					)
						return;

					const wasRendered = this.rendered;
					if (this.isInFlyout) {
						ScratchBlocks.Events.disable();
					}

					this.rendered = false;
					this.extendableUpdatedDisplay = true;

					// First, disconnect any old blocks and save them for later
					const connectionMap = this.disconnectOldBlocks_();
					// Remove all extendable inputs
					this.removeAllInputs_();

					// Recreate all the inputs, and if any inputs were there before, put them back in
					let index = this.createAllInputs_(connectionMap);
					this.addArrowButtons_();
					// Add the ending inputs
					for (const def of this.extendableDefsEnd)
						this.addInput_(def, index, connectionMap);
					// Delete any unused blocks
					ScratchBlocks.ScratchBlocks.ProcedureUtils.deleteShadows_.call(
						this,
						connectionMap
					);
					this.prevInputCount = this.inputCount;

					this.rendered = wasRendered;
					if (wasRendered) {
						this.initSvg();
						this.render();
					}

					if (this.isInFlyout) {
						ScratchBlocks.Events.enable();
					}
				},
			},
			function () {
				// An array of extendable input definitions;
				// for each click of the right arrow button,
				// all of these inputs will be added
				this.extendableDefs = [];
				// Inputs to put before any extendable inputs.
				// If non-empty, also increases the maximum index by one
				this.extendableDefsStart = [];
				// Inputs to put after the extendable inputs (after the arrow buttons).
				// If non-empty, also increases the maximum index by one
				this.extendableDefsEnd = [];
				// The default number of inputs.
				this.inputCount = 2;
				// The minimum number of inputs.
				this.minInputs = 1;
				// The maximum number of inputs.
				this.maxInputs = Infinity;
				// If true, clears all blockInfo labels.
				this.clearLabels = false;

				// Internal.
				this.prevInputCount = this.inputCount;
			}
		);

		const createInput = (
			type, // ScratchBlocks.INPUT_VALUE, NEXT_STATEMENT or DUMMY_INPUT
			id, // The argument ID (a number will be appended to this)
			check = null, // null or "Boolean" (or the label text for DUMMY_INPUTs)
			shadowType = undefined, // The type of shadow block (or falsy for none)
			shadowField = undefined, // The field to use in the shadow block
			shadowDefault = undefined // The default shadow block value
		) => ({ type, id, check, shadowType, shadowField, shadowDefault });

		// Configuration extensions
		ScratchBlocks.Extensions.register(`cst_extendable_${exId}_string`, function () {
			this.extendableDefs = [
				createInput(ScratchBlocks.INPUT_VALUE, "ARG", null, "text", "TEXT", ""),
			];
			const ops = {
				[exId + "_extendLess"]: "<",
				[exId + "_extendEqual"]: "=",
				[exId + "_extendGreater"]: ">",
			};
			if (this.type in ops) {
				const op = ops[this.type];
				this.extendableDefsStart = [
					createInput(
						ScratchBlocks.INPUT_VALUE,
						"ARG",
						null,
						"text",
						"TEXT",
						""
					),
				];
				this.extendableDefs.unshift(
					createInput(ScratchBlocks.DUMMY_INPUT, "WORD", op)
				);
				this.inputCount = 1;
			}
		});

		const ogInitSvg = ScratchBlocks.BlockSvg.prototype.initSvg;
		ScratchBlocks.BlockSvg.prototype.initSvg = function () {
			if (this.getExtendableInput && !this.extendableUpdatedDisplay) {
				this.updateDisplay_();
			}
			return ogInitSvg.call(this);
		};
	}

	if (!("scaffolding" in window)) {
		Scratch.vm.on("EXTENSION_ADDED", patchSB);
		Scratch.vm.on("BLOCKSINFO_UPDATE", patchSB);
	}

	Scratch.extensions.register(new ExtendableBlocks());
})(Scratch);
