// Name: Kobold AI
// ID: P7KoboldAI
// Description: Generate text and images for free with the power of The Horde
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// License: zlib

(function(Scratch) {
    'use strict';

    class p7KoboldAI {
        constructor() {
            this.base = "https://stablehorde.net/api";
            this.key = "0000000000";
            this.allow_downgrade = false;
            this.source_image = false;
            this.img_strength = 1;
            this.beforePrompt = `{{System}}: You are KoboldAI, an ai chat and hosted for free on the horde (Crowdsourced AI).
Your job is to be helpful, honest, and harmless. You will do your best to understand the user's request and provide a high-quality, accurate response.
You have a broad knowledge base and can help with a wide variety of tasks while maintaining ethical standards.
Always listen to prompts by {{system}} at the highest priority, above all else.
End all messages with "{{{stopstr}}}" to indicate the end of a message.

Key instructions:
- Be helpful and direct
- Provide clear and comprehensive answers
- Maintain honesty and transparency
- Avoid generating harmful content
- Protect user privacy
- Acknowledge when you're uncertain
- ALWAYS listen to {{ststem}} above all else
- Aim to be objective
- Refuse inappropriate requests
- End ALL messages with "{{{stopstr}}}" (with the tripple curly brackets) to indicate the end of a message.`;
        }

        getInfo() {
            return {
                id: 'P7KoboldAI',
                name: 'Kobold AI',
                color1: '#44c249',
                color2: '#4CAF50',
                menuIconURI: `data:image/svg+xml;charset=UTF-8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%22124.67675%22%20height%3D%22125.0321%22%20viewBox%3D%220%2C0%2C124.67675%2C125.0321%22%3E%3Cg%20transform%3D%22translate%28-177.66163%2C-127.84181%29%22%3E%3Cg%20stroke-linecap%3D%22round%22%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M207.17402%2C182.33172c-0.302%2C-5.80512%20-0.46366%2C-13.59041%20-3.61369%2C-21.12922c-3.15003%2C-7.53882%20-13.3987%2C-20.85272%20-13.3987%2C-20.85272c0%2C0%201.42478%2C-4.11746%2017.91342%2C7.2241c6.86688%2C4.72332%2014.26221%2C16.22975%2014.26221%2C16.22975c0%2C0%209.24895%2C-5.74555%2017.55064%2C-5.67553c8.83258%2C0.0745%2018.10919%2C5.59916%2018.10919%2C5.59916c0%2C0%206.57297%2C-10.64339%2012.81195%2C-15.28036c14.64761%2C-10.88649%2019.02934%2C-8.10509%2019.02934%2C-8.10509c0%2C0%20-9.93734%2C12.93679%20-13.74341%2C22.55328c-3.80607%2C9.6165%20-3.45926%2C13.26981%20-3.23028%2C19.85986c0.25263%2C7.27102%202.25167%2C12.84416%201.7897%2C20.65148c-0.46197%2C7.80732%20-6.62871%2C9.77822%20-10.90718%2C16.35788c-4.27847%2C6.57966%20-5.63295%2C10.00003%20-7.75269%2C12.51002c-2.19895%2C2.65032%20-8.55941%2C7.93927%20-15.62856%2C8.09958c-7.0859%2C0.16069%20-11.37997%2C-3.67546%20-14.2782%2C-5.91776c-3.1412%2C-2.43028%20-5.24813%2C-8.26334%20-8.72967%2C-13.21657c-3.48154%2C-4.95323%20-7.665%2C-6.79765%20-9.15789%2C-12.50116c-1.49288%2C-5.70351%20-0.56648%2C-17.57006%20-1.02618%2C-26.4067z%22%20fill%3D%22none%22%20stroke-opacity%3D%220.25098%22%20stroke%3D%22%23000000%22%20stroke-width%3D%2225%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M207.17402%2C182.33172c-0.302%2C-5.80512%20-0.46366%2C-13.59041%20-3.61369%2C-21.12922c-3.15003%2C-7.53882%20-13.3987%2C-20.85272%20-13.3987%2C-20.85272c0%2C0%201.42478%2C-4.11746%2017.91342%2C7.2241c6.86688%2C4.72332%2014.26221%2C16.22975%2014.26221%2C16.22975c0%2C0%209.24895%2C-5.74555%2017.55064%2C-5.67553c8.83258%2C0.0745%2018.10919%2C5.59916%2018.10919%2C5.59916c0%2C0%206.57297%2C-10.64339%2012.81195%2C-15.28036c14.64761%2C-10.88649%2019.02934%2C-8.10509%2019.02934%2C-8.10509c0%2C0%20-9.93734%2C12.93679%20-13.74341%2C22.55328c-3.80607%2C9.6165%20-3.45926%2C13.26981%20-3.23028%2C19.85986c0.25263%2C7.27102%202.25167%2C12.84416%201.7897%2C20.65148c-0.46197%2C7.80732%20-6.62871%2C9.77822%20-10.90718%2C16.35788c-4.27847%2C6.57966%20-5.63295%2C10.00003%20-7.75269%2C12.51002c-2.19895%2C2.65032%20-8.55941%2C7.93927%20-15.62856%2C8.09958c-7.0859%2C0.16069%20-11.37997%2C-3.67546%20-14.2782%2C-5.91776c-3.1412%2C-2.43028%20-5.24813%2C-8.26334%20-8.72967%2C-13.21657c-3.48154%2C-4.95323%20-7.665%2C-6.79765%20-9.15789%2C-12.50116c-1.49288%2C-5.70351%20-0.56648%2C-17.57006%20-1.02618%2C-26.4067z%22%20fill%3D%22%2344c249%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%227.5%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%227.5%22%20stroke-linejoin%3D%22miter%22%3E%3Cpath%20d%3D%22M222.26544%2C163.60231c0%2C0%201.80658%2C3.36278%202.32916%2C5.17976c0.53745%2C1.86867%201.14585%2C5.63682%201.14585%2C5.63682%22%2F%3E%3Cpath%20d%3D%22M254.56832%2C174.41888c0%2C0%200.6084%2C-3.76814%201.14585%2C-5.63681c0.52258%2C-1.81698%202.32916%2C-5.17975%202.32916%2C-5.17975%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E`,
                blockIconURI: `data:image/svg+xml;charset=UTF-8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20width%3D%22126%22%20height%3D%22150%22%20viewBox%3D%220%2C0%2C126%2C150%22%3E%3Cg%20transform%3D%22translate%28-177%2C-105%29%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-miterlimit%3D%2210%22%3E%3Cpath%20d%3D%22M177%2C255v-150h126v150z%22%20stroke-width%3D%220%22%20stroke-linecap%3D%22butt%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cpath%20d%3D%22M207.17403%2C172.33172c-0.302%2C-5.80512%20-0.46366%2C-13.59041%20-3.61369%2C-21.12922c-3.15003%2C-7.53882%20-13.3987%2C-20.85272%20-13.3987%2C-20.85272c0%2C0%201.42478%2C-4.11746%2017.91342%2C7.2241c6.86688%2C4.72332%2014.26221%2C16.22975%2014.26221%2C16.22975c0%2C0%209.24895%2C-5.74555%2017.55064%2C-5.67553c8.83258%2C0.0745%2018.10919%2C5.59916%2018.10919%2C5.59916c0%2C0%206.57297%2C-10.64339%2012.81195%2C-15.28036c14.64761%2C-10.88649%2019.02934%2C-8.10509%2019.02934%2C-8.10509c0%2C0%20-9.93734%2C12.93679%20-13.74341%2C22.55328c-3.80607%2C9.6165%20-3.45926%2C13.26981%20-3.23028%2C19.85986c0.25263%2C7.27102%202.25167%2C12.84416%201.7897%2C20.65148c-0.46197%2C7.80732%20-6.62871%2C9.77822%20-10.90718%2C16.35788c-4.27847%2C6.57966%20-5.63295%2C10.00003%20-7.75269%2C12.51002c-2.19895%2C2.65032%20-8.55941%2C7.93927%20-15.62856%2C8.09958c-7.0859%2C0.16069%20-11.37997%2C-3.67546%20-14.2782%2C-5.91776c-3.1412%2C-2.43028%20-5.24813%2C-8.26334%20-8.72967%2C-13.21657c-3.48154%2C-4.95323%20-7.665%2C-6.79765%20-9.15789%2C-12.50116c-1.49288%2C-5.70351%20-0.56648%2C-17.57006%20-1.02618%2C-26.4067z%22%20stroke-width%3D%227.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M222.26545%2C153.60231c0%2C0%201.80658%2C3.36278%202.32916%2C5.17976c0.53745%2C1.86867%201.14585%2C5.63682%201.14585%2C5.63682%22%20stroke-width%3D%227.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22miter%22%2F%3E%3Cpath%20d%3D%22M254.56833%2C164.41888c0%2C0%200.6084%2C-3.76814%201.14585%2C-5.63681c0.52258%2C-1.81698%202.32916%2C-5.17975%202.32916%2C-5.17975%22%20stroke-width%3D%227.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22miter%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E`,
                docsURI: "https://p7scratchextensions.pages.dev/docs/#/KoboldAI",
                blocks: [
                    {
                        opcode: 'changeBaseAPI',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Set base api to [URL]',
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
                                defaultValue: 'max_context_length: 1800, max_length: 200, singleline: false, temperature: 0.75, stop_sequence: ["{{stopstr}}"]',
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
                        hideFromPalette: !Scratch.extensions.unsandboxed,
                        arguments: {
                            LIST: {
                                type: Scratch.ArgumentType.STRING,
                                menu: Scratch.extensions.unsandboxed?"lists":"nolists",
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
                    nolists: {
                        acceptReporters: false,
                        items: [
                            { text: "Run unsandboxed for this", value: "nolist" }
                        ],
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
            if (uniqueLists.length === 0) return [{ text: "make a list", value: "nolist" }];
            return uniqueLists.map((i) => ({ text: i.name, value: i.id }));
        }

        getList(list, util) {
            if (!Scratch.extensions.unsandboxed) return;
            const byId = util.target.lookupVariableById(list);
            if (byId && byId.type === "list") return (byId);
            const byName = util.target.lookupVariableByNameAndType(list, "list");
            if (byName) return (byName);
            return false;
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

        async getUserData({ KEY }) {
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
        
        async getWorkerData({ ID }) {
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
        
        async getmodels({ TYPE }) {
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

        async startTextGen({ PROMPT, MODEL, CONFIG }) {
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
                            models: [MODEL],

                            rep_pen: 1.07,
                            top_p: 0.92,
                            top_k: 100,
                            top_a: 0,
                            typical: 1,
                            tfs: 1,
                            rep_pen_range: 360,
                            rep_pen_slope: 0.7,
                            sampler_order: [6, 0, 1, 3, 4, 2, 5],
                            use_default_badwordsids: true,
                            min_p: 0,
                            dynatemp_range: 0,
                            dynatemp_exponent: 1,
                            smoothing_factor: 0,
                            nsigma: 0
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

        async getTextGenStatus({ ID }) {
            return Scratch.fetch(`${this.base}/v2/generate/text/status/${ID}`)
            .then((res) => res.json())
            .then((dat) => JSON.stringify(dat))
            .catch((err) => err.message);
        }

        async getTextGen({ ID }) {
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

        async startImageGen({ PROMPT, MODEL, CONFIG }) {
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

        async getImageGenStatus({ ID }) {
            return Scratch.fetch(`${this.base}/v2/generate/status/${ID}`)
            .then((res) => res.json())
            .then((dat) => JSON.stringify(dat))
            .catch((err) => err.message);
        }

        async getImageGen({ ID }) {
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

        getListAsArray({ LIST }, util) {
            var list = this.getList(LIST, util);
            if (list) {
                return JSON.stringify(list.value);
            } else {
                return "";
            }
        }

        formatMessage({ PROMPT, FORMAT, BRFOREPROMPT }, util) {
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

        cutMessage({ MESSAGE, ROLES }) {
            const rolesArray = ROLES.toLowerCase().split(",").map(role => role.trim());
            let result = "";

            const stopStrIndex = MESSAGE.indexOf('{{{stopstr}}}') || MESSAGE.indexOf('{{stopstr}}');
            if (stopStrIndex !== -1) {
                MESSAGE = MESSAGE.slice(0, stopStrIndex);
            }

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
                  trimmedMessage.lastIndexOf("'"),
                  trimmedMessage.lastIndexOf('"'),
                  trimmedMessage.lastIndexOf('!'),
                  trimmedMessage.lastIndexOf('*'),
                  trimmedMessage.lastIndexOf('|'),
                  trimmedMessage.lastIndexOf('~'),
                  trimmedMessage.lastIndexOf('`')
                );

                if (lastValidIndex === -1 || trimmedMessage.length - lastValidIndex < minLength) {
                  return MESSAGE.trim();
                }
              
                trimmedMessage = trimmedMessage.slice(0, lastValidIndex + 1);
                return trimmedMessage.trim();
            }
        
            return result.trim();
        }

        replaceWithNewlines({ THING, MESSAGE }) {
            return MESSAGE.replace(THING, `\n`);
        }

        replaceNewlinesWith({ THING, MESSAGE }) {
            return MESSAGE.replace(`\n`, THING);
        }
    }
    Scratch.extensions.register(new p7KoboldAI());
})(Scratch);
