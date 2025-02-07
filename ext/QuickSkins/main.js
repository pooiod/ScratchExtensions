// A simple extension to render images from data uris super quickly

// Feel free to add these functions to your extension
// This is meant to be a base extension to pull code from anyways

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
                ],
            };
        }

        setSkin({ DATAURI }, util) {
            const target = util.target;
            const drawableID = target.drawableID;

            if (!target) return;

            if (!URL.startsWith("data:")) {
                async function imageToDataURI(url) {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                    });
                }

                URL = await imageToDataURI(URL)
            }
    
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
        
                const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);
            };
            image.src = Scratch.Cast.toString(DATAURI);
        }

        removeSkin(_, util) {
            const target = util.target;
            if (!target) return;
            target.updateAllDrawableProperties();
        }
    }
  
    Scratch.extensions.register(new QuickSkins());
})(Scratch);
