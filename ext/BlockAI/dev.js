/** AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI
AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI
AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI
AIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAIAI */

(async function(Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must be run unsandboxed");
    }

    if (!typeof scaffolding === "undefined") {
        return; // Backup for if the extension exports with the project
    }

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

    function strformat(STRING) {
        console.log(STRING)
		var str = String(STRING);
		// strip harmful tags but allow basic user formated text
		var allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'br', 'i', 'u', 's', 'mark', 'sub', 'sup', 'em', 'strong', 'ins', 'del', 'small', 'big', 'code', 'kbd', 'samp', 'var', 'cite', 'dfn', 'abbr', 'time', 'a', 'span', 'br'];
		str = str.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, function (match, p1) {
		  if (allowedTags.indexOf(p1.toLowerCase()) !== -1) {
			return match;
		  } else {
			return '';
		  }
		});
		// newline fixes
		str = str.replace(/(?<!\\)\\n/g, " <br>");
		str = str.replace(/\n/g, " <br>");
		// @user links
		str = str.replace(/https:\/\/scratch\.mit\.edu\/users\/([\w-]+)/g, '@$1');
		str = str.replace(/(?<!\/)@([\w-]+)/g, '<a href="https://scratch.mit.edu/users/$1" target="_blank">@$1</a>');
		// links
		str = str.replace(/(https:\/\/)([^ \n]+)/g, '<a href="https://$2" target="_blank">$2</a>');
        str = str.replace(/(http:\/\/)([^ \n]+)/g, '<a href="https://$2" target="_blank">$2</a>');
		// special links
		str = str.replace(/web\.pooiod7/g, '<a href="https://pooiod7.pages.dev" target="_blank">web.pooiod7</a>');
		str = str.replace(/pooiod7\.dev/g, '<a href="https://pooiod7.pages.dev" target="_blank">pooiod7.dev</a>');
        // images
        str = str.replace(/img:(\S+)/g, '<img src="//$1" style="max-width: 100%;" />');
        // videos
        str = str.replace(/vid:(\S+)/g, '<video src="//$1" controls style="max-width: 100%; margin-top: 5px;"></video>');
        console.log(str)
		return str;
	};

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
		message.innerHTML = `<b>${name}: </b>` + strformat(msg);
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
	chatHeader.textContent = "Chat";
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
	chatToggle.id = "BlockLive-chat-toggle";
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

	sendButton.onclick = () => {
		const userMessage = chatInput.value.trim();
		if (userMessage) {
            showMessage(1,"You", "lightgrey", userMessage);
			chatInput.value = "";
		}
	};

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
                if (element && hasmenu) {
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
    Scratch.extensions.register(new P7BlockAI());
})(Scratch);
