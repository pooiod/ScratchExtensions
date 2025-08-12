// Work in progress, do not use yet

(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Audio and Media Session extension must be run unsandboxed');
  }

  class AudioMediaSessionExtension {
    constructor() {
      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";

      this.audio.addEventListener('play', () => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        Scratch.vm.runtime.startHats('audiomediasession_whenplaystatuschanged', {
          PLAYSTATUS: 'played'
        });
      });

      this.audio.addEventListener('pause', () => {
        if ('mediaSession'in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
        Scratch.vm.runtime.startHats('audiomediasession_whenplaystatuschanged', {
          PLAYSTATUS: 'paused'
        });
      });

      this.audio.addEventListener('timeupdate', () => {
        Scratch.vm.runtime.startHats('audiomediasession_whensongprogresschanged');
      });

      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => this.startAudio());
        navigator.mediaSession.setActionHandler('pause', () => this.pauseAudio());
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          Scratch.vm.runtime.startHats('audiomediasession_whennextsongkeypressed');
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          Scratch.vm.runtime.startHats('audiomediasession_whenprevioussongkeypressed');
        });
      }
    }

    getInfo() {
      return {
        id: 'audiomediasession',
        name: 'Audio and Media',
        blocks: [
          {
            opcode: 'startAudio',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Start audio'
          },
          {
            opcode: 'pauseAudio',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Pause audio'
          },
          {
            opcode: 'setSource',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set audio source to [SOURCE]',
            arguments: {
              SOURCE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://extensions.turbowarp.org/meow.mp3'
              }
            }
          },
          {
            opcode: 'setVolume',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set audio volume to [VOLUME]',
            arguments: {
              VOLUME: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
          {
            opcode: 'setSpeed',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set audio speed to [SPEED]',
            arguments: {
              SPEED: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1
              }
            }
          },
          {
            opcode: 'setTime',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set audio time to [TIME]',
            arguments: {
              TIME: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'setMediaInfo',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Set media info | Title: [TITLE] Artist: [ARTIST] Album: [ALBUM] Image URL: [IMAGE]',
            arguments: {
              TITLE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Song Title'
              },
              ARTIST: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Artist Name'
              },
              ALBUM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Album Name'
              },
              IMAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ''
              }
            }
          },
          {
            opcode: 'stopMediaSession',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Clear media info'
          },
          {
            opcode: 'getThing',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Get [THING]',
            arguments: {
              THING: {
                type: Scratch.ArgumentType.STRING,
                menu: 'thingMenu'
              }
            }
          },
          {
            opcode: 'isPlaying',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'Is audio playing?'
          },
          {
            opcode: 'whenplaystatuschanged',
            blockType: Scratch.BlockType.EVENT,
            text: 'When audio is [PLAYSTATUS]',
            isEdgeActivated: false,
            arguments: {
              PLAYSTATUS: {
                type: Scratch.ArgumentType.STRING,
                menu: 'playStatusMenu'
              }
            }
          },
          {
            opcode: 'whensongprogresschanged',
            blockType: Scratch.BlockType.EVENT,
            text: 'When song progress changed',
            isEdgeActivated: false
          },
          {
            opcode: 'whennextsongkeypressed',
            blockType: Scratch.BlockType.EVENT,
            text: 'When next song key pressed',
            isEdgeActivated: false,
          },
          {
            opcode: 'whenprevioussongkeypressed',
            blockType: Scratch.BlockType.EVENT,
            text: 'When previous song key pressed',
            isEdgeActivated: false,
          }
        ],
        menus: {
          thingMenu: {
            acceptReporters: true,
            items: ['current time', 'length', 'source', 'volume', 'speed']
          },
          playStatusMenu: {
            acceptReporters: true,
            items: ['played', 'paused']
          }
        }
      };
    }

    startAudio() {
      this.audio.play().catch(e => console.error("Audio play failed:", e));
    }

    pauseAudio() {
      this.audio.pause();
    }

    setSource(args) {
      this.audio.src = args.SOURCE;
    }

    setVolume(args) {
      this.audio.volume = Math.max(0, Math.min(1, parseFloat(args.VOLUME)));
    }

    setSpeed(args) {
      this.audio.playbackRate = parseFloat(args.SPEED);
    }

    setTime(args) {
      this.audio.currentTime = args.TIME;
    }

    getThing(args) {
      switch (args.THING) {
        case 'current time':
          return this.audio.currentTime;
        case 'length':
          return this.audio.duration || 0;
        case 'source':
          return this.audio.src;
        case 'volume':
          return this.audio.volume;
        case 'speed':
          return this.audio.playbackRate;
        default:
          return '';
      }
    }

    isPlaying() {
      return !this.audio.paused;
    }

    setMediaInfo(args) {
      if ('mediaSession' in navigator) {
        const metadata = {};
        if (args.TITLE) metadata.title = args.TITLE;
        if (args.ARTIST) metadata.artist = args.ARTIST;
        if (args.ALBUM) metadata.album = args.ALBUM;
        if (args.IMAGE) {
          metadata.artwork = [{
            src: args.IMAGE,
            sizes: '512x512',
            type: 'image/png'
          }];
        }
        navigator.mediaSession.metadata = new MediaMetadata(metadata);
      }
    }

    stopMediaSession() {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
      }
    }
  }

  Scratch.extensions.register(new AudioMediaSessionExtension());
})(Scratch);
