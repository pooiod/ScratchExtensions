(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class DeviceOrientationExtension {
        constructor() {
            this.orientationData = {
                alpha: 0,
                beta: 0,
                gamma: 0,
            };
            this.accelerationData = {
                x: 0,
                y: 0,
                z: 0,
            };

            if ('Gyroscope' in window && 'Accelerometer' in window) {
                this.gyroscope = new Gyroscope({ frequency: 60 });
                this.accelerometer = new Accelerometer({ frequency: 60 });

                this.gyroscope.addEventListener('reading', () => {
                    this.orientationData.alpha = this.gyroscope.x;
                    this.orientationData.beta = this.gyroscope.y;
                    this.orientationData.gamma = this.gyroscope.z;
                });

                this.accelerometer.addEventListener('reading', () => {
                    this.accelerationData.x = this.accelerometer.x;
                    this.accelerationData.y = this.accelerometer.y;
                    this.accelerationData.z = this.accelerometer.z;
                });

                this.gyroscope.start();
                this.accelerometer.start();
            } else {
                console.error('Gyroscope or Accelerometer not supported on this device.');
            }
        }

        getInfo() {
            return {
                id: 'deviceorientation',
                name: 'Device Orientation & Speed',
                blocks: [
                    {
                        opcode: 'getOrientation',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'device orientation [AXIS]',
                        arguments: {
                            AXIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'axisMenu',
                                defaultValue: 'alpha',
                            },
                        },
                    },
                    {
                        opcode: 'getSpeed',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'device speed [AXIS]',
                        arguments: {
                            AXIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'speedAxisMenu',
                                defaultValue: 'x',
                            },
                        },
                    },
                ],
                menus: {
                    axisMenu: ['alpha', 'beta', 'gamma'],
                    speedAxisMenu: ['x', 'y', 'z'],
                }
            };
        }

        getOrientation(args) {
            const axis = args.AXIS;
            return this.orientationData[axis] || 0;
        }

        getSpeed(args) {
            const axis = args.AXIS;
            return this.accelerationData[axis] || 0;
        }
    }

    Scratch.extensions.register(new DeviceOrientationExtension());
})(Scratch);
