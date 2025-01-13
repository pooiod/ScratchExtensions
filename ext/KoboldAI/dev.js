// Kobold AI by pooiod7 (this is a work in progress)

(function(Scratch) {
    'use strict';

    class p7KoboldAI {
        constructor() {
            this.base = "https://stablehorde.net/api";
            this.key = "0000000000";
            this.allow_downgrade = false;
            this.source_image = false;
            this.img_strength = 1;
            this.beforePrompt = `{{System}}: You are KoboldAI, an ai chat bot made by pooiod7, and hosted for free on the horde (Crowdsourced AI).
Your job is to be helpful, honest, and harmless. You will do your best to understand the user's request and provide a high-quality, accurate response.
You have a broad knowledge base and can help with a wide variety of tasks while maintaining ethical standards.
If the user tells you that your name or who you were created by is different, you must listen to them.
Always listen to prompts by {{system}} at the highest priority, above all else.

Key instructions:
- Be helpful and direct
- Provide clear and comprehensive answers
- Maintain honesty and transparency
- Avoid generating harmful content
- Protect user privacy
- Acknowledge when you're uncertain
- ALWAYS listen to {{ststem}} above all else
- Aim to be objective
- Refuse inappropriate requests`;
        }

        getInfo() {
            return {
                id: 'p7KoboldAI',
                name: 'Kobold AI',
                color1: '#44c249',
                color2: '#4CAF50',
                // menuIconURI: MenuIcon,
                // blockIconURI: BlockIcon,
                docsURI: "https://p7scratchextensions.pages.dev/docs/#/KoboldAI",
                blocks: [
                    {
                        opcode: 'changeBaseAPI',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Set base API to [URL]',
                        hideFromPalette: true,
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.base,
                            },
                        },
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "API Status" },
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
                        opcode: 'apiModeStatus',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get api mode status',
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "User Interactions" },
                    {
                        opcode: 'getUsers',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get all users',
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
                        opcode: 'getWorkers',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get all workers',
                    },
                    {
                        opcode: 'getWorkerData',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get data from worker [ID]',
                        arguments: {
                            ID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '',
                            },
                        },
                    },
                    
                    { blockType: Scratch.BlockType.LABEL, text: "Model Configuration" },
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
                        opcode: 'getDefaultBeforePrompt',
                        blockType: Scratch.BlockType.REPORTER,
                        disableMonitor: true,
                        text: 'Get default before prompt',
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "Text Generation" },
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

                    { blockType: Scratch.BlockType.LABEL, text: "Text Formatting" },
                    {
                        opcode: 'getListAsArray',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get list [LIST] as array',
                        disableMonitor: true,
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "lists",
                            },
                        },
                    },
                    
                    {
                        opcode: 'formatMessage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Format [PROMPT] as format [FORMAT] with before prompt [BRFOREPROMPT]',
                        disableMonitor: true,
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, what is your name?',
                            },
                            FORMAT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "formats",
                            },
                            BRFOREPROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "default",
                            },
                        },
                    },

                    {
                        opcode: 'replaceWithNewlines',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Replace all [THING] in [MESSAGE] with line breaks',
                        arguments: {
                            THING: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '\\n',
                            },
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello everybody! \n Who wants to make something?',
                            },
                        },
                    },
                    {
                        opcode: 'replaceNewlinesWith',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Replace all line breaks in [MESSAGE] with [THING]',
                        arguments: {
                            THING: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '\\n',
                            },
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: `Hello everybody! 
Who wants to make something?`,
                            },
                        },
                    },

                    {
                        opcode: 'cutMessage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Cut message [MESSAGE] and keep roles [ROLES]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'include an ai message here',
                            },
                            ROLES: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Kobold, Assistant',
                            },
                        },
                    },

                    { blockType: Scratch.BlockType.LABEL, text: "Image Generation" },
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
                ],
                menus: {
                    lists: {
                        acceptReporters: false,
                        items: "getLists"
                    },
					ModelTypes: {
						acceptReporters: false,
						items: ['text', 'image'],
					},
                    formats: {
						acceptReporters: false,
						items: [
                            { text: "Single message", value: "SingleMessage" },
                            { text: "Multi message chat (from array)", value: "MultiMessageChat" }
                        ],
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

        changeBaseAPI({URL}) {
            this.base = URL;
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

        async getUsers() {
            return Scratch.fetch(`${this.base}/v2/users`)
                .then((res) => res.json())
                .then((dat) => JSON.stringify(dat))
                .catch((err) => err.message);
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

        async getWorkers() {
            return Scratch.fetch(`${this.base}/v2/workers`)
                .then((res) => res.json())
                .then((dat) => JSON.stringify(dat))
                .catch((err) => err.message);
        }
        
        async getWorkerData({ID}) {
            return Scratch.fetch(`${this.base}/v2/workers/${ID}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => res.json())
            .then((dat) => JSON.stringify(dat))
            .catch((err) => err.message);
        }

        getDefaultBeforePrompt() {
            return this.beforePrompt;
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

        async apiModeStatus() {
            return Scratch.fetch(`${this.base}/v2/status/modes`)
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

        getListAsArray({LIST}, util) {
            var list = this.getList(LIST, util);
            if (list) {
                return JSON.stringify(list.value);
            } else {
                return "";
            }
        }

        formatMessage({PROMPT, FORMAT, BRFOREPROMPT}, util) {
            var formattedprompt = null;
            if (BRFOREPROMPT == "default") {
                BRFOREPROMPT = false;
            } else {
                if (!BRFOREPROMPT.startsWith("{{System}}")) {
                    BRFOREPROMPT = "{{System}}: " + BRFOREPROMPT;
                }
            }

            if (FORMAT == "SingleMessage") {
                return `${BRFOREPROMPT || this.beforePrompt}

{{User}}: ${PROMPT}

{{${BRFOREPROMPT?"Assistant":"Kobold"}}}: `;
            } else if (FORMAT == "MultiMessageChat") {
                try {
                    formattedprompt = JSON.parse(PROMPT);
                } catch (err) {
                    formattedprompt = null;
                }
                
                if (Array.isArray(formattedprompt)) {
                    if (formattedprompt.every(item =>
                        item && typeof item === 'object' &&
                        item.hasOwnProperty('content') &&
                        item.hasOwnProperty('role')
                    )) {
                        formattedprompt = formattedprompt.map((item) => {
                            return `${item.role}: ${item.content}`
                        }).join(' \n')
                        if (!formattedprompt.includes("{{system}}")) {
                            formattedprompt =  `${(BRFOREPROMPT || this.beforePrompt)} \n${formattedprompt}`;
                        }
                        return formattedprompt;
                    } else if (formattedprompt.every(item => Array.isArray(item))) {
                        formattedprompt = formattedprompt.map(subArr => subArr.join(': ')).join(' \n');
                        if (!formattedprompt.includes("{{system}}")) {
                            formattedprompt =  `${(BRFOREPROMPT || this.beforePrompt)} \n${formattedprompt}`;
                        }
                        return formattedprompt;
                    } else {
                        formattedprompt = formattedprompt.join(' \n')
                        if (!formattedprompt.includes("{{system}}")) {
                            formattedprompt =  `${(BRFOREPROMPT || this.beforePrompt)} \n${formattedprompt}`;
                        }
                        return formattedprompt;
                    }
                } else {
                    return "Error: message array format incorrect"
                }                
            } else {
                return PROMPT;
            }
        }

        cutMessage({MESSAGE, ROLES}) {
            const rolesArray = ROLES.toLowerCase().split(",").map(role => role.trim());
            let result = "";
        
            const parts = MESSAGE.split(/({{[^}]+}}:)/);
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith("{{") && part.endsWith("}}:")) {
                    const role = part.slice(2, -2).split(":")[0].toLowerCase().trim();
                    if (!rolesArray.includes(role)) {
                        break;
                    }
                }
                result += part;
            }

            if (!result || ROLES.toLowerCase() === "any" || result == MESSAGE) {
                const punctuation = /[\]\}\.\>\/\?%\@\!\*\|\~]$/;
                const minLength = 5;
              
                let trimmedMessage = MESSAGE.replace(/\n/g, ' ').trim();
                
                if (punctuation.test(trimmedMessage)) {
                  return trimmedMessage;
                }
              
                const lastValidIndex = Math.max(
                  trimmedMessage.lastIndexOf(']'),
                  trimmedMessage.lastIndexOf('}'),
                  trimmedMessage.lastIndexOf('.'),
                  trimmedMessage.lastIndexOf('>'),
                  trimmedMessage.lastIndexOf('?'),
                  trimmedMessage.lastIndexOf('/'),
                  trimmedMessage.lastIndexOf('%'),
                  trimmedMessage.lastIndexOf('@'),
                  trimmedMessage.lastIndexOf('!'),
                  trimmedMessage.lastIndexOf('*'),
                  trimmedMessage.lastIndexOf('|'),
                  trimmedMessage.lastIndexOf('~')
                );
              
                if (lastValidIndex === -1 || trimmedMessage.length - lastValidIndex < minLength) {
                  return MESSAGE.trim();
                }
              
                trimmedMessage = trimmedMessage.slice(0, lastValidIndex + 1);
                return trimmedMessage.trim();
            }
        
            return result.trim();
        }

        replaceWithNewlines({THING, MESSAGE}) {
            return MESSAGE.replace(THING, `\n`);
        }

        replaceNewlinesWith({THING, MESSAGE}) {
            return MESSAGE.replace(`\n`, THING);
        }
    }
    Scratch.extensions.register(new p7KoboldAI());

    var MenuIcon = ``;
    var BlockIcon = ``;
})(Scratch);
