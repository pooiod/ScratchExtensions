// Name: Scroll Utilities
// ID: p7ScrollUtilities
// Description: Detect user scrolling on the page
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main dev
// Unsandboxed: true
// WIP: true
// Created: Oct 5, 2023

(function (Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class ScrollExtension {
		constructor() {
			this.isScrolling = false;
			this.yvel = 0;
			this.xvel = 0;
			this.zvel = 0;
			this.timeout = null;

			document.addEventListener('wheel', this.handleScroll.bind(this), {
				capture: true,
				passive: false
			});

			// Scratch.vm.runtime.on('BEFORE_EXECUTE', () => {});
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
						text: 'Scroll Y velocity',
					},
					{
						opcode: 'getScrollXVelocity',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Scroll X velocity',
					},
					{
						opcode: 'getScrollZVelocity',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Scroll Z velocity',
					},

					{
						opcode: 'scrolldetect',
						blockType: Scratch.BlockType.BOOLEAN,
						text: 'Scrolling?',
					},

					{
						blockType: Scratch.BlockType.EVENT,
						opcode: 'onscroll',
						text: 'On page scrolled',
						isEdgeActivated: false
					  }
				],
			};
		}

		getScrollYVelocity() {
			return this.yvel;
		}
		
		getScrollXVelocity() {
			return this.xvel;
		}

		getScrollZVelocity() {
			return this.zvel;
		}

		scrolldetect() {
			return this.isScrolling;
		}

		handleScroll(scrolldata) {
			if (scrolldata.target && scrolldata.target.tagName === 'CANVAS') {
				scrolldata.preventDefault();
			}

			this.xvel = parseInt(scrolldata.deltaX);
			this.isScrolling = true;

			if (scrolldata.ctrlKey) {
				this.yvel = 0;
				this.zvel = parseInt(scrolldata.deltaY);
			} else {
				this.zvel = parseInt(scrolldata.deltaZ);
				this.yvel = parseInt(scrolldata.deltaY);
			}

			if (scrolldata.shiftKey) {
				var tmpy = this.yvel;
				this.yvel = this.xvel;
				this.xvel = tmpy;
			}

			Scratch.vm.runtime.startHats('p7ScrollUtilities_onscroll');

			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.timeout = null;
				if (this.isScrolling) {
					this.isScrolling = false;
					this.yvel = 0;
					this.xvel = 0;
					this.zvel = 0;
				}
			}, 50);
		}
	}

	Scratch.extensions.register(new ScrollExtension());
})(Scratch);
