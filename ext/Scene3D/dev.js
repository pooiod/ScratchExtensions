// work in progress 3D extension

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

    if (!window.Scene3D) {
        window.Scene3D = {};
        window.Scene3D.scenes = {};
        window.Scene3D.maxverts = 10000;

        window.Scene3D.libs = {};
        window.Scene3D.libs.max = 1;
        window.Scene3D.libs.loaded = 0;

        if (window.THREE) {
            window.Scene3D.libs.loaded += 1;
            window.THREE.getRandomColor = function() {
                var letters = '0123456789ABCDEF';
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
        } else {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.id = "WindowImports3D";
            script.src = "https://unpkg.com/three@0.157.0/build/three.min.js";
            script.onload = function () {
                window.Scene3D.libs.loaded += 1;
                window.THREE.getRandomColor = function() {
                    var letters = '0123456789ABCDEF';
                    var color = '#';
                    for (var i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }
                    return color;
                }
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

                    {
                        opcode: "setCameraFOV",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set fov of camera for [ID] to [FOV]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            FOV: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "75",
                            },
                        },
                    },

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

					{
						opcode: 'makePointObject',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create object [ID] with points [POINTS] and face type [TYPE] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "quad",
                                menu: "faceTypes",
                            },
                            POINTS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `-1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1,
 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1,
 -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1,  1,
 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,
 -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
 -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1 `.replace(/\n/g, ''),
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
						opcode: 'setObjectUV',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set object [ID] UV to [TYPE] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "uvTypes",
                            },
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

					{
						opcode: 'setObjectMaterial',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set object [ID] material to [MATERIAL] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            MATERIAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "material1",
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

                    { blockType: Scratch.BlockType.LABEL, text: "Materials" }, // ----------------------------------
                    {
                        opcode: "makeMaterial",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Create material [ID] of type [TYPE] in scene [SCENE]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "material1",
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "materials",
                            },
                        },
                    },

                    {
                        opcode: "setMaterialPropMap",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set [PROP] of material [ID] in scene [SCENE] to [VALUE]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "material1",
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            PROP: {
                                menu: "materialPropsTexture",
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `http://p7scratchextensions.pages.dev/extras/images/custom_uv_diag.png`,
                            },
                        },
                    },

                    {
                        opcode: "setMaterialPropColor",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set [PROP] of material [ID] in scene [SCENE] to [VALUE]",
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "material1",
                            },
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            PROP: {
                                menu: "materialPropsColor",
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: window.THREE && THREE.getRandomColor ? window.THREE.getRandomColor() : "#049ef4",
                            },
                        },
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

                    { blockType: Scratch.BlockType.LABEL, text: "Environment" }, // --------------------------------
                    {
                        opcode: "setSceneFog",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set fog in scene [SCENE] to color [COLOR] and near [NEAR] with far [FAR]",
                        arguments: {
                            SCENE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            COLOR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "#fff",
                            },
                            NEAR: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "3",
                            },
                            FAR: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "20",
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
						opcode: 'getObjectUVtexture',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Generate template texture for object [ID] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
							},
						},
					},

					{
						opcode: 'getObjectPoints',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Generate points from object [ID] in scene [SCENE]',
						arguments: {
                            ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'object1',
							},
                            SCENE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'scene1',
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
                    {
                        opcode: 'jsHookSceneCommand',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Run JavaScript [JS] on scene [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene1",
                            },
                            JS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "scene.objects[\"box1\"].destroy()",
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
                    },
                    faceTypes: {
                        acceptReporters: true,
                        items: ["tri", "quad"]
                    },
                    materials: {
                        acceptReporters: true,
                        items: [
                            { text: "Basic", value: "MeshBasicMaterial" },
                            { text: "Depth", value: "MeshDepthMaterial" },
                            { text: "Lambert", value: "MeshLambertMaterial" },
                            { text: "Matcap", value: "MeshMatcapMaterial" },
                            { text: "Normal", value: "MeshNormalMaterial" },
                            { text: "Phong", value: "MeshPhongMaterial" },
                            { text: "Physical", value: "MeshPhysicalMaterial" },
                            { text: "Standard", value: "MeshStandardMaterial" },
                            { text: "Toon", value: "MeshToonMaterial" }
                        ]
                    },
                    uvTypes: [
                        { text: "Cube", value: "CubeFit" },
                        { text: "Spherical", value: "SphericalFit" },
                        { text: "Cylindrical", value: "CylindricalFit" },

                        { text: "Plane Fit", value: "PlaneFit" },

                        { text: "Wrap Fit", value: "WrapFit" },
                        { text: "All One Face", value: "AllOneFace" },
                        { text: "Grid", value: "Grid" },
                    ],
                    wireframeJoin: [
                        "round",
                        "bevel",
                        "miter"
                    ],
                    wireframeCap: [
                        "round",
                        "butt",
                        "square"
                    ],
                    materialPropsColor: [
                        { text: "Color", value: "color" },
                        { text: "Emissive Color", value: "emissive" },
                        { text: "Speculat Color", value: "specular" },
                        { text: "Attenuation Color", value: "attenuationColor" },
                        { text: "Sheen Color", value: "sheenColor" },
                        { text: "Specular Color", value: "specularColor" },
                    ],
                    materialPropsTexture: [
                        { text: "Texture", value: "map" },
                        { text: "Alpha Map", value: "alphaMap" },
                        { text: "Environment Map", value: "envMap" },
                        { text: "Speculat Map Map", value: "specularMap" },
                        { text: "Displacement Map", value: "displacementMap" },
                        { text: "Bump Map", value: "bumpMap" },
                        { text: "Emissive Map", value: "emissiveMap" },
                        { text: "Normal Map", value: "normalMap" },
                        { text: "Matcap", value: "matcap" },
                        { text: "Anistrophy Map", value: "anisotropyMap" },
                        { text: "Clearcoat Map", value: "clearcoatMap" },
                        { text: "Clearcoat Normal Map", value: "clearcoatNormalMap" },
                        { text: "Iridecence Map", value: "iridescenceMap" },
                        { text: "Iridecence Thickness Map", value: "iridescenceThicknessMap " },
                        { text: "Sheen Roughness Map", value: "sheenRoughnessMap" },
                        { text: "Sheen Color Map", value: "sheenColorMap" },
                        { text: "Speculat Intensity Map", value: "specularIntensityMap" },
                        { text: "Speculat Color Map", value: "specularColorMap" },
                        { text: "Thickness Map", value: "thicknessMap" },
                        { text: "Tranmission Map", value: "transmissionMap" },
                        { text: "Metalness Map", value: "metalnessMap" },
                        { text: "Gradient Map", value: "gradientMap" },
                    ],
                    materialPropsNumber: [
                        { text: "Reflectivity", value: "reflectivity" },
                        { text: "Refraction Ratio", value: "refractionRatio" },
                        { text: "Displacement Scale", value: "displacementScale" },
                        { text: "Displacement Bias", value: "displacementBias" },
                        { text: "Bump Scale", value: "bumpScale" },
                        { text: "Emissive Intensity", value: "emissiveIntensity" },
                        { text: "Shininess", value: "shininess" },
                        { text: "Anistrophy", value: "anisotropy" },
                        { text: "Attenuation Distance", value: "attenuationDistance" },
                        { text: "Clearcoat", value: "clearcoat" },
                        { text: "Clearcoat Rouchness", value: "clearcoatRoughness" },
                        { text: "Dispersion", value: "dispersion" },
                        { text: "Ior", value: "ior" },
                        { text: "Iridescence", value: "iridescence" },
                        { text: "IridescenceIOR", value: "iridescenceIOR" },
                        { text: "Sheen", value: "sheen" },
                        { text: "Sheen Roughness", value: "sheenRoughness" },
                        { text: "Specular Intensity", value: "specularIntensity" },
                        { text: "Thickness", value: "thickness" },
                        { text: "Transmission", value: "transmission" },
                        { text: "Environment Map Intensity", value: "envMapIntensity" },
                        { text: "Metalness", value: "metalness" },
                        { text: "Roughness", value: "roughness" },
                    ],
                    materialPropsRotation: [
                        { text: "Anisotropy", value: "anisotropyRotation" },
                        { text: "Environment", value: "envMapRotation" },
                    ],
                    materialPropsBool: [
                        { text: "Fog Enabled", value: "fog" },
                        { text: "Flat Shading", value: "flatShading" },
                    ],
                }
			};
		}

        isLoaded() {
            return window.Scene3D.libs.loaded >= window.Scene3D.libs.max;
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
                case "x": return V3[0];
                case "y": return V3[1];
                case "z": return V3[2];
                default:  return 0;
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

            scene.uniformTime = new THREE.Uniform(0);

            scene.renderer = new THREE.WebGLRenderer({
                canvas: scene.canvas,
                antialias: false,
                alpha: true
            });

            scene.renderer.setSize(WIDTH, HEIGHT, false);

            scene.objects = {};
            scene.materials = {};
            scene.world = new THREE.Scene();

            scene.camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

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
                    Scratch.vm.renderer.destroySkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                }
                util.target.updateAllDrawableProperties();
                return;
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
                    } else {
                        if (
                            Scratch.vm.renderer._allDrawables[drawableID]._skin && 
                            Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id] &&
                            Scratch.vm.renderer._allSkins[Scratch.vm.renderer._allDrawables[drawableID]._skin._id].tmpSkin
                        ) {
                            Scratch.vm.renderer.destroySkin(Scratch.vm.renderer._allDrawables[drawableID]._skin._id);
                        }
                    }
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

            image.src = await this.getSceneRender({ ID: ID, FORMAT: 'bmp' });;
        }

        // -------------------------------- Environment --------------------------------- //

        setSceneFog({ SCENE, COLOR, NEAR, FAR }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].world.fog = new THREE.Fog(new THREE.Color(COLOR).convertLinearToSRGB(), NEAR, FAR);
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
            Scene3D.scenes[ID].camera.lookAt(new THREE.Vector3(X, Y, Z));
        }

        setCameraFOV({ ID, FOV }) {
            if (!Scene3D.scenes[ID]) return;
            Scene3D.scenes[ID].camera.fov = FOV
            Scene3D.scenes[ID].camera.updateProjectionMatrix();
        }

        // ---------------------------------- Materials ---------------------------------- //

        makeMaterial({ SCENE, ID, TYPE }) {
            if (!Scene3D.scenes[SCENE]) return;

            if (!TYPE.includes("Material")) return;

            Scene3D.scenes[SCENE].materials[ID] = new THREE[TYPE]({});

            Scene3D.scenes[SCENE].materials[ID].destroy = () => {
                delete Scene3D.scenes[SCENE].materials[ID];
            }
        }

        setMaterialPropColor({ SCENE, ID, PROP, VALUE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].materials[ID]) return;

            Scene3D.scenes[SCENE].materials[ID][PROP] = new THREE.Color(VALUE);
        }

        setMaterialPropNumber({ SCENE, ID, PROP, VALUE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].materials[ID]) return;

            Scene3D.scenes[SCENE].materials[ID][PROP] = VALUE;
        }

        setMaterialPropBool({ SCENE, ID, PROP, VALUE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].materials[ID]) return;

            Scene3D.scenes[SCENE].materials[ID][PROP] = VALUE;
        }

        async setMaterialPropMap({ SCENE, ID, PROP, VALUE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].materials[ID]) return;

            function loadTexture(url) {
                return new Promise((resolve, reject) => {
                    new THREE.TextureLoader().load(url, resolve, undefined, reject);
                });
            }

            var texture = await loadTexture(VALUE);
            Scene3D.scenes[SCENE].materials[ID][PROP] = texture;
        }

        // ----------------------------------- Helpers ----------------------------------- //

        makeHelperAxes({ ID, SCENE, SIZE }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            Scene3D.scenes[SCENE].objects[ID] = new THREE.AxesHelper(SIZE);
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

            Scene3D.scenes[SCENE].objects[ID] = new THREE.GridHelper(SIZE, PARTS);
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

            Scene3D.scenes[SCENE].objects[ID] = new THREE.ArrowHelper(new THREE.Vector3(DX, DY, DZ).normalize(), new THREE.Vector3(OX, OY, OZ), LENGTH, COLOR);

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

        makePointObject({ SCENE, ID, POINTS, TYPE }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            var points = [];
            try {
                if (POINTS.startsWith("[") && POINTS.endsWith("]")) {
                    points = JSON.parse(POINTS);
                } else {
                    points = JSON.parse(`[${POINTS}]`);
                }
            } catch (e) {
                return;
            }

            var geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));

            var indices = [];
            var stopcount = 0;

            var vp = 3;
            switch (TYPE) {
                case "tri": vp = 3; break;
                case "quad": vp = 4; break;
                default: vp = TYPE || 3;
            }

            var numFaces = points.length / vp;

            for (var f = 0; f < numFaces; f++) {
                var base = f * vp;
                if (stopcount >= Scene3D.maxverts) break;

                for (var i = 1; i < vp - 1; i++) {
                    stopcount += 1; if (stopcount >= Scene3D.maxverts) break;
                    indices.push(base, base + i, base + i + 1);
                }
            }

            var baseMaterial = new THREE.MeshBasicMaterial({color: THREE.getRandomColor()});

            geom.setIndex(indices);
            geom.computeVertexNormals();

            Scene3D.scenes[SCENE].objects[ID] = geom;

            var mesh = new THREE.Mesh(geom, baseMaterial);
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

        makeBox({ ID, SCENE, V3 }) {
            if (!Scene3D.scenes[SCENE]) return;
            Scene3D.scenes[SCENE].objects[ID]?.destroy();

            var [WIDTH, HEIGHT, DEPTH] = this.vectorToArray(V3);

            Scene3D.scenes[SCENE].objects[ID] = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);

            var baseMaterial = new THREE.MeshBasicMaterial({color: window.THREE.getRandomColor(), side: window.THREE.DoubleSide});

            var mesh = new THREE.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial);
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

            Scene3D.scenes[SCENE].objects[ID] = new THREE.CapsuleGeometry(RADIUS, LENGTH, 5, 30);

            var baseMaterial = new THREE.MeshBasicMaterial({color: window.THREE.getRandomColor(), side: window.THREE.DoubleSide});

            var mesh = new THREE.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial);
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

            Scene3D.scenes[SCENE].objects[ID] = new THREE.CylinderGeometry(RADIUSTOP, RADIUSBOTTOM, HEIGHT, 30, 1, OPENED);

            var baseMaterial = new THREE.MeshBasicMaterial({color: window.THREE.getRandomColor()});

            var mesh = new THREE.Mesh(Scene3D.scenes[SCENE].objects[ID], baseMaterial);
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
                THREE.MathUtils.degToRad(X),
                THREE.MathUtils.degToRad(Y),
                THREE.MathUtils.degToRad(Z)
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

        setObjectMaterial({ ID, SCENE, MATERIAL }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;
            if (!Scene3D.scenes[SCENE].materials[MATERIAL]) return;

            var genuuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var mesh = Scene3D.scenes[SCENE].world.children.find(obj => obj.uuid == genuuid);
            mesh.material = Scene3D.scenes[SCENE].materials[MATERIAL];
        }

        setObjectUV({ ID, SCENE, TYPE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;
        
            var genuuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var mesh = Scene3D.scenes[SCENE].world.children.find(obj => obj.uuid == genuuid);

            if (!mesh) return;
            var geometry = mesh.geometry;
            if (!geometry) return;

            switch (TYPE) {
                case "CubeFit": // project the surface of a cube onto the object to make UV map
                    geometry.computeBoundingBox();
                    var bbox = geometry.boundingBox;
                    var bboxSize = new THREE.Vector3().subVectors(bbox.max, bbox.min);
                    var boxMaxSize = Math.max(bboxSize.x, bboxSize.y, bboxSize.z);

                    // Based on https://jsfiddle.net/mmalex/pcjbysn1
                    function applyBoxUV(geom, transformMatrix, bbox, bboxMaxSize) {
                        var coords = new Float32Array(2 * geom.attributes.position.array.length / 3);
                        
                        if (!geom.attributes.uv) {
                            geom.setAttribute('uv', new THREE.Float32BufferAttribute(coords, 2));
                        }

                        var makeUVs = function(v0, v1, v2) {
                            v0.applyMatrix4(transformMatrix);
                            v1.applyMatrix4(transformMatrix);
                            v2.applyMatrix4(transformMatrix);

                            var n = new THREE.Vector3();
                            n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize();

                            n.x = Math.abs(n.x);
                            n.y = Math.abs(n.y);
                            n.z = Math.abs(n.z);

                            var uv0 = new THREE.Vector2();
                            var uv1 = new THREE.Vector2();
                            var uv2 = new THREE.Vector2();

                            if (n.y > n.x && n.y > n.z) {
                                uv0.set((v0.x - bbox.min.x) / bboxMaxSize, (bbox.max.z - v0.z) / bboxMaxSize);
                                uv1.set((v1.x - bbox.min.x) / bboxMaxSize, (bbox.max.z - v1.z) / bboxMaxSize);
                                uv2.set((v2.x - bbox.min.x) / bboxMaxSize, (bbox.max.z - v2.z) / bboxMaxSize);
                            } else if (n.x > n.y && n.x > n.z) {
                                uv0.set((v0.z - bbox.min.z) / bboxMaxSize, (v0.y - bbox.min.y) / bboxMaxSize);
                                uv1.set((v1.z - bbox.min.z) / bboxMaxSize, (v1.y - bbox.min.y) / bboxMaxSize);
                                uv2.set((v2.z - bbox.min.z) / bboxMaxSize, (v2.y - bbox.min.y) / bboxMaxSize);
                            } else {
                                uv0.set((v0.x - bbox.min.x) / bboxMaxSize, (v0.y - bbox.min.y) / bboxMaxSize);
                                uv1.set((v1.x - bbox.min.x) / bboxMaxSize, (v1.y - bbox.min.y) / bboxMaxSize);
                                uv2.set((v2.x - bbox.min.x) / bboxMaxSize, (v2.y - bbox.min.y) / bboxMaxSize);
                            }

                            return { uv0, uv1, uv2 };
                        };

                        if (geom.index) {
                            for (var i = 0; i < geom.index.array.length; i += 3) {
                                var idx0 = geom.index.array[i], idx1 = geom.index.array[i + 1], idx2 = geom.index.array[i + 2];

                                var v0 = new THREE.Vector3().fromArray(geom.attributes.position.array, idx0 * 3);
                                var v1 = new THREE.Vector3().fromArray(geom.attributes.position.array, idx1 * 3);
                                var v2 = new THREE.Vector3().fromArray(geom.attributes.position.array, idx2 * 3);

                                var uvs = makeUVs(v0, v1, v2);

                                coords[2 * idx0] = uvs.uv0.x; coords[2 * idx0 + 1] = uvs.uv0.y;
                                coords[2 * idx1] = uvs.uv1.x; coords[2 * idx1 + 1] = uvs.uv1.y;
                                coords[2 * idx2] = uvs.uv2.x; coords[2 * idx2 + 1] = uvs.uv2.y;
                            }
                        }

                        geom.attributes.uv.array = coords;
                        geom.attributes.uv.needsUpdate = true;
                    }

                    var transformMatrix = new THREE.Matrix4();
                    var uvBoundingBox = new THREE.Box3(
                        new THREE.Vector3(-boxMaxSize / 2, -boxMaxSize / 2, -boxMaxSize / 2),
                        new THREE.Vector3(boxMaxSize / 2, boxMaxSize / 2, boxMaxSize / 2)
                    );

                    applyBoxUV(geometry, transformMatrix, uvBoundingBox, boxMaxSize);
                break; case "SphericalFit": // project the surface of a sphere onto the object to make UV map
                    geometry.computeBoundingSphere();
                    var sphere = geometry.boundingSphere;
                    var center = sphere.center;
                    var radius = sphere.radius;

                    if (!geometry.attributes.uv) {
                        var uvArray = new Float32Array(2 * geometry.attributes.position.array.length / 3);
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
                    }

                    var positions = geometry.attributes.position.array;
                    var uvs = geometry.attributes.uv.array;

                    for (var i = 0, j = 0; i < positions.length; i += 3, j += 2) {
                        var x = positions[i] - center.x;
                        var y = positions[i + 1] - center.y;
                        var z = positions[i + 2] - center.z;

                        var theta = Math.atan2(z, x);
                        var phi = Math.acos(y / radius);

                        var u = (theta / (2 * Math.PI)) + 0.5;
                        var v = phi / Math.PI;

                        uvs[j] = u;
                        uvs[j + 1] = v;
                    }

                    geometry.attributes.uv.needsUpdate = true;
                break; case "CylindricalFit": // project the surface of a cyliner onto the object to make UV map
                    geometry.computeBoundingBox();
                    var bbox = geometry.boundingBox;
                    var height = bbox.max.y - bbox.min.y;
                    var centerY = (bbox.max.y + bbox.min.y) / 2;

                    if (!geometry.attributes.uv) {
                        var uvArray = new Float32Array(2 * geometry.attributes.position.array.length / 3);
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
                    }

                    var positions = geometry.attributes.position.array;
                    var uvs = geometry.attributes.uv.array;

                    for (var i = 0, j = 0; i < positions.length; i += 3, j += 2) {
                        var x = positions[i];
                        var y = positions[i + 1] - centerY; // Centering Y
                        var z = positions[i + 2];

                        var theta = Math.atan2(z, x); // Angle around Y-axis
                        var u = (theta / (2 * Math.PI)) + 0.5; // Map theta to [0,1]
                        var v = (y - bbox.min.y) / height; // Normalize height to [0,1]

                        uvs[j] = u;
                        uvs[j + 1] = v;
                    }

                    geometry.attributes.uv.needsUpdate = true;
                break; case "WrapFit": // project the surface of a sphere onto the object, but shrink wrap it to make UV map
                    geometry.computeBoundingBox();
                    var bbox = geometry.boundingBox;

                    var center = bbox.getCenter(new THREE.Vector3());
                    var size = bbox.getSize(new THREE.Vector3());

                    if (!geometry.attributes.uv) {
                        var uvArray = new Float32Array(2 * geometry.attributes.position.array.length / 3);
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
                    }

                    var positions = geometry.attributes.position.array;
                    var uvs = geometry.attributes.uv.array;

                    for (var i = 0, j = 0; i < positions.length; i += 3, j += 2) {
                        var x = positions[i] - center.x;
                        var y = positions[i + 1] - center.y;
                        var z = positions[i + 2] - center.z;

                        var theta = Math.atan2(z, x);
                        var phi = Math.acos(y / size.y);

                        uvs[j] = (theta / (2 * Math.PI)) + 0.5;
                        uvs[j + 1] = phi / Math.PI;
                    }

                    geometry.attributes.uv.needsUpdate = true;
                break; case "PlaneFit": // project a plane onto the object from above to make UV map
                    geometry.computeBoundingBox();
                    var bbox = geometry.boundingBox;

                    var sizeX = bbox.max.x - bbox.min.x;
                    var sizeZ = bbox.max.z - bbox.min.z;

                    if (!geometry.attributes.uv) {
                        var uvArray = new Float32Array(2 * geometry.attributes.position.array.length / 3);
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
                    }

                    var positions = geometry.attributes.position.array;
                    var uvs = geometry.attributes.uv.array;

                    for (var i = 0, j = 0; i < positions.length; i += 3, j += 2) {
                        var x = positions[i];
                        var z = positions[i + 2];

                        var u = (x - bbox.min.x) / sizeX;
                        var v = (z - bbox.min.z) / sizeZ;

                        uvs[j] = u;
                        uvs[j + 1] = v;
                    }

                    geometry.attributes.uv.needsUpdate = true;
                break; case "Grid": // every face gets a spot on the texture in a grid of triangles
                    var triangleCount = geometry.index
                        ? geometry.index.count / 3
                        : geometry.attributes.position.count / 3;

                    var gridSize = Math.ceil(Math.sqrt(triangleCount / 2));

                    var cellSize = 100;
                    var totalSize = gridSize * cellSize;

                    var uvs = [];

                    for (var i = 0; i < triangleCount; i++) {
                        var row = Math.floor(i / (gridSize * 2));
                        var col = (i % (gridSize * 2)) / 2;

                        var sx = col * cellSize;
                        var sy = row * cellSize;

                        var isLeft = (i % 2) === 0;

                        if (isLeft) {
                            uvs.push(
                                sx / totalSize, sy / totalSize,
                                (sx + cellSize) / totalSize, sy / totalSize,
                                sx / totalSize, (sy + cellSize) / totalSize
                            );
                        } else {
                            uvs.push(
                                (sx + cellSize / 2) / totalSize, sy / totalSize,
                                (sx + cellSize / 2) / totalSize, (sy + cellSize) / totalSize,
                                (sx - cellSize / 2) / totalSize, (sy + cellSize) / totalSize
                            );
                        }
                    }

                    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                    geometry.attributes.uv.needsUpdate = true;
                break; default:
                    if (!geometry.attributes.uv) {
                        var uvArray = new Float32Array(2 * geometry.attributes.position.array.length / 3);
                        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
                    }

                    var uvs = geometry.attributes.uv.array;

                    for (var i = 0, j = 0; i < uvs.length; i += 6) {
                        uvs[i] = 0;   uvs[i + 1] = 0;
                        uvs[i + 2] = 1; uvs[i + 3] = 0;
                        uvs[i + 4] = 0; uvs[i + 5] = 1;
                    }

                    geometry.attributes.uv.needsUpdate = true;
                break;
            }
        }

        // ----------------------------------- extras ----------------------------------- //

        getObjectPoints({ ID, SCENE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;
        
            var genuuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var mesh = Scene3D.scenes[SCENE].world.children.find(obj => obj.uuid == genuuid);

            if (!mesh) return;
            var geometry = mesh.geometry;
            if (!geometry) return;

            if (geometry.index) {
                const indices = geometry.index.array;
                const positions = geometry.attributes.position.array;
                const result = [];
                for (let i = 0; i < indices.length; i++) {
                    const idx = indices[i] * 3;
                    result.push(positions[idx], positions[idx + 1], positions[idx + 2]);
                }
                return JSON.stringify(result);
            } else {
                return JSON.stringify(Array.from(geometry.attributes.position.array));
            }
        }

        getObjectUVtexture({ ID, SCENE }) {
            if (!Scene3D.scenes[SCENE]) return;
            if (!Scene3D.scenes[SCENE].objects[ID]) return;

            var genuuid = Scene3D.scenes[SCENE].objects[ID].generated;
            var mesh = Scene3D.scenes[SCENE].world.children.find(obj => obj.uuid == genuuid);

            if (!mesh) return;

            var geometry = mesh.geometry;
            if (!geometry || !geometry.attributes.uv) return;
            geometry.computeBoundingBox();

            var size = 512; // geometry.boundingBox.getSize(new THREE.Vector3())

            var canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext("2d");

            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, size, size);

            var uvs = geometry.attributes.uv.array;
            var indices = geometry.index ? geometry.index.array : null;
            var positions = geometry.attributes.position.array;

            ctx.strokeStyle = THREE.getRandomColor();
            ctx.lineWidth = 1;

            for (var i = 0; i < (indices ? indices.length : uvs.length / 2); i += 3) {
                var idx0 = indices ? indices[i] * 2 : i * 2;
                var idx1 = indices ? indices[i + 1] * 2 : (i + 1) * 2;
                var idx2 = indices ? indices[i + 2] * 2 : (i + 2) * 2;

                var x0 = uvs[idx0] * size;
                var y0 = (1 - uvs[idx0 + 1]) * size;
                var x1 = uvs[idx1] * size;
                var y1 = (1 - uvs[idx1 + 1]) * size;
                var x2 = uvs[idx2] * size;
                var y2 = (1 - uvs[idx2 + 1]) * size;

                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
                ctx.stroke();

                ctx.strokeStyle = THREE.getRandomColor();
            }

            return canvas.toDataURL('image/png');
        }

        onObjectLoad({ SCENE, ID }) {
            if (! Scene3D.scenes[SCENE]) return;
            if (! Scene3D.scenes[SCENE].objects[ID]) return;
            return Scene3D.scenes[SCENE].objects[ID].loaded;
        }

        jsHookSceneCommand(args) {console.log(this.jsHookScene(args))};
        jsHookScene({ ID, JS }) {
            if (!this.canscript) {
                if (!window.confirm("Do you want to allow this project to run JavaScript hooks? \n(This will allow it to run any code, including malicious code)")) {
                    return "Error: User denied access to JS hooks";
                } else {
                    this.canscript = true;
                }
            }

            if (!Scene3D.scenes[ID]) return "Error: No scene found";
            if (!(JS.includes("scene") || JS.includes("Scene3D"))) return "Error: Unused scene";

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
