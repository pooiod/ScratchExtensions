// Scratch3 advanced extension template

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    const SKEW_X = Symbol("skew.x");
    const SKEW_Y = Symbol("skew.y");

	class exampleunsandboxedext {
		constructor() {
            const implementSkewForTarget = (target, originalTarget) => {
                if (SKEW_X in target) {
                    return;
                }
        
                target[SKEW_X] = 0;
                target[SKEW_Y] = 0;
        
                const original = target._getRenderedDirectionAndScale;

				const originalFunc = target.onTargetVisualChange;
                target.onTargetVisualChange = () => {
					renderSkew(target, originalFunc);
				};

				function getimage(target) {
					var img = target.sprite.costumes_;
					img[target.currentCostume];
					if (target.renderer._nextSkinId) {
						img = target.renderer._allSkins[target.renderer._nextSkinId];
						img = img._texture;
					}
					return img;
				}

                function renderSkew(target, originalFunc) {
					if (originalFunc) originalFunc();
                    console.log(target);

					// this.setSkin({ DATAURI: "" }, target)
                }
            };
        
            vm.runtime.targets.forEach((target) => implementSkewForTarget(target));
            vm.runtime.on("targetWasCreated", (target, originalTarget) =>
                implementSkewForTarget(target, originalTarget)
            );
            vm.runtime.on("PROJECT_LOADED", () => {
                vm.runtime.targets.forEach((target) => implementSkewForTarget(target));
            });
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
					},

                    {
                        opcode: "log",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "log",
                    },
				]
			};
		}

        log(_, util) {
            console.log(util.target);
        }

		func(args) {
			console.log(args);
		}
	}
	Scratch.extensions.register(new exampleunsandboxedext());
})(Scratch);
