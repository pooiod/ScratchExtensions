(function(Scratch) {
    'use strict';

    class RaccFacts {
        constructor() {
            this.localWikiSnippet = 
                'Racoons (Procyon lotor) are medium-sized mammals native to North America. They are known for their distinctive black facial mask and ringed tail.';
            this.localFacts = [
                "Racoons are highly intelligent animals.",
                "They are known for their dexterous front paws.",
                "Racoons can run at speeds of up to 15 miles per hour.",
                "They are native to North America but have spread to other continents."
            ];
        }

        getInfo() {
            return {
                id: 'RaccFacts',
                name: 'Racoon Facts',
                color1: "#525252",
                color2: "#292929",
                blocks: [
                    {
                        opcode: 'getRandomFact',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Random racoon fact as [TYPE]',
                        disableMonitor: true,
                        arguments: {
                            TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'type',
                                defaultValue: 'text',
                            },
                        }
                    },
                    {
                        opcode: 'areRacoonsAmazing',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'Are racoons amazing?'
                    },
                    {
                        opcode: 'getRandomImage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Random racoon image',
                        disableMonitor: true
                    },
                    {
                        opcode: 'getRandomVideo',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Random racoon video',
                        disableMonitor: true
                    },
                    {
                        opcode: 'racoonOfThe',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Racoon of the [TIME]',
                        disableMonitor: true,
                        arguments: {
                            TIME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'time',
                                defaultValue: 'day',
                            },
                        }
                    },
                    {
                        opcode: 'getWikiInfo',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Wiki info on racoons',
                        disableMonitor: true
                    }
                ],
                menus: {
                    type: {
                        acceptReporters: true,
                        items: ['text', 'json']
                    },
                    time: {
                        acceptReporters: true,
                        items: ['day', 'hour']
                    }
                }
            };
        }

        async getRandomFact(args) {
            try {
                if (args.TYPE == "json") {
                    const response = await fetch('https://some-random-api.com/animal/Raccoon');
                    const data = await response.json();
                    if (!data) return 'Could not fetch fact.';
                    return JSON.stringify(data);
                } else {
                    const response = await fetch('https://api.racc.lol/v1/fact');
                    const data = await response.json();
                    return data.data.fact || 'Could not fetch fact.';
                }
            } catch (e) {
                // return 'Error fetching online fact.';
                const randomIndex = Math.floor(Math.random() * this.localFacts.length);
                return this.localFacts[randomIndex];
            }
        }

        areRacoonsAmazing() {
            return true;
        }

        async getRandomImage() {
            try {
                const response = await fetch('https://api.racc.lol/v1/raccoon?json=true');
                const data = await response.json();
                return data.data.url || 'Error fetching image.';
            } catch (e) {
                return 'Error fetching image.';
            }
        }

        async getRandomVideo() {
            try {
                const response = await fetch('https://api.racc.lol/v1/video?json=true');
                const data = await response.json();
                return data.data.url || 'Error fetching image.';
            } catch (e) {
                return 'Error fetching image.';
            }
        }

        async racoonOfThe(args) {
            try {
                const response = await fetch(`https://api.racc.lol/v1/${args.TIME=="day"?"raccoftheday":"racchour"}?json=true`);
                const data = await response.json();
                return data.data.url || 'Error fetching image.';
            } catch (e) {
                return 'Error fetching image.';
            }
        }

        async getWikiInfo() {
            const wikipediaApiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/Raccoon';
            try {
                const response = await fetch(wikipediaApiUrl);
                const data = await response.json();
                if (data.extract) {
                    return data.extract;
                } else {
                    throw new Error('No Wikipedia extract found.');
                }
            } catch (e) {
                return this.localWikiSnippet;
            }
        }
    }

    Scratch.extensions.register(new RaccFacts());
})(Scratch);
