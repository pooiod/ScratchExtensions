// ==UserScript==
// @name         	BlockLink
// @namespace    	https://p7scratchextensions.pages.dev
// @version      	wip
// @description  	Auto-load BlockLink in supported mods
// @include      	https://mirror.turbowarp.xyz*
// @include     	https://turbowarp.org*
// @include      	https://studio.penguinmod.com*
// @include       https://alpha.unsandboxed.org*
// @include       https://librekitten.org*
// @grant         none
// @run-at        document-start
// ==/UserScript==

(function() {
  const logger = { info: (...args) => console.log("[INFO]", ...args), debug: (...args) => console.debug("[DEBUG]", ...args), error: (...args) => console.error("[ERROR]", ...args), warn: (...args) => console.warn("[WARN]", ...args) };
  const TIMEOUT_MS = 60000;
  const originalBind = Function.prototype.bind;

  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logger.info("Timeout while finding VM instance, stopping.");
      Function.prototype.bind = originalBind;
      reject(new Error("Timeout"));
    }, TIMEOUT_MS);

    Function.prototype.bind = function(...args) {
      if (Function.prototype.bind === originalBind) return originalBind.apply(this, args);
      if (args[0] && args[0].editingTarget && args[0].runtime) {
        logger.info("VM found!");
        Function.prototype.bind = originalBind;
        clearTimeout(timeoutId);
        resolve(args[0]);
        return originalBind.apply(this, args);
      }
      return originalBind.apply(this, args);
    };
  }).then(vm => {
    logger.info("VM instance acquired", vm);
    window.Scratch = {};
    Scratch.vm = vm;
    Scratch.runtime = vm.runtime,
    Scratch.renderer = vm.runtime.renderer,
    Scratch.extensions = {};

    Scratch.extensions.register = function(extension) {
      logger.info("Registering extension", extension);
    };

    Scratch.extensions.unsandboxed = true;
		Scratch.extensions.userscript = true;
    Scratch.BlockType = { COMMAND: "command", REPORTER: "reporter", BOOLEAN: "boolean", HAT: "hat", STACK: "stack" };
    Scratch.ArgumentType = { STRING: "string", NUMBER: "number", BOOLEAN: "boolean", MATRIX: "matrix", COLOR: "color" };
    loadScript("https://p7scratchextensions.pages.dev/ext/BlockLink/main.js", () => {
      logger.info("BlockLink extension loaded.");
    });
  }).catch(err => {
    logger.error("Failed to acquire VM", err);
  });

  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => { logger.info("Script loaded", src); callback && callback(); };
    script.onerror = () => { logger.error("Failed to load script", src); };
    document.head.appendChild(script);
  }
})();
