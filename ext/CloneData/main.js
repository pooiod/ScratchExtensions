// Name: Clone Data
// ID: P7CloneData
// Description: Track and control clones.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: main
// Unsandboxed: true
// WIP: false
// Created: 5/5/2026

(function (Scratch) {
    'use strict';

    const vm = Scratch.vm;

    let color1 = '#FFAB19';
    let color2 = '#EC9C13';
    let color3 = '#CF8B17';

    try {
        if (typeof ScratchBlocks !== 'undefined' && ScratchBlocks.Colours && ScratchBlocks.Colours.control) {
            color1 = ScratchBlocks.Colours.control.primary || color1;
            color2 = ScratchBlocks.Colours.control.secondary || color2;
            color3 = ScratchBlocks.Colours.control.tertiary || color3;
        }
    } catch (e) { }

    class CloneData {
        constructor() {
            this.cloneTags = new Map();
            this.cloneIds = new Map();

            vm.runtime.on('targetWasRemoved', (target) => {
                this.cloneTags.delete(target.id);
                this.cloneIds.delete(target.id);
            });

            const originalCreateClone = vm.runtime.ext_scratch3_control._createClone;
            const self = this;
            vm.runtime.ext_scratch3_control._createClone = function (targetName, sourceTarget) {
                const result = originalCreateClone.call(this, targetName, sourceTarget);
                const clones = sourceTarget.sprite.clones;
                const newClone = clones[clones.length - 1];
                if (newClone && newClone !== sourceTarget.sprite.clones[0]) {
                    self.setUniqueId(newClone);
                }
                return result;
            };
        }

        setUniqueId(target) {
            let newId;
            const spriteClones = target.sprite.clones;
            const existingIds = spriteClones.map(c => this.cloneIds.get(c.id)).filter(Boolean);
            do {
                newId = Math.random().toString(36).substring(2, 9);
            } while (existingIds.includes(newId));
            this.cloneIds.set(target.id, newId);
        }

        getTargetById(id, currentTarget) {
            if (!currentTarget || !currentTarget.sprite) return null;
            const clones = currentTarget.sprite.clones;
            const matches = clones.filter(c => this.cloneIds.get(c.id) === id);
            if (matches.length === 0) return null;
            return matches[Math.floor(Math.random() * matches.length)];
        }

        getVariable(target, varInput) {
            if (!target) return null;
            return target.lookupVariableById(varInput) || target.lookupVariableByNameAndType(varInput, '');
        }

        getInfo() {
            return {
                id: 'P7CloneData',
                name: 'CloneData',
                color1: color1,
                color2: color2,
                color3: color3,
                blocks: [
                    {
                        opcode: 'createCloneWithId',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create clone with ID [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'special' }
                        }
                    },

                    {
                        opcode: 'setMyId',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set clone ID to [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'clone1' }
                        }
                    },

                    {
                        opcode: 'addTag',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add clone tag [TAG]',
                        arguments: {
                            TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' }
                        }
                    },
                    {
                        opcode: 'removeTag',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove clone tag [TAG]',
                        arguments: {
                            TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' }
                        }
                    },

                    '---',

                    {
                        opcode: 'getAllIds',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Every clone ID'
                    },
                    {
                        opcode: 'countClones',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Number of clones'
                    },

                    '---',

                    {
                        opcode: 'idsWithTag',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IDs of clones with tag [TAG]',
                        arguments: {
                            TAG: { type: Scratch.ArgumentType.STRING, defaultValue: 'enemy' }
                        }
                    },
                    {
                        opcode: 'getTags',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Tags of clone [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'clone1' }
                        }
                    },

                    '---',

                    {
                        opcode: 'getTagsOfTouching',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Tags of clones touching me'
                    },
                    {
                        opcode: 'idsTouchingMe',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'IDs of clones touching me'
                    },

                    '---',

                    {
                        opcode: 'forEachClone',
                        blockType: Scratch.BlockType.LOOP,
                        text: 'For each clone set [VAR] to ID and do',
                        arguments: {
                            VAR: { type: Scratch.ArgumentType.STRING, menu: 'VARIABLES' }
                        }
                    },

                    {
                        opcode: 'runAsClone',
                        blockType: Scratch.BlockType.LOOP,
                        text: 'Run as clone [ID]',
                        arguments: {
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'clone1' }
                        }
                    },
                    {
                        opcode: 'runAsSprite',
                        blockType: Scratch.BlockType.LOOP,
                        text: 'Run as sprite [SPRITE]',
                        arguments: {
                            SPRITE: { type: Scratch.ArgumentType.STRING, menu: 'SPRITE_MENU' }
                        }
                    },

                    '---',

                    {
                        opcode: 'setVarInClone',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set variable [VAR] in clone [ID] to [VALUE]',
                        arguments: {
                            VAR: { type: Scratch.ArgumentType.STRING, menu: 'VARIABLES' },
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'clone1' },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
                        }
                    },
                    {
                        opcode: 'getVarFromClone',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get variable [VAR] from clone [ID]',
                        arguments: {
                            VAR: { type: Scratch.ArgumentType.STRING, menu: 'VARIABLES' },
                            ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'clone1' }
                        }
                    },

                    {
                        opcode: 'setVarInMain',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set variable [VAR] in main sprite to [VALUE]',
                        arguments: {
                            VAR: { type: Scratch.ArgumentType.STRING, menu: 'VARIABLES' },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '10' }
                        }
                    },
                    {
                        opcode: 'getVarFromMain',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get variable [VAR] from main sprite',
                        arguments: {
                            VAR: { type: Scratch.ArgumentType.STRING, menu: 'VARIABLES' }
                        }
                    }
                ],
                menus: {
                    VARIABLES: {
                        acceptReporters: true,
                        items: 'getVariablesMenu'
                    },
                    SPRITE_MENU: {
                        acceptReporters: true,
                        items: 'getSpritesMenu'
                    }
                }
            };
        }

        getVariablesMenu() {
            const stage = vm.runtime.getTargetForStage();
            const stageVars = stage ? stage.variables : {};
            const targetVars = vm.editingTarget ? vm.editingTarget.variables : {};
            const allVars = {};
            Object.assign(allVars, stageVars, targetVars);
            const vars = Object.values(allVars)
                .filter(v => v.type === '')
                .map(v => ({ text: v.name, value: v.id }));
            return vars.length > 0 ? vars : [{ text: '', value: '' }];
        }

        getSpritesMenu() {
            return vm.runtime.targets
                .filter(t => t.isOriginal && !t.isStage)
                .map(t => ({ text: t.sprite.name, value: t.sprite.name }));
        }

        setMyId(args, util) {
            if (util.target.isOriginal) return;
            this.cloneIds.set(util.target.id, args.ID);
        }

        addTag(args, util) {
            if (util.target.isOriginal) return;
            if (!this.cloneTags.has(util.target.id)) {
                this.cloneTags.set(util.target.id, new Set());
            }
            this.cloneTags.get(util.target.id).add(args.TAG);
        }

        removeTag(args, util) {
            if (util.target.isOriginal) return;
            const tags = this.cloneTags.get(util.target.id);
            if (tags) tags.delete(args.TAG);
        }

        setVarInClone(args, util) {
            const target = this.getTargetById(args.ID, util.target);
            const variable = this.getVariable(target, args.VAR);
            if (variable) {
                variable.value = args.VALUE;
            }
        }

        getVarFromClone(args, util) {
            const target = this.getTargetById(args.ID, util.target);
            const variable = this.getVariable(target, args.VAR);
            return variable ? variable.value : '';
        }

        getAllIds(args, util) {
            const ids = [];
            if (!util.target || !util.target.sprite) return JSON.stringify(ids);
            for (const clone of util.target.sprite.clones) {
                if (clone.isOriginal) continue;
                const id = this.cloneIds.get(clone.id);
                if (id) ids.push(id);
            }
            return JSON.stringify(ids);
        }

        countClones(args, util) {
            if (!util.target || !util.target.sprite) return 0;
            return Math.max(0, util.target.sprite.clones.length - 1);
        }

        createCloneWithId(args, util) {
            vm.runtime.ext_scratch3_control._createClone("_myself_", util.target);
            const clones = util.target.sprite.clones;
            const newClone = clones[clones.length - 1];
            if (newClone) {
                this.cloneIds.set(newClone.id, args.ID);
            }
        }

        forEachClone(args, util) {
            const ids = [];
            if (util.target && util.target.sprite) {
                for (const clone of util.target.sprite.clones) {
                    if (clone.isOriginal) continue;
                    const id = this.cloneIds.get(clone.id);
                    if (id) ids.push(id);
                }
            }

            if (typeof util.stackFrame.index === 'undefined') {
                util.stackFrame.index = 0;
            }
            if (util.stackFrame.index < ids.length) {
                const variable = this.getVariable(util.target, args.VAR);
                if (variable) {
                    variable.value = ids[util.stackFrame.index];
                }
                util.stackFrame.index++;
                util.startBranch(1, true);
            }
        }

        runAsSprite(args, util) {
            const target = vm.runtime.getSpriteTargetByName(args.SPRITE);
            if (!target) return;
            if (typeof util.stackFrame.state === 'undefined') {
                util.stackFrame.state = 1;
                util.stackFrame.originalTarget = util.thread.target;
                util.thread.target = target;
                util.startBranch(1, true);
            } else if (util.stackFrame.state === 1) {
                util.thread.target = util.stackFrame.originalTarget;
            }
        }

        idsTouchingMe(args, util) {
            const touching = [];
            if (!util.target || !util.target.sprite) return JSON.stringify(touching);
            const clones = util.target.sprite.clones;
            const myDrawableId = util.target.drawableID;
            for (const clone of clones) {
                if (clone === util.target || clone.isOriginal) continue;
                const isTouching = Scratch.vm.renderer.isTouchingDrawables(
                    myDrawableId,
                    [clone.drawableID]
                );
                if (isTouching) {
                    const id = this.cloneIds.get(clone.id);
                    if (id) touching.push(id);
                }
            }
            return JSON.stringify(touching);
        }

        idsWithTag(args, util) {
            const matches = [];
            if (!util.target || !util.target.sprite) return JSON.stringify(matches);
            for (const clone of util.target.sprite.clones) {
                const tags = this.cloneTags.get(clone.id);
                if (tags && tags.has(args.TAG)) {
                    const id = this.cloneIds.get(clone.id);
                    if (id) matches.push(id);
                }
            }
            return JSON.stringify(matches);
        }

        getTags(args, util) {
            const target = this.getTargetById(args.ID, util.target);
            if (target) {
                const tags = this.cloneTags.get(target.id);
                return tags ? JSON.stringify(Array.from(tags)) : '[]';
            }
            return '[]';
        }

        getTagsOfTouching(args, util) {
            const uniqueTags = new Set();
            if (!util.target || !util.target.sprite) return JSON.stringify([]);
            const clones = util.target.sprite.clones;
            const myDrawableId = util.target.drawableID;
            for (const clone of clones) {
                if (clone === util.target || clone.isOriginal) continue;
                const isTouching = Scratch.vm.renderer.isTouchingDrawables(
                    myDrawableId,
                    [clone.drawableID]
                );
                if (isTouching) {
                    const tags = this.cloneTags.get(clone.id);
                    if (tags) {
                        for (const tag of tags) {
                            uniqueTags.add(tag);
                        }
                    }
                }
            }
            return JSON.stringify(Array.from(uniqueTags));
        }

        runAsClone(args, util) {
            const thread = util.thread;
            if (!util.stackFrame.started) {
                util.stackFrame.started = true;
                const target = this.getTargetById(args.ID, util.target);
                if (!target) return;

                const originalTarget = thread.target;
                util.stackFrame.originalTarget = originalTarget;
                thread.target = target;

                Object.defineProperty(util, 'target', {
                    value: target,
                    writable: true,
                    configurable: true
                });

                const layerMethods = ['goToFront', 'goToBack', 'goForwardLayers', 'goBackwardLayers', 'moveLayer'];
                util.stackFrame.patchedMethods = {};
                layerMethods.forEach(method => {
                    if (typeof originalTarget[method] === 'function') {
                        util.stackFrame.patchedMethods[method] = originalTarget[method];
                        originalTarget[method] = (...args) => target[method](...args);
                    }
                });

                util.startBranch(1, true);
            } else {
                const original = util.stackFrame.originalTarget;
                thread.target = original;
                Object.defineProperty(util, 'target', {
                    value: original,
                    writable: true,
                    configurable: true
                });
                if (util.stackFrame.patchedMethods) {
                    for (const method in util.stackFrame.patchedMethods) {
                        original[method] = util.stackFrame.patchedMethods[method];
                    }
                }
            }
        }

        setVarInMain(args, util) {
            const main = util.target.sprite.clones[0];
            const variable = this.getVariable(main, args.VAR);
            if (variable) {
                variable.value = args.VALUE;
            }
        }

        getVarFromMain(args, util) {
            const main = util.target.sprite.clones[0];
            const variable = this.getVariable(main, args.VAR);
            return variable ? variable.value : '';
        }
    }

    Scratch.extensions.register(new CloneData());
})(Scratch);
