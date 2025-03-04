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
			iframe.src = `data:text/html,<!doctypehtml><html%20lang%3Den><base%20href%3Dhttps%3A%2F%2Fytmp3.plus%2F261-youtube-to-mp4%2F%20><div%20id%3Dcontent><div%20id%3Dconverter_wrapper><div%20id%3Dconverter><form%20method%3Dpost><input%20id%3Dinput%20name%3Dvideo>%20<input%20id%3Dsubmit%20type%3Dsubmit%20value%3DConvert><%2Fform><div%20id%3Dprogress><div%20class%3Dloader><%2Fdiv><%2Fdiv><div%20id%3Dbuttons%20hidden><a%20href%20id%3Ddownloadbtn%20rel%3Dnofollow%20style%3Ddisplay%3Anone>Download<%2Fa><%2Fdiv><%2Fdiv><div%20id%3Dformats%20hidden><a%20href%20id%3Dmp4>mp4<%2Fa>%20<a%20href%20id%3Dmp3>mp3<%2Fa><%2Fdiv><%2Fdiv><%2Fdiv><video%20controls%20id%3Dvidelem%20style%3Ddisplay%3Anone><%2Fvideo><script%20src%3D%2Fassets%2Fjs%2Fjquery-3.4.1.min.js><%2Fscript><script%20src%3D"%2Fassets%2Fjs%2Flang.js%3F%3D1655223185"><%2Fscript><script%20src%3D"%2Fassets%2Fjs%2Fytmp3.js%3Fu%3DNrOSUIDu11tCnRUIUmCCduI%26%3D1655223185"><%2Fscript><script>const%20link%3Ddocument.querySelector("link%5Brel*%3D'icon'%5D")%7C%7Cdocument.createElement("link")%3Bfunction%20loadvid(A)%7Bconsole.log(A)%2Cwindow.parent.postMessage(%7Bfrom%3A"ytdownloadapi"%2Cdat%3AA%7D%2C"*")%2Cdocument.getElementById("videlem").src%3DA%2Cdocument.getElementById("videlem").style.display%3D"block"%2Cdocument.getElementById("videlem").addEventListener("loadeddata"%2Cfunction()%7BcheckForErrorElement()%7D)%7Dlink.type%3D"image%2Fx-icon"%2Clink.rel%3D"shortcut%20icon"%2Clink.href%3D""%2Cdocument.querySelector("head").appendChild(link)%3Bconst%20urlParams%3Dnew%20URLSearchParams(window.location.search)%3Bfunction%20checkForErrorElement()%7Bdocument.getElementById("error")%26%26window.parent.postMessage(%7Bfrom%3A"ytdownloadapi"%2Cdat%3A"ERROR"%7D%2C"*")%7DsetTimeout(function()%7Bdocument.getElementById(urlParams.get("format")).click()%3Blet%20A%3DurlParams.get("q")%3Bdocument.getElementById("input").value%3DA%2CA%3FsetTimeout(function()%7Bdocument.getElementById("submit").click()%7D%2C10)%3A(document.getElementById("input").style.display%3D"block"%2Cdocument.getElementById("progress").style.display%3D"none")%3Blet%20e%3Ddocument.getElementById("progress")%3Bdocument.getElementById("downloadbtn")%3Blet%20E%3Dnew%20MutationObserver(function(A)%7Bfor(let%20E%20of%20A)"attributes"%3D%3D%3DE.type%26%26"style"%3D%3D%3DE.attributeName%26%26"none"%3D%3D%3De.style.display%26%26(checkForErrorElement()%2Cdocument.getElementById("progress").style.display%3D"block"%2Cloadvid(document.getElementById("downloadbtn").href))%7D)%3BE.observe(e%2C%7Battributes%3A!0%7D)%7D%2C100)%2CsetInterval(checkForErrorElement%2C300)%3B<%2Fscript>?format=${TYPE}&q=${VIDURL}`;
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
