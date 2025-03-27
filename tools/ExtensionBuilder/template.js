/** This is a basic template extension */

(function(Scratch) {
    'use strict';

    // part:Before
    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    // end

    // part:ClassStart
    class extexample {
        // func
        constructor() {
            this.thing = 0;
        }
        // end

        // part:getinfo
        getInfo() {
            return {
                // part:props
                id: 'extexample',
                name: 'Example Extension',
                // end

                blocks: [
                    // part:blocks
                    {
                        opcode: 'Block1',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'A block [VAL]',
                        arguments: {
                            VAL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'REEEEEEEEEE',
                            },
                        },
                    }
                    // end
                ]
            };
        }
        // end

        // func
        Block1(args) {
            console.log(args);
        }
        // end
    }
    Scratch.extensions.register(new extexample());
})(Scratch);
