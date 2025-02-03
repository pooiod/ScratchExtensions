// do not use this yet!

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    var createdSkins = [];
    const runtime = Scratch.vm.runtime;
    const renderer = runtime.renderer;
    const Cast = Scratch.Cast;

    if (!document.getElementById("SplatImportMap")) {
        const importmap = document.createElement('script');
        importmap.type = 'importmap';
        importmap.id = "SplatImportMap";
        importmap.textContent = JSON.stringify({
            imports: {
                "three": "https://unpkg.com/three@0.157.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.157.0/examples/jsm/",
                "@lumaai/luma-web": "https://unpkg.com/@lumaai/luma-web@0.2.0/dist/library/luma-web.module.js"
            }
        });
        document.currentScript.after(importmap);

        let SplatWindowImports = document.createElement("script");
        SplatWindowImports.type = "module";
        SplatWindowImports.id = "SplatWindowImports";
        SplatWindowImports.innerHTML = `
    import { WebGLRenderer, PerspectiveCamera, Scene, Color, FogExp2 } from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { LumaSplatsSemantics, LumaSplatsThree } from "@lumaai/luma-web";
    
    window.WebGLRenderer = WebGLRenderer;
    window.PerspectiveCamera = PerspectiveCamera;
    window.Scene = Scene;
    window.Color = Color;
    window.FogExp2 = FogExp2;
    
    window.OrbitControls = OrbitControls;
    
    window.LumaSplatsSemantics = LumaSplatsSemantics;
    window.LumaSplatsThree = LumaSplatsThree;
`;
        document.head.appendChild(SplatWindowImports);
    }

	class P7Splats {
		constructor() {
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

            this.splats = {};

            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'none';
            document.body.appendChild(this.canvas);

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				this.clearSplats();
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				this.clearSplats();
			});

			Scratch.vm.runtime.on('PROJECT_STOP', () => {
				this.clearSplats();
			});
		}

		getInfo() {
			return {
				id: 'P7Splats',
				name: 'Splats',
				blocks: [
					{
						opcode: 'makeSplat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create splat: Model [MODEL], ID [ID], Width [WIDTH], Height [HEIGHT], Load animation? [LOADANIM]',
						arguments: {
							CONFIG: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'REEEEEEEEEE',
							},
						},
					},

                    {
                        opcode: "showSplatFrame",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Show splat frame from [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                        },
                    },
				]
			};
		}

        async _createURLSkin(URL) {
            let imageData;
            if (await Scratch.canFetch(URL)) {
                imageData = await Scratch.fetch(URL);
            } else {
                return;
            }

            const contentType = imageData.headers.get("Content-Type");
            if (
                contentType === "image/png" ||
                contentType === "image/jpeg" ||
                contentType === "image/bmp" ||
                contentType === "image/webp"
            ) {
                const output = new Image();
                output.src = URL;
                output.crossOrigin = "anonymous";
                await output.decode();
                return renderer.createBitmapSkin(output);
            }
        }

        _refreshTargetsFromID(skinId, reset, newId) {
            const drawables = renderer._allDrawables;
            const skins = renderer._allSkins;
      
            for (const target of runtime.targets) {
                const drawableID = target.drawableID;
                const targetSkin = drawables[drawableID].skin.id;
        
                if (targetSkin === skinId) {
                    target.updateAllDrawableProperties();
                    if (!reset)
                    drawables[drawableID].skin = newId ? skins[newId] : skins[skinId];
                }
            }
        }

        setSkin(args, util) {
            const skinName = `lms-${Cast.toString(args.NAME)}`;
            if (!createdSkins[skinName]) return;
      
            const targetName = Cast.toString(args.TARGET);
            const target = util.target;
            if (!target) return;
            const drawableID = target.drawableID;
      
            const skinId = createdSkins[skinName];
            renderer._allDrawables[drawableID].skin = renderer._allSkins[skinId];
        }
      
        restoreSkin(args, util) {
            const target = util.target;
            if (!target) return;
            target.updateAllDrawableProperties();
        }

		clearSplats() {
            this.splats = {};
        }

        makeSplat({MODEL, ID, WIDTH, HEIGHT, LOADANIM}) {
            this.splats[ID] = {}

            this.canvas.width = WIDTH + "px";
            this.canvas.height = HEIGHT + "px";

            this.splats[ID].render = new WebGLRenderer({
                canvas: this.canvas,
                antialias: false
            });

            this.splats[ID].render.setSize(WIDTH, HEIGHT, false);

            this.splats[ID].scene = new Scene();

            this.splats[ID].camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
            this.splats[ID].camera.position.set( 0, 0, 2 );

            this.splats[ID].splats = new LumaSplatsThree({
                source: 'https://lumalabs.ai/capture/2c2f462b-be1a-4d0d-bf74-0975dba73d49',
                loadingAnimationEnabled: !!LOADANIM
            });
            this.splats[ID].scene.add(this.splats[ID].splats);

            this.splats[ID].splats.onLoad = () => {
                splats.captureCubemap(renderer).then((capturedTexture) => {
                    scene.environment = capturedTexture;
                    scene.background = capturedTexture;
                    scene.backgroundBlurriness = 0.5;
                });
            }
        }

        async showSplatFrame(args, util) {
            const name = "3DsplatSkin";
            const skinName = `lms-${Cast.toString(name)}`;
            const url = Cast.toString(args.ID);
      
            let oldSkinId = null;
            if (createdSkins[skinName]) {
                oldSkinId = createdSkins[skinName];
            }
      
            const skinId = await this._createURLSkin(url);
            if (!skinId) return;
            createdSkins[skinName] = skinId;
      
            if (oldSkinId) {
                this._refreshTargetsFromID(oldSkinId, false, skinId);
                renderer.destroySkin(oldSkinId);
            }
      
            this.setSkin({NAME:name}, util)
        }
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
