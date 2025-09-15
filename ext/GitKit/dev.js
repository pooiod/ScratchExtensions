(function(Scratch) {
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
    setTimeout(()=>{
        loaded = true;
    }, 500);

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

        setKey() {
            var key = prompt("Enter your GitHub API key (repo scope)");
            if (key) {
                var d = new Date();
                d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                document.cookie = "github_api_key=" + key + ";" + expires + ";path=/";
                alert("API key set for 30 days. You may need to reload for all features to activate.");
                this.init();
            }
        }

        loadFromRepo() {
            var repo = prompt("Enter the GitHub repo (ex: pooiod/ScratchProject)");
            if (repo) {
                location.href = `?project_url=https://raw.githubusercontent.com/${repo}/refs/heads/main/index.project`;
            }
        }

        async commitSprite() {
            const sprite = Scratch.vm.runtime.getEditingTarget();
            if (sprite.isStage) {
                alert("You are not editing a sprite. Please select a sprite to commit.");
                return;
            }
            const spriteName = sprite.getName();

            const apiKey = this.apiKey;
            if (!apiKey) {
                alert("GitHub API key not set. Please set it first.");
                this.setKey();
                return;
            }

            if (!this.repo) {
                alert("Not in a GitHub project. Please connect to a repo first.");
                return;
            }

            const commitMessage = prompt(`Enter a commit message for '${spriteName}':`, `Update ${spriteName}`);
            if (!commitMessage) {
                return;
            }

            const base64DataUrl = await exportSprite(spriteName);
            if (!base64DataUrl) {
                alert("Failed to export sprite.");
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
                    alert(`Failed to commit sprite: ${errorData.message}`);
                    console.error("GitHub API Error:", errorData);
                }
            } catch (error) {
                alert("An error occurred while committing.");
                console.error("Commit error:", error);
            }
        }

        async commitStage() {
            const apiKey = this.apiKey;
            if (!apiKey) {
                alert("GitHub API key not set. Please set it first.");
                this.setKey();
                return;
            }
            if (!this.repo) {
                alert("Not in a GitHub project. Please connect to a repo first.");
                return;
            }
            const commitMessage = prompt("Enter a commit message for the stage:", "Update stage");
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
                    alert("Stage committed successfully!");
                } else {
                    const errorData = await putResponse.json();
                    alert(`Failed to commit stage: ${errorData.message}`);
                }
            } catch (error) {
                alert("An error occurred while committing the stage.");
                console.error("Stage commit error:", error);
            }
        }

        async deleteSpriteAndCommit() {
            const sprite = Scratch.vm.runtime.getEditingTarget();
            if (sprite.isStage) {
                alert("Cannot delete the stage. Select a sprite to delete.");
                return;
            }
            const spriteName = sprite.getName();

            const apiKey = this.apiKey;
            if (!apiKey) {
                alert("GitHub API key not set. Please set it first.");
                this.setKey();
                return;
            }

            if (!this.repo) {
                alert("Not in a GitHub project. Please connect to a repo first.");
                return;
            }
            
            if (!confirm(`Are you sure you want to delete and commit '${spriteName}' from the repository?`)) {
                return;
            }

            const commitMessage = prompt(`Enter a commit message for deleting '${spriteName}':`, `Delete ${spriteName}`);
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
                    alert("Sprite not found in the repository. Deleting locally only.");
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
                    alert(`Sprite '${spriteName}' deleted successfully from the repository.`);
                    deleteSprite(spriteName);
                } else {
                    const errorData = await deleteResponse.json();
                    alert(`Failed to delete sprite from repository: ${errorData.message}`);
                    console.error("GitHub API Error:", errorData);
                }
            } catch (error) {
                alert("An error occurred while deleting the sprite.");
                console.error("Delete error:", error);
            }
        }

        async undoLastCommit() {
            if (!this.apiKey || !this.repo) {
                alert("Please connect to a repository and set an API key first.");
                return;
            }
    
            if (!confirm("Are you sure you want to permanently undo the last commit? This will remove the most recent save from the repository and cannot be undone.")) {
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
                    alert("Cannot undo the initial commit of the repository.");
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
                
                alert("Last commit has been successfully undone. Reloading the editor to resync.");
                location.reload();
    
            } catch (error) {
                alert(`An error occurred: ${error.message}`);
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
                            if (confirm("The stage has been updated. Reload editor to see changes?")) {
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
