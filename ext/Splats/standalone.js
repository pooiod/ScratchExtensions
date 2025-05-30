// 3D Splats - an extension for rendering gaussian splats. (made by pooiod7)
// Demo project: https://yeetyourfiles.lol/file/41fc9c2e/Splat%20test%201.pmp

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

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
        document.head.appendChild(importmap);

        let SplatWindowImports = document.createElement("script");
        SplatWindowImports.type = "module";
        SplatWindowImports.id = "SplatWindowImports";
        SplatWindowImports.innerHTML = `
    import { WebGLRenderer, PerspectiveCamera, Scene, Color, FogExp2, Vector3, Uniform } from 'three';
    import { LumaSplatsSemantics, LumaSplatsThree } from "@lumaai/luma-web";
    import * as THREE from 'three';

    window.WebGLRenderer = WebGLRenderer;
    window.PerspectiveCamera = PerspectiveCamera;
    window.Scene = Scene;
    window.Color = Color;
    window.FogExp2 = FogExp2;
    window.Uniform = Uniform;
    window.Vector3 = Vector3;
    window.THREE = THREE

    window.LumaSplatsSemantics = LumaSplatsSemantics;
    window.LumaSplatsThree = LumaSplatsThree;
`;
        document.head.appendChild(SplatWindowImports);
    }

	class P7Splats {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

            this.splats = {};

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				this.clearSplats();
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				this.clearSplats();
			});
		}

		getInfo() {
			return {
				id: 'P7Splats',
				name: '3D Splats',
                color1: '#7b61e8',
				blocks: [
					{
						opcode: 'makeSplat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create splat id: [ID] model: [MODEL] width: [WIDTH] height: [HEIGHT]',
						arguments: {
							MODEL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'bbce804e-3b50-490f-a86f-6e5c4094bac0',
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

                    { blockType: Scratch.BlockType.LABEL, text: "Render Splats" },
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

                    { blockType: Scratch.BlockType.LABEL, text: "Modify Splats" },
                    {
                        opcode: "clearSplats",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Clear all splats",
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

                    { blockType: Scratch.BlockType.LABEL, text: "Move Camera" },
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
                        opcode: "setSplatCameraFOV",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set fov of camera for [ID] to [FOV]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            FOV: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "75",
                            },
                        },
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "Configure Shaders" },
                    {
                        opcode: "setSplatFog",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set fog of splat [ID] to [COLOR] with distance [DISTANCE]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            COLOR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "#e0e1ff",
                            },
                            DISTANCE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0.1",
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
                            },
                            COLOR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "",
                            },
                        },
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "Interaction Hooks" },
                    {
                        blockType: Scratch.BlockType.HAT,
                        opcode: 'onSplatLoad',
                        text: 'When [ID] loads',
                        isEdgeActivated: true,
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'splat1',
                            }
                        }
                    },
                    {
                        opcode: "jsHookSplat",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Run JavaScript [JS] on splat [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            JS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat.source",
                            },
                        },
                    },
				],
                menus: {
                    TypeSplat: {
                        acceptReporters: true,
                        items: ["object", "full", "background"]
                    }
                }
			};
		}

        restoreSkin(_, util) {
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

		clearSplats() {
            document.querySelectorAll('.SplatCanvas3D').forEach(el => el.remove());
            this.splats = {};
        }

        makeSplat({ MODEL, ID, WIDTH, HEIGHT}) {
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
                antialias: false,
                alpha: true
            });

            this.splats[ID].render.setSize(WIDTH, HEIGHT, false);

            this.splats[ID].scene = new Scene();

            this.splats[ID].camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

            if (!MODEL.startsWith('http')) {
                MODEL = 'https://lumalabs.ai/capture/' + MODEL;
            }

            this.splats[ID].source = MODEL.replace("https://lumalabs.ai/capture/", "");
            this.splats[ID].splats = new LumaSplatsThree({
                source: MODEL,
                loadingAnimationEnabled: true,
                onBeforeRender: () => {
                    this.splats[ID].uniformTime.value = performance.now() / 1000;
                }
            });
            this.splats[ID].scene.add(this.splats[ID].splats);

            this.splats[ID].camera.position.set(0, 0, 2);

            this.splats[ID].loaded = false;
            this.splats[ID].splats.onLoad = () => {
                this.splats[ID].splats.captureCubemap(this.splats[ID].render).then((capturedTexture) => {
                    this.splats[ID].scene.environment = capturedTexture;
                    this.splats[ID].scene.background = capturedTexture;
                    this.splats[ID].scene.backgroundBlurriness = 0.5;
                });
                this.splats[ID].loaded = true;
            }
        }

        onSplatLoad({ ID }) {
            if (!this.splats[ID]) return;
            return this.splats[ID].loaded;
        }

        moveSplatCamera({ ID, X, Y, Z }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.position.set(X, Y, Z);
        }

        rotateSplatCamera({ ID, X, Y, Z }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.rotation.set(X, Y, Z);
        }

        rotateSplatCameraToLookAt({ ID, X, Y, Z }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.lookAt(new Vector3(X, Y, Z));
        }

        setSplatCameraFOV({ ID, FOV }) {
            if (!this.splats[ID]) return;
            this.splats[ID].camera.fov = FOV;
            this.splats[ID].camera.updateProjectionMatrix();
        }

        setSplatType({ ID, TYPE }) {
            if (!this.splats[ID]) return;
            if (TYPE == "object") {
                this.splats[ID].splats.semanticsMask = LumaSplatsSemantics.FOREGROUND;
                this.splats[ID].scene.prevbackground = this.splats[ID].scene.background;
                this.splats[ID].scene.background = null;
            } else if (TYPE == "full") {
                this.splats[ID].splats.semanticsMask = LumaSplatsSemantics.ALL;
                if (this.splats[ID].scene.prevbackground) {
                    this.splats[ID].scene.background = this.splats[ID].scene.prevbackground;
                    this.splats[ID].scene.prevbackground = false;
                }
            } else {
                this.splats[ID].splats.semanticsMask = LumaSplatsSemantics.BACKGROUND;
                if (this.splats[ID].scene.prevbackground) {
                    this.splats[ID].scene.background = this.splats[ID].scene.prevbackground;
                    this.splats[ID].scene.prevbackground = false;
                }
            }
        }

        setSplatFog({ ID, COLOR, DISTANCE }) {
            if (!this.splats[ID]) return;
            this.splats[ID].scene.fog = new FogExp2(new Color(COLOR).convertLinearToSRGB(), DISTANCE);
            this.splats[ID].scene.background = this.splats[ID].scene.fog.color;
        }

        async getSplatRender({ ID }) {
            if (!this.splats[ID]) return;
            this.splats[ID].render.render(this.splats[ID].scene, this.splats[ID].camera);
            // return this.splats[ID].canvas.toDataURL('image/png');
            return this.splats[ID].canvas.toDataURL('image/bmp');
        }

        async showSplatFrame({ ID }, util) {
            if (!this.splats[ID]) {
                this.restoreSkin(ID, util);
                return;
            }

            var url = await this.getSplatRender({ ID: ID });

            // The fastest method I could find
            function setImage(DATAURI, util) {
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
                        } /*else {
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

            setImage(url, util);
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

        jsHookSplat({ ID, JS }) {
            if (!this.canscript) {
                if (!window.confirm("Do you want to allow this project to run JavaScript hooks? \n(This will allow it to run any code, including malicious code)")) {
                    return "Error: User denied access to JS hooks";
                } else {
                    this.canscript = true;
                }
            }

            if (!this.splats[ID]) return "Error: No splat found";
            if (!JS.includes("splat")) return "Error: Unused splat";

            var splat = this.splats[ID];
            var result = "";

            try {
                result = eval(JS);
            } catch(err) {
                result = err;
            }

            this.splats[ID] = splat;
            return result;
        }
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
