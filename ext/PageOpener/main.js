// A simple page opening extension by pooiod7

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

        openWindow({ URL, SETTINGS }) {  
            window.open(URL, '_blank', SETTINGS);
        }
    }

    Scratch.extensions.register(new winopen());
})(Scratch);
