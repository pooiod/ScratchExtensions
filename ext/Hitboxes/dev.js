// github extension (wip)

(function (Scratch) {
	let lastStatus = "", token = "";

	class Git {
		getInfo() {
			return {
				id: "P7Git",
				name: "Git",
				blocks: [
					{
						opcode: "setToken",
						blockType: Scratch.BlockType.COMMAND,
						text: "Set github token to [TOKEN]",
						arguments: {
							TOKEN: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "GITHUB_TOKEN"
							}
						}
					},
					{ blockType: Scratch.BlockType.LABEL, text: "Get" },
					{
						opcode: "getFileContents",
						blockType: Scratch.BlockType.REPORTER,
						text: "Get contents of file [FILE] from repository [REPO] of user [NAME]",
						arguments: {
							FILE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "README.md"
							},
							REPO: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "docs"
							},
							NAME: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "github"
							}
						}
					},
					{
						opcode: "getRepoZip",
						blockType: Scratch.BlockType.REPORTER,
						text: "Download repository [REPO] of user [NAME] as a zip file",
						arguments: {
							REPO: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "docs"
							},
							NAME: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "github"
							}
						}
					},
					{
						opcode: "getStatus",
						blockType: Scratch.BlockType.REPORTER,
						text: "Last file status"
					},

					{ blockType: Scratch.BlockType.LABEL, text: "Set" },
					{
						opcode: "createFile",
						blockType: Scratch.BlockType.COMMAND,
						text: "Create file [FILE] with content [CONTENT] in repository [REPO] of user [NAME]",
						arguments: {
							FILE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "newFile.txt"
							},
							CONTENT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "Hello, world!"
							},
							REPO: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "repository"
							},
							NAME: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "username"
							},
						}
					},
					{
						opcode: "editFileContent",
						blockType: Scratch.BlockType.COMMAND,
						text: "Edit content of file [FILE] in repository [REPO] of user [NAME] to [CONTENT]",
						arguments: {
							FILE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "newFile.txt"
							},
							CONTENT: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "Hello, world!"
							},
							REPO: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "repository"
							},
							NAME: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "username"
							},
						}
					},
					{
						opcode: "deleteFile",
						blockType: Scratch.BlockType.COMMAND,
						text: "Delete file [FILE] from repository [REPO] of user [NAME]",
						arguments: {
							FILE: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "newFile.txt"
							},
							REPO: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "repository"
							},
							NAME: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: "username"
							},
						}
					},
				]
			};
		}

		setToken(TOKEN) {
			token = TOKEN;
		}

		async getFileContents({ REPO, NAME }) {
			const apiUrl = `https://github.com/${NAME}/${REPO}.git`;
			const response = await Scratch.fetch(apiUrl);
			const data = await response.json();
			lastStatus = response.status;
			if (response.ok) return atob(data.content);
			else return '';
		}

		async getRepoZip({ REPO, NAME }) {
			const response = await fetch(`https://api.github.com/repos/${NAME}/${REPO}/zipball`)
			lastStatus = response.status;
			if (!response.ok) return '';
			const buf = await response.arrayBuffer()
			const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
			return `data:application/zip;base64,${b64}`
		}

		async createFile({ FILE, CONTENT, REPO, NAME }) {
			const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
			const requestBody = JSON.stringify({
				message: `Create ${FILE}`,
				content: CONTENT
			});
			const response = await Scratch.fetch(apiUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `token ${token}`
				},
				body: requestBody
			});
			lastStatus = response.status;
			if (!response.ok) return;
		}

		async editFileContent({ FILE, CONTENT, REPO, NAME }) {
			const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
			const getResponse = await Scratch.fetch(apiUrl, {
				headers: {
					'Authorization': `token ${token}`
				}
			});
			lastStatus = getResponse.status;
			if (!getResponse.ok) return;
			const fileData = await getResponse.json();
			const putResponse = await Scratch.fetch(apiUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `token ${TOKEN}`
				},
				body: JSON.stringify({
					message: `Edit ${FILE}`,
					content: CONTENT,
					sha: fileData.sha
				})
			});
			lastStatus = putResponse.status;
			if (!putResponse.ok) return;
		}

		async deleteFile({ FILE, REPO, NAME }) {
			const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
			const getResponse = await Scratch.fetch(apiUrl, {
				headers: {
					'Authorization': `token ${token}`
				}
			});
			if (!getResponse.ok) return;
			const fileData = await getResponse.json();
			const deleteResponse = await Scratch.fetch(apiUrl, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `token ${token}`
				},
				body: JSON.stringify({
					message: `Delete ${FILE}`,
					sha: fileData.sha
				})
			});
			lastStatus = deleteResponse.status;
			if (!deleteResponse.ok) return;
		}

		getStatus() { return lastStatus }
	}
	Scratch.extensions.register(new Git());
})(Scratch);
