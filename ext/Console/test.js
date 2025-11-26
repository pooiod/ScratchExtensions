(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    const EXTENSION_ID = 'P7Console';
    const HAT_OPCODE = 'onCommand';
    const REPORTER_OPCODE = 'getInput';
    const FULL_HAT_ID = `${EXTENSION_ID}_${HAT_OPCODE}`;
    const FULL_REPORTER_ID = `${EXTENSION_ID}_${REPORTER_OPCODE}`;

    class ConsoleCommandExtension {
        getInfo() {
            return {
                id: EXTENSION_ID,
                name: 'Console Commands',
                color1: '#5cb1d6',
                blocks: [
                    {
                        blockType: Scratch.BlockType.XML,
                        xml: `
                            <block type="${FULL_HAT_ID}">
                                <value name="NAME">
                                    <shadow type="text">
                                        <field name="TEXT">help</field>
                                    </shadow>
                                </value>
                                <value name="variableHere">
                                    <block type="${FULL_REPORTER_ID}"/>
                                </value>
                            </block>
                        `
                    },
                    {
                        opcode: HAT_OPCODE,
                        blockType: Scratch.BlockType.HAT,
                        text: 'When console command [NAME] run [variableHere]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'help'
                            },
                            variableHere: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        },
                        isEdgeActivated: false,
                        hideFromPalette: true
                    },
                    {
                        opcode: REPORTER_OPCODE,
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'args',
                        disableMonitor: true,
                        hideFromPalette: true
                    }
                ]
            };
        }

        commandData() {
            return 'data';
        }

        onCommand(args) {
            return true; 
        }
    }

    Scratch.extensions.register(new ConsoleCommandExtension());

    setTimeout(() => {
        const SB = window.ScratchBlocks;
        
        if (!SB || !SB.Blocks[FULL_HAT_ID]) {
            return;
        }

        const originalInit = SB.Blocks[FULL_HAT_ID].init;

        SB.Blocks[FULL_HAT_ID].init = function() {
            if (originalInit) {
                originalInit.call(this);
            }

            this.setOnChange(function(changeEvent) {
                if (!this.workspace || this.isInFlyout) return;
                if (this.workspace.isDragging()) return;

                const input = this.getInput('variableHere');
                if (input && !input.connection.targetConnection) {
                    SB.Events.disable();
                    try {
                        const newBlock = this.workspace.newBlock(FULL_REPORTER_ID);
                        newBlock.initSvg();
                        newBlock.render();
                        newBlock.outputConnection.connect(input.connection);
                    } finally {
                        SB.Events.enable();
                    }
                }
            });
        };
    }, 100);

})(Scratch);
