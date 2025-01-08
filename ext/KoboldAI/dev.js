// This extension is super early in development

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    function mergeJSON(json1, json2) {
        if (typeof json2 === 'string') {
            try {
                json2 = JSON.parse(`{${json2}}`);
            } catch {
                return json1;
            }
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

    class p7KoboldAI {
        constructor() {
            this.base = "//stablehorde.net/api";
            this.key = "0000000000";
        }

        getInfo() {
            return {
                id: 'p7KoboldAI',
                name: 'Kobold AI',
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
                        opcode: 'apiPerformance',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get api status',
                    },
                    {
                        opcode: 'apiPerformance',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get api performance',
                    },
                    {
                        opcode: 'startTextGen',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Start text generation [PROMPT] from model [MODEL] with config [CONFIG]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'The quick orange fox jumped over the lazy dog, then the dog responded',
                            },
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'any',
                            },
                            CONFIG: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'max_context_length: 1024, singleline: false, temperature: 5, max_length: 150,',
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
                ],
                menus: {
					ModelTypes: {
						acceptReporters: false,
						items: ['text', 'image'],
					}
				},
            };
        }

        setKey({KEY}) {
            this.key = KEY;
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
                const response = await fetch(`${this.base}/v2/generate/text/async`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.key
                    },
                    body: JSON.stringify({
                        prompt: PROMPT,
                        params: mergeJSON({
                            n: 1,
                            models: [MODEL]
                        }, CONFIG)
                    })
                });
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
    }
    Scratch.extensions.register(new p7KoboldAI());
})(Scratch);
