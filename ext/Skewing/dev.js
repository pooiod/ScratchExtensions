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

                target.onTargetVisualChange = () => {renderSkew(target)};

                function renderSkew(target) {
                    console.log(target);
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
