// work in progress 3D extension

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    if (!window.Scene3D) {
        window.Scene3D = {};
        window.Scene3D.scenes = {};

        if (window.THREE) {
            window.Scene3D.func = THREE;
            window.Scene3D.func.getRandomColor = function() {
                var letters = '0123456789ABCDEF';
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
        } else {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.id = "WindowImports3D";
            script.src = "https://unpkg.com/three@0.157.0/build/three.min.js";
            script.onload = function () {
                window.Scene3D.func = THREE;
                window.Scene3D.func.getRandomColor = function() {
                    var letters = '0123456789ABCDEF';
                    var color = '#';
                    for (var i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }
                    return color;
                }
                THREE = null;
            };
            document.head.appendChild(script);
        }
    }

	class P7Scene3D {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

            this.over3seconds = false;
            setTimeout(()=>{this.over3seconds = true});

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
                this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
				this.clearscenes();
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				this.clearscenes();
			});
		}

		getInfo() {
			return {
				id: 'P7Scene3D',
				name: '3D scenes',
                color1: '#eb4034',
				blocks: [
					{
						opcode: 'isLoaded',
						blockType: Scratch.BlockType.BOOLEAN,
                        hideFromPalette: this.over3seconds,
						text: 'Scene3D libs loaded',
					},

					{
						opcode: 'makeScene',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create scene [ID] with a resolution of [WIDTH] by [HEIGHT]',
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
                            ANTIALIASING: {
								type: Scratch.ArgumentType.BOOLEAN,
							},
						},
					},

					{
						opcode: 'clearscenes',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Delete all scenes',
					},

					{
						opcode: 'clearscene',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Delete scene [ID]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

                    { blockType: Scratch.BlockType.LABEL, text: "Move Camera" }, // --------------------------------
                    {
                        opcode: "moveCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set position camera of [ID] to [POS]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            POS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0, 0, 25",
                            },
                        },
                    },
                    {
                        opcode: "rotateCamera",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Rotate camera for [ID] to [V3]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            V3: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0, 0, 0",
                            },
                        },
                    },
                    {
                        opcode: "rotateCameraToLookAt",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Point camera of [ID] to look at [V3]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            V3: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0, 0, 0",
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

                    { blockType: Scratch.BlockType.LABEL, text: "Object Creation" }, // ----------------------------
					{
						opcode: 'makeBox',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create box [ID] with a size of [V3] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'box1',
							},
                            V3: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "20, 20, 20",
                            },
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

					{
						opcode: 'makeCapsule',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create capsule [ID] with a length of [LENGTH] and a redius of [RADIUS] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'capsule1',
							},
                            LENGTH: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "2",
                            },
                            RADIUS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "1",
                            },
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

                    { blockType: Scratch.BlockType.LABEL, text: "Object Modification" }, // ------------------------
                    {
                        opcode: "destroyObject",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Destroy object [ID] in scene [SCENE]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "object1",
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                        },
                    },

					{
						opcode: 'moveObject',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Move object [ID] in scene [SCENE] to [POS]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            POS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0, 0, 0",
                            },
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

					{
						opcode: 'rotateObject',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set rotation of object [ID] in scene [SCENE] to [ROTATION]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            ROTATION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "0, 0, 0",
                            },
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

					{
						opcode: 'scaleObject',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set scale of object [ID] in scene [SCENE] to [SCALE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            SCALE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "2, 2, 2",
                            },
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

                    {
                        blockType: Scratch.BlockType.HAT,
                        opcode: 'onObjectLoad',
                        text: 'When [ID] in scene [SCENE] loads',
                        isEdgeActivated: true,
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'object1',
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                        }
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "Render" }, // -------------------------------------
                    {
                        opcode: "showSceneFrame",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Show frame from scene [ID] on sprite",
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

                    { blockType: Scratch.BlockType.LABEL, text: "Debug" }, // --------------------------------------
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
                                type: Scratch.ArgumentType.NUMBER,
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
                                defaultValue: "GridHelper",
                            },
                            SIZE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "50",
                            },
                            PARTS: {
                                type: Scratch.ArgumentType.NUMBER,
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

                    { blockType: Scratch.BlockType.LABEL, text: "Math" }, // ----------------------------------------
                    {
                        disableMonitor: true,
                        opcode: "newVector3",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Vector3 x:[VECX] y:[VECY] z:[VECZ]",
                        arguments: {
                            VECX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0,
                            },
                            VECY: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0,
                            },
                            VECZ: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0,
                            },
                        },
                    },
                    {
                        disableMonitor: true,
                        opcode: "vectorToSingle",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get [PART] from [V3]",
                        arguments: {
                            V3: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "0, 0, 0",
                            },
                            PART: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "x",
                                menu: "xyz",
                            },
                        },
                    },
                ],
                menus: {
                    xyz: {
                        acceptReporters: true,
                        items: ["x", "y", "z"]
                    }
                }
			};
		}

        isLoaded() {
            return !!window.Scene3D.func;
        }

        // ----------------------------------- Math ----------------------------------- //

        newVector3(args) {
            var { VECX, VECY, VECZ } = args;
            return `${Scratch.Cast.toNumber(VECX) || 0}, ${Scratch.Cast.toNumber(VECY) || 0}, ${Scratch.Cast.toNumber(VECZ) || 0}`;
        }

        vectorToArray(VECTOR) {
            var vector;

            vector = `[${VECTOR}]`;

            try {
                vector = JSON.parse(vector);
                return vector;
            } catch(err) {
                return;
            }
        }

        vectorToSingle({ V3, PART }) {
            V3 = this.vectorToArray(V3);
            if (!V3) return;
            switch(PART) {
                case "x":
                    return V3[0];
                    break;
                case "y":
                    return V3[1];
                    break;
                case "z":
                    return V3[2];
                    break;
                default:
                    return 0;
            }
        }

        // ----------------------------------- Scenes ----------------------------------- //

		clearscenes() {
            document.querySelectorAll('.SceneCanvas3D').forEach(el => el.remove());
            Scene3D.scenes = {};
        }

		clearscene({ ID }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].canvas.remove();
            delete Scene3D.scenes[ID];
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
            Scene3D.scenes[ID].uniformTime.value = performance.now() / 1000
            Scene3D.scenes[ID].renderer.render(Scene3D.scenes[ID].world, Scene3D.scenes[ID].camera);
            return Scene3D.scenes[ID].canvas.toDataURL(`image/${FORMAT || "png"}`);
        }

        async showSceneFrame({ ID }, util) {
            if (!util.target) return;
            const drawableID = util.target.drawableID;

            if (!Scene3D.scenes[ID]) {
                if (
                    Scratch.vm.renderer._allDrawables[drawableID]._skin && 
                    Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] &&
                    Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin
                ) {
                    Scratch.vm.renderer._allSkins.splice(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, 1);
                }
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

                if (
                    Scratch.vm.renderer._allDrawables[drawableID]._skin && 
                    Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] &&
                    Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin
                ) {
                    Scratch.vm.renderer._allSkins.splice(Scratch.vm.renderer._allDrawables[drawableID]._skin._id, 1);
                }

                const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                Scratch.vm.renderer._allSkins[skinId].tmpSkin = true;
                Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);
            };
            image.src = await this.getSceneRender({ ID: ID, FORMAT: 'bmp' });;
        }

        // ----------------------------------- Camera ----------------------------------- //

        moveCamera({ ID, POS }) {
            if (!Scene3D.scenes[ID]) return;
            var [X, Y, Z] = this.vectorToArray(POS);
            Scene3D.scenes[ID].camera.position.set(X, Y, Z);
        }

        rotateCamera({ ID, V3 }) {
            if (!Scene3D.scenes[ID]) return;
            var [X, Y, Z] = this.vectorToArray(V3);
            Scene3D.scenes[ID].camera.rotation.set(X, Y, Z);
        }

        rotateCameraToLookAt({ ID, V3 }) {
            if (!Scene3D.scenes[ID]) return;
            var [X, Y, Z] = this.vectorToArray(V3);
            Scene3D.scenes[ID].camera.lookAt(new Scene3D.func.Vector3(X, Y, Z));
        }

        setCameraFOV({ ID, FOV }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].camera.fov = FOV
        }

        // ----------------------------------- Helpers ----------------------------------- //

        makeHelperAxes({ ID, SCENE, SIZE }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.AxesHelper(SIZE);
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].loaded = true;

            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].original = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        makeHelperGrid({ ID, SCENE, SIZE, PARTS }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.GridHelper(SIZE, PARTS);
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].loaded = true;

            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].original = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        makeHelperArrow({ ID, SCENE, LENGTH, COLOR, OV3, DV3 }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();
            var [OX, OY, OZ] = this.vectorToArray(OV3);
            var [DX, DY, DZ] = this.vectorToArray(DV3);

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.ArrowHelper(new Scene3D.func.Vector3(DX, DY, DZ).normalize(), new Scene3D.func.Vector3(OX, OY, OZ), LENGTH, COLOR);

            Scene3D.scenes[SCENE].world.add(Scene3D.scenes[SCENE].objects[ID]);

            Scene3D.scenes[SCENE].objects[ID].loaded = true;
            Scene3D.scenes[SCENE].objects[ID].original = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].generated = Scene3D.scenes[SCENE].objects[ID].uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        // ----------------------------------- Object creaton ----------------------------------- //

        makeBox({ ID, SCENE, V3 }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            var [WIDTH, HEIGHT, DEPTH] = this.vectorToArray(V3);

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.BoxGeometry(WIDTH, HEIGHT, DEPTH);

            let baseMaterial = new Scene3D.func.MeshBasicMaterial({color: window.Scene3D.func.getRandomColor()});

            var mesh = new Scene3D.func.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial);
            mesh.original = Scene3D.scenes[SCENE].objects[ID].uuid;

            Scene3D.scenes[SCENE].world.add(mesh);

            Scene3D.scenes[SCENE].objects[ID].loaded = true;
            Scene3D.scenes[SCENE].objects[ID].generated = mesh.uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        makeCapsule({ ID, SCENE, RADIUS, LENGTH }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.CapsuleGeometry(RADIUS, LENGTH, 5, 30);

            let baseMaterial = new Scene3D.func.MeshBasicMaterial({color: window.Scene3D.func.getRandomColor()});

            var mesh = new Scene3D.func.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial);
            mesh.original = Scene3D.scenes[SCENE].objects[ID].uuid;

            Scene3D.scenes[SCENE].world.add(mesh);

            Scene3D.scenes[SCENE].objects[ID].loaded = true;
            Scene3D.scenes[SCENE].objects[ID].generated = mesh.uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        makeCylinder({ ID, SCENE, RADIUSTOP, RADIUSBOTTOM, HEIGHT, OPENED }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            Scene3D.scenes[SCENE].objects[ID] = new Scene3D.func.CylinderGeometry(RADIUSTOP, RADIUSBOTTOM, HEIGHT, 30, 1, OPENED);

            let baseMaterial = new Scene3D.func.MeshBasicMaterial({color: window.Scene3D.func.getRandomColor()});

            var mesh = new Scene3D.func.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial);
            mesh.original = Scene3D.scenes[SCENE].objects[ID].uuid;

            Scene3D.scenes[SCENE].world.add(mesh);

            Scene3D.scenes[SCENE].objects[ID].loaded = true;
            Scene3D.scenes[SCENE].objects[ID].generated = mesh.uuid;
            Scene3D.scenes[SCENE].objects[ID].destroy = () => {
                var destroy = Scene3D.scenes[SCENE].objects[ID].generated;
                var newscene = Scene3D.scenes[SCENE].world.children.filter(obj => obj.uuid !== destroy);
                Scene3D.scenes[SCENE].world.children = newscene;
                delete Scene3D.scenes[SCENE].objects[ID];
            }
        }

        // ----------------------------------- Object modification ----------------------------------- //

        destroyObject({ ID, SCENE }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();
        }

        moveObject({ ID, SCENE, POS }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;
            var [X, Y, Z] = this.vectorToArray(POS);

            var uuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var obj = Scene3D.scenes[SCENE].world.children.find(objc => objc.uuid == uuid);
            if (!obj) return;

            obj.position.x = X;
            obj.position.y = Y;
            obj.position.z = Z;
        }

        rotateObject({ ID, SCENE, ROTATION }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;
            var [X, Y, Z] = this.vectorToArray(ROTATION);

            var uuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var obj = Scene3D.scenes[SCENE].world.children.find(objc => objc.uuid == uuid);
            if (!obj) return;

            obj.rotation.set(
                Scene3D.func.MathUtils.degToRad(X),
                Scene3D.func.MathUtils.degToRad(Y),
                Scene3D.func.MathUtils.degToRad(Z)
            );              
        }

        scaleObject({ ID, SCENE, SCALE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;
            var [X, Y, Z] = this.vectorToArray(SCALE);

            var uuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var obj = Scene3D.scenes[SCENE].world.children.find(objc => objc.uuid == uuid);
            if (!obj) return;

            obj.scale.x = X;
            obj.scale.y = Y;
            obj.scale.z = Z;
        }

        // ----------------------------------- extras ----------------------------------- //

        onObjectLoad({ SCENE, ID }) {
            if (! Scene3D.scenes[SCENE]) return;
            if (! Scene3D.scenes[SCENE].objects[ID]) return;
            return Scene3D.scenes[SCENE].objects[ID].loaded;
        }

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
	Scratch.extensions.register(new P7Scene3D());
})(Scratch);
