// Get hand positions in scratch (made by pooiod7)

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class Scratch3Handpose {
        constructor() {
            this.runtime = Scratch.vm.runtime;

			this.stagewidth = this.runtime.stageWidth;
			this.stageheight = this.runtime.stageHeight;

            this.keypoints = [];

            this.checkAndLoadML5 = () => {
                return new Promise((resolve) => {
                    if (window.ml5) {
                        resolve();
                    } else {
                        const loadScriptSynchronously = (url) => {
                            const request = new XMLHttpRequest();
                            request.open('GET', url, false);
                            request.send(null);
                            if (request.status === 200) {
                                const script = document.createElement('script');
                                script.text = request.responseText;
                                document.head.appendChild(script);
                            }
                        }; loadScriptSynchronously('https://unpkg.com/ml5@1/dist/ml5.min.js');

                        const loadercheck = setInterval(() => {
                            if (window.ml5) {
                                clearInterval(loadercheck);
                                resolve();
                            }
                        }, 500);
                    }
                });
            };
        }

        getInfo() {
            return {
                id: 'P7HandPos',
                name: 'Hand Positions',
                blocks: [
                    {
                        opcode: 'getX',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'X of [KEYPOINT] of hand no. [HAND]',
                        arguments: {
                            HAND: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'handsMenu',
                                defaultValue: '1'
                            },
                            KEYPOINT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'keypointsMenu',
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'getY',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Y of [KEYPOINT] of hand no. [HAND]',
                        arguments: {
                            HAND: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'handsMenu',
                                defaultValue: '1'
                            },
                            KEYPOINT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'keypointsMenu',
                                defaultValue: '1'
                            }
                        }
                    },

                    {
                        opcode: 'videoToggle',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'turn video [VIDEO_STATE]',
                        arguments: {
                            VIDEO_STATE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'videoMenu',
                                defaultValue: 'on'
                            }
                        }
                    },
                    {
                        opcode: 'setVideoTransparency',
                        text: 'set video transparency to [TRANSPARENCY]',
                        arguments: {
                            TRANSPARENCY: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            }
                        }
                    }
                ],
                menus: {
                    keypointsMenu: {
                        acceptReporters: true,
                        items: this.KEYPOINTS_MENU
                    },
                    videoMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'off', value: 'off' },
                            { text: 'on', value: 'on' },
                            { text: 'on flipped', value: 'on-flipped' }
                        ],
                    },
                    handsMenu: {
                        acceptReporters: true,
                        items: Array.from({ length: 10 }, (_, i) => ({ text: `${i + 1}`, value: `${i + 1}` }))
                    }
                }
            };
        }

        get KEYPOINTS_MENU() {
            const keypoints = [];
            for (let i = 1; i <= 21; i++) {
                keypoints.push({ text: `Keypoint ${i}`, value: String(i) });
            }
            return keypoints;
        }

        getX(args) {
            let keypoint = parseInt(args.KEYPOINT, 10) - 1;
            let hand = parseInt(args.HAND, 10) - 1;
            if (this.hands?.[hand]?.keypoints?.[keypoint]) {
                if (this.runtime.ioDevices.video.mirror === false) {
                    return -1 * (this.stagewidth/2 - this.hands[hand].keypoints[keypoint].x);
                } else {
                    return this.stagewidth/2 - this.hands[hand].keypoints[keypoint].x;
                }
            } else {
                return '';
            }
        }

        getY(args) {
            let keypoint = parseInt(args.KEYPOINT, 10) - 1;
            let hand = parseInt(args.HAND, 10) - 1;
            if (this.hands?.[hand]?.keypoints?.[keypoint]) {
                return this.stageheight/2 - this.hands[hand].keypoints[keypoint].y;
            } else {
                return '';
            }
        }

        async videoToggle(args) {
            let state = args.VIDEO_STATE;
            if (state === 'off') {
                this.runtime.ioDevices.video.disableVideo();
            } else {
                await this.checkAndLoadML5();

                ml5.handPose((handpose) => {
                    console.log("Model loaded!");
                    handpose.detectStart(this.video, (results) => {
                        this.hands = results;
                    });
                });

                this.stagewidth = this.runtime.stageWidth;
                this.stageheight = this.runtime.stageHeight;
    
                this.runtime.ioDevices.video.enableVideo().then(() => {
                    this.video = this.runtime.ioDevices.video.provider.video;
                    this.video.width = this.stagewidth;
                    this.video.height = this.stageheight;
                });

                this.runtime.ioDevices.video.mirror = state === "on";
            }
        }

        setVideoTransparency(args) {
            const transparency = Scratch.Cast.toNumber(args.TRANSPARENCY);
            this.globalVideoTransparency = transparency;
            this.runtime.ioDevices.video.setPreviewGhost(transparency);
        }
    }

    Scratch.extensions.register(new Scratch3Handpose());
})(Scratch);
