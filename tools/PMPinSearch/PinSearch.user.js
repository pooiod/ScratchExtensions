// ==UserScript==
// @name         PenguinMod custom extension search
// @namespace    https://studio.penguinmod.com
// @version      2025-12-01
// @description  Lets you search through the custom extensions you add.
// @author       pooiod7
// @match        https://studio.penguinmod.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=penguinmod.com
// @grant        none
// ==/UserScript==

(function() {
    const s = {
        in: "body > div.ReactModalPortal > div > div > div > div.library_library-content-wrapper_1FTPT > div.library_library-filter-bar_1xjYC > div:nth-child(2) > div.library_filter-bar-item_99aoX.library_filter_2k-oj.filter_filter_1JFal > input",
        cb: "body > div.ReactModalPortal > div > div > div > div.library_library-content-wrapper_1FTPT > div.library_library-filter-bar_1xjYC > div:nth-child(3)",
        it: ".library-item_library-item_1DcMO.library-item_featured-item_3V2-t.library-item_library-item-extension_3xus9",
        del: ".library-item_library-item-delete_20s4z"
    };

    const ALTS = {
        "PenguinMod": ["Penguin"],
        "TurboWarp": ["Turbo"],
        "Extension Creators": ["Extension Creator"],
        "Category Expansions": ["Plus", "+"],
        "Scratch": ["1010101100101100011010100010101011100100111000101110001010101001010"], 
        "Data Management": ["Data", "AI", "File", "JSON", "Array", "Text", "XML", "CSV"]
    };

    function run() {
        const input = document.querySelector(s.in);
        const checks = document.querySelector(s.cb);
        const items = document.querySelectorAll(s.it);

        if (!input || !checks) return;

        const txtVal = input.value.trim().toLowerCase();

        let tags = [];
        checks.querySelectorAll('input[type="checkbox"]').forEach(c => {
            if (c.checked && c.parentElement) {
                const label = c.parentElement.textContent.trim();
                if (ALTS.hasOwnProperty(label)) {
                    tags.push(...ALTS[label]);
                } else {
                    tags.push(label);
                }
            }
        });

        console.log(txtVal, tags);

        items.forEach(i => {
            const content = i.textContent.toLowerCase();

            const matchesText = !txtVal || content.includes(txtVal);

            let matchesTags = true;
            if (tags.length > 0) {
                matchesTags = tags.some(t => content.includes(t.toLowerCase()));
            }

            const isMatch = matchesText && matchesTags;

            const isTarget = i.querySelector(s.del) || content.includes("added from a website");

            if (isTarget) {
                i.style.display = isMatch ? 'block' : 'none';
            } else {
                i.style.display = 'block';
            }
            i.style.opacity = '1';
        });
    }

    setInterval(() => {
        const input = document.querySelector(s.in);
        const checks = document.querySelector(s.cb);

        if (input && checks) {
            if (input.getAttribute('data-init') !== '1') {
                input.addEventListener('input', run);
                checks.addEventListener('change', run);
                input.setAttribute('data-init', '1');
            }
            run();
        }
    }, 1000);
})();
