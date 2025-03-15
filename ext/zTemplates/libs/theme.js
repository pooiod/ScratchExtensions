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
