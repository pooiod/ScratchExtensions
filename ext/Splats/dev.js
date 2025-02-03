// Scratch3 advanced extension template

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
			this.stagewidth = Scratch.vm.runtime.stageWidth;
			this.stageheight = Scratch.vm.runtime.stageHeight;
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
			this.canvas = Scratch.vm.runtime.renderer.canvas;

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				console.log("project loaded");
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				canvas = Scratch.vm.runtime.renderer.canvas;
				console.log("project started");
			});

			Scratch.vm.runtime.on('PROJECT_STOP', () => {
				console.log("project stopped");
			});
		}

		getInfo() {
			return {
				id: 'P7Splats',
				name: 'Splats',
				blocks: [
					{
						opcode: 'func',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create splat: Model [MODEL], ID [ID], Width [WIDTH], Height [HEIGHT]',
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

		func(args) {
			console.log(args);
		}
	}
	Scratch.extensions.register(new P7Splats());
})(Scratch);
