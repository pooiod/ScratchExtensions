// ProjectParser (wip) by pooiod7

(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) {
        throw new Error("This extension must be run unsandboxed");
    }

    const vm = Scratch.vm;
    let fetchedBuffer = null;
    let projectData = null;
    let lastError = "";
    let progress = 0;
    const JSZipURL = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

    function LoadJSZIP() {
        return new Promise((resolve, reject) => {
            if (window.JSZip) return resolve();
            if (document.querySelector(`script[src="${JSZipURL}"]`)) return resolve();
            const script = document.createElement("script");
            script.src = JSZipURL;
            script.onload = resolve;
            script.onerror = () => reject("Failed to load JSZip");
            document.head.appendChild(script);
        });
    }

    class ProjectParser {
        getInfo() {
            return {
                id: "P7ProjectParser",
                name: "Project Parser",
                color1: "#fcb103",
                blocks: [
                    {
                        opcode: "loadProject",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Load project [URL]",
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "https://extensions.turbowarp.org/samples/Box2D.sb3"
                            }
                        }
                    },
                    {
                        opcode: "runProject",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run loaded project"
                    },
                    {
                        opcode: "getProgress",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Progress"
                    },
                    {
                        opcode: "getLastError",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Last error"
                    },
                    {
                        opcode: "getProp",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get [PROP] from project",
                        arguments: {
                            PROP: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "props"
                            }
                        }
                    },
                    {
                        opcode: "getCostume",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get costume [COSTUME] from sprite [SPRITE]",
                        arguments: {
                            SPRITE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Sprite1"
                            },
                            COSTUME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "costume1"
                            }
                        }
                    },
                    {
                        opcode: "getThumbnail",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Generate project thumbnail"
                    }
                ],
                menus: {
                    props: {
                        acceptReporters: true,
                        items: ["sprites", "costumes", "extensions", "platform"]
                    }
                }
            };
        }

        loadProject({ URL }) {
            lastError = "";
            fetchedBuffer = null;
            projectData = null;
            progress = 0;

            fetch(URL).then((response) => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const contentLength = response.headers.get("content-length");
                const reader = response.body.getReader();
                let receivedLength = 0;
                const chunks = [];

                function read() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            const completeBuffer = new Uint8Array(receivedLength);

                            let offset = 0;
                            for (const chunk of chunks) {
                                completeBuffer.set(chunk, offset);
                                offset += chunk.length;
                            }

                            fetchedBuffer = completeBuffer.buffer;
                            progress = 100;

                            return LoadJSZIP()
                                .then(() => JSZip.loadAsync(fetchedBuffer))
                                .then((zip) => zip.file("project.json").async("string"))
                                .then((data) => {
                                    projectData = JSON.parse(data);
                                });
                        }

                        chunks.push(value);
                        receivedLength += value.length;
                        progress = contentLength ? Math.round((receivedLength / contentLength) * 100) : 0;
                        return read();
                    });
                }
                return read();
            }).catch((error) => {
                console.error(error);
                lastError = error.toString();
            });
        }

        runProject() {
            if (!fetchedBuffer) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            vm.loadProject(fetchedBuffer).then(() => vm.greenFlag()).catch((error) => {
                console.error(error);
                lastError = error.toString();
            });
        }

        getProgress() {
            return progress;
        }

        getLastError() {
            return lastError;
        }

        getProp({ PROP }) {
            if (!projectData) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            switch (PROP) {
                case "sprites":
                    return JSON.stringify(projectData.targets.filter(t => !t.isStage).map(t => t.name));
                case "costumes":
                    let costumesArr = [];
                    if (projectData.targets) {
                        const stage = projectData.targets.find(t => t.isStage);
                        if (stage && stage.costumes && stage.costumes.length > 0) {
                            costumesArr.push(`Stage: ["${stage.costumes.map(c => c.name).join('", "')}"]`);
                        }
                        projectData.targets.filter(t => !t.isStage).forEach(sprite => {
                            if (sprite.costumes && sprite.costumes.length > 0) {
                                costumesArr.push(`${sprite.name}: ["${sprite.costumes.map(c => c.name).join('", "')}"]`);
                            }
                        });
                    }
                    return JSON.stringify(costumesArr);
                case "extensions":
                    return JSON.stringify(projectData.extensions || []);
                case "platform":
                    return projectData.meta?.platform?.name || "scratch";
                default:
                    return projectData.meta[PROP] || "";
            }
        }

        getCostume({ SPRITE, COSTUME }) {
            if (!projectData) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            const sprite = projectData.targets.find(t => t.name === SPRITE);
            if (!sprite) return "No sprite found";
            const costume = sprite.costumes.find(c => c.name === COSTUME);
            if (!costume) return "No costume found";

            return LoadJSZIP().then(() => JSZip.loadAsync(fetchedBuffer)).then((zip) => {
                const file = zip.file(costume.md5ext);
                if (!file) throw new Error("Costume file not found in zip");
                return file.async("base64");
            }).then((data) => {
                if (costume.dataFormat === "svg") {
                    return `data:image/svg+xml;base64,${data}`;
                }
                return `data:image/png;base64,${data}`;
            }).catch((error) => {
                console.error(error);
                lastError = error.toString();
                return lastError;
            });
        }

        getThumbnail() {
            if (!projectData) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 480;
            canvas.height = 360;

            return LoadJSZIP()
                .then(() => JSZip.loadAsync(fetchedBuffer))
                .then((zip) => {
                    const targets = projectData.targets.filter(t => t.visible !== false)
                        .sort((a, b) => (a.layerOrder || 0) - (b.layerOrder || 0));

                    const drawPromises = targets.map((target) => {
                        const costume = target.costumes[target.currentCostume];
                        if (!costume) return Promise.resolve();

                        return zip.file(costume.md5ext).async("base64").then((imageData) => {
                            return new Promise((resolve, reject) => {
                                const img = new Image();
                                img.src = costume.dataFormat === "svg"
                                    ? `data:image/svg+xml;base64,${imageData}`
                                    : `data:image/png;base64,${imageData}`;

                                const timer = setTimeout(() => {
                                    reject("Image load timeout");
                                }, 5000);

                                img.onload = () => {
                                    clearTimeout(timer);
                                    ctx.save();
                                    ctx.translate(240 + (target.x || 0), 180 - (target.y || 0));
                                    ctx.rotate(((target.direction || 0) - 90) * (Math.PI / 180));
                                    ctx.scale((target.size || 100) / 100, (target.size || 100) / 100);
                                    const rotationCenterX = costume.rotationCenterX || 0;
                                    const rotationCenterY = costume.rotationCenterY || 0;
                                    ctx.drawImage(img, -rotationCenterX, -rotationCenterY);
                                    ctx.restore();
                                    resolve();
                                };

                                img.onerror = () => {
                                    clearTimeout(timer);
                                    reject("Image failed to load");
                                };
                            });
                        });
                    });
                    return Promise.all(drawPromises);
                }).then(() => canvas.toDataURL("image/png")).catch((error) => {
                    console.error(error);
                    lastError = error.toString();
                    return lastError;
                });
        }
    }

    Scratch.extensions.register(new ProjectParser());
})(Scratch);
