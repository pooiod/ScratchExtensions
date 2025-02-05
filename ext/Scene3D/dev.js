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
window.Scene3D.func = THREE;`;
        document.head.appendChild(script);
    }

	class P7Splats {
		constructor() {
			this.canscript = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

            window.Scene3D.Scenes = {};

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
				blocks: [],
			};
		}

		clearScenes() {
            document.querySelectorAll('.SceneCanvas3D').forEach(el => el.remove());
            Scene3D.Scenes = {};
        }

        makeSplat({ ID, WIDTH, HEIGHT}) {
            if (Scene3D.Scenes[ID]) {
                Scene3D.Scenes[ID].canvas.remove();
            } Scene3D.Scenes[ID] = {};

            Scene3D.Scenes[ID].canvas = document.createElement('canvas');
            Scene3D.Scenes[ID].canvas.style.display = 'none';
            Scene3D.Scenes[ID].canvas.classList.add("SceneCanvas3D");
            Scene3D.Scenes[ID].canvas.width = WIDTH;
            Scene3D.Scenes[ID].canvas.height = HEIGHT;
            document.body.appendChild(Scene3D.Scenes[ID].canvas);

            Scene3D.Scenes[ID].uniformTime = new Uniform(0);

            Scene3D.Scenes[ID].render = new WebGLRenderer({
                canvas: Scene3D.Scenes[ID].canvas,
                antialias: false,
                alpha: true
            });

            Scene3D.Scenes[ID].render.setSize(WIDTH, HEIGHT, false);

            Scene3D.Scenes[ID].world = new Scene();

            Scene3D.Scenes[ID].camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

            Scene3D.Scenes[ID].camera.position.set(0, 0, 2);
        }

        async getSceneRender({ ID, FORMAT }) {
            if (!Scene3D.Scenes[ID]) return;
            Scene3D.Scenes[ID].render.render(Scene3D.Scenes[ID].scene, Scene3D.Scenes[ID].camera);
            return Scene3D.Scenes[ID].canvas.toDataURL(`image/${FORMAT || "png"}`);
        }

        async showSceneFrame({ ID }, util) {
            if (!Scene3D.Scenes[ID]) {
                const target = util.target;
                if (!target) return;
                target.updateAllDrawableProperties();
                return;
            }

            var url = await this.getSplatRender({ ID: ID, FORMAT: 'bmp' });

            function setImage(DATAURI, util) {
                const target = util.target;
                const drawableID = target.drawableID;
                const dataURI = DATAURI;
          
                const image = new Image();
                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0);

                    const skinId = Scratch.vm.renderer.createBitmapSkin(canvas);
                    Scratch.vm.renderer.updateDrawableSkinId(drawableID, skinId);
                };
                image.src = dataURI;
            }

            setImage(url, util);
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
