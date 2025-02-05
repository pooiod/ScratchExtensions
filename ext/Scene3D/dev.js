// work in progress 3D extension

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    if (!document.getElementById("WindowImports3D")) {
        let script = document.createElement("script");
        script.type = "module";
        script.id = "WindowImports3D";
        script.innerHTML = `import * as THREE from 'https://unpkg.com/three@0.157.0/build/three.module.js';
window.Scene3D = {};
window.Scene3D.Scenes = {};
window.Scene3D.func = THREE;`;
        document.head.appendChild(script);
    }

	class P7Splats {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				this.clearScenes();
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				this.clearScenes();
			});
		}

		getInfo() {
			return {
				id: 'P7Scene3D',
				name: '3D Scenes',
                // color1: '',
				blocks: [
					{
						opcode: 'makeScene',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create scene id: [ID] width: [WIDTH] height: [HEIGHT]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
                            WIDTH: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: Scratch.vm.runtime.stageWidth,
							},
                            HEIGHT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: Scratch.vm.runtime.stageHeight,
							},
						},
					},

                    { blockType: Scratch.BlockType.LABEL, text: "Object Creation" },
					{
						opcode: 'makeBox',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create box [ID] with a width of [WIDTH] and a height of [HEIGHT] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'box1',
							},
                            WIDTH: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: Scratch.vm.runtime.stageWidth,
							},
                            HEIGHT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: Scratch.vm.runtime.stageHeight,
							},
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

                    { blockType: Scratch.BlockType.LABEL, text: "Render" },
                    {
                        opcode: "showSceneFrame",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Show frame from scene [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                        },
                    },
                    {
                        opcode: "getSceneRender",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get frame from scene [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                        },
                    },
                ],
			};
		}

		clearScenes() {
            document.querySelectorAll('.SceneCanvas3D').forEach(el => el.remove());
            Scene3D.Scenes = {};
        }

        makeScene({ ID, WIDTH, HEIGHT}) {
            if (Scene3D.Scenes[ID]) {
                Scene3D.Scenes[ID].canvas.remove();
            } Scene3D.Scenes[ID] = {};

            Scene3D.Scenes[ID].canvas = document.createElement('canvas');
            Scene3D.Scenes[ID].canvas.style.display = 'none';
            Scene3D.Scenes[ID].canvas.classList.add("SceneCanvas3D");
            Scene3D.Scenes[ID].canvas.width = WIDTH;
            Scene3D.Scenes[ID].canvas.height = HEIGHT;
            document.body.appendChild(Scene3D.Scenes[ID].canvas);

            Scene3D.Scenes[ID].uniformTime = new Scene3D.func.Uniform(0);

            Scene3D.Scenes[ID].render = new Scene3D.func.WebGLRenderer({
                canvas: Scene3D.Scenes[ID].canvas,
                antialias: false,
                alpha: true
            });

            Scene3D.Scenes[ID].render.setSize(WIDTH, HEIGHT, false);

            Scene3D.Scenes[ID].objects = {};
            Scene3D.Scenes[ID].world = new Scene3D.func.Scene();

            Scene3D.Scenes[ID].camera = new Scene3D.func.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

            Scene3D.Scenes[ID].camera.position.set(0, 0, 2);

            Scene3D.Scenes[ID].objects.helper = new Scene3D.func.AxesHelper( 5 );
            Scene3D.Scenes[ID].world.add(Scene3D.Scenes[ID].objects.helper);
        }

        async getSceneRender({ ID, FORMAT }) {
            if (!Scene3D.Scenes[ID]) return;
            Scene3D.Scenes[ID].render.render(Scene3D.Scenes[ID].world, Scene3D.Scenes[ID].camera);
            return Scene3D.Scenes[ID].canvas.toDataURL(`image/${FORMAT || "png"}`);
        }

        async showSceneFrame({ ID }, util) {
            if (!util.target) return;
            if (!Scene3D.Scenes[ID]) {
                util.target.updateAllDrawableProperties();
                return;
            }

            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);

                const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                Scratch.vm.renderer.updateDrawableSkinId(util.target.drawableID, skinId);
            };
            image.src = await this.getSceneRender({ ID: ID, FORMAT: 'bmp' });;
        }

        jsHookScene({ ID, JS }) {
            if (!this.canscript) {
                if (!window.confirm("Do you want to allow this project to run JavaScript hooks? \n(This will allow it to run any code, including malicious code)")) {
                    return "Error: User denied access to JS hooks";
                } else {
                    this.canscript = true;
                }
            }

            if (!Scene3D.Scenes[ID]) return "Error: No scene found";
            if (!JS.includes("scene")) return "Error: Unused scene";

            var scene = Scene3D.Scenes[ID];
            var result = "";

            try {
                result = eval(JS);
            } catch(err) {
                result = err;
            }

            Scene3D.Scenes[ID] = scene;
            return result;
        }
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
