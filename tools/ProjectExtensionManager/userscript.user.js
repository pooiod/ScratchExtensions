// ==UserScript==
// @name         Project extension manager
// @namespace    https://p7scratchextensions.pages.dev
// @version      2025-04-16
// @description  Manage project extensions
// @author       Pooiod7
// @include      https://mirror.turbowarp.xyz*
// @include      https://turbowarp.org*
// @include      https://studio.penguinmod.com*
// @include      https://snail-ide.js.org*
// @include      https://alpha.unsandboxed.org*
// @include      https://librekitten.org*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=p7scratchextensions.pages.dev
// @grant        none
// ==/UserScript==

// work in progress

(function() {
    var Scratch = {};
    var overlay;
    var iframe;

    var accent = "#e01f1f";
    var theme = "light";
    var backColor = "rgba(0, 0, 0, 0.7)";
    
    function getTheme() {
        function standardizeColor(color) {
            if (color.startsWith('#')) {
                let r = parseInt(color.slice(1, 3), 16);
                let g = parseInt(color.slice(3, 5), 16);
                let b = parseInt(color.slice(5, 7), 16);
                return `rgb(${r}, ${g}, ${b})`;
            } else if (color.startsWith('rgb')) {
                return color;
            } else if (color.startsWith('rgba')) {
                return color.slice(0, color.length - 4) + '1)';
            }
            return color;
        }
    
        try {
            accent = "#e01f1f";
            theme = "light";
            backColor = "rgba(0, 0, 0, 0.7)";
            var themeSetting = localStorage.getItem('tw:theme');
            var parsed = JSON.parse(themeSetting);
    
            if (parsed.gui) {
                theme = parsed.gui;
            }
    
            if (parsed.accent === 'purple') {
                accent = '#855cd6';
            } else if (parsed.accent === 'blue') {
                accent = '#4c97ff';
            }
        } catch (err) {
            err = err;
        }
    
        if (document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp")) {
            var accent2 = window.getComputedStyle(document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp")).backgroundColor;
            if (accent2 && accent != "transparent") {
                accent = accent2;
            }
        }
    
        backColor = standardizeColor(accent).replace('rgb', 'rgba').replace(')', ', 0.7)');
    } getTheme();

	const TIMEOUT_MS = 60000;
	const originalBind = Function.prototype.bind;

	new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			Function.prototype.bind = originalBind;
			reject(new Error("Timeout"));
		}, TIMEOUT_MS);

		Function.prototype.bind = function(...args) {
			if (Function.prototype.bind === originalBind) return originalBind.apply(this, args);
			if (args[0] && args[0].editingTarget && args[0].runtime) {
				Function.prototype.bind = originalBind;
				clearTimeout(timeoutId);
				resolve(args[0]);
				return originalBind.apply(this, args);
			}
			return originalBind.apply(this, args);
		};
	}).then(vm => {
		Scratch = {
            vm: vm
        };

        console.log("Extension manager loaded")
        // console.log("Acquired VM", vm);
	}).catch(err => {
		console.log("Failed to acquire VM", err);
	});

    window.addEventListener('message', async function(event) {
        if (event.data && event.data.exploreprojectloaded === true) {
            var proj = await Scratch.vm.saveProjectSb3();
            var reader = new FileReader();
            reader.onloadend = function() {
                var dataUri = reader.result;
                iframe.contentWindow.postMessage({ exploreproject: dataUri }, "*");
            };
            reader.readAsDataURL(proj);
        } else if (event.data && event.data.exportproject) {
            document.body.removeChild(overlay);

            if (Scratch.vm.extensionManager.removeExtension) {
                for (const ext of Scratch.vm.extensionManager._loadedExtensions.keys()) {
                    Scratch.vm.extensionManager.removeExtension(ext);
                }
            } else {
                const response = await fetch("http://p7scratchextensions.pages.dev/view/Project.zip");
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);

                await Scratch.vm.loadProject(buffer);
            }

            const response = await fetch(event.data.exportproject);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            Scratch.vm.loadProject(buffer);
        }
    });

    setInterval(() => {
        const btn = document.querySelector('.gui_extension-button_2T7PA');
        if (btn && !btn.dataset.listenerAdded) {
            btn.addEventListener('contextmenu', e => {
                e.preventDefault();
                getTheme();

                if (document.getElementById("widgetoverlay")) return;
        
                overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = backColor;
                overlay.style.zIndex = '9999';
                overlay.id = "widgetoverlay";

                const wrapper = document.createElement('div');
                wrapper.style.position = 'absolute';
                wrapper.style.top = "50%";
                wrapper.style.left = "50%";
                wrapper.style.transform = 'translate(-50%, -50%)';
                wrapper.style.border = '4px solid rgba(255, 255, 255, 0.25)';
                wrapper.style.borderRadius = '13px';
                wrapper.style.padding = '0px';
                wrapper.style.width = '550px';
                wrapper.style.height = '80vh';

                const modal = document.createElement('div');
                modal.style.backgroundColor = 'var(--ui-primary, white)';
                modal.style.padding = '0px';
                modal.style.borderRadius = '10px';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.textAlign = 'center';

                wrapper.appendChild(modal);

                const title = document.createElement('div');
                title.style.position = 'absolute';
                title.style.top = '0';
                title.style.left = '0';
                title.style.width = '100%';
                title.style.height = '50px';
                title.style.backgroundColor = accent;
                title.style.display = 'flex';
                title.style.justifyContent = 'center';
                title.style.alignItems = 'center';
                title.style.color = 'white';
                title.style.fontSize = '24px';
                title.style.borderTopLeftRadius = '10px';
                title.style.borderTopRightRadius = '10px';
                title.innerHTML = "Extension Manager";

                iframe = document.createElement('iframe');
                iframe.src = 'https://p7scratchextensions.pages.dev/tools/ProjectExtensionManager';
                iframe.style.width = '100%';
                iframe.style.height = `calc(100% - 50px)`;
                iframe.style.marginTop = '50px';
                iframe.style.border = 'none';
                iframe.style.borderBottomLeftRadius = '10px';
                iframe.style.borderBottomRightRadius = '10px';
                modal.appendChild(iframe);

                const closeButton = document.createElement('div');
                closeButton.setAttribute('aria-label', 'Close');
                closeButton.classList.add('close-button_close-button_lOp2G', 'close-button_large_2oadS');
                closeButton.setAttribute('role', 'button');
                closeButton.setAttribute('tabindex', '0');
                closeButton.innerHTML = '<img class="close-button_close-icon_HBCuO" src="data:image/svg+xml,%3Csvg%20data-name%3D%22Layer%201%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%207.48%207.48%22%3E%3Cpath%20d%3D%22M3.74%206.48V1M1%203.74h5.48%22%20style%3D%22fill%3Anone%3Bstroke%3A%23fff%3Bstroke-linecap%3Around%3Bstroke-linejoin%3Around%3Bstroke-width%3A2px%22%2F%3E%3C%2Fsvg%3E">';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '50%';
                closeButton.style.right = '10px';
                closeButton.style.transform = 'translateY(-50%)';
                closeButton.style.zIndex = '1000';
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                });
                title.appendChild(closeButton);

                modal.appendChild(title);
                overlay.appendChild(wrapper);
                document.body.appendChild(overlay);

                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        document.body.removeChild(overlay);
                    }
                });
            });
            btn.dataset.listenerAdded = 'true';
        }
    }, 1000);
})();
