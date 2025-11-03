// Name: Server Data
// ID: serverData
// Description: Simple file storage using tools from Snap!
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: false
// WIP: false
// Created: May 18, 2024
// Notes: This extension is depricated

class ServerExtension {
    constructor(runtime) {
      this.runtime = runtime;
      this.serverURL = 'https://snapextensions.uni-goettingen.de/handleTextfile.php';
    }
  
    getInfo() {
      return {
        id: 'serverData',
        name: 'Server Data',
        color1: '#31b3d4',
        color2: '#179fc2',
        blocks: [
          {
            opcode: 'saveToServer',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Save [variableName] with content [content]',
            arguments: {
              variableName: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'default.txt',
              },
              content: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Hello, World!',
              },
            },
          },
          {
            opcode: 'deleteFromServer',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Delete [variableName]',
            arguments: {
              variableName: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'default.txt',
              },
            },
          },
          {
            opcode: 'loadFromServer',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Load [variableName]',
            arguments: {
              variableName: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'default.txt',
              },
            },
          },
        ],
      };
    }
  
    saveToServer(args, util) {
      const variableName = args.variableName;
      const content = args.content;
  
      const url =
        this.serverURL +
        '?type=write' +
        '&content=' +
        encodeURIComponent(content) +
        '&filename=./textfiles/' +
        encodeURIComponent(variableName);
  
      return fetch(url)
        .then(response => response.text())
        .then(result => (result === 'ok'))
        .catch(error => {
          console.error('Failed to save data:', error);
          return false;
        });
    }
    
    deleteFromServer(args, util) {
      const variableName = args.variableName;
      const content = args.content;
  
      const url =
        this.serverURL +
        '?type=delete&filename=./textfiles/' +
        encodeURIComponent(variableName);
  
      return fetch(url)
        .then(response => response.text())
        .then(result => (result === 'ok'))
        .catch(error => {
          console.error('Failed to delete data:', error);
          return false;
        });
    }
  
    loadFromServer(args, util) {
      const variableName = args.variableName;
  
      const url =
        this.serverURL +
        '?type=read' +
        '&filename=./textfiles/' +
        encodeURIComponent(variableName);
  
      return fetch(url)
        .then(response => response.text())
        .catch(error => {
          console.error('Failed to load data:', error);
          return "can't get data";
        });
    }
  }
  
  Scratch.extensions.register(new ServerExtension());
  