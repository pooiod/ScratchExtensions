// 3D Splats - an extension for rendering gaussian splats with Scene3D. (made by pooiod7)

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
    import * as THREE from 'three';

    window.LumaSplatsSemantics = LumaSplatsSemantics;
    window.LumaSplatsThree = LumaSplatsThree;
`;
        document.head.appendChild(SplatWindowImports);
    }

	class P7Splats {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
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
						text: 'Create splat id [ID] with model [MODEL] in scene [SCENE]',
						arguments: {
							MODEL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'bbce804e-3b50-490f-a86f-6e5c4094bac0',
							},
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'splat1',
							},
						},
					},

                    { blockType: Scratch.BlockType.LABEL, text: "Configure Shaders" },
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
                    }
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
            target.updateAllDrawableProperties();
        }

		clearSplats() {
            document.querySelectorAll('.SplatCanvas3D').forEach(el => el.remove());
            this.splats = {};
        }

        makeSplat({ MODEL, ID, SCENE }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            if (!MODEL.startsWith('http')) {
                MODEL = 'https://lumalabs.ai/capture/' + MODEL;
            }

            Scene3D.scenes[SCENE].objects[ID] = new LumaSplatsThree({
                source: MODEL,
                loadingAnimationEnabled: true,
                onBeforeRender: () => {
                    this.splats[ID].uniformTime.value = performance.now() / 1000;
                }
            });

            Scene3D.scenes[SCENE].objects[ID].source = MODEL.replace("https://lumalabs.ai/capture/", "");
            Scene3D.scenes[SCENE].world.add(this.splats[ID].splats);

            Scene3D.scenes[SCENE].objects[ID].loaded = false;
            Scene3D.scenes[SCENE].objects[ID].splats.onLoad = () => {
                Scene3D.scenes[SCENE].objects[ID].captureCubemap(Scene3D.scenes[SCENE].renderer).then((capturedTexture) => {
                    this.splats[ID].scene.environment = capturedTexture;
                    this.splats[ID].scene.background = capturedTexture;
                    this.splats[ID].scene.backgroundBlurriness = 0.5;
                });
                Scene3D.scenes[SCENE].objects[ID].loaded = true;
            }
        }

        onSplatLoad({ ID }) {
            if (!this.splats[ID]) return;
            return this.splats[ID].loaded;
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
