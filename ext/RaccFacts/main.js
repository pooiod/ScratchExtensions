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
                        text: 'Random racoon image'
                    },
                    {
                        opcode: 'getWikiInfo',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Wiki info on racoons'
                    }
                ],
                menus: {
                    type: {
                        acceptReporters: true,
                        items: ['text', 'json']
                    }
                }
            };
        }

        async getRandomFact(args) {
            try {
                const response = await fetch('https://some-random-api.com/animal/Raccoon');
                const data = await response.json();
                if (args.TYPE == "json") {
                    if (!data) return 'Could not fetch fact.';
                    return JSON.stringify(data);
                } else {
                    return data.fact || 'Could not fetch fact.';
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
                const response = await fetch('https://some-random-api.com/img/Raccoon');
                const data = await response.json();
                return data.link || 'Error fetching image.';
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
