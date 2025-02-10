// 3D Splats - an extension for rendering gaussian splats with Scene3D. (made by pooiod7)

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    if (!document.getElementById("SplatWindowImports")) {
        const importMap = document.querySelector('script[type="importmap"]#SplatImportMap');
        if (importMap) {
            const map = JSON.parse(importMap.textContent);
            map.imports["@lumaai/luma-web"] = "https://unpkg.com/@lumaai/luma-web@0.2.0/dist/library/luma-web.module.js";
            importMap.textContent = JSON.stringify(map, null, 2);
        }
        
        let SplatWindowImports = document.createElement("script");
        SplatWindowImports.type = "module";
        SplatWindowImports.id = "SplatWindowImports";
        SplatWindowImports.innerHTML = `
    import { LumaSplatsSemantics, LumaSplatsThree } from "https://unpkg.com/@lumaai/luma-web@0.2.0/dist/library/luma-web.module.js";

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

            Scene3D.scenes[SCENE].objects[ID].source = MODEL.replace("https://lumalabs.ai/capture/", "");
            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].original = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].supported = [];

            Scene3D.scenes[SCENE].objects[ID].loaded = false;
            Scene3D.scenes[SCENE].objects[ID].onLoad = () => {
                // Scene3D.scenes[SCENE].objects[ID].captureCubemap(Scene3D.scenes[SCENE].renderer).then((capturedTexture) => {
                //     Scene3D.scenes[SCENE].world.environment = capturedTexture;
                //     Scene3D.scenes[SCENE].world.background = capturedTexture;
                //     Scene3D.scenes[SCENE].world.backgroundBlurriness = 0.5;
                // });
                Scene3D.scenes[SCENE].objects[ID].loaded = true;
            }

            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
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
