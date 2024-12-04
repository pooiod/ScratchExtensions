
class Fetch {
    getInfo () {
      return {
        id: 'fetch',
        name: 'Fetch',
        color1: '#b3b3b3',
        color2: '#595959',
        blocks: [
          {
            opcode: 'get',
            blockType: Scratch.BlockType.REPORTER,
            text: 'GET [URL]',
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com'
              }
            }
          },
          {
            opcode: 'getbasic',
            blockType: Scratch.BlockType.REPORTER,
            text: 'GET PAGE [URL]',
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
  
    get (args) {
      return fetch(args.URL)
        .then(r => r.text())
        .catch(() => {
          return fetch('https://thingproxy.freeboard.io/fetch/' + args.URL)
            .then(r => r.text())
            .catch(() => {
            return fetch('https://corsproxy.io?' + encodeURIComponent(args.URL))
              .then(r => r.text())
              .catch(() => {
               return fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(args.URL))
                  .then(r => r.text())
                .catch((error) => error);
               });
           });
        });
    }
  
    getbasic (args) {
      return fetch(args.URL)
        .then(r => r.text())
        .catch((error) => error);
    }
  }
  
  Scratch.extensions.register(new Fetch());
  