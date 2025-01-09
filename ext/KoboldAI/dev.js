// This extension is super early in development

(function(Scratch) {
    'use strict';

    // if (!Scratch.extensions.unsandboxed) {
    //     throw new Error('This extension must run unsandboxed');
    // }

    class p7KoboldAI {
        constructor() {
            this.base = "//stablehorde.net/api";
            this.key = "0000000000";
            this.allow_downgrade = false;
            this.source_image = false;
            this.img_strength = 1;
        }

        getInfo() {
            return {
                id: 'p7KoboldAI',
                name: 'Kobold AI',
                color1: '#47ba1e',
                color2: '#40a31c',
                blocks: [
                    {
                        opcode: 'setKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set api key to [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '0000000000',
                            },
                        },
                    },

                    {
                        opcode: 'apiStatus',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get api status',
                    },
                    {
                        opcode: 'apiPerformance',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get api performance',
                    },

                    {
                        opcode: 'getUserData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get data from user [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '0000000000',
                            },
                        },
                    },
                    
                    {
                        opcode: 'getmodels',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get all [TYPE] models',
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'text',
                                menu: 'ModelTypes',
                            },
                        },
                    },

                    {
                        opcode: 'startTextGen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Start text generation [PROMPT] from model [MODEL] with config [CONFIG]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'The quick orange cat jumped over the lazy dog. The dog then ',
                            },
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'any',
                            },
                            CONFIG: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'max_context_length: 1024, singleline: false, temperature: 5, max_length: 150',
                            },
                        },
                    },
                    {
                        opcode: 'getTextGenStatus',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get status of text generation [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'ID',
                            },
                        },
                    },
                    {
                        opcode: 'getTextGen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get text from generation [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'ID',
                            },
                        },
                    },

                    {
                        opcode: 'startImageGen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Start image generation [PROMPT] from model [MODEL] with config [CONFIG]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'An orange cat in space',
                            },
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'any',
                            },
                            CONFIG: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'height: 512, width: 512, transparent: false',
                            },
                        },
                    },
                    {
                        opcode: 'getImageGenStatus',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get status of image generation [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'ID',
                            },
                        },
                    },
                    {
                        opcode: 'getImageGen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get image from generation [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'ID',
                            },
                        },
                    },

                    {
                        opcode: 'getListInFormat',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Format [LIST] as [FORMAT]',
                        disableMonitor: true,
                        arguments: {
                          LIST: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "lists",
                          },
                          FORMAT: {
                            type: Scratch.ArgumentType.STRING,
                            menu: "formats",
                          },
                        },
                      },
                ],
                menus: {
                    lists: {
                        acceptReporters: true,
                        acceptReporters: false,
                        items: "getLists"
                    },
					ModelTypes: {
						acceptReporters: false,
						items: ['text', 'image'],
					},
                    formats: {
						acceptReporters: false,
						items: ['chat', 'array'],
					},
				},
            };
        }

        mergeJSON(json1, json2) {
            if (typeof json2 === 'string') {
                try {
                    json2 = JSON.parse(`{${json2}}`);
                } catch {
                    return json1;
                }
            }
    
            if (json.img && Array.isArray(json.img) && json.img.length === 2) {
                this.source_image = json.img[0];
                this.img_strength = json.img[1];
            }        
        
            if (typeof json2 !== 'object' || json2 === null) {
                return json1;
            }
        
            let result = { ...json1 };
            for (let key in json2) {
                if (Array.isArray(json2[key]) && Array.isArray(json1[key])) {
                    result[key] = [...json2[key]];
                } else if (typeof json2[key] === 'object' && typeof json1[key] === 'object') {
                    result[key] = mergeJSON(json1[key], json2[key]);
                } else {
                    result[key] = json2[key];
                }
            }
            return result;
        }

        getLists() {
            const globalLists = Object.values(
                vm.runtime.getTargetForStage().variables
            ).filter((x) => x.type == "list");
            const localLists = Object.values(vm.editingTarget.variables).filter(
                (x) => x.type == "list"
            );
            const uniqueLists = [...new Set([...globalLists, ...localLists])];
            if (uniqueLists.length === 0) return [{ text: "make a list", value: "make a list" }];
            return uniqueLists.map((i) => ({ text: i.name, value: i.id }));
        }

        getList(list, util) {
            const byId = util.target.lookupVariableById(list);
            if (byId && byId.type === "list") return (byId);
            const byName = util.target.lookupVariableByNameAndType(list, "list");
            if (byName) return (byName);
            return;
        }

        setKey({KEY}) {
            this.key = KEY;
        }

        async getUserData({KEY}) {
            return Scratch.fetch(`${this.base}/v2/find_user`, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': KEY
                }
            })
            .then((res) => res.json())
            .then((dat) => JSON.stringify(dat))
            .catch((err) => err.message);
        }
        
        async getmodels({TYPE}) {
            return Scratch.fetch(`${this.base}/v2/status/models?type=${TYPE}`)
                .then((res) => res.json())
                .then((dat) => JSON.stringify(dat))
                .catch((err) => err.message);
        }
        
        async apiStatus() {
            return Scratch.fetch(`${this.base}/v2/status/heartbeat`)
                .then((res) => res.json())
                .then((dat) => JSON.stringify(dat))
                .catch((err) => err.message);
        }

        async apiPerformance() {
            return Scratch.fetch(`${this.base}/v2/status/performance`)
                .then((res) => res.json())
                .then((dat) => JSON.stringify(dat))
                .catch((err) => err.message);
        }

        async startTextGen({PROMPT, MODEL, CONFIG}) {
            try {
                const response = await Scratch.fetch(`${this.base}/v2/generate/text/async`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.key
                    },
                    body: JSON.stringify({
                        prompt: PROMPT,
                        params: this.mergeJSON({
                            n: 1,
                            models: [MODEL]
                        }, CONFIG),
                        "extra_source_images": this.source_image?[
                            {
                              "image": this.source_image,
                              "strength": this.img_strength
                            }
                        ]:[],
                        allow_downgrade: this.allow_downgrade || MODEL == "any"
                    })
                });
                this.source_image = false;
                const data = await response.json();
                return data.id;
            } catch (error) {
                return error;
            }
        }

        async getTextGenStatus({ID}) {
            return Scratch.fetch(`${this.base}/v2/generate/text/status/${ID}`)
            .then((res) => res.json())
            .then((dat) => JSON.stringify(dat))
            .catch((err) => err.message);
        }

        async getTextGen({ID}) {
            return Scratch.fetch(`${this.base}/v2/generate/text/status/${ID}`)
            .then((res) => res.json())
            .then((dat) => {
                if (dat.generations && dat.generations.length > 0) {
                    if (dat.generations && dat.generations.length > 1) {
                        return JSON.stringify(dat.generations);
                    } else {
                        return dat.generations[0].text;
                    }
                } else {
                    return ""
                }
            })
            .catch((err) => err.message);
        }

        async startImageGen({PROMPT, MODEL, CONFIG}) {
            try {
                const response = await Scratch.fetch(`${this.base}/v2/generate/async`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.key
                    },
                    body: JSON.stringify({
                        prompt: PROMPT,
                        params: this.mergeJSON({
                            n: 1,
                            censor_nsfw: true,
                            models: [MODEL]
                        }, CONFIG),
                        "extra_source_images": this.source_image?[
                            {
                              "image": this.source_image,
                              "strength": this.img_strength
                            }
                        ]:[],
                        allow_downgrade: this.allow_downgrade || MODEL == "any"
                    })
                });
                this.source_image = false;
                const data = await response.json();
                return data.id;
            } catch (error) {
                return error;
            }
        }

        async getImageGenStatus({ID}) {
            return Scratch.fetch(`${this.base}/v2/generate/status/${ID}`)
            .then((res) => res.json())
            .then((dat) => JSON.stringify(dat))
            .catch((err) => err.message);
        }

        async getImageGen({ID}) {
            return Scratch.fetch(`${this.base}/v2/generate/status/${ID}`)
            .then((res) => res.json())
            .then((dat) => {
                if (dat.generations && dat.generations.length > 0) {
                    if (dat.generations && dat.generations.length > 1) {
                        return JSON.stringify(dat.generations);
                    } else {
                        return dat.generations[0].img;
                    }
                } else {
                    return ""
                }
            })
            .catch((err) => err.message);
        }
    }
    Scratch.extensions.register(new p7KoboldAI());
})(Scratch);
