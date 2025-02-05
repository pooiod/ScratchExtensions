// Fast bitmap render function

(function (Scratch) {
    class BitmapSkinExtension {
        constructor() {
            this.skins = {};
        }
    
        getInfo() {
            return {
            id: "bitmapSkin",
            name: "Bitmap Skin",
            color1: "#4C97FF",
                blocks: [
                    {
                        opcode: "setImage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set sprite image to [DATAURI]",
                        arguments: {
                            DATAURI: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "data:image/png;base64,...",
                            },
                        },
                    },
                    {
                        opcode: "resetSprite",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Reset sprite to normal costume",
                    },
                ],
            };
        }

        setImage(args, util) {
            const target = util.target;
            const drawableID = target.drawableID;
            const dataURI = Scratch.Cast.toString(args.DATAURI);
    
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
        
                const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);
                this.skins[drawableID] = skinId;
            };
            image.src = dataURI;
        }

        resetSprite(args, util) {
            const target = util.target;
            if (this.skins[target.drawableID]) {
                target.setCostume(target.currentCostume);
                delete this.skins[target.drawableID];
            }
        }
    }
  
    Scratch.extensions.register(new BitmapSkinExtension());
})(Scratch);
  