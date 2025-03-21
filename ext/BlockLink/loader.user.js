// ==UserScript==
// @name         	BlockLink
// @namespace    	https://p7scratchextensions.pages.dev
// @version      	1
// @description  	Auto-load BlockLink in supported mods
// @include      	https://mirror.turbowarp.xyz*
// @include     	https://turbowarp.org*
// @include      	https://studio.penguinmod.com*
// @include       https://alpha.unsandboxed.org*
// @include       https://librekitten.org*
// @run-at        document-start
// @grant         none
// ==/UserScript==

(function() {
  const TIMEOUT_MS = 60000;
  const originalBind = Function.prototype.bind;
	console.log("BlockLink: Waiting for VM");

  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      Function.prototype.bind = originalBind;
      reject(new Error("Timeout"));
    }, TIMEOUT_MS);

    Function.prototype.bind = function(...args) {
      if (Function.prototype.bind === originalBind) return originalBind.apply(this, args);
      if (args[0] && args[0].editingTarget && args[0].runtime) {
        console.log("BlockLink: VM found");
        Function.prototype.bind = originalBind;
        clearTimeout(timeoutId);
        resolve(args[0]);
        return originalBind.apply(this, args);
      }
      return originalBind.apply(this, args);
    };
  }).then(vm => {
		console.log("BlockLink: exporting VM functions", vm);
    window.Scratch = {};
    Scratch.vm = vm;
    Scratch.runtime = vm.runtime,
    Scratch.renderer = vm.runtime.renderer,
    Scratch.extensions = {};

		// Simulate extension register without adding blocks
    Scratch.extensions.register = function(extension) {
      console.log("BlockLink: extension registered", extension);
    };

    Scratch.extensions.unsandboxed = true;
		Scratch.extensions.userscript = true;
    Scratch.BlockType = { COMMAND: "command", REPORTER: "reporter", BUTTON: "button", BOOLEAN: "boolean", HAT: "hat", STACK: "stack" };
    Scratch.ArgumentType = { STRING: "string", NUMBER: "number", BOOLEAN: "boolean", MATRIX: "matrix", COLOR: "color" };
    loadScript("https://p7scratchextensions.pages.dev/ext/BlockLink/main.js", () => {
      console.log("BlockLink: extension loaded");
			window.Scratch = null;
    });
  }).catch(err => {
		console.log("BlockLink: failed to acquire VM", err);
  });

  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
			callback && callback();
		};
    script.onerror = () => {
			console.log("BlockLink: failed to load extension", scr);
		};
    document.head.appendChild(script);
  }
})();
