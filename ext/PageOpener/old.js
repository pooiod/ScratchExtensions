// Simple page opening extension

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  class winopen {
    constructor() {
      this.thing = 0;
    }

    getInfo() {
      return {
        id: 'winopen',
        name: 'Page Opener',
        blocks: [
          {
            opcode: 'openURL',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Open [URL] in [TARGET]',
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com',
              },
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: 'targetMenu',
                defaultValue: 'New Tab',
              },
            },
          },
        ],
        menus: {
          targetMenu: {
            items: [
              { text: 'New Tab', value: 'New Tab' },
              { text: 'New Window', value: 'New Window' },
            ],
          },
        },
      };
    }

    openURL(args) {
      const { URL, TARGET } = args;

      if (TARGET === 'New Tab') {
        window.open(URL, '_blank');
      } else if (TARGET === 'New Window') {
        window.open(URL, '_blank', 'width=480,height=360');
      }
    }
  }

  Scratch.extensions.register(new winopen());
})(Scratch);
