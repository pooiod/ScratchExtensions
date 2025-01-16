(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class MotionSensors {
        constructor() {
            this.gyroscopeData = { x: 0, y: 0, z: 0 };
            this.accelerometerData = { x: 0, y: 0, z: 0 };

            if ('Gyroscope' in window && 'Accelerometer' in window) {
                try {
                    this.gyroscope = new Gyroscope({ frequency: 60 });
                    this.gyroscope.addEventListener('reading', () => {
                        this.gyroscopeData.x = this.gyroscope.x;
                        this.gyroscopeData.y = this.gyroscope.y;
                        this.gyroscopeData.z = this.gyroscope.z;
                    });
                    this.gyroscope.start();
                } catch (error) {
                    console.error('Error initializing gyroscope:', error);
                }

                try {
                    this.accelerometer = new Accelerometer({ frequency: 60 });
                    this.accelerometer.addEventListener('reading', () => {
                        this.accelerometerData.x = this.accelerometer.x;
                        this.accelerometerData.y = this.accelerometer.y;
                        this.accelerometerData.z = this.accelerometer.z;
                    });
                    this.accelerometer.start();
                } catch (error) {
                    console.error('Error initializing accelerometer:', error);
                }
            } else {
                console.error('Gyroscope or Accelerometer not supported on this device.');
            }
        }

        getInfo() {
            return {
                id: 'motionsensors',
                name: 'Motion Sensors',
                blocks: [
                    {
                        opcode: 'getGyroscope',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'gyroscope [AXIS]',
                        arguments: {
                            AXIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'axisMenu',
                                defaultValue: 'x',
                            },
                        },
                    },
                    {
                        opcode: 'getAccelerometer',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'accelerometer [AXIS]',
                        arguments: {
                            AXIS: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'axisMenu',
                                defaultValue: 'x',
                            },
                        },
                    },
                ],
                menus: {
                    axisMenu: {
                        acceptReporters: true,
                        items: ['x', 'y', 'z'],
                    },
                },
            };
        }

        getGyroscope(args) {
            const axis = args.AXIS;
            return this.gyroscopeData[axis] || 0;
        }

        getAccelerometer(args) {
            const axis = args.AXIS;
            return this.accelerometerData[axis] || 0;
        }
    }

    Scratch.extensions.register(new MotionSensors());
})(Scratch);
