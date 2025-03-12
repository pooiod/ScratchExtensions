// Youtube Utilities extension v1 by pooiod7

(function (Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('Youtube Utils can\'t run in the sandbox');
	}

	var defaulturl = "https://www.youtube.com/watch?v=FtutLA63Cp8";

	class YTutil {
		getInfo() {
			return {
				"id": "P7YTutils",
				"name": "You-tilities",
				color1: '#e30000',
				color2: '#ba1818',
				"blocks": [
					{
						opcode: "downloadvid",
						blockType: "reporter",
						text: "Get video [VIDURL] as [TYPE]",
						arguments: {
							VIDURL: {
								type: "string",
								defaultValue: defaulturl
							},
							TYPE: {
								menu: 'formats',
								defaultValue: "Audio"
							}
						}
					},
					{
						opcode: "vidthumb",
						blockType: "reporter",
						text: "Get thumbnail from video [VIDURL] as [TYPE]",
						arguments: {
							VIDURL: {
								type: "string",
								defaultValue: defaulturl
							},	
							TYPE: {
								type: "string",
								menu: 'thumbFiles',
							}
						}
					},
					{
						opcode: "vidjson",
						blockType: "reporter",
						text: "Get [DAT] from video [VIDURL]",
						arguments: {
							VIDURL: {
								type: "string",
								defaultValue: defaulturl
							},
							DAT: {
								menu: 'dat',
								defaultValue: "title"
							}
						}
					}
				],
				menus: {
					formats: [
						{ text: "Video", value: "mp4" },
						{ text: "Audio", value: "mp3" }
					],
					thumbFiles: [
						{ text: "Default", value: "default.jpg" },
						{ text: "Max resolution", value: "maxresdefault.jpg" },
						{ text: "High quality", value: "hqdefault.jpg" },
						{ text: "Medium quality", value: "mqdefault.jpg" },
						{ text: "Low quality", value: "sddefault.jpg" },

						{ text: "Generated 1", value: "0.jpg" },
						{ text: "Generated 2", value: "1.jpg" },
						{ text: "Generated 3", value: "2.jpg" },
						{ text: "Generated 4", value: "3.jpg" },
					],
					dat: [
						{ text: "Title", value: "title" },
						{ text: "Author Name", value: "author_name" },
						{ text: "Author Link", value: "author_url" },
						{ text: "Thumbnail Width", value: "thumbnail_width" },
						{ text: "Thumbnail Height", value: "thumbnail_height" },
						{ text: "Thumbnail Link", value: "thumbnail_url" },
						{ text: "Video Width", value: "width" },
						{ text: "Video Height", value: "height" }
					],
				},
			};
		}

		vidjson({ VIDURL, DAT }) {
			return fetch(`https://noembed.com/embed?url=${encodeURIComponent(VIDURL)}`)
				.then((response) => response.json())
				.then((data) => (data[DAT]))
				.catch((error) => {
					console.error('Error fetching data:', error);
					return false;
				});
		}

		vidthumb({ VIDURL, TYPE }) {
			var id = new URLSearchParams(new URL(VIDURL).search).get("v");
			return "https://img.youtube.com/vi/" + id + "/" + TYPE;
		}

		async downloadvid({ VIDURL, TYPE }) {
			const iframe = document.createElement('iframe');
			const nhce982404 = document.createElement("div");
			nhce982404.id = "nhce982404";
			nhce982404.style.display = "none";
			document.body.appendChild(nhce982404);

			window.addEventListener('message', (event) => {
				if (event && event.data) {
					nhce982404.textContent = JSON.stringify(event.data);
				}
			});

			iframe.style.display = 'none';
			iframe.src = `https://p7scratchextensions.pages.dev/ext/YouTilities/api.html?format=${TYPE}&q=${VIDURL}`;
			document.body.appendChild(iframe);

			return new Promise(resolve => {
				let intime = 0;
				let intervalId = setInterval(() => {
					const element = document.getElementById("nhce982404");
					intime += 1;
					if (element && element.textContent) {
						try {
							const data = JSON.parse(element.textContent);
							if (data.from === 'ytdownloadapi') {
								clearInterval(intervalId);
								iframe.parentNode.removeChild(iframe);
								document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
								resolve(data.dat !== 'ERROR' ? data.dat : false);
							}
						} catch (error) {
							iframe.parentNode.removeChild(iframe);
							document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
							resolve("");
						}

						if (intime >= 1000) {
							iframe.parentNode.removeChild(iframe);
							document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
							resolve("");
						}
					} else {
						if (intime >= 100) {
							iframe.parentNode.removeChild(iframe);
							document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
							resolve("");
						}
					}
				}, 100);
			});
		}
	}

	Scratch.extensions.register(new YTutil());
})(Scratch);
