// Pooiod7's Block AI (work in progress)

// TheShovel made a block AI (github.com/TheShovel/block-ai) before I could, so the model / key used is from that extension

(async function(Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must be run unsandboxed");
    }

    if (!typeof scaffolding === "undefined") {
        return; // Backup for if the extension exports with the project
    }

    document.head.appendChild(Object.assign(document.createElement('script'), {
        src: 'https://pooiod7.neocities.org/markdown/scratchblocks.js',
        onload: () => scratchblocks.init()
    }));

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
        } else if (color.startsWith('hsla')) {
            let hsla = color.match(/hsla\((\d+), (\d+)%, (\d+)%, (\d+)\)/);
            if (hsla) {
                let h = parseInt(hsla[1]) / 360;
                let s = parseInt(hsla[2]) / 100;
                let l = parseInt(hsla[3]) / 100;
                let a = parseFloat(hsla[4]);
                return `rgb(${Math.round(h * 255)}, ${Math.round(s * 255)}, ${Math.round(l * 255)})`;
            }
        } else if (color.startsWith('hsl')) {
            let hsl = color.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);
            if (hsl) {
                let h = parseInt(hsl[1]) / 360;
                let s = parseInt(hsl[2]) / 100;
                let l = parseInt(hsl[3]) / 100;
                let r, g, b;

                if (s === 0) {
                    r = g = b = l;
                } else {
                    function hueToRgb(p, q, t) {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1 / 6) return p + (q - p) * 6 * t;
                        if (t < 1 / 2) return q;
                        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                        return p;
                    }

                    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    let p = 2 * l - q;

                    r = hueToRgb(p, q, h + 1 / 3);
                    g = hueToRgb(p, q, h);
                    b = hueToRgb(p, q, h - 1 / 3);
                }

                return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
            }
        }
        return color;
    }

    var accent = "#e01f1f";
    var theme = "light";
    var backColor = "rgba(0, 0, 0, 0.7)";
    
    function getTheme() {
        try {
            accent = "rgb(24, 202, 39)";
            theme = "light";
            backColor = "rgba(0, 0, 0, 0.7)";
            var themeSetting = localStorage.getItem('tw:theme');
            var parsed = JSON.parse(themeSetting);

            function isPrimaryColorDark() {
                const color = getComputedStyle(document.documentElement).getPropertyValue("--ui-primary").trim() || "rgb(255, 255, 255)";
                const rgb = color.match(/\d+/g);
                const r = parseInt(rgb[0]);
                const g = parseInt(rgb[1]);
                const b = parseInt(rgb[2]);
                const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
                return luminance < 0.5;
            }

            if (parsed.gui) {
                theme = parsed.gui;
            } else {
                if (isPrimaryColorDark()) {
                    theme == "dark";
                }
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
        } else if (document.querySelector("#app > div > div.interface_menu_3K-Q2 > div")) {
            var accent2 = window.getComputedStyle(document.querySelector("#app > div > div.interface_menu_3K-Q2 > div")).backgroundColor;
            if (accent2 && accent != "transparent") {
                accent = accent2;
            }
        }

        backColor = standardizeColor(accent).replace('rgb', 'rgba').replace(')', ', 0.7)');
    } getTheme();

    function darkenHexColor(hex, percent) {
        hex = standardizeColor(hex);
        hex = hex.replace(/rgb\((\d+), (\d+), (\d+)\)/, (match, r, g, b) => {
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        });

        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);

        r = Math.max(0, r - r * percent / 100);
        g = Math.max(0, g - g * percent / 100);
        b = Math.max(0, b - b * percent / 100);

        return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }

    function lightenHexColor(hex, percent) {
        hex = standardizeColor(hex);
        hex = hex.replace(/rgb\((\d+), (\d+), (\d+)\)/, (match, r, g, b) => {
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        });

        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);

        r = Math.min(255, r + r * percent / 100);
        g = Math.min(255, g + g * percent / 100);
        b = Math.min(255, b + b * percent / 100);

        return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }

    function htmlsafe(str) {
        return str.replace(/[&<>"']/g, function(match) {
            switch (match) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
            }
        });
    }

    function strformat(input) {
        let html = input
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n-{3,}\n/g, '<hr>')
            .replace(/\n/g, '<br>');

        html = html.replace(/```scratch([\s\S]*?)```/g, (match, code) => {
            code = code.trim().replace(/<br>/g, '\n');
            let doc = scratchblocks.module.parse(code, { lang: "en", style: "scratch3", scale: 0.7 });
            let docView = scratchblocks.module.newView(doc, { style: "scratch3", scale: 0.7 });
            docView.render();
            var bg = getComputedStyle(document.documentElement).getPropertyValue("--ui-primary").trim() || "rgb(255, 255, 255)";
            return `<br><div style="overflow: auto; max-width: 300px; background:${bg}; border:${darkenHexColor(standardizeColor(bg), 30)} solid 2px; border-radius: 5px; padding: 5px; margin-top: 4px; margin-bottom: 4px;">` + docView.exportSVGString() + "</div>";
        });

        return html;
    }

    function showToast(text, html, time = 2000) {
        var targetElement = document.querySelector("#app > div > div > div > div.gui_body-wrapper_-N0sA.box_box_2jjDp > div > div.gui_editor-wrapper_2DYcj.box_box_2jjDp > div.gui_tabs_AgmuP > ul");
        if (!targetElement) return;

        var existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        function getTextColorBasedOnBackground(color) {
            var rgb = hexToRgb(color) || { r: 255, g: 255, b: 255 };
            var lightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
            return lightness > 128 ? 'black' : 'white';
        }

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        var alertBox = document.createElement('div');
        alertBox.classList.add('toast-notification');
        
        if (html) {
            alertBox.innerHTML = strformat(text);
        } else {
            alertBox.innerText = text;
        }

        var bgColor = getComputedStyle(document.documentElement).getPropertyValue("--ui-primary").trim() || "#fff";
        alertBox.style.position = 'absolute';
        alertBox.style.top = '5px';
        alertBox.style.right = '5px';
        alertBox.style.height = (targetElement.offsetHeight - 10) + 'px';
        alertBox.style.backgroundColor = bgColor;
        alertBox.style.color = getTextColorBasedOnBackground(bgColor);
        alertBox.style.fontSize = 'auto';
        alertBox.style.whiteSpace = 'nowrap';
        alertBox.style.overflow = 'hidden';
        alertBox.style.textOverflow = 'ellipsis';
        alertBox.style.borderRadius = '5px';
        alertBox.style.outline = `2px solid ${getComputedStyle(document.documentElement).getPropertyValue("--ui-tertiary").trim() || "#f1f1f1"}`;
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(100%)';
        alertBox.style.transition = 'all 0.5s ease';

        var height = (targetElement.offsetHeight - 10);
        alertBox.style.padding = `${height * 0.3}px ${height * 0.35}px`;

        document.querySelector('#app > div > div > div > div.gui_body-wrapper_-N0sA.box_box_2jjDp > div > div.gui_editor-wrapper_2DYcj.box_box_2jjDp > div.gui_tabs_AgmuP > ul').appendChild(alertBox);

        setTimeout(function() {
            alertBox.style.opacity = '1';
            alertBox.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(function() {
            alertBox.style.opacity = '0';
            alertBox.style.transform = 'translateY(100%)';
        }, time);

        setTimeout(function() {
            alertBox.remove();
        }, time + 500);
    }

	function setColors() {
        getTheme();

		const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--ui-primary").trim() || "#fff";
		const backgroundColorSecond = getComputedStyle(document.documentElement).getPropertyValue("--ui-tertiary").trim() || "#f1f1f1";

		chatHeader.style.background = accent;
		sendButton.style.background = accent;

		chatContainer.style.background = backgroundColorSecond;
		chatMessages.style.background = backgroundColor;
		chatInputContainer.style.background = backgroundColorSecond;

		var chatIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38">
<circle fill="#231f20" opacity="0.15" cx="19" cy="19" r="18"/>
<circle fill="${theme=="light"?"#fff":"#000"}" cx="19" cy="19" r="16"/>
<g opacity="0.8" transform="translate(6, 6)">
	<path fill="rgb(134, 134, 134)" d="M19.91,16.51A8.45,8.45,0,0,0,22,11c0-5-4.49-9-10-9S2,6,2,11s4.49,9,10,9a10.9,10.9,0,0,0,3-.41l4.59,2.3A.91.91,0,0,0,20,22a1,1,0,0,0,.62-.22,1,1,0,0,0,.35-1Z"/>
</g>
</svg>
		`;
		chatToggle.innerHTML = chatIcon;

        var borderColor = getComputedStyle(document.documentElement).getPropertyValue("--ui-tertiary").trim() || "#f1f1f1";
        if (theme == "dark") {
            borderColor = lightenHexColor(borderColor, 50);
            chatContainer.style.border = `2px solid ${borderColor}`;
        } else {
            chatContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            chatContainer.style.border = `0px`;
        }
	}

	function showMessage(user, name, color, msg) {
		const message = document.createElement("div");
		message.innerHTML = name ? `<b>${name}: </b>` + strformat(msg) : strformat(msg);
		message.classList.add("message");
		message.style.margin = "5px 0";
		message.style.padding = "8px";
		message.style.borderRadius = "5px";
		message.style.maxWidth = "80%";
		message.style.minWidth = "40%"
		message.style.alignSelf = user ? "flex-end" : "flex-start";
		message.style.background = color;
		message.style.color = getTextColor(color);

		if (chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 20) {
			setTimeout(function() {
				chatMessages.scrollTop = chatMessages.scrollHeight;
			}, 10);
		}

		chatMessages.appendChild(message);

		chatToggle.style.background = "rgba(9, 9, 9, 0.1)";
		setTimeout(function() {
			chatToggle.style.background = "transparent";
		}, 300);
	}

    function sendchat(msg) {
        sendmsg("chat", JSON.stringify({
            message: msg,
            time: 0,
            from: clientId
        }));
    }

	function getTextColor(backgroundColor) {
		const color = backgroundColor.startsWith("#") ? backgroundColor.slice(1) : backgroundColor;
		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);

		const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		return brightness < 128 - 20 ? "white" : "black";
	}

	function setPos() {
		var targetElementChat = document.querySelector("svg.blocklySvg > g > g.blocklyZoom > image:nth-child(3)");
        var targetElement = document.querySelector("svg.blocklySvg > g > g.blocklyZoom > image:nth-child(2)");

        if (document.querySelector("#app > div > div.interface_menu_3K-Q2 > div") || document.querySelector("div.stage-wrapper_stage-wrapper_2bejr.stage-wrapper_full-screen_2hjMb.box_box_2jjDp > div:nth-child(1) > div") || document.querySelector("body > div.ReactModalPortal > div > div > div > div.modal_header_1h7ps > div.modal_header-item_2zQTd.modal_header-item-title_tLOU5") || document.querySelector(".ReactModal__Overlay")) {
            targetElementChat = false;
            targetElement = false;
        }

        function detectMob() {
            const toMatch = [
                /Android/i,
                /webOS/i,
                /iPhone/i,
                /iPad/i,
                /iPod/i,
                /BlackBerry/i,
                /Windows Phone/i
            ];

            return toMatch.some((toMatchItem) => {
                return navigator.userAgent.match(toMatchItem);
            });
        }

		if (targetElementChat) {
			var rect = targetElementChat.getBoundingClientRect();
			if (rect.top == 0) {
				targetElementChat = document.querySelector("div.gui_stage-and-target-wrapper_69KBf.box_box_2jjDp > div.gui_target-wrapper_36Gbz.box_box_2jjDp > div > div.sprite-selector_sprite-selector_2KgCX.box_box_2jjDp");
				rect = targetElementChat.getBoundingClientRect();

				chatContainer.style.borderRadius = "0px";
				chatContainer.style.borderTopRightRadius = "10px";
				chatContainer.style.borderTopLeftRadius = "10px";

				chatContainer.style.top = window.innerHeight - chatContainer.offsetHeight + "px";
				chatContainer.style.left = rect.left + 2 + "px";
			} else {
				chatContainer.style.top = rect.top - 360 + "px";
				chatContainer.style.left = rect.left - 360 + "px";
				chatContainer.style.borderRadius = "10px";
			}
		} else {
            chatContainer.style.top = `calc(100vh - 20px - ${chatContainer.offsetHeight}px)`;
            chatContainer.style.left = `calc(100vw - 40px - ${chatContainer.offsetWidth}px)`;

            if (/\bCrOS\b/.test(navigator.userAgent) || detectMob()) {
                chatContainer.style.left = `calc(100vw - 20px - ${chatContainer.offsetWidth}px)`;
            }
		}

		if (targetElement) {
			const rect = targetElement.getBoundingClientRect();
			chatToggle.style.top = rect.top - 52 + "px";
			chatToggle.style.left = rect.left + rect.width / 2 - (52 / 2) + "px";
		} else {
            chatToggle.style.top = `calc(100vh - 20px - ${chatToggle.offsetHeight}px)`;
            chatToggle.style.left = `calc(100vw - 40px - ${chatToggle.offsetWidth}px)`;

            if (/\bCrOS\b/.test(navigator.userAgent) || detectMob()) {
                chatToggle.style.left = `calc(100vw - 20px - ${chatToggle.offsetWidth}px)`;
            }
		}
	}

	function toggleChat() {
		setColors();
		if (chatContainer.style.display === "none") {
			chatContainer.style.display = "flex";
			setTimeout(() => {
				chatContainer.style.transform = "translateY(0)";
				chatContainer.style.opacity = "1";

				setTimeout(() => {
					chatInput.focus();
				}, 100);
			}, 100);
		} else {
			chatContainer.style.transform = "translateY(100%)";
			chatContainer.style.opacity = "0";
			setTimeout(() => {
				chatContainer.style.display = "none";
			}, 400);
		}
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	const chatContainer = document.createElement("div");
	chatContainer.id = "chat-container";
	chatContainer.style.position = "fixed";
	chatContainer.style.width = "400px";
	chatContainer.style.height = "400px";
	chatContainer.style.background = "white";
	chatContainer.style.borderRadius = "10px";
	chatContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
	chatContainer.style.overflow = "hidden";
	chatContainer.style.display = "none";
	chatContainer.style.flexDirection = "column";
	chatContainer.style.fontFamily = "Arial, sans-serif";
	chatContainer.style.transition = "transform 0.3s ease, opacity 0.2s ease, top 0.2s ease-in-out, left 0.2s ease-in-out";
	chatContainer.style.transform = "translateY(100%)";
	chatContainer.style.opacity = "0";

	const chatHeader = document.createElement("div");
	chatHeader.id = "chat-header";
	chatHeader.textContent = "AI Chat";
	chatHeader.style.color = "white";
	chatHeader.style.padding = "10px";
	chatHeader.style.textAlign = "center";
	chatHeader.style.fontWeight = "bold";
	chatHeader.style.cursor = "pointer";
	chatHeader.style.display = "flex";
	chatHeader.style.justifyContent = "space-between";
	chatHeader.style.alignItems = "center";
	chatContainer.style.zIndex = "9999";

	const closeButton = document.createElement("button");
	var closeIMG = `data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3LjQ4IDcuNDgiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDpub25lO3N0cm9rZTojZmZmO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MnB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+aWNvbi0tYWRkPC90aXRsZT48bGluZSBjbGFzcz0iY2xzLTEiIHgxPSIzLjc0IiB5MT0iNi40OCIgeDI9IjMuNzQiIHkyPSIxIi8+PGxpbmUgY2xhc3M9ImNscy0xIiB4MT0iMSIgeTE9IjMuNzQiIHgyPSI2LjQ4IiB5Mj0iMy43NCIvPjwvc3ZnPg==`;
	closeButton.innerHTML = `<div aria-label="Close" class="close-button_close-button_lOp2G close-button_large_2oadS" role="button" tabindex="0"><img class="close-button_close-icon_HBCuO" src="${closeIMG}" draggable="false" data-alt-listener="true"></div>`;
	closeButton.style.background = "none";
	closeButton.style.border = "none";
	closeButton.style.color = "white";
	closeButton.style.fontSize = "16px";
	closeButton.style.cursor = "pointer";
	closeButton.onclick = toggleChat;

	chatHeader.appendChild(closeButton);

	const chatMessages = document.createElement("div");
	chatMessages.id = "chat-messages";
	chatMessages.style.flex = "1";
	chatMessages.style.padding = "10px";
	chatMessages.style.overflowY = "auto";
	chatMessages.style.background = "#f9f9f9";
	chatMessages.style.display = "flex";
	chatMessages.style.flexDirection = "column";

	const chatInputContainer = document.createElement("div");
	chatInputContainer.style.display = "flex";
	chatInputContainer.style.padding = "10px";
	chatInputContainer.style.background = "#f1f1f1";

	const chatInput = document.createElement("input");
	chatInput.style.flex = "1";
	chatInput.style.padding = "8px";
	chatInput.style.borderRadius = "5px";
	chatInput.style.border = "1px solid #ccc";
	chatInput.style.marginRight = "10px";
	chatInput.style.border = "0px";
	chatInput.placeholder = "Type a message...";

	const sendButton = document.createElement("button");
	sendButton.textContent = "Send";
	sendButton.style.background = accent;
	sendButton.style.color = "white";
	sendButton.style.border = "none";
	sendButton.style.padding = "8px 15px";
	sendButton.style.cursor = "pointer";
	sendButton.style.borderRadius = "5px";

	chatInputContainer.appendChild(chatInput);
	chatInputContainer.appendChild(sendButton);

	chatContainer.appendChild(chatHeader);
	chatContainer.appendChild(chatMessages);
	chatContainer.appendChild(chatInputContainer);
	document.body.appendChild(chatContainer);

	const chatToggle = document.createElement("button");
	chatToggle.id = "BlockAI-chat-toggle";
	chatToggle.style.position = "fixed";
	chatToggle.style.background = "transparent";
	chatToggle.style.color = "white";
	chatToggle.style.border = "none";
	chatToggle.style.width = "52px";
	chatToggle.style.height = "52px";
	chatToggle.style.borderRadius = "50%";
	chatToggle.style.display = "flex";
	chatToggle.style.alignItems = "center";
	chatToggle.style.justifyContent = "center";
	chatToggle.style.transition = "background 0.3s ease-in-out, border 0.3s ease-in-out";
	chatToggle.style.cursor = "default";
	chatToggle.style.fontSize = "24px";

	chatToggle.onclick = toggleChat;
	document.body.appendChild(chatToggle);

	setColors();
    var intervalColors = setInterval(setColors, 5000);
	var intervalPos = setInterval(setPos, 100);
	setPos();

    class P7BlockAI {
        constructor() {
            setInterval(()=>{
                var element = [...document.querySelectorAll('.scratchCategoryMenu > *')].find(el => el.innerText === 'BlockAI');
                if (element && (element.classList.contains("scratchCategoryMenuItem") || element.classList.contains("scratchCategoryMenuRow"))) {
                    element.style.display = "none";
                }

                var element = [...document.querySelectorAll('g.blocklyBlockCanvas text.blocklyFlyoutLabelText')].find(el => el.textContent === 'BlockAI');
                if (element) {
                    element.style.display = "none";
                }
            }, 1000);
        }

        getInfo() {
            return {
                id: 'P7BlockAI',
                name: 'BlockAI',
                blocks: [],
            };
        }
    }

    var gemini = (() => {
        const API_KEY = 'AIzaSyD2B46yojYB2AQzktJNR7jzIHRrqAISG9A'; // https://extensions.penguinmod.com/extensions/TheShovel/blockAI.js
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        let beforePrompt = 'You are a helpful and friendly assistant.';
        const gemini = {};

        gemini.history = [];

        gemini.chat = async function (msg) {
            const messages = [{ role: 'user', parts: [{ text: beforePrompt }] }, ...gemini.history, { role: 'user', parts: [{ text: msg }] }];
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: messages })
            });
            const data = await res.json();
            const response = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            gemini.history.push({ role: 'user', parts: [{ text: msg }] });
            gemini.history.push({ role: 'model', parts: [{ text: response }] });
            return response;
        };

        gemini.init = function (customPrompt) {
            beforePrompt = customPrompt || 'You are a helpful and friendly assistant.';
            gemini.history = [];
        };

        gemini.reset = function () {
            gemini.history = [];
        };

        return gemini;
    })();

    const syntax = "When you asnwer with blocks, format them to be compatible with https://github.com/scratchblocks/scratchblocks. You can reference the syntax more from here https://en.scratch-wiki.info/wiki/Block_Plugin/Syntax. Make sure its valid code by checking the blocks at https://en.scratch-wiki.info/wiki/Blocks. Blocks are not inside square brackets. Number values are in round brackets and strings are in square brackets. Booleans are only in < >. Round brackets can also contain input names. Wrap all the blocks in ```scratch CODEHERE```. You MUST include 3 of the ```. Math operations are all separate reporter blocks. Dont do stuff like(1-2+2), do ((1-1)+2) instead. For example you cant have (10+20-20) in the same block, its have to be ((10+20)-20).If statements should never be empty, aways add a placeholder block inside both the if and the else. Comments cannot be inside the code, they can only be next to a block, not under or on top of it.Do not add comments inside if statements or any C type block! That is not valid syntax! A C type block is a block that wraps around others. For example if statements, forever looks, repeat until and so on. Also, C blocks dont need any square brackets! Dont do if[...]else[...]!!! That is wrong sytax!!! Do if ... else... instead. Place holder blocks should just be ... . Dont do anything else for placeholder blocks. All blocks that do comparison are treated like booleans, and they should therefore be in < >. For example, greated than, equal, smaller than, and, or and so on. Continuations of a C block can never be on the same line. You should not do if < > newline then you should instead do if < > then newline. For special hat blocks like 'when green flag clicked', you should not include any inputs, as the green flag is not an input. Inputs inside blocks dont need to be in any kind of bracket like < >, () or [] if they are already a normal block, that has a bracket. Dont forget that empty if statements still need a < > as a place holder for the sytax to be correct. Try to think in javascript, and then translate that to scratchblocks. Custom blocks cant take a dropdown as an input, they can only have booleans, text and numbers, so define sort list [thing v] is not possible, but [thing],(thing),<thing> are. Effects blocks have the effect name in a dropdown input. For looks effects blocks, its always the effect name and the word 'effect' after. When you are using the 'contains' boolean block, it only has a dropdown if its refering to a list, otherwise, it is a string input. If you pass a list through an input, you dont get an array or a useful format, in custom blocks that require a list for example, you should make the input be the name of the list, and then get its values in the custom block. List blocks can only select the list from a dropdown, so its not lenght of [list] its length of [list v]. Dropdowns can only be strings, not numbers, so (thing v) is not correct, but [thing v] is. Mathematical operations with use the operations and are always like this ([ v]of(number)), for example ([cos v]of(25)), it does not start with mathop though! Its only the function name in a dropdown! Operator blocks dont have to be inside another operator all the time, for example 'or' is <<>or<>>, not <<<>or<>>>, doing that just puts it in an empty boolean block that does nothing.Blocks like (10+10) or (10/10) dont exist, only ((10)+(10)) and ((10)/(10)). To run code inside a clone, you have to use the 'when i start as a clone' hat block. The 'touching' boolean block is structured like <touching[thing v]?>. When you refer to the position of the sprite, the variable name is x position, not just x. Hat blocks never end with 'end', NEVER!. The sprite size is not a variable block. If an item is inside a [ v] that means it is inside a drop down, for example if we have [wall v] the thing selected in the dropdown is wall.";

    const references = "Here are reference pieces of code:" + JSON.stringify({
        "Simple if then else statement": "if <  > then\n\nelse\n\nend\n",
        "Example of using booleans":
        "if <<mouse down?> and <(costume [number v]) = [1]>> then\n    stamp\nend",
        "Move 10 steps": "move (10) steps\n",
        "Say hi": "say [Hi]",
        "Color inputs": "set pen color to [#1540bf]",
        "Dropdown lists": "stop [all v]\n",
        "Round dropdown lists": "broadcast (start v)\n",
        "When green flag clicked": "when green flag clicked",
        "When this sprite clicked": "when this sprite clicked\n",
        "Turn right": "turn right () degrees",
        "C blocks":
        'C blocks must be closed by typing "end" after the last stack block inside it. However, C blocks at the end of a script will close automatically. For example:\n\nrepeat (10)\n    move (5) steps\n    stamp\nend\nrepeat (10)\n    move (10) steps\n    stamp',
        "Block comments":
        "Comments are created with two slashes: //comment after a block.\n\nmove (10) steps //is that too far?",
        "Custom blocks": "define jump\nrepeat (10)\n    change y by (4)\nend",
        "Custom block arguments":
        "Number, boolean, and string arguments can be added:\n\ndefine jump (height) <gravity on?> [message]",
        "Custom block inputs":
        "If one tries to use an input reporter without making a block definition first, it will appear as a variable.\n\nsay (height) But if it is put below a block definition, it will render as an input reporter:\n\ndefine jump (height)\nsay (input)",
        "List reporters":
        "If one tries to write a list reporter, it will look like a variable reporter, because the plugin has no way of telling them apart.\n\nsay (list of Scratch team members) However, if one has used the list in a list block inside the same <scratchblocks> tag, then it will render correctly:\n\nadd [mres] to [list of Scratch team members v]\nadd [paddle2see] to [list of Scratch team members v]\nadd [harakou] to [list of Scratch team members v]\nsay (list of Scratch team members) If a list block is not wanted or needed inside the same <scratchblocks> tag, :: list can be used:\n\nsay (list of Scratch team members:: list)",
        "Effect blocks":
        "change [effectname v] effect by (25)\nset [geffectnamehost v] effect to (25)",
        "Layer blocks": "go to [front v] layer\ngo [forward v] (5) layers",
        "Looks reporters":
        "(costume [number v])\n(costume [name v])\n(backdrop [number v])\n(backdrop [name v])",
        "Looks effect blocks":
        "change [color v] effect by ()\nchange [fisheye v] effect by ()\nchange [whirl v] effect by ()\nchange [pixelate v] effect by ()\nchange [mosaic v] effect by ()\nchange [brightness v] effect by ()\nchange [ghost v] effect by ()\nchange [saturation v] effect by ()\nchange [red v] effect by ()\nchange [green v] effect by ()\nchange [blue v] effect by ()\nchange [opaque v] effect by ()\nset [color v] effect to ()\nset [fisheye v] effect to ()\nset [whirl v] effect to ()\nset [pixelate v] effect to ()\nset [mosaic v] effect to ()\nset [brightness v] effect to ()\nset [ghost v] effect to ()\nset [saturation v] effect to ()\nset [red v] effect to ()\nset [green v] effect to ()\nset [blue v] effect to ()\nset [opaque v] effect to ()",
        "Reporter 'when' blocks": "when [loudness v] > ()\nwhen [timer v] > ()",
        "Control blocks":
        "if <> then\n...\nend\n\nif <> then\n...\nelse\n...\nend\n\nwait until <>\n\nrepeat until <>\n...\nend\n\nrepeat (0)\n...\nend",
        "Mathematical operation blocks":
        "([abs v]of(number))\n([floor v]of(number))\n([ceiling v]of(number))\n([sqrt v]of(number))\n([sin v]of(number))\n([cos v]of(number))\n([tan v]of(number))\n([asin v]of(number))\n([acos v]of(number))\n([atan v]of(number))\n([log v]of(number))",
        "Comparison blocks":
        "< (0) > (0) >\n< (0) < (0) >\n< (0) = (0) >\n< not < > >\n< < > and < > >\n< < > or < > >",
        "Other operator blocks":
        "<[]contains[]?>\n(()mod())\n(round())\n(pick random()to())\n(length of[])",
        "Hat blocks":
        "when green flag clicked\nwhen [space v] key pressed\nwhen this sprite clicked\nwhen backdrop switches to [backdrop1 v]\nwhen [loudness v] > (10)\nwhen i receive [message1 v]\nwhen i start as a clone",
        "Example hat block use":
        "when [right arrow v] key pressed\nif <touching [wall v]?> then\n\nelse\nchange x by (5)\nend",
        "Create clone": "create clone of (myself v)"
    });

    gemini.init(`You are a helpful and friendly AI coding assistant. Your name is "Spark" and you were created by pooiod7 (github.com/pooiod).
You muse ALWAYS place your blocks in the markdown code format, Everything else must be html formatting.
Always mark links as clickable with html <a> tags, and open them in a new tab, not the current one.

${syntax} ${references}

studio.penguinmod.com, turbowarp.org, robo-code.pages.dev, snail-ide.js.org, and librekitten.org are all scratch mods that you are compatable with.
You are currently on ${window.location.host}.

Turbowarp is a mod of scratch that makes it compile into JavaScript before running, allowing for faster project running.
It also has addon support, and an extension library.

Penguinmod is a mod of Turbowarp that adds more default blocks, while adding more general features aswel.
Penguinmod also has community features for sharing projects.
It also has its own extension library.

Snail-IDE is a mod of Penguinmod that makes it purple and have snail theme.
It also has another extension library of its own.

Robo-Code (made by pooiod7) is a mod of Turbowarp that kinda looks like a mix of Scratch2 and Scratch3 with a maroon color.
Other than that, it does one thing: add an extension that can be used to interact with robots.
It also comes with another Scratch extension made by pooiod7 called "BlockLink" that allows for project collaberation online.

Here are some helpful resources https://docs.turbowarp.org/development/getting-started, https://github.com/PenguinMod/PenguinMod-Vm, https://extensions.turbowarp.org/, https://extensions.penguinmod.com/. Give simple responses. Dont overcomplicate stuff, and dont fluff up your responses too much. Try to explain what it does AFTER you display the blocks.

If people ask for extensions, link them to one of these websites https://p7scratchextensions.pages.dev/, https://extensions.turbowarp.org/, https://extensions.penguinmod.com/. Check the websites and see if it contains an extension the user wants, and tell them what extension it is. Fetch the lists of those websites.
p7scratchextensions.pages.dev is Pooiod7's extension gallary
If they ask you about how to use an extension, try to help, but mention that you dont have access to the code of the extensions in the extenion libraries, and that your responses might not be correct. Dont say it directly though. Always do that.

Dont create new questions for yourself, or answer things in the future.
Try to be polite! Never explain stuff in text, always explain stuff using comments, and nothing else.
Dont overuse comments, only use them to explain what is needed, dont tell me what every single block does.

If someone asks you to make a full project dont say you cant, give them snippest that could help them instead, just dont leave an empty response with nothing to show.
If someone asks you to make a script that draws an image, tell them you cant visualize images to draw them with code.
Refuse to do make JavaScript or css. Don't ever use <script> JavaScript tags or <style> or <link> tags.

You dont have access to the users workspace, you cant see what blocks they placed down. Please specify that when needed, and that you will have access in a future update.
If the user says nothing, give them a useful tip or fun fact.`);

	sendButton.onclick = async () => {
		const userMessage = chatInput.value.trim();
		if (userMessage) {
            showMessage(1,"", "lightgrey", userMessage);
			chatInput.value = "";
            var response = await gemini.chat(userMessage);
            showMessage(0,"", "lightblue", response);
		}
	};

    Scratch.extensions.register(new P7BlockAI());
})(Scratch);
