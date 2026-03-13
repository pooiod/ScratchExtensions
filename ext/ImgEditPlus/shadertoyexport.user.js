// ==UserScript==
// @name         ShaderToy IEplus export
// @namespace    http://tampermonkey.net/
// @version      2026-03-13
// @description  Adds buttons for ShaderToy to export shaders for the Image Editing Plus Scratch extension
// @author       pooiod7
// @match        https://www.shadertoy.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shadertoy.com
// @grant        none
// ==/UserScript==

(async function() {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isViewPage = window.location.pathname.includes('/view/');
    const isResultsPage = window.location.pathname.includes('/results') || window.location.pathname.includes('/browse');

    if (isViewPage) {
        const header = document.getElementById('headerBlock2');
        if (!header) return;

        const darkBg = "#2a2a2a";
        const border = "1px solid #444";
        const btnStyle = `background:${darkBg}; color:#ccc; border:${border}; padding:5px 12px; cursor:pointer; font-size:12px; border-radius:3px; margin-top:5px; margin-right:5px;`;

        const showModal = (content, title, isImport) => {
            const overlay = document.createElement('div');
            overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;";
            overlay.innerHTML = `<div style="background:#1e1e1e;padding:20px;width:500px;border:${border};color:#ddd;border-radius:4px;"><h3 style="margin:0 0 10px 0;font-size:14px;color:#fff;">${title}</h3><textarea id="ioText" style="width:100%;height:150px;background:#111;color:#eee;border:${border};font-family:monospace;padding:8px;box-sizing:border-box;">${content}</textarea><div style="margin-top:15px;text-align:right;"><button id="closeBtn" style="${btnStyle.replace('margin-top:5px;', '')}">Close</button>${isImport ? `<button id="actBtn" style="${btnStyle.replace('margin-top:5px;', '')} background:#3a3a3a;border-color:#666;">Overwrite Editor</button>` : ""}</div></div>`;
            document.body.appendChild(overlay);
            const textarea = document.getElementById('ioText');
            textarea.select();
            document.getElementById('closeBtn').onclick = () => overlay.remove();
            if (isImport) {
                document.getElementById('actBtn').onclick = () => {
                    const editor = document.querySelector('.CodeMirror')?.CodeMirror;
                    if (editor) {
                        editor.setValue(textarea.value.replace(/\|/g, '\n'));
                        overlay.remove();
                    }
                };
            }
        };

        const container = document.createElement('div');
        container.style = "display:inline-block; position:relative;";
        const trigger = document.createElement('button');
        trigger.innerText = "IEplus Tools ▾";
        trigger.style = btnStyle;
        const menu = document.createElement('div');
        menu.style = `position:absolute; top:100%; left:0; background:${darkBg}; border:${border}; display:none; flex-direction:column; min-width:180px; z-index:1000; margin-top:2px; border-radius:3px;`;
        
        const mItem = (text, onClick) => {
            const el = document.createElement('div');
            el.innerText = text;
            el.style = "padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #333;";
            el.onmouseover = (e) => e.target.style.background = "#353535";
            el.onmouseout = (e) => e.target.style.background = "transparent";
            el.onclick = () => { menu.style.display = 'none'; onClick(); };
            return el;
        };

        menu.appendChild(mItem("Export for ImageEditingPlus", () => {
            const editor = document.querySelector('.CodeMirror')?.CodeMirror;
            const code = editor ? editor.getValue() : "";
            showModal(code.replace(/\n/g, '|'), "Export Code (| format)", false);
        }));
        
        menu.appendChild(mItem("Import from | format", () => {
            const editor = document.querySelector('.CodeMirror')?.CodeMirror;
            const code = editor ? editor.getValue() : "";
            showModal(code.replace(/\n/g, '|'), "Paste Code (| format)", true);
        }));

        trigger.onclick = () => menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        container.appendChild(trigger);
        container.appendChild(menu);
        header.prepend(container);
    } else if (isResultsPage) {
        const results = document.querySelectorAll('.searchResult');
        results.forEach(async (resEl) => {
            const link = resEl.querySelector('a')?.getAttribute('href');
            if (!link || !link.includes('/view/')) return;
            const shaderId = link.split('/').pop();
            const response = await fetch("/shadertoy", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `s=%7B%20%22shaders%22%20%3A%20%5B%22${shaderId}%22%5D%20%7D&nt=1&nl=1&np=1`
            });
            const data = await response.json();
            const pass = data[0]?.renderpass?.[0];
            const isCompatible = data[0]?.renderpass?.length === 1 && pass?.inputs?.length === 1 && pass?.inputs[0]?.channel === 0;

            if (isCompatible) {
                const container = resEl.querySelector('.searchResultContainer');
                if (container) {
                    container.style.position = 'relative';
                    const btn = document.createElement('button');
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    btn.style = "position:absolute; bottom:5px; right:5px; background:rgba(0,0,0,0.6); color:white; border:1px solid #555; padding:4px; cursor:pointer; border-radius:3px; z-index:10; display:flex; align-items:center; justify-content:center;";
                    btn.onclick = (e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(pass.code.replace(/\n/g, '|'));
                        const notif = document.createElement('div');
                        notif.innerText = "Copied!";
                        notif.style = "position:fixed; bottom:20px; right:20px; background:#333; color:#fff; padding:10px 20px; border-radius:5px; z-index:99999; border:1px solid #555;";
                        document.body.appendChild(notif);
                        setTimeout(() => notif.remove(), 2000);
                    };
                    container.appendChild(btn);
                }
            }
        });
    }
})();
