// Name: QuickSkins
// ID: P7QuickSkins
// Description: A simple extension to render images from data uris super quickly
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: false
// Created: Feb 4, 2025
// Notes: Feel free to take these code for your own extensions

(function (Scratch) {
	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    class QuickSkins {
        constructor() {}
    
        getInfo() {
            return {
                id: "P7QuickSkins",
                name: "Quick Skins",
                color1: "#9966ff",
                blocks: [
                    {
                        opcode: "setSkin",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set sprite skin to [DATAURI]",
                        arguments: {
                            DATAURI: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "data:image/bmp;base64,...",
                            },
                        },
                    },
                    {
                        opcode: "setSkinCrop",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set sprite skin to [DATAURI] at width [WIDTH] and height [HEIGHT] with crop type [CROPTYPE]",
                        arguments: {
                            DATAURI: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "data:image/bmp;base64,...",
                            },
                            WIDTH: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100,
                            },
                            HEIGHT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100,
                            },
                            CROPTYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "cropTypes",
                                defaultValue: "contain",
                            },
                        },
                    },
                    {
                        opcode: "removeSkin",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Remove sprite skin",
                    }
                ],
                menus: {
                    cropTypes: [
                        "fit",
                        "cover",
                        "stretch",
                        "cut"
                    ],
                },
            };
        }

        async setSkin({ DATAURI }, util) {
            const target = util.target || util;
            if (!target) return;

            const drawableID = target.drawableID;

            var removeSkin = false;

            if (!DATAURI.startsWith("data:")) {
                async function imageToDataURI(url) {
                    try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch(e) {
                        removeSkin = true;
                        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/ep7rVQAAAAASUVORK5CYII=`;
                    }
                }

                DATAURI = await imageToDataURI(DATAURI)
            }

            var doUpdate = Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] && Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin;

            const image = new Image();
            image.onload = () => {
                var canvas = document.createElement("canvas");

                canvas.width = image.width;
                canvas.height = image.height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);

                if (removeSkin) {
                    if (doUpdate) {
                        Scratch.vm.renderer.updateBitmapSkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, canvas, 2);
                        Scratch.vm.renderer.updateDrawableSkinId(drawableID, Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                    }/* else {
                        if (
                            Scratch.vm.renderer._allDrawables[drawableID]._skin && 
                            Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] &&
                            Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin
                        ) {
                            Scratch.vm.renderer.destroySkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                        }
                    }*/
                    target.updateAllDrawableProperties();
                }

                if (doUpdate) {
                    Scratch.vm.renderer.updateBitmapSkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, canvas, 2);
                    Scratch.vm.renderer.updateDrawableSkinId(drawableID, Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                } else {
                    const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                    Scratch.vm.renderer._allSkins[skinId].tmpSkin = true;
                    Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);
                }

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
                Scratch.vm.renderer.destroySkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
            }
            target.updateAllDrawableProperties();
        }

        async setSkinCrop({ DATAURI, WIDTH, HEIGHT, CROPTYPE }, util) {
            const target = util.target || util;
            if (!target) return;
            const drawableID = target.drawableID;

            var removeSkin = false;
            if (!DATAURI.startsWith("data:")) {
                async function imageToDataURI(url) {
                    try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch(e) {
                        removeSkin = true;
                        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/ep7rVQAAAAASUVORK5CYII=`;
                    }
                }

                DATAURI = await imageToDataURI(DATAURI)
            }
            var doUpdate = Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] && Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin;

            const image = new Image();
            image.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = WIDTH;
                canvas.height = HEIGHT;
                const ctx = canvas.getContext("2d");

                let sx, sy, sWidth, sHeight;
                const imgAspect = image.width / image.height;
                const canvasAspect = WIDTH / HEIGHT;
                if (CROPTYPE === "cover") {
                    if (imgAspect > canvasAspect) {
                        sWidth = image.height * canvasAspect;
                        sHeight = image.height;
                        sx = (image.width - sWidth) / 2;
                        sy = 0;
                    } else {
                        sWidth = image.width;
                        sHeight = image.width / canvasAspect;
                        sx = 0;
                        sy = (image.height - sHeight) / 2;
                    }
                } else if (CROPTYPE === "fit") {
                    if (imgAspect < canvasAspect) {
                        sWidth = image.height * canvasAspect;
                        sHeight = image.height;
                        sx = (image.width - sWidth) / 2;
                        sy = 0;
                    } else {
                        sWidth = image.width;
                        sHeight = image.width / canvasAspect;
                        sx = 0;
                        sy = (image.height - sHeight) / 2;
                    }
                } else if (CROPTYPE === "stretch") {
                    sx = 0;
                    sy = 0;
                    sWidth = image.width;
                    sHeight = image.height;
                } else if (CROPTYPE === "cut") {
                    sx = (image.width - WIDTH) / 2;
                    sy = (image.height - HEIGHT) / 2;
                    sWidth = Math.min(image.width, WIDTH);
                    sHeight = Math.min(image.height, HEIGHT);
                }
                ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, WIDTH, HEIGHT);

                if (removeSkin) {
                    if (doUpdate) {
                        Scratch.vm.renderer.updateBitmapSkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, canvas, 2);
                        Scratch.vm.renderer.updateDrawableSkinId(drawableID, Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                    }
                    target.updateAllDrawableProperties();
                }
                if (doUpdate) {
                    Scratch.vm.renderer.updateBitmapSkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, canvas, 2);
                    Scratch.vm.renderer.updateDrawableSkinId(drawableID, Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                }
                else {
                    const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                    Scratch.vm.renderer._allSkins[skinId].tmpSkin = true;
                    Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);
                }
                if (target.onTargetVisualChange) {
                    target.onTargetVisualChange();
                }
            };
            image.src = Scratch.Cast.toString(DATAURI);
        }
    }
  
    Scratch.extensions.register(new QuickSkins());
})(Scratch);
