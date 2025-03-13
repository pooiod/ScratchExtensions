// Youtube Utilities extension (updated mar/12/2025) by pooiod7

(function (Scratch) {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('Youtube Utils can\'t run in the sandbox');
	}

	var defaulturl = "https://www.youtube.com/watch?v=FtutLA63Cp8";

	class YTutil {
		constructor() {}

		getInfo() {
			return {
				"id": "P7YTutils",
				"name": "You-tilities",
				color1: '#e30000',
				color2: '#ba1818',
				"blocks": [
					{
						opcode: "converturl",
						blockType: "reporter",
						text: "Convert [INPUT] to [TYPE]",
						arguments: {
							INPUT: {
								type: "string",
								defaultValue: defaulturl
							},
							TYPE: {
								menu: 'linkTypeConvert',
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
					},
					{
						opcode: "vidstat",
						blockType: "reporter",
						text: "Get stat [STAT] from video [URL]",
						arguments: {
							STAT: {
								type: "string",
								menu: "statusOptions"
							},
							URL: {
								type: "string",
								defaultValue: defaulturl
							}
						}
					},
					{
						opcode: "search",
						blockType: "reporter",
						text: "Search youtube for [Q]",
						arguments: {
							Q: {
								type: "string",
								defaultValue: "pooiod7"
							}
						}
					},
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
				],
				menus: {
					formats: [
						{ text: "Video", value: "mp4" },
						{ text: "Audio", value: "mp3" }
					],
					linkTypeConvert: ["ID", "URL"],
					thumbFiles: [
						{ text: "Default", value: "default.jpg" },
						{ text: "Max resolution", value: "maxresdefault.jpg" },
						{ text: "High quality", value: "hqdefault.jpg" },
						{ text: "Medium quality", value: "mqdefault.jpg" },
						{ text: "Low quality", value: "sddefault.jpg" },

						{ text: "Generated 1", value: "0.jpg" },
						{ text: "Generated 2", value: "1.jpg" },
						{ text: "Generated 3", value: "2.jpg" },
						{ text: "Generated 4", value: "3.jpg" }
					],
					dat: [
						{ text: "Title", value: "title" },
						{ text: "Author Name", value: "author_name" },
						{ text: "Author Link", value: "author_url" },
						{ text: "Thumbnail Width", value: "thumbnail_width" },
						{ text: "Thumbnail Height", value: "thumbnail_height" },
						{ text: "Thumbnail Link", value: "thumbnail_url" },
						{ text: "Video Width", value: "width" },
						{ text: "Video Height", value: "height" },
						{ text: "Creation date", value: "date created" }
					],
					statusOptions: [
						{ text: "Likes", value: "like" },
						{ text: "Dislikes", value: "dislike" },
						{ text: "Views", value: "view count" },
						{ text: "Rating", value: "rating" }
					],
				},
			};
		}

		converturl({ INPUT, TYPE }) {
			if (TYPE == "ID") {
				const url = INPUT;
				if (!url.includes("http")) return "Invalid Link";
				const urlObj = new URL(url);
				const path = urlObj.pathname;
				if (url.includes("?v=") || url.includes("&v=")) return urlObj.searchParams.get("v") || "Invalid Link";
				else return path.slice(path.lastIndexOf("/") + 1, path.length) || "Invalid Link";
			} else if (TYPE == "URL") {
				return `https://www.youtube.com/watch?v=${INPUT}`;
			}
		}

		async vidjson({ VIDURL, DAT }) {
			if (DAT == "date created") return this.vidstat({ URL:VIDURL, STAT:DAT });

			return Scratch.fetch(`https://noembed.com/embed?url=${encodeURIComponent(VIDURL)}`)
				.then((response) => response.json())
				.then((data) => (data[DAT]))
				.catch((error) => {
					console.error('Error fetching data:', error);
					return false;
				});
		}

		async vidstat({ URL, STAT }) {
			var ID = this.converturl({ INPUT: URL, TYPE: "ID"});

			try {
				const response = await Scratch.fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${ID}`);
				if (!response.ok) return "Error: response not ok";
				const jsonData = await response.json();
				switch (STAT) {
					case "like": return jsonData.likes;
					case "dislike": return jsonData.dislikes;
					case "view count": return jsonData.viewCount;
					case "rating": return jsonData.rating;
					case "date created": return jsonData.dateCreated;
					default: return "Error: unknown stat";
				}
			} catch { return "Error: failed to reach API" }
		}

		vidthumb({ VIDURL, TYPE }) {
			var id = new URLSearchParams(new URL(VIDURL).search).get("v");
			return "https://img.youtube.com/vi/" + id + "/" + TYPE;
		}

		async search({ Q }) {
			return new Promise((resolve, reject) => {
				Scratch.fetch(`https://d.ymcdn.org/api/v1/search?q=${encodeURIComponent(Q)}`)
					.then(response => response.json())
					.then(data => {
						if (data.count > 0) {
							resolve(JSON.stringify(data.yt));
						} else {
							resolve('No results');
						}
					})
					.catch(e => reject('Error fetching results'));
			});
		}

		async downloadvid({ VIDURL, TYPE }, _, check) {
			if (!check && !await Scratch.canFetch("https://p7scratchextensions.pages.dev/ext/YouTilities/api")) {
				return "Error: API call rejected by user";
			}

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
								resolve(data.dat !== 'ERROR' ? data.dat : "Error: unable to download video");
							}
						} catch (error) {
							// iframe.parentNode.removeChild(iframe);
							// document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
							// resolve("");
						}

						if (intime >= 100) {
							iframe.parentNode.removeChild(iframe);
							document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
							resolve("Error: API did not respond");
						}
					} else {
						if (intime >= 100) {
							iframe.parentNode.removeChild(iframe);
							document.getElementById("nhce982404").parentNode.removeChild(document.getElementById("nhce982404"));
							resolve("Error: API did not respond");
						}
					}
				}, 100);
			});
		}
	}

	Scratch.extensions.register(new YTutil());
})(Scratch);
