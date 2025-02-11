// A work in progress extension for getting hand poses (unfinished)

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    window.scratchvar = Scratch;

    class Handpose2Scratch {
        constructor() {
            this.runtime = Scratch.vm.runtime;
            this.landmarks = [];
            this.ratio = 0.75;
            this.loaded = false;

            this.detectHand = this.detectHand.bind(this);

            this.loadML5 = new Promise((resolve, reject) => {
                if (typeof ml5 !== 'undefined') {
                    resolve();
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/ml5@1.2.1/dist/ml5.min.js';
                    script.onload = resolve;
                    script.onerror = () => {
                        reject(new Error('Failed to load ml5'));
                    };
                    document.head.appendChild(script);
                }
            });

            this.loadML5.then(() => {
                this.loaded = true;
            }).catch((err) => {
                console.error("Error loading ml5:", err);
            });

            this.checkLoad = () => {
                return new Promise((resolve, reject) => {
                    if (this.loaded) {
                        resolve();
                    } else {
                        var loadercheck = setInterval(() => {
                            if (this.loaded) {
                                clearInterval(loadercheck);
                                resolve();
                            }
                        }, 500);
                    }
                })
            }
        }

        getInfo() {
            return {
                id: 'p7HandPos',
                name: 'Hand Pos',
                blocks: [
                    {
                        opcode: 'getX',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'x of [LANDMARK]',
                        arguments: {
                            LANDMARK: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'landmark',
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'getY',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'y of [LANDMARK]',
                        arguments: {
                            LANDMARK: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'landmark',
                                defaultValue: '1'
                            }
                        }
                    },
                    {
                        opcode: 'getZ',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'z of [LANDMARK]',
                        arguments: {
                            LANDMARK: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'landmark',
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
                                defaultValue: 'off'
                            }
                        }
                    },
                    {
                        opcode: 'setVideoTransparency',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set video transparency to [TRANSPARENCY]',
                        arguments: {
                            TRANSPARENCY: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            }
                        }
                    },
                    {
                        opcode: 'setRatio',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set ratio to [RATIO]',
                        arguments: {
                            RATIO: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'ratioMenu',
                                defaultValue: '0.75'
                            }
                        }
                    }
                ],
                menus: {
                    landmark: {
                        acceptReporters: true,
                        items: this.getLandmarkMenu()
                    },
                    videoMenu: {
                        acceptReporters: true,
                        items: [
                            { text: 'off', value: 'off' },
                            { text: 'on', value: 'on' },
                            { text: 'on flipped', value: 'on-flipped' }
                        ]
                    },
                    ratioMenu: {
                        acceptReporters: true,
                        items: [
                            { text: '0.5', value: '0.5' },
                            { text: '0.75', value: '0.75' },
                            { text: '1', value: '1' },
                            { text: '1.5', value: '1.5' },
                            { text: '2.0', value: '2.0' }
                        ]
                    },
                    intervalMenu: {
                        acceptReporters: true,
                        items: [
                            { text: '0.1', value: '0.1' },
                            { text: '0.2', value: '0.2' },
                            { text: '0.5', value: '0.5' },
                            { text: '1.0', value: '1.0' }
                        ]
                    }
                }
            };
        }

        getLandmarkMenu() {
            const menu = [];
            const landmarks = [
                'wrist',
                'the base of thumb',
                'the 2nd joint of thumb',
                'the 1st joint of thumb',
                'thumb',
                'the 3rd joint of index finger',
                'the 2nd joint of index finger',
                'the 1st joint of index finger',
                'index finger',
                'the 3rd joint of middle finger',
                'the 2nd joint of middle finger',
                'the 1st joint of middle finger',
                'middle finger',
                'the 3rd joint of ring finger',
                'the 2nd joint of ring finger',
                'the 1st joint of ring finger',
                'ring finger',
                'the 3rd joint of little finger',
                'the 2nd joint of little finger',
                'the 1st joint of little finger',
                'little finger'
            ];
            for (let i = 0; i < landmarks.length; i++) {
                menu.push({
                    text: `${landmarks[i]} (${i + 1})`,
                    value: String(i + 1)
                });
            }
            return menu;
        }

        detectHand() {
            this.video = this.runtime.ioDevices.video.provider.video;
            // alert('Setup takes a while. The browser will get stuck, but please wait.');

            const handpose = ml5.handPose(this.video, function () {
                console.log("Model loaded!");
            });

            handpose.on('predict', (hands) => {
                hands.forEach((hand) => {
                    this.landmarks = hand.landmarks;
                });
            });
        }

        getX(args) {
            const landmark = parseInt(args.LANDMARK, 10) - 1;
            if (this.landmarks[landmark]) {
                if (this.runtime.ioDevices.video.mirror === false) {
                    return -1 * (240 - this.landmarks[landmark][0] * this.ratio);
                } else {
                    return 240 - this.landmarks[landmark][0] * this.ratio;
                }
            }
            return "";
        }

        getY(args) {
            const landmark = parseInt(args.LANDMARK, 10) - 1;
            if (this.landmarks[landmark]) {
                return 180 - this.landmarks[landmark][1] * this.ratio;
            }
            return "";
        }

        getZ(args) {
            const landmark = parseInt(args.LANDMARK, 10) - 1;
            if (this.landmarks[landmark]) {
                return this.landmarks[landmark][2];
            }
            return "";
        }

        videoToggle(args) {
            const state = args.VIDEO_STATE;

            if (state === 'off') {
                this.runtime.ioDevices.video.disableVideo();
            } else {
                await this.checkLoad();
                this.runtime.ioDevices.video.enableVideo().then(this.detectHand);
                this.runtime.ioDevices.video.mirror = (state === 'on');
            }
        }

        setVideoTransparency(args) {
            const transparency = Number(args.TRANSPARENCY);
            this.globalVideoTransparency = transparency;
            this.runtime.ioDevices.video.setPreviewGhost(transparency);
        }

        setRatio(args) {
            this.ratio = parseFloat(args.RATIO);
        }
    }

    Scratch.extensions.register(new Handpose2Scratch());
})(Scratch);
