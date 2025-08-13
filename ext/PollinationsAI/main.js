// Pollinations.ai Extension by pooiod7

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    const CHAT_API_URL = 'https://text.pollinations.ai/openai';
    const IMAGE_API_URL = 'https://image.pollinations.ai/prompt/';

    class PollinationsExtension {
        constructor() {
            this.chats = {};
            this.lastAnswers = {};

            this.imageModels = [];
            this.fetchImageModels();
        }

        getInfo() {
            return {
                id: 'pollinations',
                name: 'Pollinations ai',
                color1: '#cfc813',
                blocks: [
                    {
                        opcode: 'singlePrompt',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Generate text from prompt [PROMPT]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'What is the capital of France?',
                            },
                        },
                    },
                    '---',
                    {
                        opcode: 'createChat',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create chat session [chatID]',
                        arguments: {
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    {
                        opcode: 'informChat',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set system message for [chatID] to [inform]',
                        arguments: {
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            },
                            inform: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Your name is apple.'
                            }
                        },
                    },
                    {
                        opcode: 'advancedPrompt',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get response from [chatID] for prompt [PROMPT]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello!',
                            },
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    '---',
                    {
                        opcode: 'generateImage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Generate image with prompt [PROMPT] using model [MODEL]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'A photorealistic cat wearing a suit and tie',
                            },
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'imageModels'
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'lastGeneration',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Last [type] from [chatID]',
                        arguments: {
                            type: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'types',
                            },
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    '---',
                    {
                        opcode: 'listChats',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Active chats',
                        disableMonitor: true,
                    },
                    {
                        opcode: 'exportChat',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Export chat history of [chatID] as JSON',
                        arguments: {
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    {
                        opcode: 'importChat',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Import chat history from [json] to [chatID]',
                        arguments: {
                            json: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '[]'
                            },
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    {
                        opcode: 'resetChat',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Reset chat history of [chatID]',
                        arguments: {
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    {
                        opcode: 'removeChat',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Delete chat session [chatID]',
                        arguments: {
                            chatID: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'MyChat'
                            }
                        },
                    },
                    {
                        opcode: 'exportAll',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Export all chats as JSON',
                        disableMonitor: true,
                    },
                    {
                        opcode: 'importAll',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Import all chats from [json] and [merge]',
                        arguments: {
                            json: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            },
                            merge: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'merge',
                            }
                        },
                    },
                ],
                menus: {
                    types: {
                        acceptReporters: true,
                        items: ['prompt', 'generated text']
                    },
                    merge: {
                        acceptReporters: true,
                        items: ['merge with existing chats', 'remove all and import']
                    },
                    imageModels: {
                        acceptReporters: true,
                        items: this.imageModels.length > 0 ? this.imageModels : ['default']
                    },
                }
            };
        }

        async fetchImageModels() {
            try {
                const response = await fetch('https://image.pollinations.ai/models');
                if (!response.ok) return;
                this.imageModels = await response.json();
            } catch (error) {
                console.error('Error fetching image models:', error);
            }
        }

        async singlePrompt(args) {
            try {
                const response = await fetch(`${CHAT_API_URL}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "gpt-4",
                        messages: [{ role: "user", content: args.PROMPT }]
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', response.status, errorText);
                    return `Error: ${response.status}`;
                }

                const data = await response.json();
                if (!data.choices || data.choices.length === 0) return 'Error: Invalid API response.';

                return data.choices[0].message.content;
            } catch (error) {
                console.error(error);
                return 'Error';
            }
        }

        createChat(args) {
            this.chats[args.chatID] = [];
            this.lastAnswers[args.chatID] = { prompt: '', answer: '' };
        }

        informChat(args) {
            if (!this.chats[args.chatID]) {
                this.createChat(args);
            }
            this.chats[args.chatID].push({ role: 'system', content: args.inform });
        }

        async advancedPrompt(args) {
            if (!this.chats[args.chatID]) {
                this.createChat(args);
            }

            let messages = this.chats[args.chatID].slice();
            messages.push({ role: 'user', content: args.PROMPT });

            try {
                const response = await fetch(CHAT_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "gpt-4",
                        messages: messages
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', response.status, errorText);
                    return `Error: ${response.status}`;
                }

                const data = await response.json();
                if (!data.choices || data.choices.length === 0) {
                     console.error('Invalid response from API:', data);
                    return 'Error: Invalid response from API.';
                }

                const answer = data.choices[0].message.content;
                this.chats[args.chatID].push({ role: 'user', content: args.PROMPT });
                this.chats[args.chatID].push({ role: 'assistant', content: answer });
                this.lastAnswers[args.chatID] = { prompt: args.PROMPT, answer: answer };
                return answer;

            } catch (error) {
                console.error('Error with advanced prompt:', error);
                return 'Error processing your request.';
            }
        }

        async generateImage(args) {
            const url = `${IMAGE_API_URL}${encodeURIComponent(args.PROMPT)}?model=${args.MODEL}`;
            try {
                const response = await fetch(url);
                if (!response.ok) return 'Error generating image.';
                const blob = await response.blob();
                const reader = new FileReader();
                return new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error('Image generation error:', error);
                return 'Error generating image.';
            }
        }

        lastGeneration(args) {
            const last = this.lastAnswers[args.chatID];
            if (!last) return '';
            return args.type === 'prompt' ? last.prompt : last.answer;
        }

        listChats() {
            return JSON.stringify(Object.keys(this.chats));
        }

        exportChat(args) {
            if (!this.chats[args.chatID]) return '[]';
            return JSON.stringify(this.chats[args.chatID]);
        }

        importChat(args) {
            try {
                const history = JSON.parse(args.json);
                if (Array.isArray(history)) {
                    this.chats[args.chatID] = history;
                }
            } catch (e) {
                console.error('Invalid JSON for import');
            }
        }

        resetChat(args) {
            if (this.chats[args.chatID]) {
                this.chats[args.chatID] = [];
                this.lastAnswers[args.chatID] = { prompt: '', answer: '' };
            }
        }

        removeChat(args) {
            delete this.chats[args.chatID];
            delete this.lastAnswers[args.chatID];
        }

        exportAll() {
            return JSON.stringify(this.chats);
        }

        importAll(args) {
            try {
                const newChats = JSON.parse(args.json);
                if (typeof newChats !== 'object' || newChats === null) return;
                if (args.merge.includes('remove')) {
                    this.chats = newChats;
                } else {
                    this.chats = { ...this.chats, ...newChats };
                }
            } catch (e) {
                console.error('Invalid JSON for import all');
            }
        }
    }

    Scratch.extensions.register(new PollinationsExtension());
})(Scratch);
