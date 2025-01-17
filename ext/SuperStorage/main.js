// SuperStorage (v2) by pooiod7

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class SuperStorage {
		constructor() {
			this.currentServer = "https://storage-ext.penguinmod.com/";
			this.useGlobal = true;
			this.waitingForResponse = false;
			this.serverFailedResponse = false;
			this.serverError = "";
			this.prefix = "SuperStorage_";
		}

		getInfo() {
			return {
				id: 'P7SuperStorage',
				name: 'Super Storage',
				color1: '#31b3d4',
				color2: '#179fc2',
				docsURI: 'https://p7scratchextensions.pages.dev/docs/#/SuperStorage',
				blocks: [
					{ blockType: Scratch.BlockType.LABEL, text: "Local Storage" },

					{
						opcode: 'getValue',
						text: 'Get local [KEY]',
						disableMonitor: true,
						blockType: Scratch.BlockType.REPORTER,
						arguments: {
							KEY: { 
								type: Scratch.ArgumentType.STRING, 
								defaultValue: "File1" 
							}
						}
					},

					{
						opcode: 'setValue',
						text: 'Set local [KEY] to [VALUE]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: {
							KEY: { 
								type: Scratch.ArgumentType.STRING, 
								defaultValue: "File1" 
							},
							VALUE: { 
								type: Scratch.ArgumentType.STRING, 
								defaultValue: "Hello, World!" 
							}
						}
					},

					{
						opcode: 'deleteValue',
						text: 'Delete local [KEY]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: { 
							KEY: { 
								type: Scratch.ArgumentType.STRING, 
								defaultValue: "File1" 
							} 
						}
					},

					{
						opcode: 'getKeys',
						text: 'Get all local stored names',
						disableMonitor: true,
						blockType: Scratch.BlockType.REPORTER
					},

					{ blockType: Scratch.BlockType.LABEL, text: "Server Storage" },

					{
						opcode: 'canUseOnlineStorage',
						text: 'Can connect to server?',
						disableMonitor: true,
						blockType: Scratch.BlockType.BOOLEAN
					},

					{
						opcode: 'waitingForConnection',
						text: 'Waiting for server to respond?',
						disableMonitor: true,
						blockType: Scratch.BlockType.BOOLEAN
					},

					{
						opcode: 'connectionFailed',
						text: 'Server failed to respond?',
						disableMonitor: true,
						blockType: Scratch.BlockType.BOOLEAN
					},
					{
						opcode: 'serverErrorOutput',
						text: 'Server error',
						disableMonitor: false,
						blockType: Scratch.BlockType.REPORTER
					},
					
					"---",

					{
						opcode: 'getServerValue',
						text: 'Get server [KEY]',
						disableMonitor: true,
						blockType: Scratch.BlockType.REPORTER,
						arguments: { 
							KEY: { 
								type: Scratch.ArgumentType.STRING, 
								defaultValue: "File1" 
							} 
						}
					},

					{
						opcode: 'setServerValue',
						text: 'Set server [KEY] to [VALUE]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: {
							KEY: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "File1" 
							},
							VALUE: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "Hello, World!" 
							}
						}
					},

					{
						opcode: 'deleteServerValue',
						text: 'Delete server [KEY]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: { 
							KEY: { 
								type: Scratch.ArgumentType.STRING, 
								defaultValue: "File1" 
							} 
						}
					},

					{ blockType: Scratch.BlockType.LABEL, text: "Device files" },

					{
                        opcode: "openFile",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "Open file selector for types [types] as [format]",
                        arguments: {
                            types: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "" 
							},
                            format: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "fileFormats",
                                defaultValue: "raw"
                            }
                        }
                    },

                    {
                        opcode: "downloadFile",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Download [text] as [filename]",
                        arguments: {
                            text: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "Hello, world!" 
							},
                            filename: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "file.txt" 
							}
                        }
                    },
                    {
                        opcode: "downloadDataURI",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "Download file from data URI [url] as [filename]",
                        arguments: {
                            url: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==" 
							},
                            filename: { 
								type: Scratch.ArgumentType.STRING, defaultValue: "file.txt" 
							}
                        }
                    },

					{ blockType: Scratch.BlockType.LABEL, text: "Cookies" },

					{
                        opcode: 'getAllCookies',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get all cookie names',
                    },

                    {
                        opcode: 'setCookie',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set cookie [KEY] to [VALUE] with expiration [DATE]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Cookie1',
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, World!',
                            },
                            DATE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: new Date(Date.now() + 86400000).toISOString(),
                            }
                        },
                    },

                    {
                        opcode: 'getCookieValue',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get cookie value for [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Cookie1',
                            }
                        },
                    },
					
                    {
                        opcode: 'removeCookie',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove cookie [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Cookie1',
                            }
                        },
                    },
				],
                menus: {
                    fileFormats: {
                        acceptReporters: true,
                        items: ["raw", "data uri", "hex"]
                    }
                }
			};
		}

		getPrefix() {
			return this.prefix;
		}

		getAllKeys() {
			return Object.keys(localStorage).filter(key => key.startsWith(this.getPrefix())).map(key => key.replace(this.getPrefix(), ""));
		}

		runPenguinWebRequest(url, options, ifFailReturn) {
			this.waitingForResponse = true;
			this.serverFailedResponse = false;
			this.serverError = "";

			return Scratch.fetch(url, options)
				.then(response => response.ok ? response.text() : Promise.reject(response.text()))
				.then(text => {
					this.waitingForResponse = false;
					return text;
				})
				.catch(err => {
					this.waitingForResponse = false;
					this.serverFailedResponse = true;
					this.serverError = err;
					return ifFailReturn;
				});
		}

		getKeys() {
			return JSON.stringify(this.getAllKeys());
		}

		getValue(args) {
			return localStorage.getItem(this.getPrefix() + args.KEY) || "";
		}

		setValue(args) {
			localStorage.setItem(this.getPrefix() + args.KEY, args.VALUE);
		}

		deleteValue(args) {
			localStorage.removeItem(this.getPrefix() + args.KEY);
		}

		async canUseOnlineStorage() {
			try {
				const response = await Scratch.fetch(this.currentServer, { method: 'HEAD' });
				return response.ok;
			} catch {
				return false;
			}
		}

		waitingForConnection() {
			return this.waitingForResponse;
		}

		connectionFailed() {
			return this.serverFailedResponse;
		}

		serverErrorOutput() {
			return this.serverError;
		}

		getServerValue(args) {
			return this.runPenguinWebRequest(`${this.currentServer}get?key=${args.KEY}`, null, "");
		}

		setServerValue(args) {
			return this.runPenguinWebRequest(`${this.currentServer}set?key=${args.KEY}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ "value": args.VALUE })
			});
		}

		deleteServerValue(args) {
			return this.runPenguinWebRequest(`${this.currentServer}delete?key=${args.KEY}`, { method: "DELETE" });
		}

		openFile(args) {
            return new Promise((resolve) => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = args.types || "";

                const outer = document.createElement("div");
                outer.style.pointerEvents = "auto";
                outer.style.position = "fixed";
                outer.style.top = "0";
                outer.style.left = "0";
                outer.style.width = "100%";
                outer.style.height = "100%";
                outer.style.display = "flex";
                outer.style.justifyContent = "center";
                outer.style.alignItems = "center";
                outer.style.background = "rgba(0, 0, 0, 0.5)";
                outer.style.zIndex = "10000";
                outer.style.opacity = "0";
                outer.style.transition = "opacity 0.3s ease-in";

                setTimeout(() => {
                    outer.style.opacity = "1";
                }, 0);

                const modal = document.createElement("div");
                modal.style.background = "white";
                modal.style.padding = "20px";
                modal.style.borderRadius = "10px";
                modal.style.textAlign = "center";
                modal.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
                modal.innerHTML = `
                    <p>Select a file or drop it here</p>
                    <button>Select File</button>
                `;

                const selectButton = modal.querySelector("button");
                selectButton.addEventListener("click", () => input.click());

                outer.appendChild(modal);
                document.body.appendChild(outer);

                const cleanUp = () => {
                    outer.style.opacity = "0";
                    setTimeout(() => {
                        document.body.removeChild(outer);
                    }, 300);
                };

                input.addEventListener("change", (e) => {
                    cleanUp();
                    const file = e.target.files[0];
                    if (file) {
                    	const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result;
                            if (args.format === "raw") {
                                resolve(result);
                            } else if (args.format === "data uri") {
                                resolve(result);
                            } else if (args.format === "hex") {
                                resolve(Array.from(new Uint8Array(result)).map(b => b.toString(16).padStart(2, "0")).join(""));
                            } else {
                                resolve("");
                            }
                        };
                        reader.onerror = () => resolve("");
                        if (args.format === "data uri") {
                            reader.readAsDataURL(file);
                        } else if (args.format === "hex") {
                            reader.readAsArrayBuffer(file);
                        } else {
                            reader.readAsText(file);
                        }
                    } else {
                        resolve("");
                    }
                });

                input.addEventListener("cancel", () => {
                    cleanUp();
                    resolve("");
                });

                outer.addEventListener("click", (e) => {
                    if (e.target === outer) {
                        cleanUp();
                        resolve("");
                    }
                });

                input.click();
            });
        }

        async downloadFile(args) {
            try {
                const url = URL.createObjectURL(new Blob([args.text], { type: "text/plain" }));
                await Scratch.download(url, args.filename);
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error(e);
            }
        }

        async downloadDataURI(args) {
            try {
                const url = args.url;
                await Scratch.download(url, args.filename);
            } catch (e) {
                console.error(e);
            }
        }

		getAllCookies() {
            const cookies = document.cookie.split(';');
            let result = [];
            cookies.forEach(cookie => {
                const [key] = cookie.split('=');
                if (key.trim().startsWith(this.prefix)) {
                    result.push(key.trim().replace(this.prefix, ''));
                }
            });
            return result.join(', ');
        }

        setCookie(args) {
            const { KEY, VALUE, DATE } = args;
            const cookieName = this.prefix + KEY;
            let cookie = `${cookieName}=${VALUE}; path=/`;
            if (DATE) {
                cookie += `; expires=${new Date(DATE).toUTCString()}`;
            }
            document.cookie = cookie;
        }

        getCookieValue(args) {
            const cookieName = this.prefix + args.KEY;
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const [key, value] = cookies[i].split('=');
                if (key.trim() === cookieName) {
                    return value;
                }
            }
            return '';
        }

        removeCookie(args) {
            const cookieName = this.prefix + args.KEY;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
	}

	Scratch.extensions.register(new SuperStorage());
})(Scratch);
