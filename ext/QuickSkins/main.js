// A simple extension to render images from data uris super quickly
// Feel free to add these functions to your extension

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
                                defaultValue: "data:image/png;base64,...",
                            },
                        },
                    },
                    {
                        opcode: "removeSkin",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Remove sprite skin",
                    },

                    // {
                    //     opcode: "log",
                    //     blockType: Scratch.BlockType.COMMAND,
                    //     text: "log",
                    // },
                ],
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
    }
  
    Scratch.extensions.register(new QuickSkins());
})(Scratch);
