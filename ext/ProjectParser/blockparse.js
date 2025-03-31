class JSONParserExtension {
    getInfo() {
        return {
            id: 'jsonparser',
            name: 'JSON Parser',
            blocks: [
                {
                    opcode: 'getStacks',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Get stack ids from json [JSON]',
                    arguments: {
                        JSON: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: 'getStack',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Get stack [ID] from json [JSON]',
                    arguments: {
                        JSON: {
                            type: Scratch.ArgumentType.STRING
                        },
                        ID: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: 'getBlocks',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Get block ids from stack [JSON]',
                    arguments: {
                        JSON: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                }
                {
                    opcode: 'getBlock',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Get block [ID] from stack [JSON]',
                    arguments: {
                        JSON: {
                            type: Scratch.ArgumentType.STRING
                        },
                        ID: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: 'parseBlock',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'Get [PROP] from block [JSON]',
                    arguments: {
                        JSON: {
                            type: Scratch.ArgumentType.STRING
                        },
                        PROP: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'propsMenu'
                        }
                    }
                }
            ],
            menus: {
                propsMenu: ['opcode', 'category', 'parent', 'inputs', 'fields', 'x', 'y', 'next']
            }
        };
    }

    getStacks(args) {
        const json = JSON.parse(args.JSON);
        return Object.keys(json).filter(id => json[id].topLevel).join(',');
    }

    getStack(args) {
        const json = JSON.parse(args.JSON);
        const id = args.ID;
        const stack = {};
        let current = id;
        while (current) {
            stack[current] = json[current];
            current = json[current].next;
        }
        return JSON.stringify(stack);
    }

    getBlock(args) {
        const json = JSON.parse(args.JSON);
        return JSON.stringify(json[args.ID] || {});
    }

    parseBlock(args) {
        const block = JSON.parse(args.JSON);
        const prop = args.PROP;
        switch (prop) {
            case 'opcode': return block.opcode.split('_')[1];
            case 'category': return block.opcode.split('_')[0];
            case 'parent': return block.parent || '';
            case 'inputs': return JSON.stringify(block.inputs || {});
            case 'fields': return JSON.stringify(block.fields || {});
            case 'x': return block.x || 0;
            case 'y': return block.y || 0;
            case 'next': return block.next || '';
            default: return '';
        }
    }

    getBlocks(args) {
        const json = JSON.parse(args.JSON);
        return Object.keys(json).join(',');
    }
}

Scratch.extensions.register(new JSONParserExtension());
