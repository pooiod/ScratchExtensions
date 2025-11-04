// Name: Chat AI
// ID: chatai
// Description: 
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: dev
// Unsandboxed: true
// WIP: true
// Created: Oct 20, 2023
// Notes: This extension does not work anymore (v1.5)

(async function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) throw new Error('Chatbots must run unsandboxed!');
    
    let serverkey = "8037184892640";
  
    async function promptbot(bot, prompt) {
      let maxtime = 10;
      const timer = Date.now() / 1000;
  
      while (true) {
        const loading = await fetch("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=read&filename=./textfiles/"+serverkey+bot+".txt");
        const data = await loading.text();
        if (!data.includes("loading") || (Date.now() / 1000) - timer > maxtime) {
          break;
        }
      }
  
      if ((Date.now() / 1000) - timer > maxtime) {
        await fetch("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content=" + encodeURIComponent("api reload") + "&filename=./textfiles/"+serverkey+bot+".txt");
        return "Error: too many requests";
      } else {
        maxtime = 50;
        await fetch("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=write&content=" + encodeURIComponent(bot + "|" + prompt) + "&filename=./textfiles/"+serverkey+".txt");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const newTimer = Date.now() / 1000;
        while (true) {
          const loading = await fetch("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=read&filename=./textfiles/"+serverkey+bot+".txt");
          const data = await loading.text();
          if (!data.includes("loading") || (Date.now() / 1000) - newTimer > maxtime) {
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        if ((Date.now() / 1000) - newTimer > maxtime) {
          return "Error: api error";
        } else {
          const response = await fetch("https://snapextensions.uni-goettingen.de/handleTextfile.php?type=read&filename=./textfiles/"+serverkey+bot+".txt");
          const content = await response.text();
          if (content.split("|").length > 1) {
            return "Error: unknown api error";
          } else {
            return content;
          }
        }
      }
    }
    async function clearchat(botID) {
      await promptbot(botID, "");
      await promptbot(botID, "(forget everything before this message)");
    }
  
    class chatai {
      getInfo() {
        return {
          id: 'chatai',
          name: 'Chat AI',
        color1: '#2473ae',
        color2: '#3498db',
          blocks: [
            {
              opcode: 'setkey',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Set server key [KEY]',
              arguments: {
                KEY: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: serverkey,
                },
              }
            },
            {
              opcode: 'clearbot',
              blockType: Scratch.BlockType.COMMAND,
              text: 'Clear chat with bot [BOT]',
              arguments: {
                BOT: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: '4sFuU5Xd8F1_jdpTOLJLlnSIGYgbufMYcHUluPzdE6s',
                },
              }
            },
            {
              opcode: 'sendprompt',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Ask [PROMPT] to [BOT]',
              arguments: {
                BOT: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: '4sFuU5Xd8F1_jdpTOLJLlnSIGYgbufMYcHUluPzdE6s',
                },
                PROMPT: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'Hello, Scratch Cat!',
                }
              }
            }
          ],
        };
      }
      
      setkey(args) {
        serverkey = args.KEY;
      }
  
      sendprompt(args) {
        if (args.BOT != "") {
          if (args.PROMPT != "") {
            return promptbot(args.BOT, args.PROMPT);
          } else {
            return promptbot(args.BOT, "...");
          }
        } else {
          return "Error: no bot set";
        }
      }
  
      clearbot(args) {
        if (args.BOT != "") {
          return clearchat(args.BOT);
        }
      }
    }
  
    Scratch.extensions.register(new chatai());
  })(Scratch);
  