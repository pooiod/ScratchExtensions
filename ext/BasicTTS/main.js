// Name: Test to speech
// ID: testToSpeech
// Description: Make your project reat dext out loud
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: false
// Created: Dec 18, 2023
// Notes: Based on a ScratchX extension created by Sayamindu Dasgupta on April 2014

(function (Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
      throw new Error('Can\'t load text to speach in sandboxed mode');
    }
    
    if (window.SpeechSynthesisUtterance === undefined) {
      alert('Your browser does not support text to speech');
    }
    
    class TextToSpeech {
        constructor(runtime) {
            this.runtime = runtime;
            this.isSpeaking = false;
        }
    
        getInfo() {
            return {
                id: 'textToSpeech',
                name: 'Text to Speech',
                blocks: [
                    {
                        opcode: 'speakText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'speak [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, Scratchers!',
                            },
                        },
                    },
                ],
            };
        }
    
        speakText(args, util) {
            if (this.isSpeaking) {
                return; // Do nothing if TTS is already in progress
            }
    
            let text = args.TEXT.toString();
    
            // fix pronouncing errors
            text = text.replace(/pooiod/g, 'poiod');
            text = text.replace(/\bama(?![a-rt-z])\b/g, 'awma');
            text = text.replace(/JavaScript/g, 'jawva script');
    
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                this.isSpeaking = false;
                util.yield(); // Signal that TTS has completed
            };
    
            this.isSpeaking = true;
            window.speechSynthesis.speak(utterance);
    
            // Return a promise to make the block wait
            return new Promise((resolve) => {
                this.resolvePromise = resolve;
            });
        }
    }
    
    Scratch.extensions.register(new TextToSpeech());
  })(Scratch);
  