// wip testing code for my Block AI extension

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    const normalize = (str) => {
        return str.replace(/\([^)]*\)|\[[^\]]*\]|\<[^>]*\>/g, ' ')
                  .replace(/[^a-zA-Z0-9+\-*/<>=?!%]/g, ' ')
                  .replace(/\s+/g, ' ')
                  .toLowerCase()
                  .trim();
    };

    const getLevenshtein = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const isShadowOpcode = (opcode) => {
        if (!opcode) return false;
        return opcode.includes('_menu') || 
               ['text', 'math_number', 'math_whole_number', 'math_positive_number', 
                'math_angle', 'color_picker', 'matrix', 'note'].includes(opcode);
    };

    let blockDict = [];

    const buildBlockDict = () => {
        console.log('Building block dictionary...');
        blockDict = [];
        const sb = window.ScratchBlocks || window.Blockly;
        
        if (sb && sb.Blocks) {
            const keys = Object.keys(sb.Blocks);
            
            if (sb.Events && typeof sb.Events.disable === 'function') {
                sb.Events.disable();
            }
            
            const workspace = sb.getMainWorkspace();
            for (const opcode of keys) {
                if (isShadowOpcode(opcode)) continue;

                try {
                    const block = workspace.newBlock(opcode);
                    let text = '';
                    block.inputList.forEach(input => {
                        input.fieldRow.forEach(field => {
                            if (field.EDITABLE) return;

                            if (typeof field.getText === 'function') {
                                text += field.getText() + ' ';
                            }
                        });
                    });
                    blockDict.push({ opcode: opcode, norm: normalize(text) });
                    block.dispose();
                } catch(e) {}
            }
            
            if (sb.Events && typeof sb.Events.enable === 'function') {
                sb.Events.enable();
            }
        }

        if (Scratch && Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime._blockInfo) {
            const blockInfo = Scratch.vm.runtime._blockInfo;
            for (const info of blockInfo) {
                if (info.blocks) {
                    for (const block of info.blocks) {
                        if (block.info && block.info.text && block.info.opcode) {
                            const fullOpcode = info.id + '_' + block.info.opcode;
                            if (isShadowOpcode(fullOpcode)) continue;

                            const exists = blockDict.find(b => b.opcode === fullOpcode);
                            if (!exists) {
                                blockDict.push({ opcode: fullOpcode, norm: normalize(block.info.text) });
                            }
                        }
                    }
                }
            }
        }
    };

    const parseLineTokens = (line) => {
        const args = [];
        let strippedLine = "";
        let i = 0;
        while (i < line.length) {
            let char = line[i];
            if (char === '(' || char === '[' || char === '<') {
                let closer = char === '(' ? ')' : (char === '[' ? ']' : '>');
                let depth = 1;
                let start = i + 1;
                i++;
                while (i < line.length && depth > 0) {
                    if (line[i] === char) depth++;
                    else if (line[i] === closer) depth--;
                    i++;
                }
                let content = line.substring(start, i - 1);
                let type = 'string';
                if (char === '(') type = 'round';
                if (char === '[') type = 'square';
                if (char === '<') type = 'hex';
                
                args.push({ text: content, type: type });
                strippedLine += " "; 
            } else {
                strippedLine += char;
                i++;
            }
        }
        return { text: strippedLine.trim(), args };
    };

    const getFirstEditableField = (block) => {
        if (!block || !block.inputList) return null;
        for (const input of block.inputList) {
            if (!input.fieldRow) continue;
            for (const field of input.fieldRow) {
                if (field.EDITABLE) return field;
            }
        }
        return null;
    };

    const tryCreateBlock = (text, workspace, wrapperType = 'round') => {
        if (!isNaN(Number(text)) && text.trim() !== '') return null;
        
        let { text: stripped, args } = parseLineTokens(text);
        let norm = normalize(stripped);
        
        if (norm.length > 0) {
            let bestOpcode = null;
            let bestDist = Infinity;
            
            for (const b of blockDict) {
                const dist = getLevenshtein(norm, b.norm);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestOpcode = b.opcode;
                }
            }
            
            let match = blockDict.find(b => b.opcode === bestOpcode);
            if (match) {
                let threshold = Math.max(match.norm.length, norm.length) * 0.4;
                if (bestDist <= threshold) {
                    try {
                        const block = workspace.newBlock(bestOpcode);
                        populateBlock(block, args, workspace);
                        block.initSvg();
                        block.render();
                        return block;
                    } catch(e) {
                        console.warn('Could not construct inner block', e);
                    }
                }
            }
        }
        
        if (workspace.getAllVariables) {
            let vars = workspace.getAllVariables();
            let existingVar = vars.find(v => v.name === text);
            if (existingVar) {
                try {
                    const block = workspace.newBlock('data_variable');
                    if (block) {
                        let field = block.getField('VARIABLE');
                        if (field) field.setValue(existingVar.getId());
                        block.initSvg();
                        block.render();
                        return block;
                    }
                } catch(e) {}
            }
        }
        
        return null;
    };

    const populateBlock = (block, args, workspace) => {
        let argIndex = 0;
        if (!block.inputList) return;
        
        for (const input of block.inputList) {
            if (input.fieldRow) {
                for (const field of input.fieldRow) {
                    if (field.EDITABLE && field.name) {
                        if (argIndex < args.length) {
                            let val = args[argIndex].text;
                            if (args[argIndex].type === 'square' && val.endsWith(' v')) val = val.substring(0, val.length - 2);
                            try { field.setValue(val); } catch(e) { console.warn(e); }
                            argIndex++;
                        }
                    }
                }
            }
            
            if (input.type === 1) { 
                if (argIndex < args.length) {
                    let arg = args[argIndex];
                    argIndex++;
                    
                    let val = arg.text;
                    if (arg.type === 'square' && val.endsWith(' v')) val = val.substring(0, val.length - 2);
                    
                    let innerBlock = tryCreateBlock(val, workspace, arg.type);
                    
                    if (innerBlock) {
                        let existing = input.connection ? input.connection.targetBlock() : null;
                        if (existing) existing.dispose();
                        
                        if (input.connection && innerBlock.outputConnection) {
                            try { 
                                input.connection.connect(innerBlock.outputConnection); 
                            } catch(e) {
                                innerBlock.dispose(); 
                            }
                        } else {
                            innerBlock.dispose();
                        }
                    } else {
                        let existing = input.connection ? input.connection.targetBlock() : null;
                        if (existing) {
                            let editField = getFirstEditableField(existing);
                            if (editField) editField.setValue(val);
                        } else if (input.connection) {
                            let isNum = !isNaN(Number(val)) && val.trim() !== '';
                            let shadowType = isNum ? 'math_number' : 'text';
                            
                            const sb = window.ScratchBlocks || window.Blockly;
                            let shadow;
                            
                            if (sb && sb.Xml) {
                                let fieldName = isNum ? 'NUM' : 'TEXT';
                                let escapedVal = String(val)
                                    .replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&apos;');
                                
                                let xmlString = `<shadow type="${shadowType}"><field name="${fieldName}">${escapedVal}</field></shadow>`;
                                try {
                                    let dom = new DOMParser().parseFromString(xmlString, 'text/xml').firstChild;
                                    shadow = sb.Xml.domToBlock(dom, workspace);
                                } catch (e) {
                                    console.warn('XML shadow creation failed, falling back', e);
                                }
                            }
                            
                            if (!shadow) {
                                shadow = workspace.newBlock(shadowType);
                                shadow.setShadow(true);
                                let editField = getFirstEditableField(shadow);
                                if (editField) editField.setValue(val);
                            }
                            
                            shadow.initSvg();
                            shadow.render();
                            
                            try { 
                                input.connection.connect(shadow.outputConnection); 
                                
                                if (Scratch && Scratch.vm && Scratch.vm.editingTarget && Scratch.vm.editingTarget.blocks) {
                                    let vmBlock = Scratch.vm.editingTarget.blocks.getBlock(shadow.id);
                                    if (vmBlock) {
                                        vmBlock.shadow = true;
                                    }
                                }
                            } catch(e) {
                                shadow.dispose();
                            }
                        }
                    }
                }
            }
        }
    };

    class ScratchblocksImporter {
        getInfo() {
            return {
                id: 'scratchblocksimporter',
                name: 'SB Importer',
                color1: '#4C97FF',
                blocks: [
                    {
                        opcode: 'IMPORT_BLOCKS',
                        func: 'IMPORT_BLOCKS',
                        blockType: Scratch.BlockType.BUTTON,
                        text: 'Import ScratchBlocks from Clipboard'
                    }
                ]
            };
        }

        async IMPORT_BLOCKS() {
            console.log('BImporting');
            try {
                const md = await navigator.clipboard.readText();
                if (!md) {
                    console.log('Clipboard is empty.');
                    return;
                }
                
                buildBlockDict();
                const lines = md.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                const sb = window.ScratchBlocks || window.Blockly;
                const workspace = sb.getMainWorkspace();
                let prevBlock = null;
                
                const metrics = workspace.getMetrics();
                const scale = workspace.scale || 1;
                
                let startX = (metrics.viewLeft + (metrics.viewWidth / 2)) / scale;
                let startY = (metrics.viewTop + (metrics.viewHeight / 2)) / scale;

                for (const line of lines) {
                    let { text: stripped, args } = parseLineTokens(line);
                    const normLine = normalize(stripped);
                    let bestOpcode = null;
                    let bestDist = Infinity;
                    
                    for (const b of blockDict) {
                        const dist = getLevenshtein(normLine, b.norm);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestOpcode = b.opcode;
                        }
                    }
                    
                    if (bestOpcode) {
                        try {
                            const block = workspace.newBlock(bestOpcode);
                            
                            populateBlock(block, args, workspace);
                            
                            block.initSvg();
                            block.render();
                            
                            if (prevBlock && prevBlock.nextConnection && block.previousConnection) {
                                prevBlock.nextConnection.connect(block.previousConnection);
                            } else if (prevBlock && prevBlock.getInput('SUBSTACK') && block.previousConnection) {
                                prevBlock.getInput('SUBSTACK').connection.connect(block.previousConnection);
                            } else {
                                block.moveBy(startX, startY);
                                startX += 20;
                                startY += 20;
                            }
                            prevBlock = block;
                        } catch(e) {
                            console.error('Failed to create or connect block for opcode', bestOpcode, e);
                        }
                    }
                }
                console.log('Import process completed.');
            } catch(err) {
                console.error('Import error', err);
            }
        }
    }

    Scratch.extensions.register(new ScratchblocksImporter());
})(Scratch);
