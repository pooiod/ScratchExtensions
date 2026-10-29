// Name: MQTT
// ID: P7MQTT
// Description: mqtt support
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: true
// Created: 10/27/2026

// not ready yet
// breaking changes may happen and you are on your own
// if you want to use this, don't use the url feature so updates don't break your project

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension can\'t run in the sandbox');
	}

	if (!window.Paho) {
		var script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/paho-mqtt/mqttws31.js';
		document.head.appendChild(script);
	}

	class MQTT {
		constructor() {
			this.mqtt = null;
			this.reconnectTimeout = 2000;
			this.lastReceivedTopic = '';
			this.hasConnected = false;
			this.hasError = false;
			this.hasDisconnected = false;
			this.debugMode = false;
			this.lastError = '';
			this.lastDisconnectReason = '';

			this.host = 'broker.emqx.io';
			this.port = 8084;
			this.path = '/mqtt';
			this.useTLS = true;
			this.username = null;
			this.password = null;
			this.cleansession = true;

			this.roomId = null;

			this.subscribedTopics = new Set();
			this.topicData = {};

			this.messageCounter = 0;
			this.topicCounters = {};
		}

		getPrefix(customRoom) {
			const room = customRoom !== undefined ? (customRoom !== null ? String(customRoom) : (typeof location !== 'undefined' ? location.href : '')) : (this.roomId !== null && this.roomId !== undefined ? String(this.roomId) : (typeof location !== 'undefined' ? location.href : ''));
			return room + '/';
		}

		prefixTopic(topic, customRoom) {
			return this.getPrefix(customRoom) + String(topic);
		}

		stripPrefix(topic) {
			const prefix = this.getPrefix();
			if (topic.startsWith(prefix)) {
				return topic.slice(prefix.length);
			}
			return topic;
		}

		getInfo() {
			return {
				id: 'P7MQTT',
				name: 'MQTT',
				color1: '#662483',
				color2: '#521c6a',
				color3: '#3f1552',
				blocks: [
					{
						opcode: 'connect_server',
						blockType: Scratch.BlockType.COMMAND,
						text: 'connect to server [url]',
						arguments: {
							url: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'wss://broker.emqx.io:8084/mqtt'
							}
						}
					},
					{
						opcode: 'disconnect_server',
						blockType: Scratch.BlockType.COMMAND,
						text: 'disconnect'
					},
					{
						opcode: 'set_room_id',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set room id [room]',
						arguments: {
							room: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'my-room'
							}
						}
					},

					{
						opcode: 'is_connected',
						blockType: Scratch.BlockType.BOOLEAN,
						text: 'connected?'
					},

					{
						opcode: 'send_message',
						blockType: Scratch.BlockType.COMMAND,
						text: 'send message [message] to topic [topic]',
						arguments: {
							message: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'message'
							},
							topic: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'topic'
							}
						}
					},

					{
						opcode: 'get_topic_content',
						blockType: Scratch.BlockType.REPORTER,
						text: 'content of [topic]',
						arguments: {
							topic: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'topic'
							}
						}
					},
					{
						opcode: 'topic_subscribe',
						blockType: Scratch.BlockType.COMMAND,
						text: 'subscribe to [topic]',
						arguments: {
							topic: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'topic'
							}
						}
					},
					{
						opcode: 'unsubscribe_topic',
						blockType: Scratch.BlockType.COMMAND,
						text: 'unsubscribe from [topic]',
						arguments: {
							topic: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'topic'
							}
						}
					},
					{
						opcode: 'unsubscribe_all',
						blockType: Scratch.BlockType.COMMAND,
						text: 'unsubscribe from all topics'
					},

					{
						opcode: 'get_subscribed_topics',
						blockType: Scratch.BlockType.REPORTER,
						text: 'subscribed'
					},
					{
						opcode: 'get_last_topic',
						blockType: Scratch.BlockType.REPORTER,
						text: 'last received topic'
					},
					{
						opcode: 'get_diagnostic',
						blockType: Scratch.BlockType.REPORTER,
						text: 'last [infoType]',
						arguments: {
							infoType: {
								type: Scratch.ArgumentType.STRING,
								menu: 'lastMenu',
								defaultValue: 'error'
							}
						}
					},

					{
						opcode: 'when_connected',
						blockType: Scratch.BlockType.HAT,
						text: 'on connect',
						isEdgeActivated: true
					},
					{
						opcode: 'when_message_arrived',
						blockType: Scratch.BlockType.HAT,
						text: 'when message [topic] recived',
						isEdgeActivated: true,
						arguments: {
							topic: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: ''
							}
						}
					},
					{
						opcode: 'when_error',
						blockType: Scratch.BlockType.HAT,
						text: 'on error',
						isEdgeActivated: true
					},
					{
						opcode: 'when_disconnected',
						blockType: Scratch.BlockType.HAT,
						text: 'on disconnect',
						isEdgeActivated: true
					},

					{
						opcode: 'set_debug_mode',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set debug logging [enabled]',
						hideFromPalette: true,
						arguments: {
							enabled: {
								type: Scratch.ArgumentType.STRING,
								menu: 'debugMenu',
								defaultValue: false
							}
						}
					}
				],
				menus: {
					lastMenu: {
						acceptReporters: true,
						items: ['error', 'disconnect message', 'connection status']
					},
					debugMenu: {
						acceptReporters: true,
						items: ['true', 'false']
					}
				}
			};
		}

		set_room_id(args) {
			const newRoomId = String(args.room);
			const oldRoomId = this.roomId;
			if (newRoomId === oldRoomId) return;

			if (this.mqtt && this.mqtt.isConnected()) {
				this.subscribedTopics.forEach((topic) => {
					try {
						this.mqtt.unsubscribe(this.prefixTopic(topic, oldRoomId));
					} catch (e) {
						this.lastError = e && e.message ? e.message : String(e);
						this.hasError = true;
					}
				});
			}

			this.roomId = newRoomId;
			this.topicData = {};

			if (this.mqtt && this.mqtt.isConnected()) {
				this.subscribedTopics.forEach((topic) => {
					try {
						this.mqtt.subscribe(this.prefixTopic(topic), { qos: 0 });
					} catch (e) {
						this.lastError = e && e.message ? e.message : String(e);
						this.hasError = true;
					}
				});
			}
		}

		parseUrl(inputUrl) {
			let urlStr = String(inputUrl).trim();
			if (!urlStr.includes('://')) {
				urlStr = 'wss://' + urlStr;
			}
			try {
				let parsed = new URL(urlStr);
				this.useTLS = parsed.protocol === 'wss:' || parsed.protocol === 'https:';
				this.host = parsed.hostname;
				if (parsed.port) {
					this.port = Number(parsed.port);
				} else {
					this.port = this.useTLS ? 8084 : 8083;
				}
				this.path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '/mqtt';
			} catch (e) {
				this.lastError = e && e.message ? e.message : String(e);
				this.hasError = true;
				console.error('URL parse failed:', inputUrl, e);
			}
		}

		MQTTconnect() {
			if (!window.Paho || !window.Paho.MQTT) {
				setTimeout(() => this.MQTTconnect(), 500);
				return;
			}

			try {
				this.mqtt = new Paho.MQTT.Client(
					this.host,
					Number(this.port),
					this.path,
					'web_' + parseInt(Math.random() * 100000, 10)
				);

				var options = {
					timeout: 5,
					useSSL: this.useTLS,
					cleanSession: this.cleansession,
					onSuccess: () => this.onConnect(),
					onFailure: (message) => {
						this.lastError = message && message.errorMessage ? message.errorMessage : String(message);
						this.hasError = true;
						console.error('Connection failed:', message);
						setTimeout(() => this.MQTTconnect(), this.reconnectTimeout);
					}
				};

				this.mqtt.onConnectionLost = (response) => this.onConnectionLost(response);
				this.mqtt.onMessageArrived = (message) => this.onMessageArrived(message);

				if (this.username != null) {
					options.userName = this.username;
					options.password = this.password;
				}

				this.mqtt.connect(options);
			} catch (err) {
				this.lastError = err && err.message ? err.message : String(err);
				this.hasError = true;
				console.error('Connect exception:', err);
			}
		}

		onConnect() {
			this.hasConnected = true;
			if (this.debugMode) {
				console.log('connected');
			}
			this.subscribedTopics.forEach((topic) => {
				try {
					this.mqtt.subscribe(this.prefixTopic(topic), { qos: 0 });
				} catch (e) {
					this.lastError = e && e.message ? e.message : String(e);
					this.hasError = true;
					console.error('Subscribe error:', e);
				}
			});
		}

		onConnectionLost(response) {
			this.hasDisconnected = true;
			this.lastDisconnectReason = response && response.errorMessage ? response.errorMessage : ('Error code: ' + response.errorCode);
			if (response.errorCode !== 0) {
				this.lastError = this.lastDisconnectReason;
				this.hasError = true;
				console.error('Connection lost:', response);
			}
			setTimeout(() => this.MQTTconnect(), this.reconnectTimeout);
		}

		onMessageArrived(message) {
			const rawTopic = message.destinationName;
			const topic = this.stripPrefix(rawTopic);
			const payload = message.payloadString;
			this.topicData[topic] = payload;
			this.lastReceivedTopic = topic;
			this.messageCounter++;
			this.topicCounters[topic] = (this.topicCounters[topic] || 0) + 1;
			if (this.debugMode) {
				console.log('received:', rawTopic, 'as', topic, payload);
			}
		}

		connect_server(args) {
			if (this.mqtt && this.mqtt.isConnected()) {
				this.subscribedTopics.forEach((topic) => {
					try {
						this.mqtt.unsubscribe(this.prefixTopic(topic));
					} catch (e) {}
				});
			}
			this.subscribedTopics.clear();
			this.topicData = {};

			this.parseUrl(args.url);
			if (this.mqtt && this.mqtt.isConnected()) {
				try {
					this.mqtt.disconnect();
				} catch (e) {}
			}
			this.MQTTconnect();
		}

		disconnect_server() {
			if (this.mqtt && this.mqtt.isConnected()) {
				this.subscribedTopics.forEach((topic) => {
					try {
						this.mqtt.unsubscribe(this.prefixTopic(topic));
					} catch (e) {}
				});
				try {
					this.mqtt.disconnect();
				} catch (e) {}
			}
			this.subscribedTopics.clear();
			this.topicData = {};
			this.hasDisconnected = true;
			this.lastDisconnectReason = 'Disconnected by user';
		}

		is_connected() {
			return !!(this.mqtt && this.mqtt.isConnected());
		}

		send_message(args) {
			if (this.mqtt && this.mqtt.isConnected()) {
				try {
					const fullTopic = this.prefixTopic(args.topic);
					this.mqtt.send(fullTopic, String(args.message));
					if (this.debugMode) {
						console.log('sent:', fullTopic, args.message);
					}
				} catch (e) {
					this.lastError = e && e.message ? e.message : String(e);
					this.hasError = true;
					console.error('Send error:', e);
				}
			}
		}

		topic_subscribe(args) {
			const topic = String(args.topic);
			if (!this.subscribedTopics.has(topic)) {
				this.subscribedTopics.add(topic);
				if (this.mqtt && this.mqtt.isConnected()) {
					try {
						this.mqtt.subscribe(this.prefixTopic(topic), { qos: 0 });
						return true;
					} catch (e) {
						this.lastError = e && e.message ? e.message : String(e);
						this.hasError = true;
						console.error('Subscribe error:', e);
						return false;
					}
				} else {
					return false;
				}
			} else {
				return true;
			}
		}

		get_topic_content(args) {
			const topic = String(args.topic);
			if (!this.subscribedTopics.has(topic)) {
				this.subscribedTopics.add(topic);
				if (this.mqtt && this.mqtt.isConnected()) {
					try {
						this.mqtt.subscribe(this.prefixTopic(topic), { qos: 0 });
					} catch (e) {
						this.lastError = e && e.message ? e.message : String(e);
						this.hasError = true;
						console.error('Subscribe error:', e);
					}
				}
			}
			return this.topicData[topic] !== undefined ? this.topicData[topic] : '';
		}

		unsubscribe_topic(args) {
			const topic = String(args.topic);
			if (this.subscribedTopics.has(topic)) {
				this.subscribedTopics.delete(topic);
			}
			if (Object.prototype.hasOwnProperty.call(this.topicData, topic)) {
				delete this.topicData[topic];
			}
			if (this.mqtt && this.mqtt.isConnected()) {
				try {
					this.mqtt.unsubscribe(this.prefixTopic(topic));
				} catch (e) {
					this.lastError = e && e.message ? e.message : String(e);
					this.hasError = true;
					console.error('Unsubscribe error:', e);
				}
			}
		}

		unsubscribe_all() {
			if (this.mqtt && this.mqtt.isConnected()) {
				this.subscribedTopics.forEach((topic) => {
					try {
						this.mqtt.unsubscribe(this.prefixTopic(topic));
					} catch (e) {
						this.lastError = e && e.message ? e.message : String(e);
						this.hasError = true;
					}
				});
			}
			this.subscribedTopics.clear();
			this.topicData = {};
		}

		get_subscribed_topics() {
			return JSON.stringify(Array.from(this.subscribedTopics));
		}

		get_last_topic() {
			return this.lastReceivedTopic;
		}

		get_diagnostic(args) {
			if (args.infoType === 'error') {
				return this.lastError;
			}
			if (args.infoType === 'disconnect message') {
				return this.lastDisconnectReason;
			}
			if (args.infoType === 'connection status') {
				if (this.mqtt && this.mqtt.isConnected()) {
					return 'connected';
				}
				return 'disconnected';
			}
			return '';
		}

		when_connected() {
			if (this.hasConnected) {
				this.hasConnected = false;
				return true;
			}
			return false;
		}

		when_message_arrived(args, util) {
			const targetTopic = args && args.topic !== undefined ? String(args.topic).trim() : '';
			if (!util.stackFrame.mqtt) {
				util.stackFrame.mqtt = {
					lastCount: targetTopic === '' ? this.messageCounter : (this.topicCounters[targetTopic] || 0)
				};
				return false;
			}
			const currentCount = targetTopic === '' ? this.messageCounter : (this.topicCounters[targetTopic] || 0);
			if (currentCount > util.stackFrame.mqtt.lastCount) {
				util.stackFrame.mqtt.lastCount = currentCount;
				return true;
			}
			return false;
		}

		when_error() {
			if (this.hasError) {
				this.hasError = false;
				return true;
			}
			return false;
		}

		when_disconnected() {
			if (this.hasDisconnected) {
				this.hasDisconnected = false;
				return true;
			}
			return false;
		}

		set_debug_mode(args) {
			this.debugMode = args.enabled === 'true' || args.enabled === true;
			console.log(this.debugMode);
		}
	}

	Scratch.extensions.register(new MQTT());
})(window.Scratch);
