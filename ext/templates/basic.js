// Scratch3 basic extension template

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class extexample {
        constructor() {
            this.thing = 0;
        }

        getInfo() {
            return {
                id: 'extexample',
                name: 'Example Extension',
                blocks: [
                    {
                        opcode: 'func',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'a block [VAL]',
                        arguments: {
                            VAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'REEEEEEEEEE',
                            },
                        },
                    }
                ]
            };
        }

        func(args) {
            console.log(args);
        }
    }
    Scratch.extensions.register(new extexample());
})(Scratch);
