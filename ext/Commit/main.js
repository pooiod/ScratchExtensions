// A commit system for scratch (wip)

(async function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must be run unsandboxed");
    }

    if (typeof ScratchBlocks == "undefined") {
        return; // Backup for if the extension exports with the project
    }

    var editing = {};

	function getColorFromID(id) {
		var hue = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
		var hexColor = `hsl(${(hue / 5) % 360}, 50%, 80%)`;
		return hexColor;
	}

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
            if (parsed.accent === 'purple') {
                accent = '#855cd6';
            } else if (parsed.accent === 'blue') {
                accent = '#4c97ff';
            }
    
            if (parsed.gui === 'dark' || parsed.gui === 'light') {
                theme = parsed.gui;
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

    function showToast(text, html) {
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
            alertBox.innerHTML = text;
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
        }, 1500);

        setTimeout(function() {
            alertBox.remove();
        }, 2000);
    }

    async function YeetFile(BLOB) {
        const formData = new FormData();
        formData.append('file', BLOB);

        return new Promise(async (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://yeetyourfiles.lol/api/upload', true);

            await new Promise(resolve => setTimeout(resolve, 500));

            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    showalert("Uploading to server " + percentComplete + "%", 2000, false);
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(`https://yeetyourfiles.lol${response.fileUrl}`);
                } else {
                    showalert("Upload failed: " + xhr.status, 5000, false);
                    reject(new Error('Upload failed with status: ' + xhr.status));
                }
            };

            xhr.onerror = function() {
                showalert("Unable to send file", 5000, false);
                reject(new Error('An error occurred during the file upload.'));
            };

            xhr.send(formData);
        });
    }

    async function blobToBase64(blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise((resolve) => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    }

    async function blobToFile(blob) {
        if (!blob instanceof Blob) {
            alert("Invalid file tried to upload");
            return;
        }

        if (blob.size < 1024 * 1024 * 1024) {
            return blobToBase64(blob);
        } else {
            return YeetFile(blob);
        }
    }

    function showalert(txt, timeout, inst) {
        var alertDiv = document.createElement('div');
        alertDiv.style.position = 'fixed';
        alertDiv.style.bottom = '-50px';
        alertDiv.style.left = '0';
        alertDiv.style.width = '100%';
        alertDiv.style.backgroundColor = '#cc1d1d';
        alertDiv.style.color = 'white';
        alertDiv.style.textAlign = 'center';
        alertDiv.style.padding = '5px';
        alertDiv.style.fontSize = '20px';
        alertDiv.style.transition = 'bottom 0.5s ease';
        alertDiv.textContent = txt;
        alertDiv.style.zIndex = '9999999999999999999999999999999999999999999';
        alertDiv.style.pointerEvents = 'none';

        try {
            var accent = "#e01f1f";
            var themeSetting = localStorage.getItem('tw:theme');
            var parsed = JSON.parse(themeSetting);
            if (parsed.accent === 'purple') {
                accent = '#855cd6';
            } else if (parsed.accent === 'blue') {
                accent = '#4c97ff';
            }
			if (document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp")) {
				var accent2 = window.getComputedStyle(document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp")).backgroundColor;
				if (accent2 && accent != "transparent") {
					accent = accent2;
				}
			}
            alertDiv.style.backgroundColor = accent;
        } catch (err) {
			var accent = "#e01f1f";
			if (document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp")) {
				var accent2 = window.getComputedStyle(document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp")).backgroundColor;
				if (accent2 && accent != "transparent") {
					accent = accent2;
				}
				alertDiv.style.backgroundColor = accent;
			}
            err = err;
        }

        document.body.appendChild(alertDiv);

        console.log(txt);

        setTimeout(function() {
            alertDiv.style.bottom = '0';
        }, 10);
        if (inst) {
            alertDiv.style.bottom = '0';
        }
        setTimeout(function() {
            alertDiv.style.bottom = '-50px';
            setTimeout(function() {
                document.body.removeChild(alertDiv);
            }, 500);
        }, timeout);
    }

    var pgeurl = new URL(window.location.href);
    var pgeparams = pgeurl.searchParams;
    var serverid = false;
    if (pgeparams.has("project_url")) {
        serverid = pgeparams.get("project_url");
    }

    async function promptUsername() {
        const editButton = Array.from(document.querySelectorAll('div.menu-bar_menu-bar-item_oLDa-.menu-bar_hoverable_c6WFB'))
            .find(el => el.textContent.trim() === "Edit");

        async function waitForInputDisappear(inputField) {
            while (inputField && inputField.offsetParent !== null) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        function click(elm) {
            const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
            const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });

            elm.dispatchEvent(mouseDownEvent);
            elm.dispatchEvent(mouseUpEvent);
            elm.click();
        }

        if (editButton) {
            click(editButton);
            await new Promise(resolve => setTimeout(resolve, 100));

            const changeUsernameButton = Array.from(document.querySelectorAll('div.menu-bar_menu-bar-menu_239MD *'))
                .find(el => el.textContent.trim() === "Change Username");

            if (changeUsernameButton) {
                click(changeUsernameButton);

                const startTime = Date.now();
                while (!document.querySelector('input.username-modal_text-input_3z1ni') && Date.now() - startTime < 1000) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

                const inputField = document.querySelector('input.username-modal_text-input_3z1ni');
                if (inputField) inputField.value = '';

                const helpTexts = document.querySelectorAll('p.username-modal_help-text_3dN2-');
                if (helpTexts.length > 0) helpTexts[0].remove();
                if (helpTexts.length > 1) helpTexts[1].innerHTML = "Please select suitable username so that everyone else on this colab can tell it's you.";
                document.querySelector(".modal_header-item_2zQTd.modal_header-item-title_tLOU5").innerText = "Choose a Username";

                document.querySelector("body > div.ReactModalPortal > div > div > div > div.username-modal_body_UaL6e.box_box_2jjDp > div.username-modal_button-row_2amuh.box_box_2jjDp > button:nth-child(1)")?.remove();

                await waitForInputDisappear(inputField);
            }
        }
    }

    if (serverid && /^player\d+$/.test(Scratch.vm.runtime.ioDevices.userData._username)) {
        try {
            await promptUsername();
        } catch(e) {}
    }

    var canmanual = true;
    document.addEventListener("keydown", async function(event) {
        if (event.ctrlKey && event.key === "k") {
            event.preventDefault();
			if (serverid) {
				if (canmanual) {
					commit(Scratch.vm.runtime.getEditingTarget());
					canmanual = false;
					Scratch.vm.extensionManager.refreshBlocks();
					setTimeout(() => {
						canmanual = true;
						Scratch.vm.extensionManager.refreshBlocks();
					}, 500);
				}
			} else {
				showalert("Starting colab server: ", 5000);
				pgeparams.set("project_url", await YeetFile(await Scratch.vm.saveProjectSb3()));
				window.location.href = pgeurl;
			}
        }
    });

    setTimeout(function() {
        if (serverid) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js';
            script.onload = function() {
                showalert("Conencting to broker...", 2000, false);
                start();
            };
            document.head.appendChild(script);
        }
    }, 1000);

    const mqttBroker = "wss://test.mosquitto.org:8081/mqtt";
    var clientId = Scratch.vm.runtime.ioDevices.userData._username
    if (clientId == null || clientId == "null" || clientId == "") clientId = false;
	clientId = clientId || "Scratcher-" + Math.random().toString(16).substr(2, 8);
    var client;

    function onConnect() {
        console.log("Connected to MQTT broker");
        client.onMessageArrived = gotMessage;
        client.subscribe("commit" + serverid);
		client.subscribe("chat" + serverid);
        client.subscribe("usrtrack" + serverid);
        main();
        showalert("Connected to broker", 2000, false);
    }

    function onFailure(err) {
        showalert("Unable to connect", 99000, true);
        console.error("Failed to connect to MQTT broker: ", err);
    }

    function onConnectionLost(response) {
        if (response.errorCode !== 0) {
            showalert("Reconnecting: " + response.errorMessage, 1000, true);
            // console.error("Connection lost: ", response.errorMessage);
            client = null;
            start(); // reconnect
        }
    }

    function start() {
        client = new Paho.MQTT.Client(mqttBroker, clientId);

        client.onConnectionLost = onConnectionLost;

        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure
        });
    }

    function sendmsg(varName, content) {
        const message = new Paho.MQTT.Message(content);
        message.destinationName = varName + serverid;
        client.send(message);
    }

    function gotMessage(message) {
        // console.log("Message received on topic " + message.destinationName + ": " + message.payloadString);
        try {
            function isJsonString(str) {
                try {
                    JSON.parse(str);
                } catch (e) {
                    return false;
                }
                return true;
            }
            if (isJsonString(message.payloadString)) {
				if (message.destinationName == "chat" + serverid) {
					dochat(message.payloadString);
				} else if (message.destinationName == "commit" + serverid) {
					setTimeout(() => {
						docommit(message.payloadString);
					}, 1000);
				} else if (message.destinationName == "usrtrack" + serverid) {
                    alertUserSpriteChange(message.payloadString);
                }
            }
        } catch (err) {
            err = err;
        }
    }

    async function getdata(target) {
        // Scratch.vm.runtime.getSpriteTargetByName("Sprite1")
        if (!target) return '';
        const spriteExport = await Scratch.vm.exportSprite(target.id);
        const dat = await blobToFile(spriteExport);
        return JSON.stringify({
            sprite: target.getName(),
            data: dat,
            from: clientId
        });
    }

    async function commit(spr) {
        // var edit = getEditingSprite(prevtarget.getName());
        // if (!edit || edit == clientId) {
        //     edit = window.conferm(`${edit} is already editing this sprite, are you sure you want to commit`);
        //     if (!edit) return;
        // }

        if (spr.isStage) {
            showalert("Unable to commit the stage.", 2000);
            return;
        } else if (spr.getName() == "Stage") {
            showalert("Unable to commit anything named \"Stage\".", 2000);
            return;
        } else {
			showalert("Commiting sprite", 2000, false);
		}

        var dat = await getdata(spr);
        sendmsg("commit", dat);
		showalert("Sprite commited", 2000, false);
    }

    var published = "";

    function main() {
        var prevtarget = Scratch.vm.runtime.getEditingTarget();

        setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            for (const user in editing) {
                if (editing[user].time < currentTime - 20) {
                    delete editing[user];
                }
            }
        }, 10000);

        setInterval(()=>{
            sendmsg("usrtrack", JSON.stringify({
                sprite: Scratch.vm.runtime.getEditingTarget().getName(),
                dothing: false,
                from: clientId
            }));
        }, 5000);

        function getEditingSprite(sprite) {
            for (const user in editing) {
                if (editing[user].sprite === sprite) {
                    return user;
                }
            }
            return;
        }

        var ignoreSwap = false;
        Scratch.vm.on('targetsUpdate', (event) => {
            if (ignoreSwap) return;
            ignoreSwap = true;
            setTimeout(()=>{
                ignoreSwap = false;
                let target = Scratch.vm.runtime.getEditingTarget(); // event.editingTarget

                if (published == target.getName() || prevtarget.getName() == published) {
                    prevtarget = target;
                    return;
                }

                if (prevtarget.getName() == target.getName()) {
                    return;
                } else {
                    // var edit = getEditingSprite(prevtarget.getName());
                    // if (!edit || edit == clientId) {
                    //     commit(prevtarget);
                    // }

                    var edit = getEditingSprite(target.getName());
                    if (edit || edit == clientId) {
                        showToast(`Notice: ${edit} is already editing "${target.getName()}"`, false);
                    }

                    sendmsg("usrtrack", JSON.stringify({
                        sprite: target.getName(),
                        dothing: true,
                        from: clientId
                    }));

                    prevtarget = target;
                }
            }, 500);
        });
    }

    function docommit(dat) {
        const parsedData = JSON.parse(dat);
        const {
            sprite,
            data,
            from
        } = parsedData;

        if (from == clientId) {
            // return;
        } else {
			showalert(`Recived "${sprite}" from ${clientId}`, 2000, false);
		}

        let target = Scratch.vm.runtime.getEditingTarget();

        published = sprite;
        deleteSprite(sprite);
        importSprite(data, () => {
            vm.setEditingTarget(target.id);
            setTimeout(() => {
                published = "";
            }, 500);
        })
    }

    function deleteSprite(SPRITE) {
        const target = Scratch.vm.runtime.getSpriteTargetByName(SPRITE);
        if (!target || target.isStage) {
            return;
        }
        vm.deleteSprite(target.id);
    }

    function importSprite(TEXT, callback) {
        fetch(TEXT)
            .then((r) => r.arrayBuffer())
            .then((buffer) => Scratch.vm.addSprite(buffer))
            .then(() => {
                callback();
            })
            .catch((error) => {
                console.log("Error", error);
            });
    }

    function alertUserSpriteChange(dat) {
        const parsedData = JSON.parse(dat);
        const {
            sprite,
            dothing,
            from
        } = parsedData;

        if (from == clientId) {
            return;
        } else {
            editing[from] = {
                sprite: sprite,
                time: Math.floor(Date.now() / 1000)
            };
        }

        if (dothing) {
            showToast(`${from} is now editing "${sprite}"`, false);
        }
    };

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
	}

    function strformat(STRING) {
		var str = String(STRING);
		// strip harmful tags but allow basic user formated text
		var allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'br', 'i', 'u', 's', 'mark', 'sub', 'sup', 'em', 'strong', 'ins', 'del', 'small', 'big', 'code', 'kbd', 'samp', 'var', 'cite', 'dfn', 'abbr', 'time', 'a', 'span', 'img'];
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
		// https links
		str = str.replace(/(\/\/|www\.)([^ \n]+)/g, '$1<a href="https://$2" target="_blank">$2</a>');
		// special links
		str = str.replace(/web\.pooiod7/g, '<a href="https://pooiod7.pages.dev" target="_blank">web.pooiod7</a>');
		str = str.replace(/pooiod7\.dev/g, '<a href="https://pooiod7.pages.dev" target="_blank">pooiod7.dev</a>');
		return str;
	};

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

    function dochat(dat) {
        const parsedData = JSON.parse(dat);
        const {
            message,
			time,
            from
        } = parsedData;

        if (from == clientId) {
            showMessage(1,from,  getColorFromID(from), message);
        } else {
			showMessage(0, from, getColorFromID(from), message);
		}
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
            chatContainer.style.left = `calc(100vw - 20px - ${chatContainer.offsetWidth}px)`;
		}

		if (targetElement) {
			const rect = targetElement.getBoundingClientRect();
			chatToggle.style.top = rect.top - 52 + "px";
			chatToggle.style.left = rect.left + rect.width / 2 - (52 / 2) + "px";
		} else {
            chatToggle.style.top = `calc(100vh - 20px - ${chatToggle.offsetHeight}px)`;
            chatToggle.style.left = `calc(100vw - 20px - ${chatToggle.offsetWidth}px)`;
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
	chatToggle.id = "chat-toggle";
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
	if (serverid) document.body.appendChild(chatToggle);

	sendButton.onclick = () => {
		const userMessage = chatInput.value.trim();
		if (userMessage) {
			sendchat(userMessage);
			chatInput.value = "";
		}
	};

	setColors();
	setInterval(setPos, 500);
	setPos();

	var element = [...document.querySelectorAll('*')].find(el => el.innerText === 'Commit Settings');
	if (element && (element.classList.contains("scratchCategoryMenuItem") || element.classList.contains("scratchCategoryMenuRow"))) element.remove();
	setInterval(()=>{
		var element = [...document.querySelectorAll('*')].find(el => el.innerText === 'Commit Settings');
		if (element && (element.classList.contains("scratchCategoryMenuItem") || element.classList.contains("scratchCategoryMenuRow"))) {
		  	element.remove();
		}
	}, 1000);

    class p7scratchcommits {
        getInfo() {
            return {
                id: 'p7scratchcommits',
                name: 'Commit Settings',
                blocks: [{
                        func: "server",
                        blockType: Scratch.BlockType.BUTTON,
                        text: serverid?"Connect to another server":"Connect to server"
                    },
                    {
                        func: "commit",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: !serverid || !canmanual,
                        text: "Commit this sprite"
                    },
                ],
            };
        }
        commit() {
            if (canmanual) {
                canmanual = false;
                commit(Scratch.vm.runtime.getEditingTarget());
                setTimeout(() => {
                    canmanual = true;
                    Scratch.vm.extensionManager.refreshBlocks();
                }, 500);
            }
        }
        async server() {
            var id = window.prompt("Select server to join (blank to start new server)");
            if (id) {
				showalert("Joining colab server: " + id, 5000);
                pgeparams.set("project_url", id);
                window.location.href = pgeurl;
            } else {
				showalert("Starting colab server", 5000);
				pgeparams.set("project_url", await YeetFile(await Scratch.vm.saveProjectSb3()));
				window.location.href = pgeurl;
			}
        }
    }
    Scratch.extensions.register(new p7scratchcommits());
})(Scratch);
