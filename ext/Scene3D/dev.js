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
window.Scene3D.scenes = {};
window.Scene3D.func = THREE;`;
        document.head.appendChild(script);
    }

	class P7Splats {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
                this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
				this.clearscenes();
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				this.clearscenes();
			});

            this.getRandomColor = function() {
                var letters = '0123456789ABCDEF';
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
		}

		getInfo() {
			return {
				id: 'P7Scene3D',
				name: '3D scenes',
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

                    { blockType: Scratch.BlockType.LABEL, text: "Move Camera" },
                    {
                        opcode: "moveCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set position camera of [ID] to x: [X] y: [Y] z: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
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
                        opcode: "rotateCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Rotate camera for [ID] to x: [X] y: [Y] z: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
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
                        opcode: "rotateCameraToLookAt",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Point camera of [ID] to look at x: [X] y: [Y] z: [Z]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
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

                    // {
                    //     opcode: "setCameraFOV",
                    //     blockType: Scratch.BlockType.COMMAND,
                    //     text: "Set fov of camera for [ID] to [FOV]",
                    //     arguments: {
                    //         ID: {
                    //             type: Scratch.ArgumentType.STRING,
                    //             defaultValue: "scene1",
                    //         },
                    //         FOV: {
                    //             type: Scratch.ArgumentType.NUMBER,
                    //             defaultValue: "75",
                    //         },
                    //     },
                    // },

                    { blockType: Scratch.BlockType.LABEL, text: "Object Creation" },
					{
						opcode: 'makeBox',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create box [ID] with a width of [WIDTH] and a height of [HEIGHT] and a depth of [DEPTH] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'box1',
							},
                            WIDTH: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 20,
							},
                            HEIGHT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 20,
							},
                            DEPTH: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 20,
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

                    { blockType: Scratch.BlockType.LABEL, text: "Debug" },
                    {
                        opcode: "makeHelperAxes",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Make axis helper [ID] with size [SIZE] in scene [SCENE]",
                        arguments: {
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "AxisHelper",
                            },
                            SIZE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "50",
                            },
                        },
                    },
                    {
                        opcode: "makeHelperGrid",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Make grid helper [ID] with size [SIZE] and parts [PARTS] in scene [SCENE]",
                        arguments: {
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "AxisHelper",
                            },
                            SIZE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "50",
                            },
                            PARTS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "10",
                            },
                        },
                    },

                    {
                        opcode: "jsHookScene",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Run JavaScript [JS] on scene [ID]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            JS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene.camera.position.y",
                            },
                        },
                    },
                ],
			};
		}

        // ----------------------------------- Scenes ----------------------------------- //

		clearscenes() {
            document.querySelectorAll('.SceneCanvas3D').forEach(el => el.remove());
            Scene3D.scenes = {};
        }

        makeScene({ ID, WIDTH, HEIGHT }) {
            if (Scene3D.scenes[ID]) {
                Scene3D.scenes[ID].canvas.remove();
            } var scene = {};

            scene.canvas = document.createElement('canvas');
            scene.canvas.style.display = 'none';
            scene.canvas.classList.add("SceneCanvas3D");
            scene.canvas.width = WIDTH;
            scene.canvas.height = HEIGHT;
            document.body.appendChild(scene.canvas);

            scene.uniformTime = new Scene3D.func.Uniform(0);

            scene.renderer = new Scene3D.func.WebGLRenderer({
                canvas: scene.canvas,
                antialias: false,
                alpha: true
            });

            scene.renderer.setSize(WIDTH, HEIGHT, false);

            scene.objects = {};
            scene.materials = {};
            scene.world = new Scene3D.func.Scene();

            scene.camera = new Scene3D.func.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

            Scene3D.scenes[ID] = scene;
        }

        // ----------------------------------- Rendering ----------------------------------- //

        async getSceneRender({ ID, FORMAT }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].renderer.render(Scene3D.scenes[ID].world, Scene3D.scenes[ID].camera);
            return Scene3D.scenes[ID].canvas.toDataURL(`image/${FORMAT || "png"}`);
        }
        async showSceneFrame({ ID }, util) {
            if (!util.target) return;
            if (!Scene3D.scenes[ID]) {
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

        // ----------------------------------- Camera ----------------------------------- //

        moveCamera({ ID, X, Y, Z }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].camera.position.set(X, Y, Z);
        }

        rotateCamera({ ID, X, Y, Z }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].camera.rotation.set(X, Y, Z);
        }

        rotateCameraToLookAt({ ID, X, Y, Z }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].camera.lookAt(new Scene3D.func.Vector3(X, Y, Z));
        }

        setCameraFOV({ ID, FOV }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].camera.fov = FOV
        }

        // ----------------------------------- Helpers ----------------------------------- //

        makeHelperAxes({ ID, SCENE, SIZE }) {
            if (!Scene3D.scenes[SCENE]) return;

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.AxesHelper(SIZE);
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].supported = [];

            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
            }
        }

        makeHelperGrid({ ID, SCENE, SIZE, PARTS }) {
            if (!Scene3D.scenes[SCENE]) return;

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.GridHelper(SIZE, PARTS);
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].supported = [];

            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
            }
        }

        makeHelperArrow({ ID, SCENE, LENGTH, COLOR, OX, OY, OZ, DX, DY, DZ }) {
            if (!Scene3D.scenes[SCENE]) return;

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.ArrowHelper(new Scene3D.func.Vector3(DX, DY, DZ).normalize(), new Scene3D.func.Vector3(OX, OY, OZ), LENGTH, COLOR);
            Scene3D.scenes[SCENE].objects[ID].supported = [];

            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
            }
        }

        // ----------------------------------- Object creaton ----------------------------------- //

        makeBox({ ID, SCENE, WIDTH, HEIGHT, DEPTH }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.BoxGeometry(WIDTH, HEIGHT, DEPTH);
            Scene3D.scenes[SCENE].objects[ID].supported = ["wireframe"];

            let baseMaterial = new Scene3D.func.MeshBasicMaterial({color: this.getRandomColor()});

            var mesh = new Scene3D.func.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial); 

            Scene3D.scenes[SCENE].world.add(mesh);

            Scene3D.scenes[SCENE].objects[ID].generated = mesh.uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
            }
        }

        // ----------------------------------- extras ----------------------------------- //

        jsHookScene({ ID, JS }) {
            if (!this.canscript) {
                if (!window.confirm("Do you want to allow this project to run JavaScript hooks? \n(This will allow it to run any code, including malicious code)")) {
                    return "Error: User denied access to JS hooks";
                } else {
                    this.canscript = true;
                }
            }

            if (!Scene3D.scenes[ID]) return "Error: No scene found";
            if (!JS.includes("scene")) return "Error: Unused scene";

            var scene = Scene3D.scenes[ID];
            var result = "";

            try {
                result = eval(JS);
            } catch(err) {
                result = err;
            }

            Scene3D.scenes[ID] = scene;
            return result;
        }
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
