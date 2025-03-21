// A commit system for scratch (wip)

(async function(Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must be run unsandboxed");
    }

    if (typeof ScratchBlocks == "undefined") {
        return; // Backup for if the extension exports with the project
    }

    var isCancled = false;

    var compatability = [
        ["turbowarp.org", "mirror.turbowarp.xyz", "robo-code.pages.dev"],
        ["studio.penguinmod.com"],
        ["alpha.unsandboxed.org"],
        ["librekitten.org"]
    ];

    var warnCompatableIssue = [
        "rc.40code.com",
        "xplab.vercel.app",
        "electramod.vercel.app"
    ];

    function isCompatible(str1, str2) {
        return str1 == str2 || compatability.some(arr => arr.includes(str1) && arr.includes(str2));
    }

    var editing = {};

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

	function getColorFromID(id, brightness = 80) {
		var hue = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
		var hexColor = `hsl(${(hue + 130) % 360}, 50%, ${brightness}%)`;
		return hexColor;
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
		// https links
		str = str.replace(/(:\/\/)([^ \n]+)/g, '<a href="https://$2" target="_blank">://$2</a>');
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

    function MakeWidget(html, pageTitle, width, height) {
        getTheme();

        const overlay = document.createElement('div');
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
        wrapper.style.width = width || '70vw';
        wrapper.style.height = height || '80vh';
        
        const modal = document.createElement('div');
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
        title.id = "WidgetTitle";
        title.innerHTML = pageTitle || "Widget";
        
        const widgetframe = document.createElement('div');
        widgetframe.style.width = '100%';
        widgetframe.style.height = `calc(100% - 50px)`;
        widgetframe.style.marginTop = '50px';
        widgetframe.style.border = 'none'; 
        widgetframe.id = "Widgetframe";
        widgetframe.name = 'Widgetframe';
        widgetframe.style.borderBottomLeftRadius = '10px';
        widgetframe.style.borderBottomRightRadius = '10px';     
        widgetframe.style.backgroundColor = theme=="light"?"white":"black";   
        widgetframe.innerHTML = html;
        modal.appendChild(widgetframe);

        const closeButton = document.createElement('div');
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.classList.add('close-button_close-button_lOp2G', 'close-button_large_2oadS');
        closeButton.setAttribute('role', 'button');
        closeButton.setAttribute('tabindex', '0');
        closeButton.innerHTML = '<img class="close-button_close-icon_HBCuO" src="data:image/svg+xml,%3Csvg%20data-name%3D%22Layer%201%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%207.48%207.48%22%3E%3Cpath%20d%3D%22M3.74%206.48V1M1%203.74h5.48%22%20style%3D%22fill%3Anone%3Bstroke%3A%23fff%3Bstroke-linecap%3Around%3Bstroke-linejoin%3Around%3Bstroke-width%3A2px%22%2F%3E%3C%2Fsvg%3E">';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '50%';
        closeButton.style.right = '10px';
        closeButton.id = "WidgetCloseButton"
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

        return [overlay, widgetframe, title, () => document.getElementById("widgetoverlay"), closeButton];
    }

// yeetyourfiles.lol is not a temperary file hosting site, so it's best not to use if for temperary files
    async function YeetFile(BLOB, tmp) {
        if (typeof BLOB.then === 'function') {
            BLOB = await BLOB;
        }

        if ((tmp || !canYeetFile) && canTMPfile) {
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('time', '1h');
            formData.append('fileToUpload', BLOB);

            const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const url = await response.text();
            return url.trim();
        } else {
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
    }

    async function canYeet() {
        try {
            const response = await fetch("https://yeetyourfiles.lol", {
                method: "HEAD",
            });
            return response.ok && !window.location.hostname.includes('archive.org');
            // archive.org is an archival site, and doesn't work with file uploads
        } catch (error) {
            return false;
        }
    }

    async function canTMP() {
        try {
            const response = await fetch("https://litterbox.catbox.moe", {
                method: "HEAD",
            });
            return response.ok && !window.location.hostname.includes('archive.org');
            // archive.org is an archival site, and doesn't work with file uploads
        } catch (error) {
            return false;
        }
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

        // Small files get sent through MQTT, large files go to a tmp file server
        if (blob.size < 1024 * 1024 * 1024) {
            return blobToBase64(blob);
        } else {
            return YeetFile(blob, true);
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
        alertDiv.style.backgroundColor = accent;
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

    function findSpriteVisual(name) {
        const container = document.querySelector("#app > div > div > div > div.gui_body-wrapper_-N0sA.box_box_2jjDp > div > div.gui_stage-and-target-wrapper_69KBf.box_box_2jjDp > div.gui_target-wrapper_36Gbz.box_box_2jjDp > div > div.sprite-selector_sprite-selector_2KgCX.box_box_2jjDp > div.sprite-selector_scroll-wrapper_3NNnc.box_box_2jjDp > div");
        if (!container) return null;

        const elements = container.querySelectorAll('*');
        for (const element of elements) {
            if (element.textContent.trim() === name) {
                return element.parentElement;
            }
        }
        return null;
    }

    var pgeurl = new URL(window.location.href);
    var pgeparams = pgeurl.searchParams;
    var serverid = false;
    if (pgeparams.has("project_url")) {
        serverid = pgeparams.get("project_url");
    }

    function click(elm) {
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });

        elm.dispatchEvent(mouseDownEvent);
        elm.dispatchEvent(mouseUpEvent);
        elm.click();
    }

    async function promptUsername() {
        const editButton = Array.from(document.querySelectorAll('div.menu-bar_menu-bar-item_oLDa-.menu-bar_hoverable_c6WFB'))
            .find(el => el.textContent.trim() === "Edit");

        async function waitForInputDisappear(inputField) {
            while (inputField && inputField.offsetParent !== null) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
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

    var canTMPfile = false;
    var promiscantmp = canTMP();
    promiscantmp.then(can => canTMPfile = can);

    var canYeetFile = canYeet().then(can => canYeetFile = can);
    canYeetFile.then(async (can) => {
        async function setCanYeet() {
            canYeetFile = await canYeet();
            canTMPfile = await canTMP();
            if (!canYeetFile && !canTMPfile) {
                setTimeout(setCanYeet, 20000);
            } else {
                showalert("File server is back online", 5000, false);
            }
        }
        if (!can && serverid) {
            if (!await promiscantmp) {
                showalert("Unable to upload connect to large file server, sprite commits van only be under 1mb", 5000, false);
                setTimeout(setCanYeet, 10000);
            }
        }
    });

    if (serverid && /^player\d+$/.test(Scratch.vm.runtime.ioDevices.userData._username)) {
        try {
            await promptUsername();
        } catch(e) {}
    } if (serverid) {
        if (warnCompatableIssue.includes(window.location.host)) {
            MakeWidget(`
                <div style="position: absolute; top: 50px; left: 0px; right: 0px; bottom: 0px; padding:20px; text-align: center; background: linear-gradient(135deg,rgba(255, 145, 0, 0.14) 0%,rgba(0, 0, 0, 0) 100%); border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                    <p style="margin: 0; font-size: 18px;">
                        ${window.location.host} has been known to have issues with BlockLink
                    </p> <p style="margin: 10px 0 0 0; font-size: 16px;">
                        This site has been tested and confermed to have issues that may cause visual inconsistencies, missing elements, and or problems that cause BlockLink to not function correctly.
                    </p>
                </div>
            `, "Compatability Error", "550px", "205px");
        }
    }

    var canmanual = true;
    document.addEventListener("keydown", async function(event) {
        if (isCancled) return;

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
				window.JoinColabServer();
			}
        }
    });

    setTimeout(function() {
        if (serverid && !window.Paho) {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js';
            script.onload = function() {
                showalert("Conencting to broker...", 2000, false);
                start();
            };
            document.head.appendChild(script);
        } else if (serverid) {
            showalert("Conencting to broker...", 2000, false);
            start();
        }
    }, 1000);

    const mqttBroker = "wss://test.mosquitto.org:8081/mqtt";
    var clientId = Scratch.vm.runtime.ioDevices.userData._username
	clientId = clientId || "Scratcher-" + Math.random().toString(16).substr(2, 8);
    var client;

    var firstTimeConnect = true;
    function onConnect() {
        console.log("Connected to MQTT broker");

        client.onMessageArrived = gotMessage;
        client.subscribe("commit" + serverid);
		client.subscribe("chat" + serverid);
        client.subscribe("usrtrack" + serverid);
        client.subscribe("joined" + serverid);
        client.subscribe("scratchVersion" + serverid);
        client.subscribe("delete" + serverid);
        client.subscribe("rename" + serverid);

        if (firstTimeConnect) {
            main();
            sendmsg("joined", clientId)
            showalert("Connected to broker", 2000, false);
        } else {
            showalert("Regained connection", 2000, false);
        }
    }

    function onFailure(err) {
        showalert("Connection lost", 10000, true);
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

    var incompatable = false;
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
                } else if (message.destinationName == "delete" + serverid) {
                    recivedDeleteCommand(message.payloadString);
                } else if (message.destinationName == "rename" + serverid) {
                    doSpriteRename(message.payloadString);
                }
            } else if (message.destinationName == "joined" + serverid) {
                if (clientId == message.payloadString) {
                    showToast(`Connected to server`, false);

                    // if (document.cookie.split('; ').some(cookie => cookie.startsWith('remove-sprite-confirm=') && (() => { try { return JSON.parse(decodeURIComponent(cookie.split('=')[1])).enabled === true; } catch { return false; } })())) {
                    //     showToast(`Please disable the "<a href="https://turbowarp.org/addons#confirmation">Sprite deletion confirmation</a>" addon.`, true);
                    // }
                } else {
                    showToast(`${message.payloadString} has joined the colab`, false);
                    if (!incompatable) sendmsg("scratchVersion", window.location.host);
                }
            } else if (message.destinationName == "scratchVersion" + serverid) {
                if (!isCompatible(window.location.host, message.payloadString) && !incompatable) {
                    incompatable = true;
                    MakeWidget(`
                        <div style="position: absolute; top: 50px; left: 0px; right: 0px; bottom: 0px; padding:20px; text-align: center; background: linear-gradient(135deg,rgba(255, 0, 13, 0.1) 0%,rgba(0, 0, 0, 0) 100%); border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                            <p style="margin: 0; font-size: 18px;">
                                This project is being hosted in ${message.payloadString} and may not be compatable with ${window.location.host}.
                            </p> <p style="margin: 10px 0 0 0; font-size: 16px;">
                                Please be cautious of project corruption when using multiple mods for a single project!
                            </p>
                        </div>
                    `, "Compatability Error", "500px", "202px");
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
    function doSpriteEventListeners() {
        document.querySelector("#app > div > div > div > div.gui_body-wrapper_-N0sA.box_box_2jjDp > div > div.gui_stage-and-target-wrapper_69KBf.box_box_2jjDp > div.gui_target-wrapper_36Gbz.box_box_2jjDp > div > div.sprite-selector_sprite-selector_2KgCX.box_box_2jjDp > div.sprite-selector_scroll-wrapper_3NNnc.box_box_2jjDp > div")
        ?.addEventListener("contextmenu", (event) => {
            setTimeout(()=>{
                if (document.querySelector(".react-contextmenu")) {
                    var deleteButton = document.querySelector("div.react-contextmenu-item.context-menu_menu-item_3cioN.context-menu_menu-item-bordered_29CJG.context-menu_menu-item-danger_1tJg0");
    
                    if (deleteButton) {
                        var clone = deleteButton.cloneNode(true);
                        deleteButton.parentNode.insertBefore(clone, deleteButton);
                        deleteButton.style.display = "none";
                        // deleteButton.remove();
                        clone.style.display = "block";
                        clone.id = "colabDeleteSpriteContextButton";
                        clone.innerText = "Delete for everyone";
                        clone.addEventListener('click', (e) => {
                            e.preventDefault();
                            var sprite = Array.from(deleteButton.parentElement.parentElement.getElementsByClassName("sprite-selector-item_sprite-name_1PXjh"));
                            sprite = sprite[0].innerText;
    
                            showalert(`Deleting ${sprite}`, 1000, false);
                            sendmsg("delete", JSON.stringify({
                                sprite: sprite,
                                from: clientId
                            }));
                        });
                    }
                }
            })
        }, 500);
    }
    doSpriteEventListeners();

    function main() {
        var prevtarget = Scratch.vm.runtime.getEditingTarget();

        setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            for (const user in editing) {
                if (editing[user].time < currentTime - 20) {
                    findSpriteVisual(editing[user].sprite).style = "";
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
            if (isCancled) return;

            var deleteButton = document.querySelector("div.sprite-selector_sprite-selector_2KgCX.box_box_2jjDp > div.sprite-selector_scroll-wrapper_3NNnc.box_box_2jjDp .delete-button_delete-button_2Nzko.sprite-selector-item_delete-button_1rkFW");
            if(deleteButton) deleteButton.style.display = "none";

            if (ignoreSwap) return;
            document.getElementById("colabDeleteSpriteButton")?.remove();
            // document.getElementById("colabDeleteSpriteContextButton")?.remove();
            ignoreSwap = true;
            setTimeout(()=>{
                ignoreSwap = false;
                let target = Scratch.vm.runtime.getEditingTarget(); // event.editingTarget

                var deleteButton = document.querySelector("div.sprite-selector_sprite-selector_2KgCX.box_box_2jjDp > div.sprite-selector_scroll-wrapper_3NNnc.box_box_2jjDp .delete-button_delete-button_2Nzko.sprite-selector-item_delete-button_1rkFW");

                if (deleteButton) {
                    const clone = deleteButton.cloneNode(true);
                    deleteButton.parentNode.insertBefore(clone, deleteButton);
                    deleteButton.style.display = "none";
                    clone.style.display = "block";
                    clone.id = "colabDeleteSpriteButton";
                    clone.addEventListener('click', (e) => {
                        e.preventDefault();
                        showalert(`Deleting ${target.getName()}`, 1000, false);
                        sendmsg("delete", JSON.stringify({
                            sprite: target.getName(),
                            from: clientId
                        }));
                    });
                }

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
                    if (edit && edit != clientId) {
                        showalert(`Warning: ${edit} is already editing "${target.getName()}"`, 2000);
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

    function recivedDeleteCommand(dat) {
        const parsedData = JSON.parse(dat);
        const {
            sprite,
            from
        } = parsedData;

        if (from == clientId) {
            // return;
        } else {
            if (Scratch.vm.runtime.getSpriteTargetByName(sprite)) {
                showalert(`Recived delete command for "${sprite}" from ${from}`, 1000, false);
            }
        }

        deleteSprite(sprite);
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
            if (editing[from]) findSpriteVisual(editing[from].sprite).style = "";
            findSpriteVisual(sprite).style.borderColor = getColorFromID(from, 50);

            editing[from] = {
                sprite: sprite,
                time: Math.floor(Date.now() / 1000)
            };
        }

        // if (dothing) {
        //     showToast(`${from} is now editing "${sprite}"`, false);
        // }
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
            showToast(`${from} has sent a message`, false);
		}
    }

    function doSpriteRename(dat) {
        const parsedData = JSON.parse(dat);
        const {
            sprite,
			name,
            from
        } = parsedData;

        Scratch.vm.runtime.getSpriteTargetByName(sprite).sprite.name = name;

        setTimeout(() => { // Force the sprite visuals to update
            Scratch.vm.runtime.getSpriteTargetByName(name).setCostume(Scratch.vm.runtime.getSpriteTargetByName(name).currentCostume)
        }, 200);
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

    chatInput.addEventListener('paste', async (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image')) {
                e.preventDefault();
                showToast("Uploading image to chat", false);
                const blob = item.getAsFile();
                const url = await YeetFile(blob, true);
                const modifiedUrl = url.replace(/^https:\/\//, `img:`);
                chatInput.value += modifiedUrl;
                e.preventDefault();
            }
        }
    });

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
    var intervalColors = setInterval(setColors, 5000);
	var intervalPos = setInterval(setPos, 100);
	setPos();

    window.JoinColabServer = async (id) => {
        if (id) {
            var match = id.match(/[?&]project_url=([^&#]+)/);
            if (match) id = decodeURIComponent(match[1]);

            showalert("Joining colab server: " + id, 5000);
            pgeparams.set("project_url", id);
            window.location.href = pgeurl;
        } else {
            showalert("Starting colab server", 5000);
            pgeparams.set("project_url", await YeetFile(await Scratch.vm.saveProjectSb3(), true));

            // await new Promise(resolve => setTimeout(resolve, 500));

            window.location.href = pgeurl;
        }
    };

    class P7BlockLink {
        constructor() {
            this.updateWorkspace = () => {
                if (isCancled) return;

                var divider = document.querySelector('.divider_divider_1_Adi.menu-bar_divider_2VFCm') ||
                document.querySelector("div.divider_divider_2uUWW.menu-bar_divider_2bLcv");

                var showIcon = document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div:nth-child(3) > img:nth-child(1)");
                if (showIcon) showIcon = getComputedStyle(showIcon).display != 'none';

                if (showIcon) {
                    divider = document.querySelector("#app > div > div > div > div.gui_menu-bar-position_3U1T0.menu-bar_menu-bar_JcuHF.box_box_2jjDp > div.menu-bar_main-menu_3wjWH > div.menu-bar_file-group_1_CHX > div:nth-child(3)") || divider;
                }

                if (!divider) {
                    setTimeout(this.updateWorkspace, 1000);
                }

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

                button.onclick = (event) => {
                    button.classList.add('menu-bar_active_2Lfqh');
                    this.displayMenu(this.getblocks(), button.offsetLeft, button.offsetTop + button.offsetHeight, button);
                };
 
                divider.parentNode.insertBefore(button, divider);

                doSpriteEventListeners();

                const interval = setInterval(() => {
                    if (!document.body.contains(button)) {
                        clearInterval(interval);
                        this.updateWorkspace();
                    }
                }, 1000);
            }
            this.updateWorkspace();

            setInterval(()=>{
                var element = [...document.querySelectorAll('.scratchCategoryMenu > *')].find(el => el.innerText === 'BlockLink');
                if (element && (element.classList.contains("scratchCategoryMenuItem") || element.classList.contains("scratchCategoryMenuRow"))) {
                    element.style.display = "none";
                }

                var element = [...document.querySelectorAll('g.blocklyBlockCanvas text.blocklyFlyoutLabelText')].find(el => el.textContent === 'BlockLink');
                if (element) {
                    element.style.display = "none";
                }
            }, 1000);
        }

        getInfo() {
            return {
                id: 'P7BlockLink',
                name: 'BlockLink',
                blocks: [],
            };
        }

        getblocks() {
            return {
                blocks: [
                    {
                        func: "inviteColab",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: !serverid,
                        text: "Invite to colab"
                    },

                    {
                        func: "leaveColab",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: !serverid,
                        text: "Leave colab"
                    },
                    {
                        func: "createColab",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: serverid || (!canYeetFile && !canTMPfile),
                        text: "Create a colab"
                    },
                    {
                        func: "joinColab",
                        blockType: Scratch.BlockType.BUTTON,
                        text: serverid?"Join another colab":"Join a colab"
                    },

                    {
                        blockType: "spacer",
                        hideFromPalette: !serverid || !canmanual || document.querySelector("#app > div > div.interface_menu_3K-Q2 > div > div.menu-bar_main-menu_3wjWH")
                    },

                    {
                        func: "commitSprite",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: !serverid || !canmanual || document.querySelector("#app > div > div.interface_menu_3K-Q2 > div > div.menu-bar_main-menu_3wjWH"),
                        text: "Save and commit"
                    },
                    {
                        func: "renameSprite",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: !serverid || !canmanual || Scratch.vm.runtime.getEditingTarget().isStage || document.querySelector("#app > div > div.interface_menu_3K-Q2 > div > div.menu-bar_main-menu_3wjWH"),
                        text: "Rename and commit"
                    },
                    {
                        func: "deleteSprite",
                        blockType: Scratch.BlockType.BUTTON,
                        hideFromPalette: !serverid || !canmanual || Scratch.vm.runtime.getEditingTarget().isStage || document.querySelector("#app > div > div.interface_menu_3K-Q2 > div > div.menu-bar_main-menu_3wjWH"),
                        text: "Delete and commit"
                    },
                ],
            };
        }

        inviteColab() {
            if (navigator.share) {
                navigator.share({
                    title: 'BlockLive Colab',
                    url: window.location.href
                })
                .then(() => console.log('Successfully shared'))
                .catch((error) => console.error('Error sharing:', error));
            } else {
            console.log('Web Share API not supported.');
            }
        }

        commitSprite() {
            if (canmanual) {
                canmanual = false;
                commit(Scratch.vm.runtime.getEditingTarget());
                setTimeout(() => {
                    canmanual = true;
                    Scratch.vm.extensionManager.refreshBlocks();
                }, 500);
            }
        }

        async renameSprite() {
            if (Scratch.vm.runtime.getEditingTarget().isStage) {
                showalert("Unable to rename the stage.", 2000);
            } else {
                MakeWidget(`
                    <div class="username-modal_body_UaL6e box_box_2jjDp" style="border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding-bottom: 25px;">
                        <div class="box_box_2jjDp" style="width: calc(100% - 30px)"><input id="ColabRenameInput" class="username-modal_text-input_3z1ni" spellcheck="false" autocomplete="off" value="${htmlsafe(Scratch.vm.runtime.getEditingTarget().sprite.name)}"></div>
                        <p class="username-modal_help-text_3dN2-"><span>
                            Enter a new name for ${htmlsafe(Scratch.vm.runtime.getEditingTarget().sprite.name)}
                        </span></p>

                        <div class="username-modal_button-row_2amuh box_box_2jjDp">
                            <button style="display:none;" class="username-modal_cancel-button_3bs7j"><span>Leave server</span></button>
                            <button class="username-modal_cancel-button_3bs7j" onclick="window.resolve8501435(false); document.getElementById('widgetoverlay').remove()"><span>Cancel</span></button>
                            <button class="username-modal_ok-button_UEZfz" onclick="window.resolve8501435(document.getElementById('ColabRenameInput').value); document.getElementById('widgetoverlay').remove()"><span>Rename sprite</span></button>
                        </div>
                    </div>
                `, "Rename sprite", "600px", "251px");

                window.resolve8501435;
                var newName = new Promise((res, rej) => {
                    window.resolve8501435 = res;
                });

                newName = await newName;
                if (!newName) return;

                sendmsg("rename", JSON.stringify({
                    sprite: Scratch.vm.runtime.getEditingTarget().getName(),
                    name: newName,
                    from: clientId
                }));
            }
        }

        deleteSprite() {
            if (Scratch.vm.runtime.getEditingTarget().isStage) {
                showalert("Unable to delete the stage.", 2000);
            } else {
                sendmsg("delete", JSON.stringify({
                    sprite: Scratch.vm.runtime.getEditingTarget().getName(),
                    from: clientId
                }));
            }
        }

        async createColab() {
            JoinColabServer();
        }

        async joinColab() {
            // JoinColabServer(window.prompt("Select server to join (blank to start new server)"));
            MakeWidget(`
                <div class="username-modal_body_UaL6e box_box_2jjDp" style="border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding-bottom: 25px;">
                    <div class="box_box_2jjDp" style="width: calc(100% - 30px)"><input id="ColabServerInput" class="username-modal_text-input_3z1ni" spellcheck="false" autocomplete="off"></div>
                    <p class="username-modal_help-text_3dN2-"><span>
                        Enter a project url to join an existing colab server.
                    </span></p>

                    <div class="username-modal_button-row_2amuh box_box_2jjDp">
                        <button style="display:none;" class="username-modal_cancel-button_3bs7j"><span>Leave server</span></button>
                        <button class="username-modal_cancel-button_3bs7j" onclick="document.getElementById('widgetoverlay').remove()"><span>Cancel</span></button>
                        <button class="username-modal_ok-button_UEZfz" onclick="window.JoinColabServer(document.getElementById('ColabServerInput').value); document.getElementById('widgetoverlay').remove()"><span>Join server</span></button>
                    </div>
                </div>
            `, "Server select", "600px", "251px");
        }

        leaveColab() {
            try {
                var url = new URL(window.location);
                url.searchParams.delete('project_url');
                url = url.searchParams.toString() ? url.toString() : url.origin + url.pathname;
                window.history.pushState({}, document.title, url);

                chatToggle.remove();
                chatContainer.style.display = "none";

                window.clearInterval(intervalPos);
                window.clearInterval(intervalColors)

                isCancled = true;
                serverid = false;
                client.disconnect();

                try {
                    Scratch.vm.extensionManager.removeExtension("P7scratchcommits");
                } catch(e) {}
            } catch(e) {
                console.error(e);
                pgeparams.delete("project_url");
                window.location.href = pgeurl;
            }
        }

        displayMenu = (menuJson, xCoordinate = window.innerWidth / 2, yCoordinate = window.innerHeight / 2, button) => {
            const menuContainerElement = document.createElement('div');
            menuContainerElement.style.top = `${yCoordinate}px`;
            menuContainerElement.style.left = `${xCoordinate}px`;
            menuContainerElement.style.display = 'block';
            menuContainerElement.style.direction = 'ltr';
            menuContainerElement.style.position = 'fixed';
            menuContainerElement.style.zIndex = '9999';

            const menuListElement = document.createElement('ul');
            menuListElement.className = 'menu_menu_3k7QT menu_right_3PQ4S';
            let itemCount = 0;

            menuJson.blocks.forEach((menuBlock, blockIndex) => {
                if (menuBlock.hideFromPalette) return;

                const menuItemElement = document.createElement('li');
                menuItemElement.className = 'menu_menu-item_3EwYA menu_hoverable_3u9dt';
                menuItemElement.id = `:${blockIndex}`;
                menuItemElement.style.color = "white";
                menuItemElement.style.userSelect = 'none';
                menuItemElement.style.overflow = "none";

                const optionDivElement = document.createElement('div');
                optionDivElement.className = 'settings-menu_option_3rMur';
                const submenuLabelElement = document.createElement('span');
                submenuLabelElement.className = 'settings-menu_submenu-label_r-gA3';

                const labelSpanElement = document.createElement('span');
                labelSpanElement.textContent = menuBlock.text;

                submenuLabelElement.appendChild(labelSpanElement);
                optionDivElement.appendChild(submenuLabelElement);
                menuItemElement.appendChild(optionDivElement);

                if (menuBlock.blockType === Scratch.BlockType.LABEL) {
                    menuItemElement.style.fontWeight = 'bold';
                    // menuItemElement.style.borderBottom = '1px solid rgba(110, 110, 110, 0.3)';
                } else if (menuBlock.blockType === Scratch.BlockType.BUTTON) {
                    menuItemElement.onclick = () => {
                        if (typeof this[menuBlock.func] === 'function') {
                            this[menuBlock.func]();
                        }
                        closeMenu();
                    };
                    menuItemElement.onmouseover = () => {
                        // menuItemElement.style.backgroundColor = 'var(--shadow-default, rgba(110, 110, 110, 0.2))';
                        menuItemElement.classList.add('menu_expanded_1-Ozh');
                    };
                    menuItemElement.onmouseout = () => {
                        // menuItemElement.style.backgroundColor = '';
                        menuItemElement.classList.remove('menu_expanded_1-Ozh')
                    };
                } else {
                    menuItemElement.style.height = "1px";
                    menuItemElement.style.marginBottom = "1px";
                    menuItemElement.classList.add('menu_expanded_1-Ozh')
                    itemCount--;
                    itemCount += "0.1";
                    // menuItemElement.style.borderBottom = '1px solid rgba(110, 110, 110, 0.2)';
                }
                menuListElement.appendChild(menuItemElement);
                itemCount++;
            });

            const maxMenuHeight = 400;
            const itemHeight = 40;

            menuContainerElement.style.height = `${Math.min(itemCount * itemHeight, maxMenuHeight)}px`;
            menuContainerElement.appendChild(menuListElement);
            document.body.appendChild(menuContainerElement);

            const clickOutsideListener = (clickEvent) => {
                if (!menuContainerElement.contains(clickEvent.target)) {
                    closeMenu();
                }
            };

            const closeMenu = () => {
                if (!menuContainerElement || !menuContainerElement.parentElement) return;
                document.body.removeChild(menuContainerElement);
                document.removeEventListener('click', clickOutsideListener);
                if (button) button.classList.remove('menu-bar_active_2Lfqh');
            };

            setTimeout(() => {
                document.addEventListener('click', clickOutsideListener);
            }, 500);
        };
    }
    Scratch.extensions.register(new P7BlockLink());
})(Scratch);
