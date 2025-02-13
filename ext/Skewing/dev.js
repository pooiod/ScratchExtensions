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
					renderSkew(target, originalFunc, this.setSkin);
				};

				function getimage(target) {
					var img = target.sprite.costumes_;
					// img[target.currentCostume].asset;
					// let blob = new Blob([img.data], { type: img.assetType.contentType });

					img = Scratch.vm.renderer._allDrawables[target.drawableID]._skin._id
					img = Scratch.vm.renderer._allSkins[img]._svgImage.currentSrc
					return img;
				}

				function renderSkew(target, originalFunc, setSkin) {
					if (originalFunc) originalFunc();
					
					const skewX = target[SKEW_X];
					const skewY = target[SKEW_Y];
				
					var img = getimage(target);
					if (!img) return;
				
					const image = new Image();
					image.onload = () => {
						const canvas = document.createElement("canvas");
						const ctx = canvas.getContext("2d");
				
						ctx.setTransform(1, skewY / 100, skewX / 100, 1, 0, 0);
						canvas.width = image.width;
						canvas.height = image.height;
				
						ctx.drawImage(image, 0, 0);
				
						const DATAURI = canvas.toDataURL();
						
						setSkin({ DATAURI }, target);
					};
					image.src = img;
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
                        opcode: "setSkew",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set skew to x: [X] y: [Y]",
                        arguments: {
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100,
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100,
                            },
                        },
                        filter: [Scratch.TargetType.SPRITE],
                    },
                    {
                        opcode: "getSkew",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "skew",
                        filter: [Scratch.TargetType.SPRITE],
                        disableMonitor: true,
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

		async setSkin({ DATAURI }, util) {
            const target = util.target || util;
            if (!target) return;

            const drawableID = target.drawableID;

            // This can cause list counter desync issues, but it's the best I have for now.
            if (
                Scratch.vm.renderer._allDrawables[drawableID]._skin && 
                Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] &&
                Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin
            ) {
                Scratch.vm.renderer._allSkins.splice(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, 1);
            }

            if (!DATAURI.startsWith("data:")) {
                async function imageToDataURI(url) {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                    });
                }

                DATAURI = await imageToDataURI(DATAURI)
            }

            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
        
                const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                Scratch.vm.renderer._allSkins[skinId].tmpSkin = true;
                Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);

                if (target.onTargetVisualChange) {
                    target.onTargetVisualChange();
                }
            };
            image.src = Scratch.Cast.toString(DATAURI);
        }

        removeSkin(_, util) {
            const target = util.target;
            if (!target) return;
            const drawableID = target.drawableID;
            if (
                Scratch.vm.renderer._allDrawables[drawableID]._skin && 
                Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] &&
                Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin
            ) {
                Scratch.vm.renderer._allSkins.splice(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, 1);
            }
            target.updateAllDrawableProperties();
        }

        setSkew(args, util) {
            const target = util.target || util;
            if (!target) return;

            const skewX = args.X;
            const skewY = args.Y;

            target[SKEW_X] = skewX;
            target[SKEW_Y] = skewY;

            if (target.onTargetVisualChange) {
                target.onTargetVisualChange();
            }
        }

        getSkew(_, util) {
            const target = util.target || util;
            if (!target) return [0, 0];

            return [target[SKEW_X], target[SKEW_Y]];
        }
	}
	Scratch.extensions.register(new exampleunsandboxedext());
})(Scratch);
