// 3D Splats - an extension for rendering gaussian splats with Scene3D. (made by pooiod7)

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    if (!document.getElementById("SplatWindowImports")) {
        // const importMap = document.getElementById("ThreeImportMap");
        // if (importMap) {
        //     const map = JSON.parse(importMap.textContent);
        //     map.imports["@lumaai/luma-web"] = "https://unpkg.com/@lumaai/luma-web@0.2.0/dist/library/luma-web.module.js";
        //     importMap.textContent = JSON.stringify(map, null, 2);
        // }
        
        let SplatWindowImports = document.createElement("script");
        SplatWindowImports.type = "module";
        SplatWindowImports.id = "SplatWindowImports";
        SplatWindowImports.innerHTML = `
    import { LumaSplatsSemantics, LumaSplatsThree } from "@lumaai/luma-web";

    window.LumaSplatsSemantics = LumaSplatsSemantics;
    window.LumaSplatsThree = LumaSplatsThree;
`;
        document.head.appendChild(SplatWindowImports);
    }

	class P7LumaSplats {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
		}

		getInfo() {
			return {
				id: 'P7LumaSplats',
				name: 'Luma Splats',
                color1: '#7b61e8',
				blocks: [
					{
						opcode: 'makeSplat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create splat [ID] with model [MODEL] in scene [SCENE]',
						arguments: {
							MODEL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'bbce804e-3b50-490f-a86f-6e5c4094bac0',
							},
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'splat1',
							},
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
						},
					},

                    { blockType: Scratch.BlockType.LABEL, text: "Configure Shaders" },
                    {
                        opcode: "addSplatShader",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set shader of [ID] in [SCENE] to [TRANSFORM] [COLOR]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "splat1",
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
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
                        text: 'When [ID] in scene [SCENE] loads',
                        isEdgeActivated: true,
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'splat1',
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
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

        makeSplat({ MODEL, ID, SCENE }) {
            if (!Scene3D.scenes[SCENE]) return;

            Scene3D.scenes[SCENE].objects[ID]?.destroy();
            Scene3D.scenes[SCENE].objects[ID] = {};

            if (!MODEL.startsWith('http')) {
                MODEL = 'https://lumalabs.ai/capture/' + MODEL;
            }

            Scene3D.scenes[SCENE].objects[ID] = new LumaSplatsThree({
                source: MODEL,
                loadingAnimationEnabled: true,
                // onBeforeRender: () => {
                //     Scene3D.scenes[SCENE].uniformTime.value = performance.now() / 1000;
                // }
            });

            Scene3D.scenes[SCENE].objects[ID].sourcemodel = MODEL.replace("https://lumalabs.ai/capture/", "");
            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].original = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].supported = [];

            Scene3D.scenes[SCENE].objects[ID].loaded = false;
            Scene3D.scenes[SCENE].objects[ID].onLoad = () => {
                Scene3D.scenes[SCENE].objects[ID].loaded = true;
                Scene3D.scenes[SCENE].objects[ID].captureCubemap(Scene3D.scenes[SCENE].renderer).then((capturedTexture) => {
                    Scene3D.scenes[SCENE].objects[ID].envtexture = capturedTexture;
                    // Scene3D.scenes[SCENE].world.environment = capturedTexture;
                    // Scene3D.scenes[SCENE].world.background = capturedTexture;
                    // Scene3D.scenes[SCENE].world.backgroundBlurriness = 0.5;
                });
            }

            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        onSplatLoad({ SCENE, ID }) {
            if (! Scene3D.scenes[SCENE]) return;
            if (! Scene3D.scenes[SCENE].objects[ID]) return;
            return Scene3D.scenes[SCENE].objects[ID].loaded;
        }

        setSplatType({ SCENE, ID, TYPE }) {
            if (! Scene3D.scenes[SCENE]) return;
            if (! Scene3D.scenes[SCENE].objects[ID]) return;

            if (TYPE == "object") {
                Scene3D.scenes[SCENE].objects[ID].semanticsMask = LumaSplatsSemantics.FOREGROUND;
            } else if (TYPE == "full") {
                Scene3D.scenes[SCENE].objects[ID].semanticsMask = LumaSplatsSemantics.ALL;
            } else {
                Scene3D.scenes[SCENE].objects[ID].semanticsMask = LumaSplatsSemantics.BACKGROUND;
            }
        }

        addSplatShader({ SCENE, ID, TRANSFORM, COLOR }) {
            if (! Scene3D.scenes[SCENE]) return;
            if (! Scene3D.scenes[SCENE].objects[ID]) return;

            Scene3D.scenes[SCENE].objects[ID].splats.setShaderHooks({
                vertexShaderHooks: {
                    additionalUniforms: {
                        time_s: ['float', Scene3D.scenes[SCENE].uniformTime],
                    },

                    getSplatTransform: TRANSFORM.replace(/\[newline\]/g, "\n"),
                    getSplatColor: COLOR.replace(/\[newline\]/g, "\n"),
                }
            });
        }
	}
	Scratch.extensions.register(new P7LumaSplats());
})(Scratch);
