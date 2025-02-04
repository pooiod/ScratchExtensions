// wprk in progress

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
    import { WebGLRenderer, PerspectiveCamera, Scene, Color, FogExp2, Vector3, Uniform } from 'three';
    import { LumaSplatsSemantics, LumaSplatsThree } from "@lumaai/luma-web";

    window.WebGLRenderer = WebGLRenderer;
    window.PerspectiveCamera = PerspectiveCamera;
    window.Scene = Scene;
    window.Color = Color;
    window.FogExp2 = FogExp2;
    window.Uniform = Uniform;

    window.Vector3 = Vector3;

    window.LumaSplatsSemantics = LumaSplatsSemantics;
    window.LumaSplatsThree = LumaSplatsThree;
`;
        document.head.appendChild(SplatWindowImports);
    }

	class P7Splats {
		constructor() {
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

            this.splats = {};

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
							MODEL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'bbce804e-3b50-490f-a86f-6e5c4094bac0', // 82c1dbf9-d22e-4e8d-bc48-2f29302fde75
							},
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'splat1',
							},
                            WIDTH: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: Scratch.vm.runtime.stageWidth,
							},
                            HEIGHT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: Scratch.vm.runtime.stageHeight,
							},
                            LOADANIM: {
								type: Scratch.ArgumentType.BOOLEAN,
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

                    {
                        opcode: "getSplatRender",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get splat frame from [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                        },
                    },

                    {
                        opcode: "setSplatType",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set type of [ID] to [TYPE]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "TypeSplat",
                                defaultValue: "object",
                            },
                        },
                    },

                    {
                        opcode: "rotateSplatCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Rotate camera for [ID] to x: [X] y: [Y] z: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Z: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "2",
                            },
                        },
                    },

                    {
                        opcode: "moveSplatCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set position camera of [ID] to x: [X] y: [Y] z: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Z: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "2",
                            },
                        },
                    },

                    {
                        opcode: "rotateSplatCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set rotation camera of [ID] to pitch: [X] yaw: [Y] roll: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Z: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                        },
                    },

                    {
                        opcode: "rotateSplatCameraToLookAt",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Point camera of [ID] to look at x: [X] y: [Y] z: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                            Z: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0",
                            },
                        },
                    },

                    {
                        opcode: "addSplatShader",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set shader of [ID] to [TRANSFORM] [COLOR]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            TRANSFORM: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `(vec3 position, uint layersBitmask) {
    // sin wave on x-axis in glsl
    float x = 0.;
    float z = 0.;
    float y = sin(position.x * 1.0 + time_s) * 0.1;
    return mat4(
        1., 0., 0., 0,
        0., 1., 0., 0,
        0., 0., 1., 0,
        x,  y,  z, 1.
    );
}`.replace(/\n/g, "[newline]"),
                                COLOR: {
                                    type: Scratch.ArgumentType.STRING,
                                    defaultValue: "",
                                },
                            },
                        },
                    },
				],
                menus: {
                    TypeSplat: {
                        acceptReporters: true,
                        items: ["object", "full"]
                    }
                }
			};
		}

        restoreSkin(_, util) {
            const target = util.target;
            if (!target) return;
            target.updateAllDrawableProperties();
        }

		clearSplats() {
            document.querySelectorAll('.SplatCanvas3D').forEach(el => el.remove());
            this.splats = {};
        }

        makeSplat({ MODEL, ID, WIDTH, HEIGHT, LOADANIM }) {
            if (this.splats[ID]) {
                this.splats[ID].canvas.remove();
            } this.splats[ID] = {};

            this.splats[ID].canvas = document.createElement('canvas');
            this.splats[ID].canvas.style.display = 'none';
            this.splats[ID].canvas.classList.add("SplatCanvas3D");
            this.splats[ID].canvas.width = WIDTH;
            this.splats[ID].canvas.height = HEIGHT;
            document.body.appendChild(this.splats[ID].canvas);

            this.splats[ID].uniformTime = new Uniform(0);

            this.splats[ID].render = new WebGLRenderer({
                canvas: this.splats[ID].canvas,
                antialias: false
            });

            this.splats[ID].render.setSize(WIDTH, HEIGHT, false);

            this.splats[ID].scene = new Scene();

            this.splats[ID].camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

            if (MODEL.startsWith('/')) {
                MODEL = 'https://lumalabs.ai/capture' + MODEL;
            } else if (!MODEL.startsWith('http')) {
                MODEL = 'https://lumalabs.ai/capture/' + MODEL;
            }

            this.splats[ID].splats = new LumaSplatsThree({
                source: MODEL,
                loadingAnimationEnabled: !!LOADANIM,
                onBeforeRender: () => {
                    this.splats[ID].uniformTime.value = performance.now() / 1000;
                }
            });
            this.splats[ID].scene.add(this.splats[ID].splats);

            this.splats[ID].camera.position.set(0, 0, 2);

            this.splats[ID].splats.onLoad = () => {
                this.splats[ID].splats.captureCubemap(this.splats[ID].render).then((capturedTexture) => {
                    this.splats[ID].scene.environment = capturedTexture;
                    this.splats[ID].scene.background = capturedTexture;
                    this.splats[ID].scene.backgroundBlurriness = 0.5;
                });
            }
        }

        moveSplatCamera({ ID, X, Y, Z }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.position.set(X, Y, Z);
            this.splats[ID].render.render(this.splats[ID].scene, this.splats[ID].camera);
        }

        rotateSplatCamera({ ID, X, Y, Z }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.rotation.set(X, Y, Z);
            this.splats[ID].render.render(this.splats[ID].scene, this.splats[ID].camera);
        }

        rotateSplatCameraToLookAt({ ID, X, Y, Z }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.lookAt(new Vector3(X, Y, Z));
            this.splats[ID].render.render(this.splats[ID].scene, this.splats[ID].camera);
        }

        setSplatType({ ID, TYPE }) {
            if (!this.splats[ID]) return;
            if (TYPE == "object") {
                this.splats[ID].splats.semanticsMask = LumaSplatsSemantics.FOREGROUND;
            } else if (TYPE == "full") {
                this.splats[ID].splats.semanticsMask = LumaSplatsSemantics.ALL;
            } else {
                this.splats[ID].splats.semanticsMask = LumaSplatsSemantics.BACKGROUND;
            }
        }

        setSplatFog({ ID, COLOR, DISTANCE }) {
            if (!this.splats[ID]) return;
            this.splats[ID].scene.fog = new FogExp2(new Color(COLOR).convertLinearToSRGB(), DISTANCE);
            this.splats[ID].scene.background = this.splats[ID].scene.fog.color;
        }

        getSplatRender({ ID }) {
            if (!this.splats[ID]) return;
            this.splats[ID].render.render(this.splats[ID].scene, this.splats[ID].camera);
            return this.splats[ID].canvas.toDataURL('image/png');
        }

        async showSplatFrame({ ID }, util) {
            const name = "3DsplatSkin";
            const skinName = `lms-${Cast.toString(name)}`;

            if (!this.splats[ID]) {
                this.restoreSkin(ID, util);
                return;
            }

            const url = this.getSplatRender({ ID : ID });

            let oldSkinId = null;
            if (createdSkins[skinName]) {
                oldSkinId = createdSkins[skinName];
            }

            async function _createURLSkin(URL) {
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
      
            const skinId = await _createURLSkin(url);
            if (!skinId) return;
            createdSkins[skinName] = skinId;
      
            if (oldSkinId) {
                function _refreshTargetsFromID(skinId, reset, newId) {
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

                _refreshTargetsFromID(oldSkinId, false, skinId);
                renderer.destroySkin(oldSkinId);
            }
      
            function setSkin({ NAME, TARGET }, util) {
                const skinName = `lms-${Cast.toString(NAME)}`;
                if (!createdSkins[skinName]) return;
          
                const targetName = Cast.toString(TARGET);
                const target = util.target;
                if (!target) return;
                const drawableID = target.drawableID;
          
                const skinId = createdSkins[skinName];
                renderer._allDrawables[drawableID].skin = renderer._allSkins[skinId];
            }

            setSkin({NAME:name}, util)
        }

        addSplatShader({ ID, TRANSFORM, COLOR }) {
            if (!this.splats[ID]) return;

            this.splats[ID].splats.setShaderHooks({
                vertexShaderHooks: {
                    additionalUniforms: {
                        time_s: ['float', this.splats[ID].uniformTime],
                    },

                    getSplatTransform: TRANSFORM.replace(/\[newline\]/g, "\n"),
                    getSplatColor: COLOR.replace(/\[newline\]/g, "\n"),
                }
            });
        }
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
