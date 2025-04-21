(async () => {
	var repo = 'pooiod/ScratchExtensions';
	var position = 'left';
	var commitsPerPage = 20;
	var totalcommits = 40;
	var showRandomUpdates = false;

	var windowTheme = window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
	var styleThingy = document.createElement('style');
	styleThingy.innerHTML = `
		body {
			transition: width 0.3s ease-in-out;
		}

		.commit-widget {
			position: fixed;
			bottom: 0px;
			${position}: 0;
			width: 340px;
			/*max-height: 80vh;*/
			height: 100vh;
			background: ${windowTheme === 'light' ? '#ffffff' : '#1a1a1a'};
			color: ${windowTheme === 'light' ? '#000' : '#fff'};
			font-family: sans-serif;
			font-size: 14px;
			overflow-y: auto;
			z-index: 9999;
			transform: translateX(${position=="right"?"100%":"-100%"});
			transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
			${document.body.clientWidth < 900 ? `width: 100%`: `border-${position=="right"?"left":"right"}: 1px solid ${windowTheme === 'light' ? '#ccc' : '#444'}`};
		}

		.commit-widget.open {
			transform: translateX(0);
		}

		.commit-widget-header {
			position: sticky;
			top: 0;
			background: inherit;
			padding: 12px 16px;
			font-size: 18px;
			font-weight: bold;
			border-bottom: 1px solid ${windowTheme === 'light' ? '#ddd' : '#333'};
		}

		.commit-item {
			padding: 10px 16px;
			border-bottom: 1px solid ${windowTheme === 'light' ? '#eee' : '#444'};
			cursor: pointer;
			transition: background 0.2s;
		}

		.commit-item:hover {
			background: ${windowTheme === 'light' ? '#f9f9f9' : '#2a2a2a'};
		}

		.commit-item .date {
			font-size: 12px;
			color: ${windowTheme === 'light' ? '#777' : '#aaa'};
			margin-bottom: 4px;
		}

		.commit-item .title {
			font-weight: bold;
			margin-bottom: 4px;
		}

		.commit-item .body {
			font-size: 13px;
			color: ${windowTheme === 'light' ? '#444' : '#ccc'};
			margin-top: 0;
		}

		.commit-toggle {
			position: fixed;
			bottom: 0px;
			${position}: 0;
			background: ${windowTheme === 'light' ? '#eee' : '#222'};
			color: ${windowTheme === 'light' ? '#000' : '#fff'};
			border: 0px;
			border-${position=="right"?"left":"right"}: 1px solid ${windowTheme === 'light' ? '#ccc' : '#444'};
			border-top: 1px solid ${windowTheme === 'light' ? '#ccc' : '#444'};
			transition: width 0.3s ease-in-out;
			border-top-${position=="right"?"left":"right"}-radius: 10px;
			/*border-radius: 6px 0 0 6px;*/
			padding: 6px 10px;
			font-size: 18px;
			cursor: pointer;
			z-index: 10000;
			transform: translateX(${position=="right"?"100%":"-100%"});
			transition: transform 0.3s ease-in-out, left 0.3s ease-in-out, right 0.3s ease-in-out;
			height: 40px;
		}
		.commit-toggle.open {
			${document.body.clientWidth < 900?"":`${position}: 340px;`}
		}

		.commit-loader {
			text-align: center;
			padding: 20px;
			font-style: italic;
			color: ${windowTheme === 'light' ? '#999' : '#aaa'};
		}

		.load-more-btn {
			background: ${windowTheme === 'light' ? '#f0f0f0' : '#333'};
			color: ${windowTheme === 'light' ? '#000' : '#fff'};
			height: 40px;
			border: none;
			padding: 10px;
			width: 100%;
			cursor: pointer;
			border-top: 1px solid ${windowTheme === 'light' ? '#ddd' : '#444'};
			font-weight: bold;
		}
	`;
	document.head.appendChild(styleThingy);

	const toggleBtn = document.createElement('button');
	toggleBtn.className = 'commit-toggle';
	toggleBtn.innerHTML = position=="right"?"⯇":"⯈";
	document.body.appendChild(toggleBtn);

	const widget = document.createElement('div');
	widget.className = 'commit-widget';
	widget.innerHTML = `<div class="commit-widget-header">Recent updates</div><div class="commit-loader">Loading...</div>`;
	document.body.appendChild(widget);

	let expanded = false;
	let currentPage = 1;
	let allCommits = [];

	widget.style.opacity = "0%";
	document.body.style.width = "100vw";
	if (position == "left") document.body.style.float = "right";

	toggleBtn.addEventListener('click', () => {
		loadCommits();

		expanded = !expanded;
		widget.classList.toggle('open', expanded);
		toggleBtn.classList.toggle('open', expanded);
		toggleBtn.innerHTML = expanded ? `${position=="left"?"⯇":"⯈"}` : `${position=="left"?"⯈":"⯇"}`;
		if (expanded) {
			widget.style.opacity = "100%";
			if (document.body.clientWidth >= 900) {
				document.body.style.width = "calc(100vw - 340px)";
			}
		} else {
			widget.style.opacity = "0%";
			document.body.style.width = "100vw";
		}
	});

	function renderCommits(commits) {
		const container = document.createElement('div');

		commits.forEach(commit => {
			const date = new Date(commit.commit.author.date).toLocaleString();
			let message = commit.commit.message.trim();
			const [title, ...rest] = message.split('\n');
			var body = rest.join('<br>').trim();
			const short = message.length < 5;

			const files = commit.files?.map(f => f.filename).join('<br>') || false;
			const displayMessage = short ? `Updated files` : title;
			if (short || !body) body = files;

			const item = document.createElement('div');
			item.className = 'commit-item';
			item.innerHTML = `
		<div class="date">${date}</div>
		<div class="title">${displayMessage}</div>
		${body ? `<div class="body">${body}</div>` : ''}
		`;
			item.addEventListener('click', () => {
				window.open(commit.html_url, '_blank');
			});

			if (!showRandomUpdates && short) return;
			if ((!short && body) || (!short && title) || body) {
				container.appendChild(item);
			}
		});

		widget.innerHTML = `<div class="commit-widget-header">Recent updates</div>`;
		widget.appendChild(container);

		if (allCommits.length > currentPage * commitsPerPage) {
			const btn = document.createElement('button');
			btn.className = 'load-more-btn';
			btn.innerText = 'Load more';
			btn.onclick = () => {
				currentPage++;
				renderCommits(allCommits.slice(0, currentPage * commitsPerPage));
			};
			widget.appendChild(btn);
		}
	}

	var loaded = false;
	async function loadCommits() {
		if (loaded) return;
		loaded = true;

		try {
			const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=${totalcommits}`);
			const commits = await res.json();
			allCommits = commits;
	
			const detailed = await Promise.all(
				commits.slice(0, commitsPerPage).map(c => fetch(c.url).then(res => res.json()))
			);
	
			renderCommits(detailed);
		} catch (err) {
			console.error(err);
			widget.innerHTML = `<div class="commit-widget-header">Recent updates</div><div class="commit-loader">Error loading commits</div>`;
		}
	}

	toggleBtn.style.transform = "translateX(0)";
})();
