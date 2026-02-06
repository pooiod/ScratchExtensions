(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  const runtime = Scratch.vm.runtime;
  const Cast = Scratch.Cast;

  class StageMover {
    getInfo() {
      return {
        id: 'P7StageMover',
        name: 'Stage Mover',
        blocks: [
          {
            opcode: 'moveSteps',
            blockType: Scratch.BlockType.COMMAND,
            text: 'move stage [STEPS] steps',
            arguments: {
              STEPS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'turnRight',
            blockType: Scratch.BlockType.COMMAND,
            text: 'turn stage right [DEGREES] degrees',
            arguments: {
              DEGREES: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 15
              }
            }
          },
          {
            opcode: 'turnLeft',
            blockType: Scratch.BlockType.COMMAND,
            text: 'turn stage left [DEGREES] degrees',
            arguments: {
              DEGREES: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 15
              }
            }
          },
          '---',
          {
            opcode: 'goTo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'go to [TO]',
            arguments: {
              TO: {
                type: Scratch.ArgumentType.STRING,
                menu: 'goMenu'
              }
            }
          },
          {
            opcode: 'goToXY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'go to x: [X] y: [Y]',
            arguments: {
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'glideTo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'glide [SECS] secs to [TO]',
            arguments: {
              SECS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              },
              TO: {
                type: Scratch.ArgumentType.STRING,
                menu: 'goMenu'
              }
            }
          },
          {
            opcode: 'glideToXY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'glide [SECS] secs to x: [X] y: [Y]',
            arguments: {
              SECS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          '---',
          {
            opcode: 'pointInDirection',
            blockType: Scratch.BlockType.COMMAND,
            text: 'point stage in direction [DIRECTION]',
            arguments: {
              DIRECTION: {
                type: Scratch.ArgumentType.ANGLE,
                defaultValue: 90
              }
            }
          },
          {
            opcode: 'pointTowards',
            blockType: Scratch.BlockType.COMMAND,
            text: 'point stage towards [TOWARDS]',
            arguments: {
              TOWARDS: {
                type: Scratch.ArgumentType.STRING,
                menu: 'pointMenu'
              }
            }
          },
          '---',
          {
            opcode: 'changeX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change stage x by [DX]',
            arguments: {
              DX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'setX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set stage x to [X]',
            arguments: {
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'changeY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change stage y by [DY]',
            arguments: {
              DY: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'setY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set stage y to [Y]',
            arguments: {
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          '---',
          {
            opcode: 'getX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'stage x position'
          },
          {
            opcode: 'getY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'stage y position'
          },
          {
            opcode: 'getDirection',
            blockType: Scratch.BlockType.REPORTER,
            text: 'stage direction'
          }
        ],
        menus: {
          goMenu: {
            acceptReporters: true,
            items: ['random position', 'mouse-pointer']
          },
          pointMenu: {
            acceptReporters: true,
            items: ['mouse-pointer']
          }
        }
      };
    }

    getStage() {
      return runtime.getTargetForStage();
    }

    _update(stage) {
      if (stage.drawableID !== -1) {
        runtime.renderer.updateDrawablePosition(stage.drawableID, [stage.x, stage.y]);
        runtime.renderer.updateDrawableDirection(stage.drawableID, stage.direction);
      }
    }

    moveSteps(args) {
      const steps = Cast.toNumber(args.STEPS);
      const stage = this.getStage();
      const radians = (90 - stage.direction) * Math.PI / 180;
      stage.x += steps * Math.cos(radians);
      stage.y += steps * Math.sin(radians);
      this._update(stage);
    }

    turnRight(args) {
      const degrees = Cast.toNumber(args.DEGREES);
      const stage = this.getStage();
      stage.direction += degrees;
      this._update(stage);
    }

    turnLeft(args) {
      const degrees = Cast.toNumber(args.DEGREES);
      const stage = this.getStage();
      stage.direction -= degrees;
      this._update(stage);
    }

    goToXY(args) {
      const stage = this.getStage();
      stage.x = Cast.toNumber(args.X);
      stage.y = Cast.toNumber(args.Y);
      this._update(stage);
    }

    goTo(args) {
      const stage = this.getStage();
      const targetName = Cast.toString(args.TO);
      
      if (targetName === '_random_' || targetName === 'random position') {
        stage.x = Math.round(runtime.stageWidth * (Math.random() - 0.5));
        stage.y = Math.round(runtime.stageHeight * (Math.random() - 0.5));
      } else if (targetName === '_mouse_' || targetName === 'mouse-pointer') {
        stage.x = runtime.ioDevices.mouse.getScratchX();
        stage.y = runtime.ioDevices.mouse.getScratchY();
      } else {
        const targetSprite = runtime.getSpriteTargetByName(targetName);
        if (targetSprite) {
          stage.x = targetSprite.x;
          stage.y = targetSprite.y;
        }
      }
      this._update(stage);
    }

    glideToXY(args) {
      const secs = Cast.toNumber(args.SECS);
      const x = Cast.toNumber(args.X);
      const y = Cast.toNumber(args.Y);
      return this._glide(secs, x, y);
    }

    glideTo(args) {
      const secs = Cast.toNumber(args.SECS);
      const targetName = Cast.toString(args.TO);
      let x, y;

      if (targetName === '_random_' || targetName === 'random position') {
        x = Math.round(runtime.stageWidth * (Math.random() - 0.5));
        y = Math.round(runtime.stageHeight * (Math.random() - 0.5));
      } else if (targetName === '_mouse_' || targetName === 'mouse-pointer') {
        x = runtime.ioDevices.mouse.getScratchX();
        y = runtime.ioDevices.mouse.getScratchY();
      } else {
        const targetSprite = runtime.getSpriteTargetByName(targetName);
        if (targetSprite) {
          x = targetSprite.x;
          y = targetSprite.y;
        } else {
          return;
        }
      }
      return this._glide(secs, x, y);
    }

    _glide(secs, endX, endY) {
      const stage = this.getStage();
      const startX = stage.x;
      const startY = stage.y;
      const duration = Math.max(0, secs * 1000);
      const startTime = Date.now();

      return new Promise(resolve => {
        const tick = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const t = duration === 0 ? 1 : Math.min(1, elapsed / duration);
          
          stage.x = startX + (endX - startX) * t;
          stage.y = startY + (endY - startY) * t;
          this._update(stage);

          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        tick();
      });
    }

    pointInDirection(args) {
      const stage = this.getStage();
      stage.direction = Cast.toNumber(args.DIRECTION);
      this._update(stage);
    }

    pointTowards(args) {
      const stage = this.getStage();
      const targetName = Cast.toString(args.TOWARDS);
      let tx, ty;
      
      if (targetName === '_mouse_' || targetName === 'mouse-pointer') {
        tx = runtime.ioDevices.mouse.getScratchX();
        ty = runtime.ioDevices.mouse.getScratchY();
      } else {
        const targetSprite = runtime.getSpriteTargetByName(targetName);
        if (!targetSprite) return;
        tx = targetSprite.x;
        ty = targetSprite.y;
      }

      const dx = tx - stage.x;
      const dy = ty - stage.y;
      stage.direction = 90 - Math.atan2(dy, dx) * 180 / Math.PI;
      this._update(stage);
    }

    changeX(args) {
      const stage = this.getStage();
      stage.x += Cast.toNumber(args.DX);
      this._update(stage);
    }

    setX(args) {
      const stage = this.getStage();
      stage.x = Cast.toNumber(args.X);
      this._update(stage);
    }

    changeY(args) {
      const stage = this.getStage();
      stage.y += Cast.toNumber(args.DY);
      this._update(stage);
    }

    setY(args) {
      const stage = this.getStage();
      stage.y = Cast.toNumber(args.Y);
      this._update(stage);
    }

    getX() {
      return this.getStage().x;
    }

    getY() {
      return this.getStage().y;
    }

    getDirection() {
      return this.getStage().direction;
    }
  }

  Scratch.extensions.register(new StageMover());
})(Scratch);
