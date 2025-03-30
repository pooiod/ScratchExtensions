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
                                defaultValue: "https://p7scratchextensions.pages.dev/ext/ProjectParser/proj.sb3" // https://yeetyourfiles.lol/file/94139be7/Box2D.sb3
                            }
                        }
                    },
                    {
                        opcode: "loadCurrentProject",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Load current project",
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "project.json"
                            },
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "{}"
                            }
                        }
                    },

                    {
                        opcode: "runProject",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Run loaded project"
                    },

                    {
                        opcode: "projectLoaded",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "Project loaded"
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
                        opcode: "exportProject",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Export project"
                    },

                    {
                        opcode: "setFile",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Set file [FILENAME] with data [DATA]",
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "test.txt"
                            },
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "This is a test"
                            }
                        }
                    },
                    {
                        opcode: "getFile",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get file [FILENAME]",
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "project.json"
                            }
                        }
                    },

                    {
                        opcode: "getAllFileNames",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get all file names"
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
                        opcode: "getSound",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Get sound [SOUND] from sprite [SPRITE]",
                        arguments: {
                            SPRITE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Sprite1"
                            },
                            SOUND: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Meow"
                            }
                        }
                    },

                    {
                        opcode: "getThumbnail",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Generate project thumbnail of width [WIDTH] and height [HEIGHT]",
                        arguments: {
                            WIDTH: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "480"
                            },
                            HEIGHT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: "360"
                            },
                        }
                    }
                ],
                menus: {
                    props: {
                        isTypeable: true,
                        acceptReporters: true,
                        items: ["sprites", "costumes", "sounds", "extension ids", "extension urls", "platform name", "platform url"]
                    }
                }
            };
        }

        projectLoaded() {
            return !! (progress == 100 && projectData && fetchedBuffer);
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

        loadCurrentProject() {
            lastError = "";
            fetchedBuffer = null;
            projectData = null;
            progress = 0;

            vm.saveProjectSb3().then((blob) => {
                const reader = new FileReader();
                reader.onload = () => {
                    fetchedBuffer = reader.result;
                    return LoadJSZIP()
                        .then(() => JSZip.loadAsync(fetchedBuffer))
                        .then((zip) => zip.file("project.json").async("string"))
                        .then((data) => {
                            progress = 100;
                            projectData = JSON.parse(data);
                        });
                };
                reader.readAsArrayBuffer(blob);
            }).catch((error) => {
                console.error(error);
                lastError = error.toString();
            });
        }

        getFile({ FILENAME }) {
            if (!fetchedBuffer) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }
            return LoadJSZIP().then(() => JSZip.loadAsync(fetchedBuffer)).then((zip) => {
                const file = zip.file(FILENAME);
                if (!file) throw new Error("File not found in project");
                return file.async("string");
            }).catch((error) => {
                console.error(error);
                lastError = error.toString();
                return lastError;
            });
        }

        getAllFileNames() {
            if (!fetchedBuffer) {
                lastError = "No project loaded.";
                console.error(lastError);
                return JSON.stringify([]);
            }

            return LoadJSZIP()
                .then(() => JSZip.loadAsync(fetchedBuffer))
                .then((zip) => JSON.stringify(Object.keys(zip.files)))
                .catch((error) => {
                    console.error(error);
                    lastError = error.toString();
                    return JSON.stringify([]);
                });
        }

        exportProject() {
            if (!fetchedBuffer) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            return LoadJSZIP()
                .then(() => JSZip.loadAsync(fetchedBuffer))
                .then((zip) => zip.generateAsync({ type: "base64" }))
                .then((base64Data) => `data:application/x.scratch.sb3;base64,${base64Data}`)
                .catch((error) => {
                    console.error(error);
                    lastError = error.toString();
                    return lastError;
                });
        }

        setFile({ FILENAME, DATA }) {
            if (!fetchedBuffer) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            return LoadJSZIP().then(() => JSZip.loadAsync(fetchedBuffer)).then((zip) => {
                if (DATA === "") {
                    zip.remove(FILENAME);
                } else {
                    zip.file(FILENAME, DATA);
                }
                return zip.generateAsync({ type: "arraybuffer" });
            }).then((buffer) => {
                fetchedBuffer = buffer;
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
                            costumesArr.push(["Stage", stage.costumes.map(c => c.name)]);
                        }
                        projectData.targets.filter(t => !t.isStage).forEach(sprite => {
                            if (sprite.costumes && sprite.costumes.length > 0) {
                                costumesArr.push([sprite.name, sprite.costumes.map(c => c.name)]);
                            }
                        });
                    }
                    return JSON.stringify(costumesArr);
                case "sounds":
                    let soundsArr = [];
                    if (projectData.targets) {
                        const stage = projectData.targets.find(t => t.isStage);
                        if (stage && stage.sounds && stage.sounds.length > 0) {
                            soundsArr.push(["Stage", stage.sounds.map(c => c.name)]);
                        }
                        projectData.targets.filter(t => !t.isStage).forEach(sprite => {
                            if (sprite.sounds && sprite.sounds.length > 0) {
                                soundsArr.push([sprite.name, sprite.sounds.map(c => c.name)]);
                            }
                        });
                    }
                    return JSON.stringify(soundsArr);
                case "extension ids":
                    return JSON.stringify(projectData.extensions || []);
                case "extension urls":
                    return JSON.stringify(projectData.extensionURLs || {});
                case "platform name":
                    return projectData.meta?.platform?.name || "scratch";
                case "platform url":
                    return projectData.meta?.platform?.url || "https://scratch.mit.edu";
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

        getSound({ SPRITE, SOUND }) {
            if (!projectData) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            const sprite = projectData.targets.find(t => t.name === SPRITE);
            if (!sprite) return "No sprite found";
            const sound = sprite.sounds.find(s => s.name === SOUND);
            if (!sound) return "No sound found";

            return LoadJSZIP().then(() => JSZip.loadAsync(fetchedBuffer)).then((zip) => {
                const file = zip.file(sound.md5ext);
                if (!file) throw new Error("Sound file not found in zip");
                return file.async("base64");
            }).then((data) => {
                return `data:audio/wav;base64,${data}`;
            }).catch((error) => {
                console.error(error);
                lastError = error.toString();
                return lastError;
            });
        }

        getThumbnail({ WIDTH, HEIGHT }) {
            if (!projectData) {
                lastError = "No project loaded.";
                console.error(lastError);
                return lastError;
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = WIDTH;
            canvas.height = HEIGHT;

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
                                    ctx.translate(WIDTH / 2 + (target.x || 0), HEIGHT / 2 - (target.y || 0));
                                    ctx.rotate(((target.direction || 90) - 90) * (Math.PI / 180));
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
