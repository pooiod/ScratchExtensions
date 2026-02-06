(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    if (typeof scaffolding !== "undefined") {
        return;
    }

    var vm = Scratch.vm;
    const JSZip = Scratch.vm.exports.JSZip;
    var loaded = false;
    setTimeout(() => {
        loaded = true;
    }, 500);

    const supercoolghthemecss = `
        :root {
            --gh-bg: #ffffff;
            --gh-text: #24292f;
            --gh-border: #d0d7de;
            --gh-overlay: rgba(140, 149, 159, 0.5);
            --gh-btn-bg: #f6f8fa;
            --gh-btn-hover: #f3f4f6;
            --gh-btn-border: rgba(27, 31, 36, 0.15);
            --gh-primary: #1f883d;
            --gh-primary-hover: #1a7f37;
            --gh-danger: #cf222e;
            --gh-blue: #0969da;
            --gh-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        @keyframes gh-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes gh-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
        @keyframes gh-slide { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .gh-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: var(--gh-overlay); z-index: 99999;
            display: flex; align-items: start; justify-content: center; padding-top: 100px;
            animation: gh-in 0.2s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }
        .gh-overlay.closing { animation: gh-out 0.15s forwards; }
        .gh-box {
            background: var(--gh-bg); width: 320px; max-width: 90vw;
            border-radius: 6px; box-shadow: 0 8px 24px rgba(140,149,159,0.2);
            font-family: var(--gh-font); border: 1px solid var(--gh-border);
            display: flex; flex-direction: column; overflow: hidden;
        }
        .gh-header {
            padding: 16px; background: #f6f8fa; border-bottom: 1px solid var(--gh-border);
            display: flex; align-items: center; gap: 8px;
        }
        .gh-title { font-size: 14px; font-weight: 600; color: var(--gh-text); margin: 0; }
        .gh-body { padding: 20px 16px; font-size: 14px; color: var(--gh-text); line-height: 1.5; }
        .gh-footer {
            padding: 16px; background: #f6f8fa; border-top: 1px solid var(--gh-border);
            display: flex; justify-content: flex-end; gap: 8px;
        }
        .gh-btn {
            padding: 5px 16px; font-size: 14px; font-weight: 500; border-radius: 6px;
            border: 1px solid var(--gh-btn-border); background: var(--gh-btn-bg);
            color: var(--gh-text); cursor: pointer; transition: 0.2s;
        }
        .gh-btn:hover { background: var(--gh-btn-hover); }
        .gh-primary { background: var(--gh-primary); color: white; border-color: rgba(27,31,36,0.15); }
        .gh-primary:hover { background: var(--gh-primary-hover); }
        .gh-danger { color: var(--gh-danger); }
        .gh-danger:hover { background: #ffebe9; }
        .gh-input {
            width: 100%; padding: 5px 12px; margin-top: 8px; font-size: 14px;
            border: 1px solid var(--gh-border); border-radius: 6px; outline: none; box-sizing: border-box;
        }
        .gh-input:focus { border-color: var(--gh-blue); box-shadow: 0 0 0 2px rgba(9,105,218,0.3); }
        #gh-toast-area {
            position: fixed; bottom: 24px; left: 24px; z-index: 100000;
            display: flex; flex-direction: column; gap: 10px; pointer-events: none;
        }
        .gh-toast {
            pointer-events: auto; background: #24292f; color: white;
            padding: 12px 16px; border-radius: 6px; font-size: 14px; font-family: var(--gh-font);
            animation: gh-slide 0.3s cubic-bezier(0.33, 1, 0.68, 1) forwards;
            box-shadow: 0 3px 6px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px;
        }
        .gh-toast.closing { animation: gh-out 0.15s forwards; }
        .gh-icon { width: 16px; height: 16px; flex-shrink: 0; }
        #gh-ui-test {
            position: fixed; bottom: 20px; right: 20px; background: white;
            padding: 10px; border: 1px solid #ddd; border-radius: 6px;
            display: flex; flex-direction: column; gap: 5px; font-family: sans-serif; z-index: 99999;
        }
    `;
    const s924 = document.createElement('style');
    s924.textContent = supercoolghthemecss;
    document.head.appendChild(s924);

    const toastContainer = document.createElement('div');
    toastContainer.id = 'gh-toast-area';
    document.body.appendChild(toastContainer);

    // icons from svgviewer.dev
    const icons = {
        info: `<svg class="gh-icon" style="fill:var(--gh-blue)" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75zM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>`,
        error: `<svg class="gh-icon" style="fill:var(--gh-danger)" viewBox="0 0 24 24"><path d="M8,19a3,3,0,0,1-3-3V8A3,3,0,0,1,8,5,1,1,0,0,0,8,3,5,5,0,0,0,3,8v8a5,5,0,0,0,5,5,1,1,0,0,0,0-2Zm7.71-3.29a1,1,0,0,0,0-1.42L13.41,12l2.3-2.29a1,1,0,0,0-1.42-1.42L12,10.59,9.71,8.29A1,1,0,0,0,8.29,9.71L10.59,12l-2.3,2.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l2.29,2.3a1,1,0,0,0,1.42,0ZM16,3a1,1,0,0,0,0,2,3,3,0,0,1,3,3v8a3,3,0,0,1-3,3,1,1,0,0,0,0,2,5,5,0,0,0,5-5V8A5,5,0,0,0,16,3Z"/></svg>`
    };

    function close(el, cb, val) {
        el.classList.add('closing');
        el.addEventListener('animationend', () => { el.remove(); if(cb) cb(val); });
    }

    function modal(title, body, btns, iconHtml) {
        const ov = document.createElement('div');
        ov.className = 'gh-overlay';
        const box = document.createElement('div');
        box.className = 'gh-box';
        
        const head = document.createElement('div');
        head.className = 'gh-header';
        if(iconHtml) head.innerHTML += iconHtml;
        const h3 = document.createElement('h3');
        h3.className = 'gh-title';
        h3.textContent = title;
        head.appendChild(h3);

        const b = document.createElement('div');
        b.className = 'gh-body';
        if(typeof body === 'string') b.textContent = body;
        else b.appendChild(body);

        const foot = document.createElement('div');
        foot.className = 'gh-footer';
        
        btns.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'gh-btn ' + (c.cls||'');
            btn.textContent = c.txt;
            btn.onclick = () => c.fn(ov);
            foot.appendChild(btn);
        });

        box.append(head, b, foot);
        ov.appendChild(box);
        document.body.appendChild(ov);
        return { ov, box };
    }

    alert = function(text, type = 'info') {
        if(type === 'notif') {
            const t = document.createElement('div');
            t.className = 'gh-toast';
            t.textContent = text;
            toastContainer.appendChild(t);
            setTimeout(() => close(t), 3000);
            return;
        }
        const ico = type === 'error' ? icons.error : icons.info;
        const tit = type === 'error' ? 'Error' : 'Information';
        const { box } = modal(tit, text, [{ txt: 'OK', cls: 'gh-primary', fn: (ov) => close(ov) }], ico);
        box.querySelector('.gh-btn').focus();
    };

    confirm = function(text, yes = 'Yes', no = 'No') {
        return new Promise(r => {
            const { box } = modal('Confirm', text, [
                { txt: no, fn: (ov) => close(ov, r, false) },
                { txt: yes, cls: 'gh-primary', fn: (ov) => close(ov, r, true) }
            ], icons.info);
            box.querySelector('.gh-primary').focus();
        });
    };

    prompt = function(text, def = '') {
        return new Promise(r => {
            const div = document.createElement('div');
            div.textContent = text;
            const inp = document.createElement('input');
            inp.className = 'gh-input';
            inp.value = def;
            div.appendChild(inp);
            
            const sub = (ov) => close(ov, r, inp.value);
            const { box, ov } = modal('Input', div, [
                { txt: 'Cancel', fn: (ov) => close(ov, r, null) },
                { txt: 'OK', cls: 'gh-primary', fn: sub }
            ], icons.info);

            inp.onkeydown = e => {
                if(e.key === 'Enter') sub(ov);
                if(e.key === 'Escape') close(ov, r, null);
            };
            setTimeout(() => { inp.focus(); inp.select(); }, 50);
        });
    };

    function deleteSprite(SPRITE) {
        const target = Scratch.vm.runtime.getSpriteTargetByName(SPRITE);
        if (!target || target.isStage) {
            return;
        }
        vm.deleteSprite(target.id);
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

    async function importSprite(URL, callback) {
        fetch(URL)
            .then((r) => r.arrayBuffer())
            .then((buffer) => Scratch.vm.addSprite(buffer))
            .then(() => {
                if (callback) callback();
            })
            .catch((error) => {
                console.log("Error importing sprite:", error);
            });
    }

    async function exportSprite(SPRITE) {
        const target = Scratch.vm.runtime.getSpriteTargetByName(SPRITE);
        if (!target) {
            console.error("Sprite not found:", SPRITE);
            return null;
        }
        const spriteExport = await Scratch.vm.exportSprite(target.id);
        return await blobToBase64(spriteExport);
    }

    async function removeNonBackgroundSprites(zipBlob) {
        const zip = await JSZip.loadAsync(zipBlob);
        const projectJsonFile = zip.file('project.json');
        if (!projectJsonFile) {
            throw new Error('project.json not found in the zip file');
        }
        const projectJson = JSON.parse(await projectJsonFile.async('string'));

        const background = projectJson.targets.find(target => target.isStage);
        const spritesToRemove = projectJson.targets.filter(target => !target.isStage);

        const assetsToRemove = new Set();
        spritesToRemove.forEach(sprite => {
            (sprite.costumes || []).forEach(costume => {
                assetsToRemove.add(costume.assetId);
            });
            (sprite.sounds || []).forEach(sound => {
                assetsToRemove.add(sound.assetId);
            });
        });

        projectJson.targets = [background];

        zip.file('project.json', JSON.stringify(projectJson));

        zip.forEach((relativePath, file) => {
            const assetId = file.name.split('.')[0];
            if (assetsToRemove.has(assetId)) {
                zip.remove(file.name);
            }
        });

        return await zip.generateAsync({ type: 'blob' });
    }

    if (location.href.includes("project_url=") && location.href.includes("raw.githubusercontent.com") && location.href.includes("/index.project")) {
        const repo = location.href.split("raw.githubusercontent.com/")[1].split("/")[0] + "/" + location.href.split("raw.githubusercontent.com/")[1].split("/")[1];

        const apiKey = ('; ' + document.cookie).split('; github_api_key=').pop().split(';')[0];
        const headers = apiKey ? { 'Authorization': `token ${apiKey}` } : {};

        fetch(`https://api.github.com/repos/${repo}/contents/`, { headers: headers })
            .then(res => {
                if (!res.ok) {
                    console.error(`GitKit: Failed to fetch repository contents. Status: ${res.status}`);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data && data.length) {
                    const sprites = data.filter(file => file.name.endsWith(".sprite")).map(file => file.name);
                    if (sprites.length) {
                        let i = 0;
                        function next() {
                            if (i < sprites.length) {
                                importSprite(`https://raw.githubusercontent.com/${repo}/main/${sprites[i]}`, () => {
                                    i++;
                                    next();
                                });
                            }
                        }
                        next();
                    }
                }
            })
            .catch(error => {
                console.error("GitKit: Error loading sprites from repository.", error);
            });
    }

    class GitKit {
        constructor() {
            this.packaged = Scratch.vm.runtime.isPackaged || typeof scaffolding !== "undefined";
            this.lastCommitSha = null;
            this.commitCheckInterval = null;
            this.repo = null;
            this.apiKey = null;
            this.init();
        }

        init() {
            if (location.href.includes("raw.githubusercontent.com")) {
                this.repo = location.href.split("raw.githubusercontent.com/")[1].split("/")[0] + "/" + location.href.split("raw.githubusercontent.com/")[1].split("/")[1];
                this.apiKey = ('; ' + document.cookie).split(`; github_api_key=`).pop().split(';')[0];

                if (this.apiKey && this.repo) {
                    this.startCommitChecker();
                } else if (!this.apiKey) {
                    console.warn("GitKit: GitHub API key not found. Auto-updater is disabled.");
                }
            }
        }

        getInfo() {
            return {
                id: 'P7GitKit',
                name: 'GitKit',
                blocks: this.getbuttons(),
            };
        }

        getbuttons() {
            var isstage = false;
            if (loaded) isstage = Scratch.vm.runtime.getEditingTarget().isStage;
            return [
                { func: "setKey", blockType: Scratch.BlockType.BUTTON, text: "Set api key" },
                { func: "loadFromRepo", blockType: Scratch.BlockType.BUTTON, text: "Connect to a repo" },
                { func: isstage ? "commitStage" : "commitSprite", blockType: Scratch.BlockType.BUTTON, text: "Save and commit" },
                { func: "deleteSpriteAndCommit", blockType: Scratch.BlockType.BUTTON, hideFromPalette: isstage, text: "Delete and commit" },
                { func: "undoLastCommit", blockType: Scratch.BlockType.BUTTON, text: "Undo Last Commit" },
                { func: "resync", blockType: Scratch.BlockType.BUTTON, text: "Resync" }
            ];
        }

        resync() {
            location.reload();
        }

        async setKey() {
            var key = await prompt("Enter your GitHub API key (repo scope)");
            if (key) {
                var d = new Date();
                d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = "github_api_key=" + key + ";" + expires + ";path=/";
                await alert("API key set for 30 days. You may need to reload for all features to activate.", "notif");
                this.init();
            }
        }

        async loadFromRepo() {
            var repo = await prompt("Enter the GitHub repo (ex: pooiod/ScratchProject)");
            if (repo) {
                location.href = `?project_url=https://raw.githubusercontent.com/${repo}/refs/heads/main/index.project`;
            }
        }

        async commitSprite() {
            const sprite = Scratch.vm.runtime.getEditingTarget();
            if (sprite.isStage) {
                await alert("You are not editing a sprite. Please select a sprite to commit.", "error");
                return;
            }
            const spriteName = sprite.getName();

            const apiKey = this.apiKey;
            if (!apiKey) {
                await alert("GitHub API key not set. Please set it first.", "error");
                this.setKey();
                return;
            }

            if (!this.repo) {
                await alert("Not in a GitHub project. Please connect to a repo first.", "error");
                return;
            }

            const commitMessage = await prompt(`Enter a commit message for '${spriteName}':`, `Update ${spriteName}`);
            if (!commitMessage) {
                return;
            }

            const base64DataUrl = await exportSprite(spriteName);
            if (!base64DataUrl) {
                await alert("Failed to export sprite.", "error");
                return;
            }

            const cleanBase64 = base64DataUrl.split(',')[1];
            const fileName = `${spriteName}.sprite`;
            const apiUrl = `https://api.github.com/repos/${this.repo}/contents/${fileName}`;

            try {
                let sha;
                const existingFileResponse = await fetch(apiUrl, {
                    headers: { 'Authorization': `token ${apiKey}` }
                });
                if (existingFileResponse.ok) {
                    const fileData = await existingFileResponse.json();
                    sha = fileData.sha;
                }

                const payload = {
                    message: commitMessage,
                    content: cleanBase64,
                    sha: sha
                };

                const putResponse = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${apiKey}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (putResponse.ok) {
                    console.log(`Sprite '${spriteName}' committed successfully!`);
                } else {
                    const errorData = await putResponse.json();
                    await alert(`Failed to commit sprite: ${errorData.message}`, "error");
                    console.error("GitHub API Error:", errorData);
                }
            } catch (error) {
                await alert("An error occurred while committing.", "error");
                console.error("Commit error:", error);
            }
        }

        async commitStage() {
            const apiKey = this.apiKey;
            if (!apiKey) {
                await alert("GitHub API key not set. Please set it first.", "error");
                this.setKey();
                return;
            }
            if (!this.repo) {
                await alert("Not in a GitHub project. Please connect to a repo first.", "error");
                return;
            }
            const commitMessage = await prompt("Enter a commit message for the stage:", "Update stage");
            if (!commitMessage) {
                return;
            }

            try {
                const projectBlob = await vm.saveProjectSb3();
                const stageOnlyBlob = await removeNonBackgroundSprites(projectBlob);
                const base64DataUrl = await blobToBase64(stageOnlyBlob);
                const cleanBase64 = base64DataUrl.split(',')[1];
                const fileName = "index.project";
                const apiUrl = `https://api.github.com/repos/${this.repo}/contents/${fileName}`;

                let sha;
                const existingFileResponse = await fetch(apiUrl, { headers: { 'Authorization': `token ${apiKey}` } });
                if (existingFileResponse.ok) {
                    sha = (await existingFileResponse.json()).sha;
                }

                const payload = { message: commitMessage, content: cleanBase64, sha: sha };
                const putResponse = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: { 'Authorization': `token ${apiKey}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (putResponse.ok) {
                    await alert("Stage committed successfully!", "notif");
                } else {
                    const errorData = await putResponse.json();
                    await alert(`Failed to commit stage: ${errorData.message}`, "error");
                }
            } catch (error) {
                await alert("An error occurred while committing the stage.", "error");
                console.error("Stage commit error:", error);
            }
        }

        async deleteSpriteAndCommit() {
            const sprite = Scratch.vm.runtime.getEditingTarget();
            if (sprite.isStage) {
                await alert("Cannot delete the stage. Select a sprite to delete.", "error");
                return;
            }
            const spriteName = sprite.getName();

            const apiKey = this.apiKey;
            if (!apiKey) {
                await alert("GitHub API key not set. Please set it first.", "error");
                this.setKey();
                return;
            }

            if (!this.repo) {
                await alert("Not in a GitHub project. Please connect to a repo first.", "error");
                return;
            }

            if (!await confirm(`Are you sure you want to delete and commit '${spriteName}' from the repository?`, "Yes", "No")) {
                return;
            }

            const commitMessage = await prompt(`Enter a commit message for deleting '${spriteName}':`, `Delete ${spriteName}`);
            if (!commitMessage) {
                return;
            }

            const fileName = `${spriteName}.sprite`;
            const apiUrl = `https://api.github.com/repos/${this.repo}/contents/${fileName}`;

            try {
                let sha;
                const existingFileResponse = await fetch(apiUrl, {
                    headers: { 'Authorization': `token ${apiKey}` }
                });

                if (existingFileResponse.ok) {
                    const fileData = await existingFileResponse.json();
                    sha = fileData.sha;
                } else {
                    await alert("Sprite not found in the repository. Deleting locally only.", "error");
                    deleteSprite(spriteName);
                    return;
                }

                const payload = {
                    message: commitMessage,
                    sha: sha
                };

                const deleteResponse = await fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${apiKey}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (deleteResponse.ok) {
                    await alert(`Sprite '${spriteName}' deleted successfully from the repository.`, "notif");
                    deleteSprite(spriteName);
                } else {
                    const errorData = await deleteResponse.json();
                    await alert(`Failed to delete sprite from repository: ${errorData.message}`, "error");
                    console.error("GitHub API Error:", errorData);
                }
            } catch (error) {
                await alert("An error occurred while deleting the sprite.", "error");
                console.error("Delete error:", error);
            }
        }

        async undoLastCommit() {
            if (!this.apiKey || !this.repo) {
                await alert("Please connect to a repository and set an API key first.", "error");
                return;
            }

            if (!await confirm("Are you sure you want to permanently undo the last commit? This will remove the most recent save from the repository and cannot be undone.", "Yes", "No")) {
                return;
            }

            try {
                const commitsApiUrl = `https://api.github.com/repos/${this.repo}/commits?per_page=1`;
                const commitResponse = await fetch(commitsApiUrl, { headers: { 'Authorization': `token ${this.apiKey}` } });
                if (!commitResponse.ok) throw new Error("Failed to fetch last commit.");
                const latestCommits = await commitResponse.json();
                if (latestCommits.length === 0) throw new Error("No commits found in the repository.");

                const lastCommit = latestCommits[0];

                if (lastCommit.parents.length === 0) {
                    await alert("Cannot undo the initial commit of the repository.", "error");
                    return;
                }
                const parentSha = lastCommit.parents[0].sha;

                const refApiUrl = `https://api.github.com/repos/${this.repo}/git/refs/heads/main`;
                const refUpdateResponse = await fetch(refApiUrl, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${this.apiKey}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sha: parentSha,
                        force: true
                    })
                });

                if (!refUpdateResponse.ok) {
                    const errorData = await refUpdateResponse.json();
                    throw new Error(`Failed to update branch reference: ${errorData.message}`);
                }

                alert("Last commit has been successfully undone. Reloading the editor to resync.", "info");
                setTimeout(() => { location.reload(); }, 2000);
            } catch (error) {
                await alert(`An error occurred: ${error.message}`, "error");
                console.error("Undo commit error:", error);
            }
        }

        async checkForUpdates(isInitialCheck = false) {
            if (!this.repo || !this.apiKey) {
                if (this.commitCheckInterval) clearInterval(this.commitCheckInterval);
                return;
            }

            try {
                const commitsApiUrl = `https://api.github.com/repos/${this.repo}/commits?per_page=1`;
                const response = await fetch(commitsApiUrl, { headers: { 'Authorization': `token ${this.apiKey}` } });
                if (!response.ok) {
                    console.error("Failed to fetch commits, stopping auto-updater.");
                    if (this.commitCheckInterval) clearInterval(this.commitCheckInterval);
                    return;
                }

                const latestCommits = await response.json();
                if (!latestCommits || latestCommits.length === 0) return;

                const latestSha = latestCommits[0].sha;

                if (isInitialCheck) {
                    this.lastCommitSha = latestSha;
                    console.log("GitKit auto-updater initialized. Last commit:", latestSha);
                    return;
                }

                if (this.lastCommitSha && latestSha !== this.lastCommitSha) {
                    console.log("New commit detected:", latestSha);
                    const commitDetailsUrl = `https://api.github.com/repos/${this.repo}/commits/${latestSha}`;
                    const commitDetailsResponse = await fetch(commitDetailsUrl, { headers: { 'Authorization': `token ${this.apiKey}` } });
                    if (!commitDetailsResponse.ok) return;

                    const commitDetails = await commitDetailsResponse.json();

                    for (const file of commitDetails.files) {
                        if (file.filename === 'index.project' && file.status !== 'removed') {
                            if (await confirm("The stage has been updated. Reload editor to see changes?", "Yes", "No")) {
                                location.reload();
                            }
                            break;
                        } else if (file.filename.endsWith('.sprite')) {
                            const spriteName = file.filename.replace('.sprite', '');
                            if (file.status === 'removed') {
                                console.log(`'${spriteName}' was removed. Deleting locally.`);
                                deleteSprite(spriteName);
                            } else {
                                console.log(`Updating sprite: '${spriteName}'`);
                                const spriteUrl = `https://raw.githubusercontent.com/${this.repo}/main/${file.filename}`;
                                deleteSprite(spriteName);
                                await importSprite(spriteUrl);
                            }
                        }
                    }
                    this.lastCommitSha = latestSha;
                }
            } catch (error) {
                console.error("Error checking for updates:", error);
            }
        }

        startCommitChecker() {
            if (this.commitCheckInterval) {
                clearInterval(this.commitCheckInterval);
            }
            this.checkForUpdates(true);
            this.commitCheckInterval = setInterval(() => this.checkForUpdates(false), 1000);
        }
    }
    Scratch.extensions.register(new GitKit());
})(Scratch);
