// do not use this yet!

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
        document.currentScript.after(importmap);

        let SplatWindowImports = document.createElement("script");
        SplatWindowImports.type = "module";
        SplatWindowImports.id = "SplatWindowImports";
        SplatWindowImports.innerHTML = `
    import { WebGLRenderer, PerspectiveCamera, Scene, Color, FogExp2 } from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { LumaSplatsSemantics, LumaSplatsThree } from "@lumaai/luma-web";
    
    window.WebGLRenderer = WebGLRenderer;
    window.PerspectiveCamera = PerspectiveCamera;
    window.Scene = Scene;
    window.Color = Color;
    window.FogExp2 = FogExp2;
    
    window.OrbitControls = OrbitControls;
    
    window.LumaSplatsSemantics = LumaSplatsSemantics;
    window.LumaSplatsThree = LumaSplatsThree;
`;
        document.head.appendChild(SplatWindowImports);
    }

	class P7Splats {
		constructor() {
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";

            this.splats = {};

            this.canvas = document.createElement('canvas');
            this.canvas.style.display = 'none';
            document.body.appendChild(this.canvas);

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
							CONFIG: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'REEEEEEEEEE',
							},
						},
					}
				]
			};
		}

		clearSplats() {}

        makeSplat({MODEL, ID, WIDTH, HEIGHT, LOADANIM}) {
            this.splats[ID] = {}

            this.canvas.width = WIDTH + "px";
            this.canvas.height = HEIGHT + "px";

            this.splats[ID].render = new WebGLRenderer({
                canvas: this.canvas,
                antialias: false
            });

            this.splats[ID].render.setSize(WIDTH, HEIGHT, false);

            this.splats[ID].scene = new Scene();

            this.splats[ID].camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
            this.splats[ID].camera.position.set( 0, 0, 2 );

            this.splats[ID].splats = new LumaSplatsThree({
                source: 'https://lumalabs.ai/capture/2c2f462b-be1a-4d0d-bf74-0975dba73d49',
                loadingAnimationEnabled: true
            });
            this.splats[ID].scene.add(this.splats[ID].splats);

            this.splats[ID].splats.onLoad = () => {
                splats.captureCubemap(renderer).then((capturedTexture) => {
                    scene.environment = capturedTexture;
                    scene.background = capturedTexture;
                    scene.backgroundBlurriness = 0.5;
                });
            }
        }
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
