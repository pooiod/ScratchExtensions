// Name: Boxed Physics
// Description: An implementation the Box2D physics engine with support for joints, springs, sliders, and more.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Original: Griffpatch
// License: zlib
// Created: Apr 15, 2024
// Docs: /docs/#/BoxedPhysics

(async function() {
    const setupEnv = function() {
        return {
            packager: {
                includeHidden: false,
                removeUnusedVM: true
            },
            extensions: {
                register: (ext) => {},
                unsandboxed: true,
                isPenguinMod: false
            },
            BlockType: {
                COMMAND: 'command',
                REPORTER: 'reporter',
                BOOLEAN: 'boolean',
                HAT: 'hat'
            },
            ArgumentType: {
                STRING: 'string',
                NUMBER: 'number',
                BOOLEAN: 'boolean'
            },
            TargetType: {
                SPRITE: 'sprite',
                STAGE: 'stage'
            },
            vm: {
                runtime: {
                    on: () => {}
                }
            }
        };
    };
    const env = setupEnv();
    const cfg = env.packager || {};
    let ext = null;
    let id = null;

    env.extensions.register = function(e) {
        ext = e;
        try {
            id = e.getInfo().id
        } catch (z) {
            console.error(z)
        }
    };

    try {
        const r = await fetch('https://p7scratchextensions.pages.dev/ext/BoxedPhysics/main.js');
        if (!r.ok) throw new Error('Fetch failed');
        const s = await r.text();

        if (cfg.removeUnusedVM) {
            if (!s.includes('vm')) delete env.vm;
            if (!s.includes('BlockType')) delete env.BlockType;
            if (!s.includes('ArgumentType')) delete env.ArgumentType;
        }

        new Function('Scratch', s)(env);

        const originalExt = ext;
        const info = originalExt.getInfo();
        const wrappedExports = {
            ext: originalExt
        };

        if (info && info.blocks) {
            info.blocks.forEach(block => {
                if (typeof block !== 'object' || !block.opcode) return;
                
                if (typeof originalExt[block.opcode] !== 'function') return;

                const argOrder = [];
                const regex = /\[([^\]]+)\]/g;
                let match;
                while ((match = regex.exec(block.text)) !== null) {
                    argOrder.push(match[1]);
                }

                wrappedExports[block.opcode] = function(...args) {
                    const argsObj = {};
                    
                    argOrder.forEach((argName, index) => {
                        if (index < args.length) {
                            argsObj[argName] = args[index];
                        }
                    });

                    return originalExt[block.opcode](argsObj);
                };
            });
        }

        window["BoxedPhysics"] = wrappedExports;
        
        console.log("BoxedPhysics loaded with wrappers:", Object.keys(wrappedExports));

    } catch (e) {
        console.error('Extension Loading Error:', e);
    }
})();
