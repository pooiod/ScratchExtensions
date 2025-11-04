// Name: Page Opener
// ID: p7PageOpener
// Description: Open web links from scratch
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main legacy
// Unsandboxed: true
// WIP: false
// Created: Dec 5, 2024

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class winopen {
        getInfo() {
            return {
                id: 'p7PageOpener',
                name: 'Page Opener',
                color1: "#8955f2",
                color2: "#7f4ee0",
                blocks: [
                    {
                        opcode: 'redirect',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Open [URL] in the current tab',
                        arguments: {
                            URL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'https://example.com',
                            }
                        },
                    },
                    {
                        opcode: 'openTab',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Open [URL] in new tab',
                        arguments: {
                            URL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'https://example.com',
                            }
                        },
                    },
                    {
                        opcode: 'openWindow',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Open [URL] in new window with settings [SETTINGS]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://example.com',
                            },
                            SETTINGS: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'width=480, height=360',
                            }
                        },
                    }
                ]
            };
        }

        openTab({ URL }) {  
            window.open(URL, '_blank');
        }

        redirect({ URL }) {  
            window.location.href = URL;
        }

        openWindow({ URL, SETTINGS }) {  
            window.open(URL, '_blank', SETTINGS);
        }
    }

    Scratch.extensions.register(new winopen());
})(Scratch);
