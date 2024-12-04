// Work in progress (scroll detector by pooiod7)

(function (Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
      throw new Error('This extension must run unsandboxed');
    }
  
    class ScrollExtension {
      constructor(runtime) {
        this.isScrolling = false;
        this.yvel = 0;
        this.xvel = 0;
  
        document.addEventListener('wheel', this.handleScroll.bind(this), true);
      }
  
      getInfo() {
        return {
          id: 'p7ScrollUtilities',
          name: 'Scroll Utilities',
          color1: '#4CAF50',
          color2: '#45A164',
          blocks: [
            {
              opcode: 'getScrollYVelocity',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Scroll Y Velocity',
            },
            {
              opcode: 'getScrollXVelocity',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Scroll X Velocity',
            },
            {
              opcode: 'scrolldetect',
              blockType: Scratch.BlockType.BOOLEAN,
              text: 'Scrolling?',
            },
          ],
        };
      }
  
      getScrollYVelocity() {
        const vel = this.yvel;
        this.yvel /= 5;
        return vel;
      }
      
      getScrollXVelocity() {
        const vel = this.xvel;
        this.xvel /= 5;
        return vel;
      }
  
      scrolldetect() {
        return (Math.round(this.yvel) !== 0) || (Math.round(this.xvel) !== 0);
      }
  
      handleScroll(scrolldata) {
        this.yvel = parseInt(scrolldata.deltaY);
        this.xvel = parseInt(scrolldata.deltaX);
        this.isScrolling = true;
      }
    }
  
    Scratch.extensions.register(new ScrollExtension());
  })(Scratch);
  