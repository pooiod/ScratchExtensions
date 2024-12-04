// SuperStorage (v1) by pooiod7

(function(Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('This extension must run unsandboxed');
	}

	class StorageV2 {
		constructor() {
			this.currentServer = "https://storage-ext.penguinmod.com/";
			this.useGlobal = true;
			this.waitingForResponse = false;
			this.serverFailedResponse = false;
			this.serverError = "";
		}

		getInfo() {
			return {
				id: 'P7SuperStorage',
				name: 'Super Storage',
				color1: '#31b3d4',
				color2: '#179fc2',
				docsURI: 'https://pooiod7.neocities.org/markdown/#/projects/scratch/extensions/other/markdown/SuperStorage',
				blocks: [
					{ blockType: Scratch.BlockType.LABEL, text: "Local Storage" },
					{
						opcode: 'getValue',
						text: 'get local [KEY]',
						disableMonitor: true,
						blockType: Scratch.BlockType.REPORTER,
						arguments: {
							KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
						}
					},
					{
						opcode: 'setValue',
						text: 'set local [KEY] to [VALUE]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: {
							KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
							VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" }
						}
					},
					{
						opcode: 'deleteValue',
						text: 'delete local [KEY]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" } }
					},
					{
						opcode: 'getKeys',
						text: 'get all local stored names',
						disableMonitor: true,
						blockType: Scratch.BlockType.REPORTER
					},
					{
						blockType: Scratch.BlockType.LABEL,
						text: "Server Storage"
					},
					{
						opcode: 'waitingForConnection',
						text: 'waiting for server to respond?',
						disableMonitor: true,
						blockType: Scratch.BlockType.BOOLEAN
					},
					{
						opcode: 'connectionFailed',
						text: 'server failed to respond?',
						disableMonitor: true,
						blockType: Scratch.BlockType.BOOLEAN
					},
					{
						opcode: 'serverErrorOutput',
						text: 'server error',
						disableMonitor: false,
						blockType: Scratch.BlockType.REPORTER
					},
					"---",
					{
						opcode: 'getServerValue',
						text: 'get server [KEY]',
						disableMonitor: true,
						blockType: Scratch.BlockType.REPORTER,
						arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" } }
					},
					{
						opcode: 'setServerValue',
						text: 'set server [KEY] to [VALUE]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: {
							KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
							VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" }
						}
					},
					{
						opcode: 'deleteServerValue',
						text: 'delete server [KEY]',
						blockType: Scratch.BlockType.COMMAND,
						arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" } }
					}
				]
			};
		}

		getPrefix() {
			return `P7_PROJECTSTORAGE_`;
		}

		getAllKeys() {
			return Object.keys(localStorage).filter(key => key.startsWith(this.getPrefix())).map(key => key.replace(this.getPrefix(), ""));
		}

		runPenguinWebRequest(url, options, ifFailReturn) {
			this.waitingForResponse = true;
			this.serverFailedResponse = false;
			this.serverError = "";

			return fetch(url, options)
				.then(response => response.ok ? response.text() : Promise.reject(response.text()))
				.then(text => {
					this.waitingForResponse = false;
					return text;
				})
				.catch(err => {
					this.waitingForResponse = false;
					this.serverFailedResponse = true;
					this.serverError = err;
					return ifFailReturn;
				});
		}

		getKeys() {
			return JSON.stringify(this.getAllKeys());
		}

		getValue(args) {
			return localStorage.getItem(this.getPrefix() + args.KEY) || "";
		}

		setValue(args) {
			localStorage.setItem(this.getPrefix() + args.KEY, args.VALUE);
		}

		deleteValue(args) {
			localStorage.removeItem(this.getPrefix() + args.KEY);
		}

		waitingForConnection() {
			return this.waitingForResponse;
		}

		connectionFailed() {
			return this.serverFailedResponse;
		}

		serverErrorOutput() {
			return this.serverError;
		}

		getServerValue(args) {
			return this.runPenguinWebRequest(`${this.currentServer}get?key=${args.KEY}`, null, "");
		}

		setServerValue(args) {
			return this.runPenguinWebRequest(`${this.currentServer}set?key=${args.KEY}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ "value": args.VALUE })
			});
		}

		deleteServerValue(args) {
			return this.runPenguinWebRequest(`${this.currentServer}delete?key=${args.KEY}`, { method: "DELETE" });
		}
	}

	Scratch.extensions.register(new StorageV2());
})(Scratch);
