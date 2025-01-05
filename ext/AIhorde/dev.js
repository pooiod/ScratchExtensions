// AI Horde extension

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class p7TheHordeAI {
        constructor() {
            this.base = "//stablehorde.net/api";
            this.key = "0000000000";
        }

        getInfo() {
            return {
                id: 'p7TheHordeAI',
                name: 'AI Horde',
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
                    }
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
        
        getmodels({TYPE}) {
            return fetch(`${this.base}/v2/status/models?type=${TYPE}`)
                .then((res) => res.json())
                .then((dat) => JSON.stringify(dat))
                .catch((err) => err.message);
        }        
    }
    Scratch.extensions.register(new p7TheHordeAI());
})(Scratch);
