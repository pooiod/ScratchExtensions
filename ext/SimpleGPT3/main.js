// Name: Simple GPT
// ID: P7SimpleGPT3
// Description: A simple extension to interact with GPT3
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: false
// WIP: false
// Created: Jul 18, 2024

(function(Scratch) {
	'use strict';
	const BlockIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30' width='30px' height='30px'%3E%3Cpath d='M 14.070312 2 C 11.330615 2 8.9844456 3.7162572 8.0390625 6.1269531 C 6.061324 6.3911222 4.2941948 7.5446684 3.2773438 9.3066406 C 1.9078196 11.678948 2.2198602 14.567816 3.8339844 16.591797 C 3.0745422 18.436097 3.1891418 20.543674 4.2050781 22.304688 C 5.5751778 24.677992 8.2359331 25.852135 10.796875 25.464844 C 12.014412 27.045167 13.895916 28 15.929688 28 C 18.669385 28 21.015554 26.283743 21.960938 23.873047 C 23.938676 23.608878 25.705805 22.455332 26.722656 20.693359 C 28.09218 18.321052 27.78014 15.432184 26.166016 13.408203 C 26.925458 11.563903 26.810858 9.4563257 25.794922 7.6953125 C 24.424822 5.3220082 21.764067 4.1478652 19.203125 4.5351562 C 17.985588 2.9548328 16.104084 2 14.070312 2 z M 14.070312 4 C 15.226446 4 16.310639 4.4546405 17.130859 5.2265625 C 17.068225 5.2600447 17.003357 5.2865019 16.941406 5.3222656 L 12.501953 7.8867188 C 12.039953 8.1527187 11.753953 8.6456875 11.751953 9.1796875 L 11.724609 15.146484 L 9.5898438 13.900391 L 9.5898438 8.4804688 C 9.5898438 6.0104687 11.600312 4 14.070312 4 z M 20.492188 6.4667969 C 21.927441 6.5689063 23.290625 7.3584375 24.0625 8.6953125 C 24.640485 9.696213 24.789458 10.862812 24.53125 11.958984 C 24.470201 11.920997 24.414287 11.878008 24.351562 11.841797 L 19.910156 9.2773438 C 19.448156 9.0113437 18.879016 9.0103906 18.416016 9.2753906 L 13.236328 12.236328 L 13.248047 9.765625 L 17.941406 7.0546875 C 18.743531 6.5915625 19.631035 6.4055313 20.492188 6.4667969 z M 7.5996094 8.2675781 C 7.5972783 8.3387539 7.5898438 8.4087418 7.5898438 8.4804688 L 7.5898438 13.607422 C 7.5898438 14.141422 7.8729844 14.635297 8.3339844 14.904297 L 13.488281 17.910156 L 11.34375 19.134766 L 6.6484375 16.425781 C 4.5094375 15.190781 3.7747656 12.443687 5.0097656 10.304688 C 5.5874162 9.3043657 6.522013 8.5923015 7.5996094 8.2675781 z M 18.65625 10.865234 L 23.351562 13.574219 C 25.490562 14.809219 26.225234 17.556313 24.990234 19.695312 C 24.412584 20.695634 23.477987 21.407698 22.400391 21.732422 C 22.402722 21.661246 22.410156 21.591258 22.410156 21.519531 L 22.410156 16.392578 C 22.410156 15.858578 22.127016 15.364703 21.666016 15.095703 L 16.511719 12.089844 L 18.65625 10.865234 z M 15.009766 12.947266 L 16.78125 13.980469 L 16.771484 16.035156 L 14.990234 17.052734 L 13.21875 16.017578 L 13.228516 13.964844 L 15.009766 12.947266 z M 18.275391 14.853516 L 20.410156 16.099609 L 20.410156 21.519531 C 20.410156 23.989531 18.399687 26 15.929688 26 C 14.773554 26 13.689361 25.54536 12.869141 24.773438 C 12.931775 24.739955 12.996643 24.713498 13.058594 24.677734 L 17.498047 22.113281 C 17.960047 21.847281 18.246047 21.354312 18.248047 20.820312 L 18.275391 14.853516 z M 16.763672 17.763672 L 16.751953 20.234375 L 12.058594 22.945312 C 9.9195938 24.180312 7.1725 23.443687 5.9375 21.304688 C 5.3595152 20.303787 5.2105423 19.137188 5.46875 18.041016 C 5.5297994 18.079003 5.5857129 18.121992 5.6484375 18.158203 L 10.089844 20.722656 C 10.551844 20.988656 11.120984 20.989609 11.583984 20.724609 L 16.763672 17.763672 z'/%3E%3C/svg%3E";
    const MenuIcon = "data:image/png;base64,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";
    let api_url = 'https://api.tmrace.net/v1/chat/completions';

	class gpt3 {
		constructor() {
			this.chatHistories = {};
		}

		getInfo() {
			return {
				id: "P7SimpleGPT3",
				name: "Simple GPT3",
				menuIconURI: MenuIcon,
				blockIconURI: BlockIcon,
				color1: "#ff4c4c",
				color2: '#f03e3e',
				blocks: [
					{
						opcode: 'setApiUrl',
						hideFromPalette: true,
						blockType: Scratch.BlockType.COMMAND,
						text: 'Set reverse proxy API to [URL]',
						arguments: {
							URL: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'https://api.tmrace.net/v1/chat/completions'
							}
						},
					},

					{
						opcode: 'singlePrompt',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Generate from prompt [PROMPT]',
						arguments: {
							PROMPT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'How are you?',
							},
						},
					},
					{
						opcode: 'createChat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Create chatbot named [chatID]',
						arguments: {
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					{
						opcode: 'informChat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Inform [chatID] that [inform]',
						arguments: {
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							},
							inform: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'You can only speak in binary'
							}
						},
					},
					{
						opcode: 'advancedPrompt',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Ask to [chatID] prompt [PROMPT]',
						arguments: {
							PROMPT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Hello!',
							},
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					'---',
					{
						opcode: 'lastGeneration',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Last [type] from [chatID]',
						arguments: {
							type: {
								type: Scratch.ArgumentType.STRING,
								menu: 'types',
							},
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					'---',
					{
						opcode: 'listChats',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Active chats',
						disableMonitor: true,
					},
					{
						opcode: 'exportChat',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Export chat history of [chatID] in json',
						arguments: {
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					{
						opcode: 'importChat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Import chat history from [json] to [chatID]',
						arguments: {
							json: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'json here'
							},
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					{
						opcode: 'resetChat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Reset chat history of [chatID]',
						arguments: {
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					{
						opcode: 'removeChat',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Delete chatbot [chatID]',
						arguments: {
							chatID: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Apple'
							}
						},
					},
					{
						opcode: 'exportAll',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Export all chats in json',
						disableMonitor: true,
					},
					{
						opcode: 'importAll',
						blockType: Scratch.BlockType.COMMAND,
						text: 'Import all from [json] and [merge]',
						arguments: {
							json: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'json here'
							},
							merge: {
								type: Scratch.ArgumentType.STRING,
								menu: 'merge',
							}
						},
					},
				],
				menus: {
					types: {
						acceptReporters: true,
						items: ['prompt', 'generated text']
					},
					merge: {
						acceptReporters: true,
						items: ['merge with existing chats', 'remove all and import']
					},
				}
			};
		}

		setApiUrl(args) {
			const newApiUrl = args.URL;
			api_url = newApiUrl;
		}

		singlePrompt(args) {
			const prompt = args.PROMPT;

			return Scratch.fetch(api_url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: "gpt-3.5-turbo",
						messages: [{
							role: "user",
							content: prompt
						}]
					}),
				})
				.then(response => {
					if (!response.ok) {
						if (response.status === 429) { // API quota exceeded
							throw new Error("API quota exceeded");
						} else {
							throw new Error(`Generic error: ${response.status} ${response.statusText}`);
						}
					}
					return response.json();
				})
				.then(data => {
					if (!data.choices || data.choices.length === 0) {
						throw new Error("No response");
					}
					const botResponse = data.choices[0].message.content;
					return botResponse;
				})
				.catch(error => {
					console.error("Error sending prompt to GPT", error.message);

					if (error.message === "API quota exceeded") {
						return "Error: You exceeded the API's quota";
					} else if (error.message === "No response") {
						return "Error: There was no response from the API.";
					} else {
						return "Error: An unexpected error occurred! Check Console for response.";
					}
				});
		}

		createChat(args) {
			const chatID = args.chatID;
			if (!(chatID in this.chatHistories)) {
				this.chatHistories[chatID] = [{
					role: "system",
					content: "Your name is: " + chatID
				}];
			}
		}

		informChat(args) {
			const inform = args.inform;
			const chatID = args.chatID;
			if (chatID in this.chatHistories) {
				this.chatHistories[chatID].push({
					role: "system",
					content: inform
				});
			}
		}

		lastGeneration(args) {
			const chatID = args.chatID;
			let type = args.type;
			if (type === 'prompt') {
				type = 'user';
			} else if (type === 'generated text') {
				type = 'assistant';
			}
			if (['user', 'assistant'].includes(type)) {
				if (this.chatHistories[chatID] !== undefined) {
					const chatHistory = this.chatHistories[chatID];
					for (let i = chatHistory.length - 1; i >= 0; i--) {
						if ('role' in chatHistory[i] && chatHistory[i].role === type) {
							return chatHistory[i].content;
						}
					}
				}
			}
			return '';
		}

		exportChat(args) {
			const chatID = args.chatID;
			if (this.chatHistories[chatID] !== undefined) {
				const chatHistory = this.chatHistories[chatID];
				const json = JSON.stringify(chatHistory);
				return json;
			} else {
				return '';
			}
		}

		listChats() {
			const activeChats = Object.keys(this.chatHistories);
			const json = JSON.stringify(activeChats);
			return json;
		}

		importChat(args) {
			const chatID = args.chatID;
			const json = args.json;
			let chatHistory;

			try {
				chatHistory = JSON.parse(json);
			} catch (error) {
				console.error('Error parsing JSON:', error.message);
				return;
			}

			if (Array.isArray(chatHistory)) {
				this.chatHistories[chatID] = chatHistory;
			} else {
				console.error('Invalid JSON format. Expected an array.');
			}
		}

		resetChat(args) {
			const chatID = args.chatID;
			if (chatID in this.chatHistories) {
				this.chatHistories[chatID] = [{
					role: "system",
					content: "Your name is: " + chatID
				}];
			}
		}

		removeChat(args) {
			const chatID = args.chatID;
			if (chatID in this.chatHistories) {
				delete this.chatHistories[chatID];
			}
		}

		advancedPrompt(args) {
			const prompt = args.PROMPT;
			const chatID = args.chatID;

			if (!(chatID in this.chatHistories)) {
				return "Error: That Chatbot does not exist.";
			}

			const chatHistory = this.chatHistories[chatID] || [];
			chatHistory.push({
				role: "user",
				content: prompt
			});

			return Scratch.fetch(api_url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: "gpt-3.5-turbo",
						messages: chatHistory
					}),
				})
				.then(response => {
					if (!response.ok) {
						throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
					}
					return response.json();
				})
				.then(data => {
					if (data.choices && data.choices.length > 0) {
						const botResponse = data.choices[0].message.content;
						chatHistory.push({
							role: "assistant",
							content: botResponse
						});
						this.chatHistories[chatID] = chatHistory;
						return botResponse;
					} else if (data.error && data.error.message === "API quota exceeded") {
						return "Error: You exceeded the API's quota. Please try again later.";
					} else {
						console.error("Unexpected error:", data);
						return "Error: An unexpected error occurred. Perhaps try again later.";
					}
				})
				.catch(error => {
					console.error("Error sending prompt to GPT", error.message);
					return "Error: An unexpected error occurred. Perhaps try again later.";
				});
		}

		exportAll() {
			const allChats = {};
			const chatIDs = Object.keys(this.chatHistories);
			for (const chatID of chatIDs) {
				allChats[chatID] = this.chatHistories[chatID];
			}
			const json = JSON.stringify(allChats);
			return json;
		}

		importAll(args) {
			const json = args.json;
			const mergeOption = args.merge.toLowerCase();
			let importedChats;
			try {
				importedChats = JSON.parse(json);
			} catch (error) {
				console.error('Error parsing JSON:', error.message);
				return;
			}
			if (typeof importedChats === 'object' && importedChats !== null) {
				if (mergeOption === 'remove all and import') {
					this.chatHistories = importedChats;
				} else if (mergeOption === 'merge with existing chats') {
					const importedChatIDs = Object.keys(importedChats);
					for (const chatID of importedChatIDs) {
						this.chatHistories[chatID] = importedChats[chatID];
					}
				} else {
					console.error('Invalid merge option. Expected "remove all and import" or "merge with existing chats".');
				}
			} else {
				console.error('Invalid JSON format. Expected an object.');
			}
		}
	}
	Scratch.extensions.register(new gpt3());
})(Scratch);
