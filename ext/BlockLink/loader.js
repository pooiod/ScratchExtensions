// BlockLink: A collaberation system for TurboWarp based Scratch mods.

// You can add this into your Turbowarp-based Scratch mod by including this script
// <script src="https://p7scratchextensions.pages.dev/ext/BlockLink/loader.js"></script>
// Keep in mind though, this is still a work in progress

(function() {
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
		var Scratch = {};
		Scratch.vm = vm;
		Scratch.runtime = vm.runtime,
		Scratch.renderer = vm.runtime.renderer,
		Scratch.extensions = {};

		// Simulate extension register without adding blocks
		Scratch.extensions.register = function() {};

		Scratch.extensions.unsandboxed = true;
		Scratch.extensions.noblocks = true;
		Scratch.extensions.version = "lib";
		Scratch.extensions.lib = true;

		Scratch.BlockType = {
			COMMAND: "command",
			REPORTER: "reporter",
			BUTTON: "button",
			BOOLEAN: "boolean",
			HAT: "hat",
			STACK: "stack"
		};

		Scratch.ArgumentType = {
			STRING: "string",
			NUMBER: "number",
			BOOLEAN: "boolean",
			MATRIX: "matrix",
			COLOR: "color"
		};

		loadScript = (src, callback) => {
			const script = document.createElement("script");
			script.src = src;
			window.Scratch = Scratch;
			script.onload = () => {
				window.Scratch = null;
				callback && callback();
			};
			script.onerror = () => {
				window.Scratch = null;
				console.log("BlockLink: failed to load extension", scr);
			};
			document.head.appendChild(script);
		};

		// Extension loads only when needed
		if (!new URL(window.location.href).searchParams.has("project_url")) {
			updateWorkspace = () => {
				var divider = document.querySelector('.divider_divider_1_Adi.menu-bar_divider_2VFCm');

				var showIcon = document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div:nth-child(2) > img:nth-child(1)") && document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div:nth-child(3) > span > span");
				if (showIcon) showIcon = getComputedStyle(showIcon).display != 'none';

				if (showIcon) {
					divider = document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div:nth-child(3)") || divider;
				}

				if (!divider) {
					setTimeout(updateWorkspace, 1000);
				}

				if (document.getElementById("BlockLinkButton")) return;
				if (!divider) return;

				const button = document.createElement('div');
				button.classList.add('menu-bar_menu-bar-item_oLDa-', 'menu-bar_hoverable_c6WFB');
				button.style.paddingLeft = '10px';
				button.style.paddingRight = '10px';

				const img = document.createElement('img');
				img.src = 'https://p7scratchextensions.pages.dev/ext/BlockLink/IconMono.svg';
				img.setAttribute('draggable', 'false');
				img.width = 20;
				img.height = 20;
				img.setAttribute('data-alt-listener', 'true');

				const img2 = document.createElement('img');
				img2.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iOHB4IiBoZWlnaHQ9IjVweCIgdmlld0JveD0iMCAwIDggNSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDguMiAoNDczMjcpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPmRyb3Bkb3duLWNhcmV0PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9ImRyb3Bkb3duLWNhcmV0IiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPHBhdGggZD0iTTQsNSBDMy43MjUyMDcwOCw1IDMuNDUxNjMwMDYsNC44OTY5NTA0NSAzLjI0MTI3OTczLDQuNjg5NjUzMTEgTDAuMzE0NjEzNTcyLDEuODA2NjYyMjcgQy0wLjEwNDg3MTE5MSwxLjM5MzI2NTgzIC0wLjEwNDg3MTE5MSwwLjcyNDY0MjAyMyAwLjMxNDYxMzU3MiwwLjMxMDA0NzMzMSBDMC43MzI4ODI0MzgsLTAuMTAzMzQ5MTEgNy4yNjcxMTc1NiwtMC4xMDMzNDkxMSA3LjY4NTM4NjQzLDAuMzEwMDQ3MzMxIEM4LjEwNDg3MTE5LDAuNzIzNDQzNzcyIDguMTA0ODcxMTksMS4zOTMyNjU4MyA3LjY4NTM4NjQzLDEuODA2NjYyMjcgTDQuNzU5OTM2MTcsNC42ODk2NTMxMSBDNC41NDk1ODU4Myw0Ljg5Njk1MDQ1IDQuMjc2MDA4ODIsNSA0LDUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==';
				img2.setAttribute('draggable', 'false');
				img2.width = 8;
				img2.height = 5;
				img2.setAttribute('data-alt-listener', 'true');

				const span = document.createElement('span');
				span.classList.add('menu-bar_collapsible-label_o2tym');
				span.innerHTML = '<span>BlockLink</span>';

				if (showIcon) button.appendChild(img);
				button.appendChild(span);
				if (showIcon) button.appendChild(img2);

				const interval = setInterval(() => {
					if (!document.body.contains(button)) {
						clearInterval(interval);
						updateWorkspace();
					}
				}, 1000);

				button.onclick = (event) => {
					clearInterval(interval);
					button.classList.add('menu-bar_active_2Lfqh');
					loadScript("https://p7scratchextensions.pages.dev/ext/BlockLink/main.js", () => {
						function clickbtn() {
							if (document.getElementById("BlockLinkButton")) {
								button.remove();
								document.getElementById("BlockLinkButton").click();
							} else {
								setTimeout(clickbtn, 500);
							}
						}
						clickbtn();
					});
				};

				divider.parentNode.insertBefore(button, divider);
			}
			if (document.getElementById("BlockLinkButton")) {
				return;
			} else {
				console.log("BlockLink: ready and waiting for user interaction");
				updateWorkspace();
			}
		} else {
			loadScript("https://p7scratchextensions.pages.dev/ext/BlockLink/main.js", () => {});
		}
	}).catch(err => {
		console.log("BlockLink: failed to acquire VM", err);
	});
})();
