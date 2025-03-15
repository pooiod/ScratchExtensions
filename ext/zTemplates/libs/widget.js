
function MakeWidget(html, pageTitle, width, height) {
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
    widgetframe.style.backgroundColor = 'var(--ui-primary, white)';   
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

var allow = false;
var [_, _, _, _, closeButton] = MakeWidget(`<div class="security-manager-modal_body_Pn7qy box_box_2jjDp">
    <div>
        <p><span>
            This project is is requesting access to your screen. Do you wish to allow this action?
        </span></p>
        <div class="load-extension_unsandboxed-warning_2iFhK"><span>
            If you say yes, your choice will be remembered until the project asks for camera access, or a new project is loaded.
        </span></div>
    </div>
    <div class="security-manager-modal_buttons_1LSKA box_box_2jjDp">
        <button class="security-manager-modal_deny-button_3Vd-R" onclick='document.getElementById("widgetoverlay").remove();'><span>Deny</span></button>
        <button class="security-manager-modal_allow-button_3tcXk" onclick='allow = true; document.getElementById("widgetoverlay").remove();'><span>Allow</span></button>
    </div>
</div>`, "Extension Security", "500px", "500px");
closeButton.remove();

// var [overlay, widget] = MakeWidget(`This project is is requesting access to your screen. Do you wish to allow this action?`, "Extension Security", "500px", "500px");
