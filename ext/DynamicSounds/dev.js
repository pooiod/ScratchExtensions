// DynamicSounds by pooiod7 (wip)

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class DynamicSounds {
		constructor() {
			console.log('DynamicSounds extension initialized');
			this.packaged = Scratch.vm.runtime.isPackaged || !typeof scaffolding === "undefined";
			this.sounds = [];
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

			this.reloadpallet = () => {
				Scratch.vm.extensionManager.refreshBlocks();
			};

			Scratch.vm.runtime.on('PROJECT_LOADED', () => {
				console.log('Project loaded');
				this.stopAllSounds();
				this.sounds = [];
			});

			Scratch.vm.runtime.on('PROJECT_START', () => {
				console.log('Project started');
				this.stopAllSounds();
				this.sounds = [];
			});

			Scratch.vm.runtime.on('PROJECT_STOP_ALL', () => {
				console.log('Project stopped');
				this.stopAllSounds();
			});
		}

		getInfo() {
			return {
				id: 'DynamicSounds',
				name: 'Dynamic Sounds',
				color1: '#cf63cf',
				color2: '#b858b8',
				blocks: [
					{
						opcode: 'makeSound',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create sound [ID]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Sound 1',
							},
						},
					},

					{
						opcode: 'setSourceURL',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set source of [ID] to [URL]',
						arguments: {
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Sound 1',
							},
							URL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'https://extensions.turbowarp.org/meow.mp3',
							},
						},
					},

					{
						opcode: 'playTempSound',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Start tmp sound [URL] with template [ID]',
						arguments: {
							URL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'https://extensions.turbowarp.org/meow.mp3',
							},
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Sound 1',
							},
						},
					},

					{
						opcode: 'playSound',
						blockType: Scratch.BlockType.COMMAND,
						text: '[ACTION] sound [ID]',
						arguments: {
							ACTION: {
								type: Scratch.ArgumentType.STRING,
								menu: 'actions',
							},
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Sound 1',
							},
						},
					},

					{
						opcode: 'setSoundProp',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set [EFFECT] of sound [ID] to [VALUE]%',
						arguments: {
							EFFECT: {
								type: Scratch.ArgumentType.STRING,
								menu: 'effects',
							},
							VALUE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: '100',
							},
							ID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Sound 1',
							},
						},
					},
				],
				menus: {
					actions: ['Play', 'Pause', 'Stop'],
					effects: ['Volume', 'Pan', /*'Pitch',*/ 'Speed', /*'echo',*/ /*'reverb',*/ 'distortion', 'delay', 'chorus', /*'flanger'*/],
				},
			};
		}

		makeSound({ ID }) {
			console.log(`Creating sound with ID: ${ID}`);
			const audio = new Audio();
			const source = this.audioContext.createMediaElementSource(audio);
			const gainNode = this.audioContext.createGain();
			const panNode = this.audioContext.createStereoPanner();
			const pitchNode = this.audioContext.createBiquadFilter();
			pitchNode.type = 'allpass';
			const echoNode = this.audioContext.createDelay();
			const reverbNode = this.audioContext.createConvolver();
			const distortionNode = this.audioContext.createWaveShaper();
			const delayNode = this.audioContext.createDelay();
			const chorusNode = this.audioContext.createGain();
			const flangerNode = this.audioContext.createGain();

			source.connect(gainNode)
				.connect(panNode)
				// .connect(pitchNode)
				// .connect(echoNode)
				// .connect(reverbNode)
				.connect(distortionNode)
				.connect(delayNode)
				.connect(chorusNode)
				// .connect(flangerNode)
				.connect(this.audioContext.destination);

			this.sounds[ID] = { audio, gainNode, panNode, pitchNode, echoNode, reverbNode, distortionNode, delayNode, chorusNode, flangerNode };
		}

		async setSourceURL({ ID, URL }) {
			console.log(`Setting source URL for sound ID: ${ID} to ${URL}`);
			if (this.sounds[ID]) {
				if (!URL.startsWith('data:')) {
					const response = await fetch(URL);
					const blob = await response.blob();
					const reader = new FileReader();
					reader.onloadend = () => {
						this.sounds[ID].audio.src = reader.result;
						console.log(`Source URL set for sound ID: ${ID}`);
					};
					reader.readAsDataURL(blob);
				} else {
					this.sounds[ID].audio.src = URL;
					console.log(`Source URL set for sound ID: ${ID}`);
				}
			}
		}

		async playTempSound({ URL, ID }) {
			console.log(`Playing temporary sound from URL: ${URL} with template ID: ${ID}`);
			if (this.sounds[ID]) {
				const tempSound = this.sounds[ID].audio.cloneNode();
				tempSound.src = URL;
				await this.audioContext.resume();
				tempSound.play();
				console.log(`Temporary sound played from URL: ${URL} with template ID: ${ID}`);
			}
		}

		async playSound({ ACTION, ID }) {
			console.log(`Performing action: ${ACTION} on sound ID: ${ID}`);
			const sound = this.sounds[ID];
			if (sound) {
				await this.audioContext.resume();
				switch (ACTION) {
					case 'Play':
						if (!sound.audio.paused) {
							sound.audio.currentTime = 0;
						}
						sound.audio.play();
						console.log(`Sound ID: ${ID} played`);
						break;
					case 'Pause':
						sound.audio.pause();
						console.log(`Sound ID: ${ID} paused`);
						break;
					case 'Stop':
						sound.audio.pause();
						sound.audio.currentTime = 0;
						console.log(`Sound ID: ${ID} stopped`);
						break;
				}
			}
		}

		setSoundProp({ EFFECT, VALUE, ID }) {
			console.log(`Setting effect: ${EFFECT} to value: ${VALUE} on sound ID: ${ID}`);
			const sound = this.sounds[ID];
			if (sound) {
				switch (EFFECT) {
					case 'Volume':
						sound.gainNode.gain.value = VALUE / 100;
						break;
					case 'Pan':
						sound.panNode.pan.value = VALUE / 100;
						break;
					case 'Pitch':
						sound.pitchNode.frequency.value = VALUE;
						break;
					case 'echo':
						sound.echoNode.delayTime.value = VALUE / 100;
						break;
					case 'reverb':
						// Reverb requires an impulse response buffer, which is complex to set up
						break;
					case 'distortion':
						sound.distortionNode.curve = this.makeDistortionCurve(VALUE);
						break;
					case 'delay':
						sound.delayNode.delayTime.value = VALUE / 100;
						break;
					case 'chorus':
						sound.chorusNode.gain.value = VALUE / 100;
						break;
					case 'flanger':
						sound.flangerNode.gain.value = VALUE / 100;
						break;
				}
				console.log(`Effect: ${EFFECT} set to value: ${VALUE} on sound ID: ${ID}`);
			}
		}

		makeDistortionCurve(amount) {
			const k = typeof amount === 'number' ? amount : 50;
			const n_samples = 44100;
			const curve = new Float32Array(n_samples);
			const deg = Math.PI / 180;
			for (let i = 0; i < n_samples; ++i) {
				const x = (i * 2) / n_samples - 1;
				curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
			}
			return curve;
		}

		stopAllSounds() {
			console.log('Stopping all sounds');
			this.sounds.forEach(sound => {
				if (sound) {
					sound.audio.pause();
					sound.audio.currentTime = 0;
				}
			});
		}
	}

	Scratch.extensions.register(new DynamicSounds());
})(Scratch);
