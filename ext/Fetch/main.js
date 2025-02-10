// Fetch - made by pooiod7

class Fetch {
    getInfo () {
    return {
        id: 'fetch',
        name: 'Fetch',
        color1: '#b3b3b3',
        color2: '#595959',
        blocks: [
            {
                opcode: 'getbasic',
                blockType: Scratch.BlockType.REPORTER,
                text: 'get [URL]',
                arguments: {
                    URL: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'https://example.com'
                    }
                }
            },

            {
                opcode: 'getproxy',
                blockType: Scratch.BlockType.REPORTER,
                text: 'get [URL] with proxy',
                arguments: {
                    URL: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'https://example.com'
                    }
                }
            },

            {
                opcode: 'getfile',
                blockType: Scratch.BlockType.REPORTER,
                text: 'Get [URL] as data uri',
                arguments: {
                    URL: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'https://example.com'
                    }
                }
            }
        ]
    };
    }

    async get(args) {
        return this.getproxy(args);
    }

    async getproxy(args) {
        var canfetch = await Scratch.canFetch(args.URL);
        if (!canfetch) return "Error: user denied request";

        return fetch(args.URL)
            .then(r => r.text())
            .catch(() => {
                return fetch('https://corsproxy.io?' + args.URL)
                    .then(r => r.text())
                    .catch(() => {
                    return fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(args.URL))
                    .then(r => r.text())
                    .catch(() => {
                    return fetch('https://thingproxy.freeboard.io/fetch/' + encodeURIComponent(args.URL))
                        .then(r => r.text())
                        .catch((error) => error);
                    });
                });
            });
    }

    async getbasic(args) {
        var canfetch = await Scratch.canFetch(args.URL);
        if (!canfetch) return "Error: user denied request";

        return Scratch.fetch(args.URL)
            .then(r => r.text())
            .catch((error) => error);
    }

    async getfile(args) {
        var canfetch = await Scratch.canFetch(args.URL);
        if (!canfetch) return "Error: user denied request";

        try {
            const response = await Scratch.fetch(args.URL);
            if (!response.ok) throw new Error("Failed to get content");

            return new Promise(async (resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(await response.blob());
            });
        } catch(err) {
            return err;
        }
    }
}

Scratch.extensions.register(new Fetch());
