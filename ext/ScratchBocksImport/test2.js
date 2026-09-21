(function initScratchExtension() {
  const ScratchBlocks = window.ScratchBlocks;
  const vm = window.vm;

  if (!ScratchBlocks || !ScratchBlocks.Gesture) {
    return;
  }

  function getDynamicAceRulesAndStyles() {
    const rules = [];
    const styles = [];
    const seenCategories = new Set();

    if (vm?.runtime?._blockInfo) {
      for (const cat of vm.runtime._blockInfo) {
        if (!cat.id || seenCategories.has(cat.id)) continue;
        seenCategories.add(cat.id);

        const color = cat.color1 || "#0FBD8C";
        const catClass = `ace_ext_${cat.id.replace(/[^a-zA-Z0-9_]/g, "_")}`;
        styles.push(`.ace_${catClass} { color: ${color} !important; font-weight: 500; }`);

        const phrases = [];
        if (cat.blocks) {
          for (const blk of cat.blocks) {
            const info = blk.info || blk;
            const text = typeof info.text === "string" ? info.text : (blk.json?.message0 || "");
            if (text) {
              const clean = text.replace(/\[.*?\]|%[0-9]+/g, "").trim();
              if (clean && clean.length > 2) {
                phrases.push(BlockCatalog.escapeRegex(clean.split(/\s+/).join("\\s+")));
              }
            }
          }
        }

        if (phrases.length > 0) {
          rules.push({
            token: `support.function.${catClass}`,
            regex: `\\b(?:${phrases.join("|")})\\b`,
            caseInsensitive: true
          });
        }
      }
    }

    return { rules, styleCss: styles.join("\n") };
  }

  function injectAceColorStyles() {
    let style = document.getElementById("sa-ace-color-styles");
    if (!style) {
      style = document.createElement("style");
      style.id = "sa-ace-color-styles";
      document.head.appendChild(style);
    }

    const { styleCss } = getDynamicAceRulesAndStyles();

    style.textContent = `
      .ace_keyword.ace_control.ace_events { color: #E65C00 !important; font-weight: bold; }
      .ace_keyword.ace_control.ace_flow { color: #D48800 !important; font-weight: bold; }
      .ace_keyword.ace_other.ace_define { color: #D6336C !important; font-weight: bold; }
      .ace_support.ace_function.ace_motion { color: #0C63E4 !important; font-weight: 500; }
      .ace_support.ace_function.ace_looks { color: #7048E8 !important; font-weight: 500; }
      .ace_support.ace_function.ace_sound { color: #A61E4D !important; font-weight: 500; }
      .ace_support.ace_function.ace_sensing { color: #1098AD !important; font-weight: 500; }
      .ace_support.ace_function.ace_data { color: #E8590C !important; font-weight: 500; }
      .ace_keyword.ace_operator { color: #2B8A3E !important; font-weight: bold; }
      .ace_string.ace_bracketed { color: #C92A2A !important; }
      .ace_variable.ace_parameter { color: #1864AB !important; }
      .ace_constant.ace_other.ace_color { color: #862E9C !important; font-weight: bold; background: rgba(134, 46, 156, 0.12); border-radius: 3px; padding: 0 2px; }
      .ace_constant.ace_numeric { color: #D9480F !important; }
      .ace_comment { color: #868E96 !important; font-style: italic; }
      ${styleCss}
    `;
  }

  function defineScratchAceMode(ace) {
    const { rules: dynamicExtRules } = getDynamicAceRulesAndStyles();

    ace.define("ace/mode/scratch_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (require, exports, module) {
      const oop = require("ace/lib/oop");
      const TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

      const ScratchHighlightRules = function () {
        this.$rules = {
          start: [
            { token: "comment", regex: "\\/\\/.*$" },
            { token: "constant.other.color", regex: "#[0-9a-fA-F]{3,8}\\b" },
            ...dynamicExtRules,
            { token: "keyword.control.events", regex: "\\b(?:when(?:\\s+@greenflag|\\s+green\\s+flag|\\s+flag)?\\s+clicked|when\\s+this\\s+sprite\\s+clicked|when\\s+stage\\s+clicked|when\\s+backdrop\\s+switches\\s+to|when\\s+I\\s+start\\s+as\\s+a\\s+clone|when\\s+I\\s+receive|when\\s+page\\s+scrolled|broadcast|broadcast\\s+and\\s+wait)\\b", caseInsensitive: true },
            { token: "keyword.control.flow", regex: "\\b(?:forever|repeat\\s+until|repeat|if|then|else|end|wait\\s+until|wait|stop|create\\s+clone\\s+of|delete\\s+this\\s+clone)\\b", caseInsensitive: true },
            { token: "keyword.other.define", regex: "\\b(?:define)\\b", caseInsensitive: true },
            { token: "support.function.motion", regex: "\\b(?:move|steps|turn\\s+right|turn\\s+left|turn\\s+cw|turn\\s+ccw|turn\\s+clockwise|turn\\s+counter-clockwise|point\\s+in\\s+direction|point\\s+towards|go\\s+to\\s+x|go\\s+to|glide|change\\s+x\\s+by|set\\s+x\\s+to|change\\s+y\\s+by|set\\s+y\\s+to|if\\s+on\\s+edge,\\s+bounce|set\\s+rotation\\s+style)\\b", caseInsensitive: true },
            { token: "support.function.looks", regex: "\\b(?:say|think|switch\\s+costume\\s+to|next\\s+costume|switch\\s+backdrop\\s+to|next\\s+backdrop|change\\s+size\\s+by|set\\s+size\\s+to|change\\s+effect\\s+by|set\\s+effect\\s+to|clear\\s+graphic\\s+effects|show|hide|go\\s+to\\s+front\\s+layer|go\\s+to\\s+back\\s+layer|go\\s+forward|go\\s+backward|layers)\\b", caseInsensitive: true },
            { token: "support.function.sound", regex: "\\b(?:play\\s+sound|start\\s+sound|stop\\s+all\\s+sounds|clear\\s+sound\\s+effects|change\\s+volume\\s+by|set\\s+volume\\s+to)\\b", caseInsensitive: true },
            { token: "support.function.sensing", regex: "\\b(?:touching\\s+color|touching|color\\s+is\\s+touching|distance\\s+to|ask|and\\s+wait|key\\s+pressed|mouse\\s+down|mouse\\s+x|mouse\\s+y|set\\s+drag\\s+mode|reset\\s+timer|current|days\\s+since\\s+2000|username)\\b", caseInsensitive: true },
            { token: "support.function.data", regex: "\\b(?:set|to|change|by|show\\s+variable|hide\\s+variable|add|delete\\s+all\\s+of|delete|insert|at|replace\\s+item|with|item|length\\s+of|contains|show\\s+list|hide\\s+list)\\b", caseInsensitive: true },
            { token: "keyword.operator", regex: "\\b(?:and|or|not|mod|round|join|letter|length\\s+of|contains)\\b|[+\\-*/<>=]", caseInsensitive: true },
            { token: "constant.numeric", regex: "\\b[0-9]+(?:\\.[0-9]+)?\\b" },
            { token: "string.bracketed", regex: "\\[[^\\]]*\\]" },
            { token: "variable.parameter", regex: "\\([A-Za-z0-9_\\s\\-\\.]+\\)" }
          ]
        };
      };
      oop.inherits(ScratchHighlightRules, TextHighlightRules);
      exports.ScratchHighlightRules = ScratchHighlightRules;
    });

    ace.define("ace/mode/scratch", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/scratch_highlight_rules"], function (require, exports, module) {
      const oop = require("ace/lib/oop");
      const TextMode = require("ace/mode/text").Mode;
      const ScratchHighlightRules = require("ace/mode/scratch_highlight_rules").ScratchHighlightRules;

      const Mode = function () {
        this.HighlightRules = ScratchHighlightRules;
      };
      oop.inherits(Mode, TextMode);
      exports.Mode = Mode;
    });
  }

  function ensureAceEditor() {
    if (window.ace) {
      injectAceColorStyles();
      defineScratchAceMode(window.ace);
      return Promise.resolve(window.ace);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.7/ace.js";
      script.onload = () => {
        injectAceColorStyles();
        defineScratchAceMode(window.ace);
        resolve(window.ace);
      };
      script.onerror = () => reject(new Error("Failed to load Ace Editor"));
      document.head.appendChild(script);
    });
  }

  class BlockCatalog {
    static normalize(text) {
      return String(text ?? "")
        .toLowerCase()
        .replace(/\[\s*|\s*\]|\(\s*|\s*\)|<\s*|\s*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    static escapeRegex(str) {
      return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    static getCompiledMatchers() {
      const matchers = [];
      const seenOpcodes = new Set();

      if (vm?.runtime?._blockInfo) {
        for (const cat of vm.runtime._blockInfo) {
          if (!cat.blocks) continue;
          for (const blk of cat.blocks) {
            const info = blk.info || blk;
            if (!info || !info.opcode) continue;
            const fullOpcode = info.opcode.includes("_") ? info.opcode : `${cat.id}_${info.opcode}`;
            if (seenOpcodes.has(fullOpcode)) continue;

            const textTemplate = typeof info.text === "string" ? info.text : (blk.json?.message0 || "");
            if (!textTemplate) continue;

            let bType = (info.blockType || (blk.json?.output ? "reporter" : "command")).toLowerCase();
            if (bType === "boolean") bType = "boolean";
            if (bType === "hat" || bType === "event") bType = "hat";

            const elements = [];
            let literalCharCount = 0;
            const argMap = info.arguments || {};

            const tokenRegex = /(\[[a-zA-Z0-9_]+\]|%[0-9]+|[^\[%]+)/g;
            let tokenMatch;

            while ((tokenMatch = tokenRegex.exec(textTemplate)) !== null) {
              const tok = tokenMatch[0];
              if (!tok) continue;

              if (tok.startsWith("[") && tok.endsWith("]")) {
                const argName = tok.slice(1, -1);
                const argDef = argMap[argName] || {};
                let shadowType = "math_number";
                let defaultVal = "0";
                let iType = "number";

                if (argDef.type === "string" || argDef.type === "String") {
                  shadowType = "text";
                  defaultVal = "";
                  iType = "string";
                } else if (argDef.type === "color" || argDef.type === "Colour" || argName === "COLOR" || argName === "COLOUR") {
                  shadowType = "colour_picker";
                  defaultVal = "#4C97FF";
                  iType = "color";
                } else if (argDef.type === "boolean" || argDef.type === "Boolean") {
                  shadowType = "";
                  iType = "boolean";
                }

                if (argDef.menu) {
                  let menuOpts = [];
                  if (typeof argDef.menu === "string" && cat.menus && cat.menus[argDef.menu]) {
                    const mDef = cat.menus[argDef.menu];
                    const rawItems = Array.isArray(mDef) ? mDef : (mDef.items || []);
                    menuOpts = rawItems.map((item) => (typeof item === "object" ? item.text || item.value : item));
                  }
                  elements.push({
                    kind: "field",
                    name: argName,
                    options: menuOpts,
                    defaultVal: menuOpts[0] || ""
                  });
                } else {
                  elements.push({
                    kind: "input",
                    name: argName,
                    inputType: iType,
                    shadowType: shadowType,
                    defaultVal: defaultVal
                  });
                }
              } else if (tok.startsWith("%")) {
                elements.push({
                  kind: "input",
                  name: `input_${elements.length}`,
                  inputType: "number",
                  shadowType: "math_number",
                  defaultVal: "0"
                });
              } else {
                const cleanTxt = tok.trim();
                if (cleanTxt) {
                  elements.push({ kind: "text", value: cleanTxt });
                  literalCharCount += cleanTxt.replace(/\s+/g, "").length;
                }
              }
            }

            let regexParts = ["^"];
            let hasDynamicParts = false;

            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              if (el.kind === "text") {
                const escaped = el.value
                  .split(/\s+/)
                  .map((w) => this.escapeRegex(w))
                  .join("\\s+");
                regexParts.push(escaped);
              } else if (el.kind === "field" && el.options?.length > 0) {
                hasDynamicParts = true;
                regexParts.push("(?:(?:\\[\\s*([^\\]]+?)(?:\\s*v)?\\s*\\])|([a-zA-Z0-9_\\-]+))");
              } else if (el.kind === "input") {
                hasDynamicParts = true;
                regexParts.push(i === elements.length - 1 ? "(.*)" : "(.*?)");
              }

              if (i < elements.length - 1) {
                regexParts.push("\\s+");
              }
            }
            regexParts.push("$");

            let compiledRegex = null;
            try {
              compiledRegex = new RegExp(regexParts.join(""), "i");
            } catch (_) {}

            const fullText = elements.filter((e) => e.kind === "text").map((e) => e.value).join(" ");

            matchers.push({
              opcode: fullOpcode,
              category: cat.id,
              blockType: bType,
              elements: elements,
              regex: compiledRegex,
              normText: this.normalize(fullText),
              literalCharCount: literalCharCount,
              isHat: bType === "hat",
              isCBlock: bType === "c-block" || bType === "loop" || bType === "conditional",
              isReporter: bType === "reporter",
              isBoolean: bType === "boolean",
              hasDynamicParts: hasDynamicParts
            });

            seenOpcodes.add(fullOpcode);
          }
        }
      }

      const headless = new ScratchBlocks.Workspace();
      const allOpcodes = Object.keys(ScratchBlocks.Blocks || {});

      for (const opcode of allOpcodes) {
        if (
          seenOpcodes.has(opcode) ||
          opcode.endsWith("_menu") ||
          opcode.startsWith("math_") ||
          opcode === "text" ||
          opcode === "colour_picker" ||
          opcode === "procedures_prototype"
        ) {
          continue;
        }

        try {
          const b = headless.newBlock(opcode);
          if (!b) continue;

          const elements = [];
          let literalCharCount = 0;

          for (const input of b.inputList) {
            for (const field of input.fieldRow) {
              if (field instanceof ScratchBlocks.FieldDropdown) {
                let opts = [];
                try {
                  opts = (field.getOptions ? field.getOptions() : []).map((o) => o[0] || o[1]);
                } catch (_) {}
                elements.push({
                  kind: "field",
                  name: field.name || "MENU",
                  options: opts,
                  defaultVal: opts[0] || ""
                });
              } else if (field instanceof ScratchBlocks.FieldVariable) {
                elements.push({ kind: "variable", name: field.name || "VARIABLE" });
              } else if (field instanceof ScratchBlocks.FieldImage) {
                if (field.src_?.includes("green-flag")) {
                  elements.push({ kind: "text", value: "when @greenflag clicked" });
                  literalCharCount += 22;
                }
              } else if (field.getText) {
                const txt = field.getText().trim();
                if (txt) {
                  elements.push({ kind: "text", value: txt });
                  literalCharCount += txt.replace(/\s+/g, "").length;
                }
              }
            }

            if (input.type === ScratchBlocks.INPUT_VALUE) {
              const check = input.connection?.check_ || [];
              let iType = "number";
              let shadowType = "math_number";
              let defaultVal = "0";

              if (check.includes("Boolean")) {
                iType = "boolean";
                shadowType = "";
              } else if (check.includes("String")) {
                iType = "string";
                shadowType = "text";
                defaultVal = "";
              } else if (check.includes("Colour") || input.name === "COLOR" || input.name === "COLOUR") {
                iType = "color";
                shadowType = "colour_picker";
                defaultVal = "#4C97FF";
              }

              elements.push({
                kind: "input",
                name: input.name,
                inputType: iType,
                shadowType: shadowType,
                defaultVal: defaultVal
              });
            } else if (input.type === ScratchBlocks.NEXT_STATEMENT) {
              elements.push({ kind: "statement", name: input.name });
            }
          }

          const isHat = !b.previousConnection && !b.outputConnection && !!b.nextConnection;
          const isReporter = !!b.outputConnection;
          const isBoolean = isReporter && b.outputConnection.check_ && b.outputConnection.check_.includes("Boolean");
          const isCBlock = b.inputList.some((i) => i.type === ScratchBlocks.NEXT_STATEMENT);

          let bType = "command";
          if (isHat) bType = "hat";
          else if (isBoolean) bType = "boolean";
          else if (isReporter) bType = "reporter";
          else if (isCBlock) bType = "c-block";

          let regexParts = ["^"];
          let hasDynamicParts = false;

          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (el.kind === "text") {
              const escaped = el.value
                .split(/\s+/)
                .map((w) => this.escapeRegex(w))
                .join("\\s+");
              regexParts.push(escaped);
            } else if (el.kind === "field" && el.options?.length > 0) {
              hasDynamicParts = true;
              regexParts.push("(?:(?:\\[\\s*([^\\]]+?)(?:\\s*v)?\\s*\\])|([a-zA-Z0-9_\\-]+))");
            } else if (el.kind === "input") {
              hasDynamicParts = true;
              regexParts.push(i === elements.length - 1 ? "(.*)" : "(.*?)");
            } else if (el.kind === "statement") {
              hasDynamicParts = true;
            }

            if (i < elements.length - 1 && el.kind !== "statement") {
              regexParts.push("\\s+");
            }
          }
          regexParts.push("$");

          let compiledRegex = null;
          try {
            compiledRegex = new RegExp(regexParts.join(""), "i");
          } catch (_) {}

          const fullText = elements.filter((e) => e.kind === "text").map((e) => e.value).join(" ");

          matchers.push({
            opcode: opcode,
            category: opcode.split("_")[0],
            blockType: bType,
            elements: elements,
            regex: compiledRegex,
            normText: this.normalize(fullText),
            literalCharCount: literalCharCount,
            isHat: isHat,
            isCBlock: isCBlock,
            isReporter: isReporter,
            isBoolean: isBoolean,
            hasDynamicParts: hasDynamicParts
          });

          seenOpcodes.add(opcode);
          b.dispose();
        } catch (_) {}
      }

      try {
        headless.dispose();
      } catch (_) {}

      matchers.sort((a, b) => b.literalCharCount - a.literalCharCount);
      return matchers;
    }

    static matchCommand(line) {
      const matchers = this.getCompiledMatchers();
      const cleanLine = line.trim();
      const normInput = this.normalize(cleanLine);

      for (const m of matchers) {
        if (m.blockType === "reporter" || m.blockType === "boolean") continue;

        if (!m.hasDynamicParts) {
          if (m.normText && normInput === m.normText) {
            return {
              type: m.opcode,
              isHat: m.isHat,
              isCBlock: m.isCBlock,
              branch: m.isCBlock ? "SUBSTACK" : null
            };
          }
          continue;
        }

        if (m.regex) {
          const match = cleanLine.match(m.regex);
          if (!match) continue;

          let groupIdx = 1;
          const fields = {};
          const values = {};
          let valid = true;

          for (const el of m.elements) {
            if (el.kind === "field" && el.options?.length > 0) {
              const rawOpt = (match[groupIdx] || match[groupIdx + 1] || "").trim();
              groupIdx += 2;
              const cleanOpt = VariableManager.extractName(rawOpt).toLowerCase();

              const foundOpt = el.options.find((o) => o.toLowerCase() === cleanOpt || o.toLowerCase() === rawOpt.toLowerCase());
              if (!foundOpt) {
                valid = false;
                break;
              }
              fields[el.name] = foundOpt;
            } else if (el.kind === "input") {
              const rawVal = (match[groupIdx] || "").trim();
              groupIdx++;
              if (el.inputType === "boolean") {
                values[el.name] = ScratchBlocksParser.parseBoolean(rawVal);
              } else {
                values[el.name] = ScratchBlocksParser.parseValue(rawVal, el.shadowType || "math_number", el.defaultVal || "0");
              }
            }
          }

          if (valid) {
            return {
              type: m.opcode,
              isHat: m.isHat,
              isCBlock: m.isCBlock,
              branch: m.isCBlock ? "SUBSTACK" : null,
              fields: fields,
              values: values
            };
          }
        }
      }

      return null;
    }

    static matchExpression(expr, expectedType = "reporter") {
      const matchers = this.getCompiledMatchers();
      const normInput = this.normalize(expr);
      if (!normInput || normInput.length < 2) return null;

      for (const m of matchers) {
        if (expectedType === "boolean" && !m.isBoolean) continue;
        if (expectedType === "reporter" && !m.isReporter) continue;

        if (m.normText && m.normText === normInput && !m.hasDynamicParts) {
          return `<block type="${m.opcode}"></block>`;
        }
      }

      return null;
    }
  }

  class VariableManager {
    static extractName(raw) {
      if (!raw) return "";
      let str = String(raw).trim();
      const bracketMatch = str.match(/\[\s*(.*?)\s*(?:v)?\s*\]/);
      if (bracketMatch) {
        str = bracketMatch[1];
      } else if (str.startsWith("(") && str.endsWith(")")) {
        str = str.slice(1, -1);
      }
      return str.replace(/\s*v$/, "").replace(/^[\[\(]+|[\]\)]+$/g, "").trim();
    }

    static resolveSoundName(rawVal, target = null) {
      if (!rawVal) return "Meow";
      const t = target || vm?.editingTarget;
      if (t) {
        const sounds = t.getSounds ? t.getSounds() : (t.sprite?.sounds || t.sounds || []);
        const match = sounds.find((s) => s.name === rawVal || s.soundId === rawVal || s.assetId === rawVal || s.md5 === rawVal);
        if (match && match.name) return match.name;
      }
      return this.extractName(rawVal);
    }

    static resolveCostumeName(rawVal, target = null) {
      if (!rawVal) return "costume1";
      const t = target || vm?.editingTarget;
      if (t) {
        const costumes = t.getCostumes ? t.getCostumes() : (t.sprite?.costumes || t.costumes || []);
        const match = costumes.find((c) => c.name === rawVal || c.assetId === rawVal || c.md5 === rawVal);
        if (match && match.name) return match.name;
      }
      return this.extractName(rawVal);
    }

    static ensure(rawName, type = "") {
      const cleanName = this.extractName(rawName);
      if (!cleanName) return "";

      const ws = ScratchBlocks.getMainWorkspace();
      if (ws && !ws.getVariable(cleanName, type)) {
        ws.createVariable(cleanName, type);
      }

      if (vm && vm.editingTarget) {
        const target = vm.editingTarget;
        if (!target.lookupVariableByNameAndType(cleanName, type)) {
          target.createVariable(cleanName, cleanName, type);
        }
      }
      return cleanName;
    }

    static ensureVariable(name) {
      return this.ensure(name, "");
    }

    static ensureList(name) {
      return this.ensure(name, "list");
    }
  }

  class ScratchBlocksParser {
    static activeCustomArgs = new Map();

    static escapeXml(str) {
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    static splitBinaryOp(str, operator) {
      let depthParen = 0, depthBracket = 0;
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === "(") depthParen++;
        else if (ch === ")") depthParen--;
        else if (ch === "[") depthBracket++;
        else if (ch === "]") depthBracket--;

        if (depthParen === 0 && depthBracket === 0) {
          if (str.substring(i).startsWith(operator)) {
            const left = str.substring(0, i).trim();
            const right = str.substring(i + operator.length).trim();
            if (left && right) return { left, right };
          }
        }
      }
      return null;
    }

    static parseCustomBlockDefinition(line) {
      let content = line.replace(/^define\s+/i, "").trim();
      let warp = false;
      if (/::\s*warp/i.test(content) || /\bwarp\b/i.test(content)) {
        warp = true;
        content = content.replace(/::\s*warp/i, "").replace(/\bwarp\b/i, "").trim();
      }

      const tokens = [];
      const argNames = [];
      const argDefaults = [];
      const argIds = [];

      this.activeCustomArgs.clear();

      const regex = /(\([^\)]+\)|\[[^\]]+\]|<[^>]+>|[^\s\(\[<]+)/g;
      let match;
      let argIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        const tok = match[0].trim();
        if (!tok) continue;

        if (tok.startsWith("(") && tok.endsWith(")")) {
          const name = tok.slice(1, -1).trim();
          tokens.push("%n");
          argNames.push(name);
          argDefaults.push(1);
          argIds.push(`input${argIndex++}`);
          this.activeCustomArgs.set(name.toLowerCase(), "number");
        } else if (tok.startsWith("[") && tok.endsWith("]")) {
          const name = tok.slice(1, -1).trim();
          tokens.push("%s");
          argNames.push(name);
          argDefaults.push("");
          argIds.push(`input${argIndex++}`);
          this.activeCustomArgs.set(name.toLowerCase(), "string");
        } else if (tok.startsWith("<") && tok.endsWith(">")) {
          const name = tok.slice(1, -1).trim();
          tokens.push("%b");
          argNames.push(name);
          argDefaults.push(false);
          argIds.push(`input${argIndex++}`);
          this.activeCustomArgs.set(name.toLowerCase(), "boolean");
        } else {
          tokens.push(tok);
        }
      }

      const procCode = tokens.join(" ");
      return {
        type: "procedures_definition",
        isCustomDef: true,
        procCode: procCode,
        argNames: argNames,
        argDefaults: argDefaults,
        argIds: argIds,
        warp: warp
      };
    }

    static parseCustomBlockCall(line) {
      const tokens = [];
      const argValues = [];
      const regex = /(\([^\)]+\)|\[[^\]]+\]|<[^>]+>|[^\s\(\[<]+)/g;
      let match;

      while ((match = regex.exec(line)) !== null) {
        const tok = match[0].trim();
        if (!tok) continue;

        if (tok.startsWith("(") && tok.endsWith(")")) {
          tokens.push("%n");
          argValues.push(tok.slice(1, -1));
        } else if (tok.startsWith("[") && tok.endsWith("]")) {
          tokens.push("%s");
          argValues.push(tok.slice(1, -1));
        } else if (tok.startsWith("<") && tok.endsWith(">")) {
          tokens.push("%b");
          argValues.push(tok);
        } else {
          tokens.push(tok);
        }
      }

      const procCode = tokens.join(" ");
      const values = {};
      argValues.forEach((val, i) => {
        values[`input${i}`] = this.parseValue(val, "math_number", "0");
      });

      return {
        type: "procedures_call",
        procCode: procCode,
        argNames: argValues.map((_, i) => `input${i}`),
        values: values
      };
    }

    static parseBoolean(expr) {
      if (!expr) return `<block type="operator_equals"><value name="OPERAND1"><shadow type="text"><field name="TEXT"></field></shadow></value><value name="OPERAND2"><shadow type="text"><field name="TEXT"></field></shadow></value></block>`;
      expr = expr.trim();

      if (expr.startsWith("<") && expr.endsWith(">")) {
        expr = expr.slice(1, -1).trim();
      }

      const extBlock = BlockCatalog.matchExpression(expr, "boolean");
      if (extBlock) return extBlock;

      if (this.activeCustomArgs.get(expr.toLowerCase()) === "boolean") {
        return `<block type="argument_reporter_boolean"><field name="VALUE">${this.escapeXml(expr)}</field></block>`;
      }

      if (/^not\s+/i.test(expr)) {
        const inner = expr.replace(/^not\s+/i, "").trim();
        return `<block type="operator_not"><value name="OPERAND">${this.parseBoolean(inner)}</value></block>`;
      }

      let split = this.splitBinaryOp(expr, " and ");
      if (split) {
        return `<block type="operator_and"><value name="OPERAND1">${this.parseBoolean(split.left)}</value><value name="OPERAND2">${this.parseBoolean(split.right)}</value></block>`;
      }
      split = this.splitBinaryOp(expr, " or ");
      if (split) {
        return `<block type="operator_or"><value name="OPERAND1">${this.parseBoolean(split.left)}</value><value name="OPERAND2">${this.parseBoolean(split.right)}</value></block>`;
      }

      split = this.splitBinaryOp(expr, " < ");
      if (split) {
        return `<block type="operator_lt"><value name="OPERAND1">${this.parseValue(split.left, "text", "")}</value><value name="OPERAND2">${this.parseValue(split.right, "text", "")}</value></block>`;
      }
      split = this.splitBinaryOp(expr, " = ");
      if (split) {
        return `<block type="operator_equals"><value name="OPERAND1">${this.parseValue(split.left, "text", "")}</value><value name="OPERAND2">${this.parseValue(split.right, "text", "")}</value></block>`;
      }
      split = this.splitBinaryOp(expr, " > ");
      if (split) {
        return `<block type="operator_gt"><value name="OPERAND1">${this.parseValue(split.left, "text", "")}</value><value name="OPERAND2">${this.parseValue(split.right, "text", "")}</value></block>`;
      }

      let m = expr.match(/(.*?)\s+contains\s+(.*)/i);
      if (m) {
        const listName = VariableManager.ensureList(m[1]);
        const itemVal = m[2].replace(/\?$/, "").trim();
        return `<block type="data_listcontainsitem"><field name="LIST" variabletype="list">${this.escapeXml(listName)}</field><value name="ITEM">${this.parseValue(itemVal, "text", "thing")}</value></block>`;
      }

      m = expr.match(/^key\s*\[?([a-zA-Z0-9_\s]+)\]?\s*pressed\??/i);
      if (m) {
        const key = VariableManager.extractName(m[1]).toLowerCase();
        return `<block type="sensing_keypressed"><value name="KEY_OPTION"><shadow type="sensing_keyoptions"><field name="KEY_OPTION">${this.escapeXml(key)}</field></shadow></value></block>`;
      }

      m = expr.match(/^touching (?:color\s*)?\[?([#0-9a-fA-F]+)\]?\s*\??/i);
      if (m) {
        return `<block type="sensing_touchingcolor"><value name="COLOR"><shadow type="colour_picker"><field name="COLOUR">${this.escapeXml(m[1])}</field></shadow></value></block>`;
      }

      m = expr.match(/^touching\s*\[?([^\]]+)\]?\s*\??/i);
      if (m) {
        let obj = VariableManager.extractName(m[1]);
        if (obj === "mouse-pointer") obj = "_mouse_";
        if (obj === "edge") obj = "_edge_";
        return `<block type="sensing_touchingobject"><value name="TOUCHINGOBJECTMENU"><shadow type="sensing_touchingobjectmenu"><field name="TOUCHINGOBJECTMENU">${this.escapeXml(obj)}</field></shadow></value></block>`;
      }

      if (/^mouse down\??/i.test(expr)) {
        return `<block type="sensing_mousedown"></block>`;
      }

      return `<block type="operator_equals"><value name="OPERAND1">${this.parseValue(expr, "text", "")}</value><value name="OPERAND2"><shadow type="text"><field name="TEXT">true</field></shadow></value></block>`;
    }

    static parseValue(expr, shadowType = "math_number", defaultShadowVal = "0") {
      const fName = shadowType === "text" ? "TEXT" : (shadowType === "colour_picker" ? "COLOUR" : "NUM");

      if (expr === undefined || expr === null) {
        return `<shadow type="${shadowType}"><field name="${fName}">${defaultShadowVal}</field></shadow>`;
      }
      expr = String(expr).trim();
      if (!expr) {
        return `<shadow type="${shadowType}"><field name="${fName}">${defaultShadowVal}</field></shadow>`;
      }

      const wrapBlock = (blockXml) => {
        const fNameShadow = shadowType === "text" ? "TEXT" : (shadowType === "colour_picker" ? "COLOUR" : "NUM");
        const shadowXml = `<shadow type="${shadowType}"><field name="${fNameShadow}">${defaultShadowVal}</field></shadow>`;
        return `${shadowXml}${blockXml}`;
      };

      if (expr.startsWith("(") && expr.endsWith(")")) {
        const inner = expr.slice(1, -1).trim();
        let depth = 0, balanced = true;
        for (let i = 0; i < inner.length; i++) {
          if (inner[i] === "(") depth++;
          if (inner[i] === ")") depth--;
          if (depth < 0) { balanced = false; break; }
        }
        if (balanced && depth === 0) {
          expr = inner;
        }
      }

      if (!isNaN(expr) && expr !== "") {
        const fNameNum = shadowType === "text" ? "TEXT" : "NUM";
        return `<shadow type="${shadowType === "colour_picker" ? "math_number" : shadowType}"><field name="${fNameNum}">${expr}</field></shadow>`;
      }

      const colorMatch = expr.match(/^\[?#([0-9a-fA-F]{3,8})\]?$/);
      if (colorMatch) {
        return `<shadow type="colour_picker"><field name="COLOUR">#${colorMatch[1]}</field></shadow>`;
      }

      if (expr.startsWith("[") && expr.endsWith("]")) {
        const inner = VariableManager.extractName(expr);
        return `<shadow type="text"><field name="TEXT">${this.escapeXml(inner)}</field></shadow>`;
      }

      const extBlock = BlockCatalog.matchExpression(expr, "reporter");
      if (extBlock) {
        return wrapBlock(extBlock);
      }

      for (const [op, type] of [[" + ", "operator_add"], [" - ", "operator_subtract"], [" * ", "operator_multiply"], [" / ", "operator_divide"]]) {
        const split = this.splitBinaryOp(expr, op);
        if (split) {
          const blk = `<block type="${type}"><value name="NUM1">${this.parseValue(split.left, "math_number", "")}</value><value name="NUM2">${this.parseValue(split.right, "math_number", "")}</value></block>`;
          return wrapBlock(blk);
        }
      }

      let m = expr.match(/^item\s+(.*?)\s+of\s+(.*)/i);
      if (m) {
        const idxVal = m[1];
        const listName = VariableManager.ensureList(m[2]);
        const blk = `<block type="data_itemoflist"><field name="LIST" variabletype="list">${this.escapeXml(listName)}</field><value name="INDEX">${this.parseValue(idxVal, "math_integer", "1")}</value></block>`;
        return wrapBlock(blk);
      }

      m = expr.match(/^length of\s+(.*)/i);
      if (m) {
        const listName = VariableManager.ensureList(m[1]);
        const blk = `<block type="data_lengthoflist"><field name="LIST" variabletype="list">${this.escapeXml(listName)}</field></block>`;
        return wrapBlock(blk);
      }

      if (this.activeCustomArgs.has(expr.toLowerCase())) {
        const type = this.activeCustomArgs.get(expr.toLowerCase());
        if (type === "boolean") {
          return wrapBlock(`<block type="argument_reporter_boolean"><field name="VALUE">${this.escapeXml(expr)}</field></block>`);
        }
        return wrapBlock(`<block type="argument_reporter_string_number"><field name="VALUE">${this.escapeXml(expr)}</field></block>`);
      }

      const varName = VariableManager.ensureVariable(expr);
      return wrapBlock(`<block type="data_variable"><field name="VARIABLE" variabletype="">${this.escapeXml(varName)}</field></block>`);
    }

    static parseLine(line) {
      line = line.trim();
      if (!line || line.startsWith("//")) return null;

      let m;

      if (/^define\s+/i.test(line)) {
        return this.parseCustomBlockDefinition(line);
      }

      if (/^when (?:@greenflag|green flag|flag) clicked/i.test(line)) {
        return { type: "event_whenflagclicked" };
      }
      if ((m = line.match(/^when (?:key\s*)?\[?([\w\s]+)\]?\s*key pressed/i))) {
        return { type: "event_whenkeypressed", fields: { KEY_OPTION: VariableManager.extractName(m[1]).toLowerCase() } };
      }
      if (/^when this sprite clicked/i.test(line)) {
        return { type: "event_whenthisspriteclicked" };
      }
      if (/^when [iI] start as a clone/i.test(line)) {
        return { type: "control_start_as_clone" };
      }
      if ((m = line.match(/^when [iI] receive\s+(.*)/i))) {
        const eventName = VariableManager.extractName(m[1]);
        return { type: "event_whenbroadcastreceived", fields: { BROADCAST_OPTION: eventName } };
      }
      if ((m = line.match(/^broadcast\s+(.*?)\s+and wait/i))) {
        const name = VariableManager.extractName(m[1]);
        return {
          type: "event_broadcastandwait",
          values: { BROADCAST_INPUT: `<shadow type="event_broadcast_menu"><field name="BROADCAST_OPTION">${this.escapeXml(name)}</field></shadow>` }
        };
      }
      if ((m = line.match(/^broadcast\s+(.*)/i))) {
        const name = VariableManager.extractName(m[1]);
        return {
          type: "event_broadcast",
          values: { BROADCAST_INPUT: `<shadow type="event_broadcast_menu"><field name="BROADCAST_OPTION">${this.escapeXml(name)}</field></shadow>` }
        };
      }

      if (/^forever/i.test(line)) {
        return { type: "control_forever", isCBlock: true, branch: "SUBSTACK" };
      }
      if ((m = line.match(/^repeat until\s*(<[\s\S]*>)/i))) {
        return {
          type: "control_repeat_until",
          isCBlock: true,
          branch: "SUBSTACK",
          values: { CONDITION: this.parseBoolean(m[1]) }
        };
      }
      if ((m = line.match(/^repeat\s*(.*)/i))) {
        return {
          type: "control_repeat",
          isCBlock: true,
          branch: "SUBSTACK",
          values: { TIMES: this.parseValue(m[1], "math_whole_number", "10") }
        };
      }
      if ((m = line.match(/^if\s*(<[\s\S]*>)\s*then/i))) {
        return {
          type: "control_if",
          isCBlock: true,
          branch: "SUBSTACK",
          values: { CONDITION: this.parseBoolean(m[1]) }
        };
      }

      if ((m = line.match(/^go to x:\s*(.*?)\s*y:\s*(.*)/i))) {
        return {
          type: "motion_gotoxy",
          values: {
            X: this.parseValue(m[1], "math_number", "0"),
            Y: this.parseValue(m[2], "math_number", "0")
          }
        };
      }
      if ((m = line.match(/^glide\s+(.*?)\s+secs?(?:\s+to)?\s+x:\s*(.*?)\s*y:\s*(.*)/i))) {
        return {
          type: "motion_glidesecstoxy",
          values: {
            SECS: this.parseValue(m[1], "math_positive_number", "1"),
            X: this.parseValue(m[2], "math_number", "0"),
            Y: this.parseValue(m[3], "math_number", "0")
          }
        };
      }
      if ((m = line.match(/^glide\s+(.*?)\s+secs?\s+to\s+(.*)/i))) {
        let target = VariableManager.extractName(m[2]);
        if (target === "random position") target = "_random_";
        if (target === "mouse-pointer") target = "_mouse_";
        return {
          type: "motion_glideto",
          values: {
            SECS: this.parseValue(m[1], "math_positive_number", "1"),
            TO: `<shadow type="motion_glideto_menu"><field name="TO">${this.escapeXml(target)}</field></shadow>`
          }
        };
      }
      if ((m = line.match(/^go to\s+(.*)/i))) {
        let target = VariableManager.extractName(m[1]);
        if (target === "random position" || target === "_random_") target = "_random_";
        if (target === "mouse-pointer" || target === "_mouse_") target = "_mouse_";
        return {
          type: "motion_goto",
          values: {
            TO: `<shadow type="motion_goto_menu"><field name="TO">${this.escapeXml(target)}</field></shadow>`
          }
        };
      }
      if ((m = line.match(/^point in direction\s+(.*)/i))) {
        return { type: "motion_pointindirection", values: { DIRECTION: this.parseValue(m[1], "math_angle", "90") } };
      }
      if ((m = line.match(/^point towards\s+(.*)/i))) {
        let target = VariableManager.extractName(m[1]);
        if (target === "mouse-pointer") target = "_mouse_";
        return {
          type: "motion_pointtowards",
          values: {
            TOWARDS: `<shadow type="motion_pointtowards_menu"><field name="TOWARDS">${this.escapeXml(target)}</field></shadow>`
          }
        };
      }
      if ((m = line.match(/^change x by\s*(.*)/i))) {
        return { type: "motion_changexby", values: { DX: this.parseValue(m[1], "math_number", "10") } };
      }
      if ((m = line.match(/^set x to\s*(.*)/i))) {
        return { type: "motion_setx", values: { X: this.parseValue(m[1], "math_number", "0") } };
      }
      if ((m = line.match(/^change y by\s*(.*)/i))) {
        return { type: "motion_changeyby", values: { DY: this.parseValue(m[1], "math_number", "10") } };
      }
      if ((m = line.match(/^set y to\s*(.*)/i))) {
        return { type: "motion_sety", values: { Y: this.parseValue(m[1], "math_number", "0") } };
      }
      if ((m = line.match(/^move\s*(.*)\s*steps/i))) {
        return { type: "motion_movesteps", values: { STEPS: this.parseValue(m[1], "math_number", "10") } };
      }
      if ((m = line.match(/^turn\s*(?:right|cw|clockwise|@turnRight)\s*(?:by\s*)?(.*?)\s*degrees?/i))) {
        return { type: "motion_turnright", values: { DEGREES: this.parseValue(m[1], "math_number", "15") } };
      }
      if ((m = line.match(/^turn\s*(?:left|ccw|counter-?clockwise|counterclockwise|@turnLeft)\s*(?:by\s*)?(.*?)\s*degrees?/i))) {
        return { type: "motion_turnleft", values: { DEGREES: this.parseValue(m[1], "math_number", "15") } };
      }
      if (/^if on edge, bounce/i.test(line)) {
        return { type: "motion_ifonedgebounce" };
      }
      if ((m = line.match(/^set rotation style\s+(.*)/i))) {
        return { type: "motion_setrotationstyle", fields: { STYLE: VariableManager.extractName(m[1]) } };
      }

      const extMatch = BlockCatalog.matchCommand(line);
      if (extMatch) {
        return extMatch;
      }

      if ((m = line.match(/^set\s*(.*?)\s*to\s*(.*)/i))) {
        const varName = VariableManager.ensureVariable(m[1]);
        return {
          type: "data_setvariableto",
          fields: { VARIABLE: { value: varName, variabletype: "" } },
          values: { VALUE: this.parseValue(m[2], "text", "0") }
        };
      }
      if ((m = line.match(/^change\s*(.*?)\s*by\s*(.*)/i))) {
        const varName = VariableManager.ensureVariable(m[1]);
        return {
          type: "data_changevariableby",
          fields: { VARIABLE: { value: varName, variabletype: "" } },
          values: { VALUE: this.parseValue(m[2], "math_number", "1") }
        };
      }
      if ((m = line.match(/^show variable\s+(.*)/i))) {
        const varName = VariableManager.ensureVariable(m[1]);
        return { type: "data_showvariable", fields: { VARIABLE: { value: varName, variabletype: "" } } };
      }
      if ((m = line.match(/^hide variable\s+(.*)/i))) {
        const varName = VariableManager.ensureVariable(m[1]);
        return { type: "data_hidevariable", fields: { VARIABLE: { value: varName, variabletype: "" } } };
      }

      if ((m = line.match(/^add\s+(.*?)\s+to\s+(.*)/i))) {
        const itemVal = m[1];
        const listName = VariableManager.ensureList(m[2]);
        return {
          type: "data_addtolist",
          fields: { LIST: { value: listName, variabletype: "list" } },
          values: { ITEM: this.parseValue(itemVal, "text", "thing") }
        };
      }
      if ((m = line.match(/^delete\s+all(?:\s+of)?\s+(.*)/i))) {
        const listName = VariableManager.ensureList(m[1]);
        return { type: "data_deletealloflist", fields: { LIST: { value: listName, variabletype: "list" } } };
      }
      if ((m = line.match(/^delete\s+(.*?)\s+of\s+(.*)/i))) {
        const listName = VariableManager.ensureList(m[2]);
        return {
          type: "data_deleteoflist",
          fields: { LIST: { value: listName, variabletype: "list" } },
          values: { INDEX: this.parseValue(m[1], "math_integer", "1") }
        };
      }
      if ((m = line.match(/^insert\s+(.*?)\s+at\s+(.*?)\s+of\s+(.*)/i))) {
        const listName = VariableManager.ensureList(m[3]);
        return {
          type: "data_insertatlist",
          fields: { LIST: { value: listName, variabletype: "list" } },
          values: { ITEM: this.parseValue(m[1], "text", "thing"), INDEX: this.parseValue(m[2], "math_integer", "1") }
        };
      }
      if ((m = line.match(/^replace item\s+(.*?)\s+of\s+(.*?)\s+with\s+(.*)/i))) {
        const listName = VariableManager.ensureList(m[2]);
        return {
          type: "data_replaceitemoflist",
          fields: { LIST: { value: listName, variabletype: "list" } },
          values: { INDEX: this.parseValue(m[1], "math_integer", "1"), ITEM: this.parseValue(m[3], "text", "thing") }
        };
      }
      if ((m = line.match(/^show list\s+(.*)/i))) {
        const listName = VariableManager.ensureList(m[1]);
        return { type: "data_showlist", fields: { LIST: { value: listName, variabletype: "list" } } };
      }
      if ((m = line.match(/^hide list\s+(.*)/i))) {
        const listName = VariableManager.ensureList(m[1]);
        return { type: "data_hidelist", fields: { LIST: { value: listName, variabletype: "list" } } };
      }

      if ((m = line.match(/^say\s*(.*)\s*for\s*(.*)\s*secs?/i))) {
        return {
          type: "looks_sayforsecs",
          values: { MESSAGE: this.parseValue(m[1], "text", "Hello!"), SECS: this.parseValue(m[2], "math_number", "2") }
        };
      }
      if ((m = line.match(/^say\s*(.*)/i))) {
        return { type: "looks_say", values: { MESSAGE: this.parseValue(m[1], "text", "Hello!") } };
      }
      if ((m = line.match(/^wait\s*(.*)\s*secs?/i))) {
        return { type: "control_wait", values: { DURATION: this.parseValue(m[1], "math_positive_number", "1") } };
      }
      if (/^show$/i.test(line)) return { type: "looks_show" };
      if (/^hide$/i.test(line)) return { type: "looks_hide" };

      return this.parseCustomBlockCall(line);
    }

    static buildAst(text) {
      let cleaned = text.trim()
        .replace(/```(?:scratch|scratchblocks|blocks)?\r?\n([\s\S]*?)```/gi, "$1")
        .replace(/\[scratchblocks\]([\s\S]*?)\[\/scratchblocks\]/gi, "$1");

      const lines = cleaned.split(/\r?\n/);
      const scripts = [];
      let currentScript = [];
      const stack = [{ currentList: currentScript }];

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
          if (currentScript.length > 0 && stack.length === 1) {
            scripts.push(currentScript);
            currentScript = [];
            stack[0].currentList = currentScript;
          }
          continue;
        }

        if (/^end$/i.test(line)) {
          if (stack.length > 1) stack.pop();
          continue;
        }

        if (/^else$/i.test(line)) {
          if (stack.length > 1) {
            const top = stack[stack.length - 1];
            if (top.block && top.block.type === "control_if") {
              top.block.type = "control_if_else";
              top.block.statements.SUBSTACK2 = [];
              top.currentList = top.block.statements.SUBSTACK2;
            }
          }
          continue;
        }

        const block = this.parseLine(line);
        if (!block) continue;

        if (
          (block.isHat || block.isCustomDef || block.type.startsWith("event_when") || block.type === "control_start_as_clone") &&
          currentScript.length > 0 &&
          stack.length === 1
        ) {
          scripts.push(currentScript);
          currentScript = [];
          stack[0].currentList = currentScript;
        }

        const currentContext = stack[stack.length - 1];
        currentContext.currentList.push(block);

        if (block.isCBlock) {
          block.statements = { [block.branch]: [] };
          stack.push({
            block: block,
            currentList: block.statements[block.branch]
          });
        }
      }

      if (currentScript.length > 0) {
        scripts.push(currentScript);
      }

      return scripts;
    }

    static serializeBlockList(blocks, isTop = false, posX = 100, posY = 100) {
      if (!blocks || blocks.length === 0) return "";
      let xml = "";

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        xml += `<block type="${b.type}"`;
        if (isTop && i === 0) {
          xml += ` x="${posX}" y="${posY}"`;
        }
        xml += `>`;

        if (b.isCustomDef) {
          const argNamesJson = JSON.stringify(b.argNames || []);
          const argDefaultsJson = JSON.stringify(b.argDefaults || []);
          const argIdsJson = JSON.stringify(b.argIds || (b.argNames || []).map((_, idx) => `input${idx}`));
          const warpStr = b.warp ? "true" : "false";

          xml += `<statement name="custom_block">
            <shadow type="procedures_prototype">
              <mutation proccode="${this.escapeXml(b.procCode)}"
                        argumentnames="${this.escapeXml(argNamesJson)}"
                        argumentdefaults="${this.escapeXml(argDefaultsJson)}"
                        argumentids="${this.escapeXml(argIdsJson)}"
                        warp="${warpStr}"/>
            </shadow>
          </statement>`;
        }

        if (b.type === "procedures_call") {
          const argNamesJson = JSON.stringify(b.argNames || []);
          const argIdsJson = JSON.stringify((b.argNames || []).map((_, idx) => `input${idx}`));
          xml += `<mutation proccode="${this.escapeXml(b.procCode)}"
                            argumentnames="${this.escapeXml(argNamesJson)}"
                            argumentids="${this.escapeXml(argIdsJson)}"/>`;
        }

        if (b.fields) {
          for (const [k, f] of Object.entries(b.fields)) {
            if (typeof f === "object" && f !== null) {
              const vtype = f.variabletype !== undefined ? ` variabletype="${this.escapeXml(f.variabletype)}"` : "";
              xml += `<field name="${k}"${vtype}>${this.escapeXml(f.value)}</field>`;
            } else {
              let vtype = "";
              if (k === "LIST") vtype = ' variabletype="list"';
              else if (k === "VARIABLE") vtype = ' variabletype=""';
              xml += `<field name="${k}"${vtype}>${this.escapeXml(f)}</field>`;
            }
          }
        }

        if (b.values) {
          for (const [k, v] of Object.entries(b.values)) {
            if (v) xml += `<value name="${k}">${v}</value>`;
          }
        }

        if (b.statements) {
          for (const [k, list] of Object.entries(b.statements)) {
            if (list && list.length > 0) {
              xml += `<statement name="${k}">${this.serializeBlockList(list, false)}</statement>`;
            }
          }
        }

        if (i < blocks.length - 1) {
          xml += `<next>`;
        }
      }

      for (let i = blocks.length - 1; i >= 0; i--) {
        xml += `</block>`;
        if (i > 0) xml += `</next>`;
      }

      return xml;
    }

    static toBlocklyXml(text, startX = 100, startY = 100) {
      if (text.trim().startsWith("<xml") || text.trim().startsWith("<block")) {
        return text.trim();
      }

      const scripts = this.buildAst(text);
      let fullXml = `<xml xmlns="http://www.w3.org/1999/xhtml">`;
      let curY = startY;

      for (const script of scripts) {
        fullXml += this.serializeBlockList(script, true, startX, curY);
        curY += 280;
      }

      fullXml += `</xml>`;
      return fullXml;
    }

    static importMarkdownToWorkspace(text, x, y) {
      const ws = ScratchBlocks.getMainWorkspace();
      if (!ws) {
        console.error("Workspace not found.");
        return false;
      }

      const metrics = ws.getMetrics ? ws.getMetrics() : null;
      let posX = typeof x === "number" && !isNaN(x) ? x : 100;
      let posY = typeof y === "number" && !isNaN(y) ? y : 100;

      if (metrics) {
        if (typeof metrics.viewLeft === "number" && !isNaN(metrics.viewLeft)) posX = metrics.viewLeft + 80;
        else if (typeof metrics.scrollX === "number" && !isNaN(metrics.scrollX)) posX = -metrics.scrollX + 80;

        if (typeof metrics.viewTop === "number" && !isNaN(metrics.viewTop)) posY = metrics.viewTop + 80;
        else if (typeof metrics.scrollY === "number" && !isNaN(metrics.scrollY)) posY = -metrics.scrollY + 80;
      }

      const xmlString = this.toBlocklyXml(text, Math.round(posX), Math.round(posY));

      try {
        const dom = ScratchBlocks.Xml.textToDom(xmlString);
        ScratchBlocks.Xml.domToWorkspace(dom, ws);
        return true;
      } catch (err) {
        console.error("XML parse failure:", err, xmlString);
        return false;
      }
    }
  }

  class ScratchBlocksExporter {
    static inspectBlock(opcode, headlessWs) {
      if (
        opcode.endsWith("_menu") ||
        opcode.startsWith("math_") ||
        opcode === "text" ||
        opcode === "colour_picker" ||
        opcode === "matrix" ||
        opcode === "note" ||
        opcode === "procedures_prototype"
      ) {
        return null;
      }

      let block;
      try {
        block = headlessWs.newBlock(opcode);
        if (!block) return null;
      } catch (_) {
        return null;
      }

      const hasSubstack = block.inputList.some((input) => input.type === ScratchBlocks.NEXT_STATEMENT);
      const isHat = !block.previousConnection && !block.outputConnection && !!block.nextConnection;
      const isReporter = !!block.outputConnection;
      const isBoolean = isReporter && block.outputConnection.check_ && block.outputConnection.check_.includes("Boolean");

      let syntaxTokens = [];
      let annotatedTokens = [];
      let menuDetails = [];

      for (const input of block.inputList) {
        for (const field of input.fieldRow) {
          if (field instanceof ScratchBlocks.FieldImage) {
            if (field.src_?.includes("green-flag")) {
              syntaxTokens.push("@greenFlag");
              annotatedTokens.push("@greenFlag");
            }
          } else if (field instanceof ScratchBlocks.FieldDropdown) {
            let fieldName = field.name || "MENU";
            let options = [];
            try {
              options = field.getOptions ? field.getOptions() : [];
            } catch (_) {}

            const optValues = options.map((opt) => opt[0] || opt[1]);
            const defaultVal = optValues[0] || "option";
            syntaxTokens.push(`[${defaultVal} v]`);
            annotatedTokens.push(`[${fieldName}: Menu v]`);

            if (optValues.length > 0) {
              menuDetails.push({
                fieldName: fieldName,
                options: optValues
              });
            }
          } else if (field instanceof ScratchBlocks.FieldVariable) {
            const varName = field.name || "VARIABLE";
            syntaxTokens.push(`[my variable v]`);
            annotatedTokens.push(`[${varName}: Variable v]`);
          } else if (field.getText) {
            const text = field.getText().trim();
            if (text) {
              syntaxTokens.push(text);
              annotatedTokens.push(text);
            }
          }
        }

        if (input.type === ScratchBlocks.INPUT_VALUE) {
          let token = "( )";
          let annotatedToken = `(${input.name}: Number/String)`;

          if (input.connection && input.connection.check_) {
            const check = input.connection.check_;
            if (check.includes("Boolean")) {
              token = "< >";
              annotatedToken = `<${input.name}: Boolean>`;
            } else if (check.includes("Number")) {
              token = "(0)";
              annotatedToken = `(${input.name}: Number)`;
            } else if (check.includes("String")) {
              token = "[ ]";
              annotatedToken = `[${input.name}: String]`;
            }
          }

          syntaxTokens.push(token);
          annotatedTokens.push(annotatedToken);
        } else if (input.type === ScratchBlocks.NEXT_STATEMENT) {
          syntaxTokens.push(`\n  ...\nend`);
          annotatedTokens.push(`\n  ...\nend`);
        }
      }

      let rawSyntax = syntaxTokens.join(" ").replace(/\s+\n/g, "\n");
      let rawAnnotated = annotatedTokens.join(" ").replace(/\s+\n/g, "\n");

      let fullSyntax = rawSyntax;
      let fullAnnotated = rawAnnotated;

      if (isBoolean) {
        fullSyntax = `<${rawSyntax}>`;
        fullAnnotated = `<${rawAnnotated}>`;
      } else if (isReporter) {
        fullSyntax = `(${rawSyntax})`;
        fullAnnotated = `(${rawAnnotated})`;
      }

      try { block.dispose(); } catch (_) {}

      return {
        opcode: opcode,
        category: opcode.split("_")[0],
        syntax: fullSyntax,
        annotatedSyntax: fullAnnotated,
        isHat,
        isReporter,
        isBoolean,
        isCBlock: hasSubstack,
        menus: menuDetails
      };
    }

    static generateAllBlocksMarkdown() {
      const headlessWs = new ScratchBlocks.Workspace();
      const allOpcodes = Object.keys(ScratchBlocks.Blocks);
      const categorized = {};

      for (const opcode of allOpcodes) {
        const info = this.inspectBlock(opcode, headlessWs);
        if (!info || !info.syntax.trim()) continue;

        if (!categorized[info.category]) {
          categorized[info.category] = [];
        }
        categorized[info.category].push(info);
      }

      try { headlessWs.dispose(); } catch (_) {}

      let md = `# Blocks Reference\n\n---\n\n`;

      for (const [catId, blocks] of Object.entries(categorized)) {
        md += `## ${catId}\n\n`;
        for (const b of blocks) {
          let typeStr = "command";
          if (b.isHat) typeStr = "hat";
          else if (b.isBoolean) typeStr = "boolean";
          else if (b.isReporter) typeStr = "reporter";
          else if (b.isCBlock) typeStr = "c-block";

          md += `blocktype: ${typeStr}\n`;
          md += `${b.syntax}\n`;

          if (b.annotatedSyntax && b.annotatedSyntax !== b.syntax) {
            md += `${b.annotatedSyntax}\n`;
          }

          if (b.menus.length > 0) {
            for (const menu of b.menus) {
              md += `[menu: ${menu.fieldName} -> ${menu.options.join(", ")}]\n`;
            }
          }

          md += `\n`;
        }
        md += `---\n\n`;
      }

      return md.trim();
    }
  }

  class VmBlockDecompiler {
    static getInputValue(block, inputName, target, blocks) {
      if (!block?.inputs || !block.inputs[inputName]) return "";
      const inp = block.inputs[inputName];
      const val = inp[1];

      if (typeof val === "string") {
        const childBlock = blocks[val];
        return childBlock ? this.decompileBlock(childBlock, target, blocks) : "";
      }

      if (Array.isArray(val)) {
        const type = val[0];
        const raw = val[1];
        if (type === 12) return `(${raw})`;
        if (type === 13) return `(${raw})`;
        return String(raw);
      }

      return "";
    }

    static getInputBoolean(block, inputName, target, blocks) {
      if (!block?.inputs || !block.inputs[inputName]) return "";
      const inp = block.inputs[inputName];
      const val = inp[1];
      if (typeof val === "string") {
        const child = blocks[val];
        return child ? this.decompileBlock(child, target, blocks) : "";
      }
      return "";
    }

    static decompileBlock(b, target, blocks) {
      if (!b) return "";
      const op = b.opcode;
      const getVal = (name) => this.getInputValue(b, name, target, blocks);
      const getBool = (name) => this.getInputBoolean(b, name, target, blocks);

      if (op === "event_whenflagclicked") return "when @greenFlag clicked";
      if (op === "event_whenthisspriteclicked") return "when this sprite clicked";
      if (op === "event_whenstageclicked") return "when stage clicked";
      if (op === "control_start_as_clone") return "when I start as a clone";
      if (op === "event_whenkeypressed") return `when [${b.fields?.KEY_OPTION?.value || "space"} v] key pressed`;
      if (op === "event_whenbroadcastreceived") return `when I receive [${b.fields?.BROADCAST_OPTION?.value || "message1"} v]`;
      if (op === "event_broadcast") return `broadcast [${getVal("BROADCAST_INPUT")} v]`;
      if (op === "event_broadcastandwait") return `broadcast [${getVal("BROADCAST_INPUT")} v] and wait`;

      if (op === "motion_movesteps") return `move (${getVal("STEPS")}) steps`;
      if (op === "motion_turnright") return `turn right (${getVal("DEGREES")}) degrees`;
      if (op === "motion_turnleft") return `turn left (${getVal("DEGREES")}) degrees`;
      if (op === "motion_gotoxy") return `go to x: (${getVal("X")}) y: (${getVal("Y")})`;
      if (op === "motion_goto") return `go to [${getVal("TO")} v]`;
      if (op === "motion_glidesecstoxy") return `glide (${getVal("SECS")}) secs to x: (${getVal("X")}) y: (${getVal("Y")})`;
      if (op === "motion_glideto") return `glide (${getVal("SECS")}) secs to [${getVal("TO")} v]`;
      if (op === "motion_pointindirection") return `point in direction (${getVal("DIRECTION")})`;
      if (op === "motion_pointtowards") return `point towards [${getVal("TOWARDS")} v]`;
      if (op === "motion_changexby") return `change x by (${getVal("DX")})`;
      if (op === "motion_setx") return `set x to (${getVal("X")})`;
      if (op === "motion_changeyby") return `change y by (${getVal("DY")})`;
      if (op === "motion_sety") return `set y to (${getVal("Y")})`;
      if (op === "motion_ifonedgebounce") return "if on edge, bounce";
      if (op === "motion_setrotationstyle") return `set rotation style [${b.fields?.STYLE?.value || "all around"} v]`;
      if (op === "motion_xposition") return "x position";
      if (op === "motion_yposition") return "y position";
      if (op === "motion_direction") return "direction";

      if (op === "looks_sayforsecs") return `say [${getVal("MESSAGE")}] for (${getVal("SECS")}) secs`;
      if (op === "looks_say") return `say [${getVal("MESSAGE")}]`;
      if (op === "looks_thinkforsecs") return `think [${getVal("MESSAGE")}] for (${getVal("SECS")}) secs`;
      if (op === "looks_think") return `think [${getVal("MESSAGE")}]`;
      if (op === "looks_switchcostumeto") return `switch costume to [${VariableManager.resolveCostumeName(getVal("COSTUME"), target)} v]`;
      if (op === "looks_nextcostume") return "next costume";
      if (op === "looks_switchbackdropto") return `switch backdrop to [${getVal("BACKDROP")} v]`;
      if (op === "looks_nextbackdrop") return "next backdrop";
      if (op === "looks_changesizeby") return `change size by (${getVal("CHANGE")})`;
      if (op === "looks_setsizeto") return `set size to (${getVal("SIZE")}) %`;
      if (op === "looks_cleargraphiceffects") return "clear graphic effects";
      if (op === "looks_show") return "show";
      if (op === "looks_hide") return "hide";
      if (op === "looks_size") return "size";

      if (op === "sound_playuntildone") return `play sound [${VariableManager.resolveSoundName(getVal("SOUND_MENU"), target)} v] until done`;
      if (op === "sound_play") return `start sound [${VariableManager.resolveSoundName(getVal("SOUND_MENU"), target)} v]`;
      if (op === "sound_stopallsounds") return "stop all sounds";
      if (op === "sound_cleareffects") return "clear sound effects";
      if (op === "sound_changevolumeby") return `change volume by (${getVal("VOLUME")})`;
      if (op === "sound_setvolumeto") return `set volume to (${getVal("VOLUME")}) %`;
      if (op === "sound_volume") return "volume";

      if (op === "control_wait") return `wait (${getVal("DURATION")}) secs`;
      if (op === "control_wait_until") return `wait until <${getBool("CONDITION")}>`;
      if (op === "control_stop") return `stop [${b.fields?.STOP_OPTION?.value || "all"} v]`;
      if (op === "control_create_clone_of") return `create clone of [${getVal("CLONE_OPTION")} v]`;
      if (op === "control_delete_this_clone") return "delete this clone";

      if (op === "sensing_touchingobject") return `touching [${getVal("TOUCHINGOBJECTMENU")} v] ?`;
      if (op === "sensing_touchingcolor") return `touching color [${getVal("COLOR")}] ?`;
      if (op === "sensing_askandwait") return `ask [${getVal("QUESTION")}] and wait`;
      if (op === "sensing_answer") return "answer";
      if (op === "sensing_keypressed") return `key [${getVal("KEY_OPTION")} v] pressed?`;
      if (op === "sensing_mousedown") return "mouse down?";
      if (op === "sensing_mousex") return "mouse x";
      if (op === "sensing_mousey") return "mouse y";
      if (op === "sensing_timer") return "timer";
      if (op === "sensing_resettimer") return "reset timer";

      if (op === "operator_add") return `(${getVal("NUM1")} + ${getVal("NUM2")})`;
      if (op === "operator_subtract") return `(${getVal("NUM1")} - ${getVal("NUM2")})`;
      if (op === "operator_multiply") return `(${getVal("NUM1")} * ${getVal("NUM2")})`;
      if (op === "operator_divide") return `(${getVal("NUM1")} / ${getVal("NUM2")})`;
      if (op === "operator_random") return `pick random (${getVal("FROM")}) to (${getVal("TO")})`;
      if (op === "operator_lt") return `(${getVal("OPERAND1")}) < (${getVal("OPERAND2")})`;
      if (op === "operator_equals") return `(${getVal("OPERAND1")}) = (${getVal("OPERAND2")})`;
      if (op === "operator_gt") return `(${getVal("OPERAND1")}) > (${getVal("OPERAND2")})`;
      if (op === "operator_and") return `<${getBool("OPERAND1")}> and <${getBool("OPERAND2")}>`;
      if (op === "operator_or") return `<${getBool("OPERAND1")}> or <${getBool("OPERAND2")}>`;
      if (op === "operator_not") return `not <${getBool("OPERAND")}>`;
      if (op === "operator_join") return `join [${getVal("STRING1")}] [${getVal("STRING2")}]`;
      if (op === "operator_letter_of") return `letter (${getVal("LETTER")}) of [${getVal("STRING")}]`;
      if (op === "operator_length") return `length of [${getVal("STRING")}]`;
      if (op === "operator_contains") return `[${getVal("STRING1")}] contains [${getVal("STRING2")}] ?`;

      if (op === "data_variable") return b.fields?.VARIABLE?.value || "";
      if (op === "data_setvariableto") return `set [${b.fields?.VARIABLE?.value || ""} v] to [${getVal("VALUE")}]`;
      if (op === "data_changevariableby") return `change [${b.fields?.VARIABLE?.value || ""} v] by (${getVal("VALUE")})`;
      if (op === "data_showvariable") return `show variable [${b.fields?.VARIABLE?.value || ""} v]`;
      if (op === "data_hidevariable") return `hide variable [${b.fields?.VARIABLE?.value || ""} v]`;
      if (op === "data_listcontents") return b.fields?.LIST?.value || "";
      if (op === "data_addtolist") return `add [${getVal("ITEM")}] to [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_deleteoflist") return `delete (${getVal("INDEX")}) of [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_deletealloflist") return `delete all of [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_insertatlist") return `insert [${getVal("ITEM")}] at (${getVal("INDEX")}) of [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_replaceitemoflist") return `replace item (${getVal("INDEX")}) of [${b.fields?.LIST?.value || ""} v] with [${getVal("ITEM")}]`;
      if (op === "data_itemoflist") return `item (${getVal("INDEX")}) of [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_lengthoflist") return `length of [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_listcontainsitem") return `[${b.fields?.LIST?.value || ""} v] contains [${getVal("ITEM")}] ?`;
      if (op === "data_showlist") return `show list [${b.fields?.LIST?.value || ""} v]`;
      if (op === "data_hidelist") return `hide list [${b.fields?.LIST?.value || ""} v]`;

      if (op === "procedures_definition") {
        const protoId = b.inputs?.custom_block?.[1];
        const proto = blocks[protoId];
        const proccode = proto?.mutation?.proccode || "custom block";
        const warp = proto?.mutation?.warp === "true" || proto?.mutation?.warp === true;
        return `define ${proccode}${warp ? " :: warp" : ""}`;
      }
      if (op === "procedures_call") {
        return b.mutation?.proccode || "custom block";
      }
      if (op === "argument_reporter_string_number") return b.fields?.VALUE?.value || "";
      if (op === "argument_reporter_boolean") return b.fields?.VALUE?.value || "";

      if (op === "pen_clear") return "erase all";
      if (op === "pen_stamp") return "stamp";
      if (op === "pen_penDown") return "pen down";
      if (op === "pen_penUp") return "pen up";
      if (op === "pen_setPenColorToColor") return `set pen color to [${getVal("COLOR")}]`;
      if (op === "pen_changePenColorParamBy") return `change pen [${getVal("COLOR_PARAM")} v] by (${getVal("VALUE")})`;
      if (op === "pen_setPenColorParamTo") return `set pen [${getVal("COLOR_PARAM")} v] to (${getVal("VALUE")})`;
      if (op === "pen_changePenSizeBy") return `change pen size by (${getVal("SIZE")})`;
      if (op === "pen_setPenSizeTo") return `set pen size to (${getVal("SIZE")})`;

      if (b.fields) {
        const fieldVals = Object.values(b.fields).map((f) => f.value).filter(Boolean);
        if (fieldVals.length > 0) return fieldVals.join(" ");
      }

      return op;
    }

    static decompileVmStack(startBlock, target, blocks, indent = "") {
      const lines = [];
      let cur = startBlock;

      while (cur) {
        const op = cur.opcode;
        const lineText = this.decompileBlock(cur, target, blocks);

        if (op === "control_forever" || op === "control_repeat" || op === "control_repeat_until") {
          lines.push(`${indent}${lineText}`);
          const subId = cur.inputs?.SUBSTACK?.[1];
          if (subId && blocks[subId]) {
            lines.push(this.decompileVmStack(blocks[subId], target, blocks, indent + "  "));
          }
          lines.push(`${indent}end`);
        } else if (op === "control_if") {
          lines.push(`${indent}${lineText}`);
          const subId = cur.inputs?.SUBSTACK?.[1];
          if (subId && blocks[subId]) {
            lines.push(this.decompileVmStack(blocks[subId], target, blocks, indent + "  "));
          }
          lines.push(`${indent}end`);
        } else if (op === "control_if_else") {
          lines.push(`${indent}${lineText}`);
          const subId1 = cur.inputs?.SUBSTACK?.[1];
          if (subId1 && blocks[subId1]) {
            lines.push(this.decompileVmStack(blocks[subId1], target, blocks, indent + "  "));
          }
          lines.push(`${indent}else`);
          const subId2 = cur.inputs?.SUBSTACK2?.[1];
          if (subId2 && blocks[subId2]) {
            lines.push(this.decompileVmStack(blocks[subId2], target, blocks, indent + "  "));
          }
          lines.push(`${indent}end`);
        } else {
          lines.push(`${indent}${lineText}`);
        }

        const nextId = cur.next;
        cur = nextId ? blocks[nextId] : null;
      }

      return lines.join("\n");
    }

    static decompileAllTargetScripts(target) {
      if (!target?.blocks?._blocks) return "";
      const blocks = target.blocks._blocks;
      const topBlockIds = Object.keys(blocks).filter((id) => blocks[id].topLevel);
      if (topBlockIds.length === 0) return "";

      const scripts = [];
      for (const topId of topBlockIds) {
        const text = this.decompileVmStack(blocks[topId], target, blocks);
        if (text.trim()) scripts.push(text.trim());
      }

      return scripts.join("\n\n");
    }
  }

  class BlockDecompiler {
    static decompileExpression(block, targetSprite = null) {
      if (!block) return "";
      const parts = [];

      for (const input of block.inputList) {
        for (const field of input.fieldRow) {
          if (field instanceof ScratchBlocks.FieldDropdown) {
            const rawVal = field.getText() || field.getValue();
            let resolved = rawVal;
            if (field.name === "SOUND_MENU") {
              resolved = VariableManager.resolveSoundName(rawVal, targetSprite);
            } else if (field.name === "COSTUME") {
              resolved = VariableManager.resolveCostumeName(rawVal, targetSprite);
            }
            parts.push(`[${resolved} v]`);
          } else if (field instanceof ScratchBlocks.FieldVariable) {
            parts.push(`[${field.getText()} v]`);
          } else if (field.getText) {
            const t = field.getText().trim();
            if (t) parts.push(t);
          }
        }
        if (input.type === ScratchBlocks.INPUT_VALUE) {
          const target = input.connection?.targetBlock();
          if (target) {
            if (target.type === "sound_sounds_menu") {
              const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
              const raw = field?.getText ? field.getText() : (field?.getValue ? field.getValue() : "Meow");
              parts.push(`[${VariableManager.resolveSoundName(raw, targetSprite)} v]`);
            } else if (target.type === "looks_costume") {
              const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
              const raw = field?.getText ? field.getText() : (field?.getValue ? field.getValue() : "costume1");
              parts.push(`[${VariableManager.resolveCostumeName(raw, targetSprite)} v]`);
            } else if (target.type === "looks_backdrops") {
              const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
              parts.push(`[${field?.getText ? field.getText() : "backdrop1"} v]`);
            } else if (target.type === "event_broadcast_menu") {
              const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
              parts.push(`[${field?.getText ? field.getText() : "message1"} v]`);
            } else if (target.type === "motion_goto_menu" || target.type === "motion_glideto_menu" || target.type === "motion_pointtowards_menu") {
              const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
              let tName = field?.getText ? field.getText() : "_random_";
              if (tName === "_random_") tName = "random position";
              if (tName === "_mouse_") tName = "mouse-pointer";
              parts.push(`[${tName} v]`);
            } else {
              const isBool = target.outputConnection?.check_?.includes("Boolean");
              const inner = this.decompileExpression(target, targetSprite);
              parts.push(isBool ? `<${inner}>` : `(${inner})`);
            }
          }
        }
      }

      return parts.join(" ");
    }

    static decompileStack(rootBlock, indent = "", targetSprite = null) {
      if (!rootBlock) return "";
      const lines = [];
      let cur = rootBlock;

      while (cur) {
        if (cur.type === "procedures_definition") {
          const proto = cur.getChildren().find((c) => c.type === "procedures_prototype" || c.getProcCode);
          const code = proto?.getProcCode ? proto.getProcCode() : "custom block";
          lines.push(`${indent}define ${code}`);
        } else {
          const lineParts = [];
          let substack1 = null;
          let substack2 = null;

          for (const input of cur.inputList) {
            for (const field of input.fieldRow) {
              if (field instanceof ScratchBlocks.FieldImage) {
                if (field.src_?.includes("green-flag")) lineParts.push("@greenFlag");
              } else if (field instanceof ScratchBlocks.FieldDropdown) {
                const rawVal = field.getText() || field.getValue();
                let resolved = rawVal;
                if (field.name === "SOUND_MENU") {
                  resolved = VariableManager.resolveSoundName(rawVal, targetSprite);
                } else if (field.name === "COSTUME") {
                  resolved = VariableManager.resolveCostumeName(rawVal, targetSprite);
                }
                lineParts.push(`[${resolved} v]`);
              } else if (field instanceof ScratchBlocks.FieldVariable) {
                lineParts.push(`[${field.getText()} v]`);
              } else if (field.getText) {
                const t = field.getText().trim();
                if (t) lineParts.push(t);
              }
            }

            if (input.type === ScratchBlocks.INPUT_VALUE) {
              const target = input.connection?.targetBlock();
              if (target) {
                if (target.type === "sound_sounds_menu") {
                  const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
                  const raw = field?.getText ? field.getText() : (field?.getValue ? field.getValue() : "Meow");
                  lineParts.push(`[${VariableManager.resolveSoundName(raw, targetSprite)} v]`);
                } else if (target.type === "looks_costume") {
                  const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
                  const raw = field?.getText ? field.getText() : (field?.getValue ? field.getValue() : "costume1");
                  lineParts.push(`[${VariableManager.resolveCostumeName(raw, targetSprite)} v]`);
                } else if (target.type === "looks_backdrops") {
                  const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
                  lineParts.push(`[${field?.getText ? field.getText() : "backdrop1"} v]`);
                } else if (target.type === "event_broadcast_menu") {
                  const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
                  lineParts.push(`[${field?.getText ? field.getText() : "message1"} v]`);
                } else if (target.type === "motion_goto_menu" || target.type === "motion_glideto_menu" || target.type === "motion_pointtowards_menu") {
                  const field = target.inputList[0]?.fieldRow?.find((f) => f instanceof ScratchBlocks.FieldDropdown) || target.inputList[0]?.fieldRow[0];
                  let tName = field?.getText ? field.getText() : "_random_";
                  if (tName === "_random_") tName = "random position";
                  if (tName === "_mouse_") tName = "mouse-pointer";
                  lineParts.push(`[${tName} v]`);
                } else {
                  const isBool = target.outputConnection?.check_?.includes("Boolean");
                  const inner = this.decompileExpression(target, targetSprite);
                  lineParts.push(isBool ? `<${inner}>` : `(${inner})`);
                }
              } else {
                if (input.name === "COLOR" || input.name === "COLOUR") {
                  lineParts.push("[#4C97FF]");
                } else if (input.name === "STEPS" || input.name === "TIMES") {
                  lineParts.push("(10)");
                } else {
                  lineParts.push("(0)");
                }
              }
            } else if (input.type === ScratchBlocks.NEXT_STATEMENT) {
              if (input.name === "SUBSTACK" || input.name === "DO") {
                substack1 = input.connection?.targetBlock();
              } else if (input.name === "SUBSTACK2" || input.name === "ELSE") {
                substack2 = input.connection?.targetBlock();
              }
            }
          }

          const lineText = lineParts.join(" ");
          lines.push(`${indent}${lineText}`);

          if (cur.inputList.some((i) => i.type === ScratchBlocks.NEXT_STATEMENT)) {
            if (substack1) {
              lines.push(this.decompileStack(substack1, indent + "  ", targetSprite));
            }
            if (cur.type === "control_if_else") {
              lines.push(`${indent}else`);
              if (substack2) {
                lines.push(this.decompileStack(substack2, indent + "  ", targetSprite));
              }
            }
            lines.push(`${indent}end`);
          }
        }

        cur = cur.getNextBlock ? cur.getNextBlock() : null;
      }

      return lines.join("\n");
    }

    static decompileAllWorkspaceScripts(targetSprite = null) {
      const ws = ScratchBlocks.getMainWorkspace();
      if (!ws) return "";
      const topBlocks = ws.getTopBlocks(true);
      if (topBlocks.length === 0) return "";

      const scripts = [];
      for (const top of topBlocks) {
        const text = this.decompileStack(top, "", targetSprite);
        if (text.trim()) scripts.push(text.trim());
      }

      return scripts.join("\n\n");
    }
  }

  function showAceEditorModal(title, content, isEditable = false, onSave = null) {
    const existing = document.getElementById("sa-editor-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "sa-editor-modal";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    });

    const dialog = document.createElement("div");
    Object.assign(dialog.style, {
      width: "820px",
      maxWidth: "94vw",
      height: "82vh",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0 16px 44px rgba(0, 0, 0, 0.35)",
      padding: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    });

    dialog.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.15rem; color:#24292f; font-weight:bold;">${title}</h3>
        <button id="sa-editor-close-btn" style="background:none; border:none; font-size:1.1rem; cursor:pointer; font-weight:bold; color:#57606a;">X</button>
      </div>

      <div id="sa-ace-container" style="
        flex: 1;
        box-sizing: border-box;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
      "></div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        ${
          isEditable
            ? `<button id="sa-editor-cancel-btn" style="padding:6px 14px; border-radius:6px; border:1px solid #d0d7de; background:#f6f8fa; cursor:pointer;">Cancel</button>
               <button id="sa-editor-save-btn" style="padding:6px 16px; border-radius:6px; border:none; background:#4C97FF; color:white; font-weight:bold; cursor:pointer;">Apply Changes</button>`
            : `<button id="sa-editor-copy-btn" style="padding:6px 14px; border-radius:6px; border:none; background:#4C97FF; color:white; font-weight:bold; cursor:pointer;">Copy to Clipboard</button>
               <button id="sa-editor-download-btn" style="padding:6px 14px; border-radius:6px; border:1px solid #d0d7de; background:#f6f8fa; cursor:pointer;">Download .txt</button>`
        }
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    let aceEditorInstance = null;

    const close = () => {
      if (aceEditorInstance) {
        aceEditorInstance.destroy();
      }
      overlay.remove();
    };

    dialog.querySelector("#sa-editor-close-btn").onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    const container = dialog.querySelector("#sa-ace-container");

    ensureAceEditor()
      .then((ace) => {
        aceEditorInstance = ace.edit(container);
        aceEditorInstance.setTheme("ace/theme/chrome");
        aceEditorInstance.session.setMode("ace/mode/scratch");
        aceEditorInstance.setFontSize("13px");
        aceEditorInstance.setOptions({
          wrap: true,
          showPrintMargin: false,
          readOnly: !isEditable
        });
        aceEditorInstance.setValue(content, -1);

        if (isEditable) {
          dialog.querySelector("#sa-editor-cancel-btn").onclick = close;
          dialog.querySelector("#sa-editor-save-btn").onclick = () => {
            const val = aceEditorInstance.getValue();
            if (onSave) onSave(val);
            close();
          };
        } else {
          const copyBtn = dialog.querySelector("#sa-editor-copy-btn");
          const dlBtn = dialog.querySelector("#sa-editor-download-btn");

          copyBtn.onclick = () => {
            navigator.clipboard.writeText(aceEditorInstance.getValue());
            copyBtn.innerText = "Copied!";
            setTimeout(() => (copyBtn.innerText = "Copy to Clipboard"), 1600);
          };

          dlBtn.onclick = () => {
            const blob = new Blob([aceEditorInstance.getValue()], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "scratch_text_export.txt";
            a.click();
            URL.revokeObjectURL(url);
          };
        }
      })
      .catch((err) => {
        container.innerHTML = `<textarea style="width:100%; height:100%; box-sizing:border-box; border:none; padding:12px; font-family:Consolas,monospace; font-size:0.85rem; resize:none;" ${isEditable ? "" : "readonly"}>${content}</textarea>`;
        const ta = container.querySelector("textarea");

        if (isEditable) {
          dialog.querySelector("#sa-editor-cancel-btn").onclick = close;
          dialog.querySelector("#sa-editor-save-btn").onclick = () => {
            if (onSave) onSave(ta.value);
            close();
          };
        } else {
          const copyBtn = dialog.querySelector("#sa-editor-copy-btn");
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(ta.value);
            copyBtn.innerText = "Copied!";
            setTimeout(() => (copyBtn.innerText = "Copy to Clipboard"), 1600);
          };
        }
      });
  }

  function showPlainTextViewerModal(title, content) {
    const existing = document.getElementById("sa-plain-viewer-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "sa-plain-viewer-modal";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
    });

    const dialog = document.createElement("div");
    Object.assign(dialog.style, {
      width: "820px",
      maxWidth: "94vw",
      height: "82vh",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0 16px 44px rgba(0, 0, 0, 0.35)",
      padding: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    });

    dialog.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.15rem; color:#24292f; font-weight:bold;">${title}</h3>
        <button id="sa-plain-close-btn" style="background:none; border:none; font-size:1.1rem; cursor:pointer; font-weight:bold; color:#57606a;">X</button>
      </div>

      <textarea id="sa-plain-textarea" readonly style="
        flex: 1;
        box-sizing: border-box;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Consolas', monospace;
        font-size: 0.85rem;
        line-height: 1.45;
        resize: none;
        outline: none;
        background: #f6f8fa;
        color: #24292f;
        white-space: pre;
      "></textarea>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button id="sa-plain-copy-btn" style="padding:6px 14px; border-radius:6px; border:none; background:#4C97FF; color:white; font-weight:bold; cursor:pointer;">Copy to Clipboard</button>
        <button id="sa-plain-download-btn" style="padding:6px 14px; border-radius:6px; border:1px solid #d0d7de; background:#f6f8fa; cursor:pointer;">Download .txt</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    dialog.querySelector("#sa-plain-close-btn").onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    const textarea = dialog.querySelector("#sa-plain-textarea");
    textarea.value = content;

    const copyBtn = dialog.querySelector("#sa-plain-copy-btn");
    const dlBtn = dialog.querySelector("#sa-plain-download-btn");

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(textarea.value);
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = "Copy to Clipboard"), 1600);
    };

    dlBtn.onclick = () => {
      const blob = new Blob([textarea.value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scratch_project_context.txt";
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  function editActiveSpriteAsText() {
    const ws = ScratchBlocks.getMainWorkspace();
    if (!ws) return;

    const md = BlockDecompiler.decompileAllWorkspaceScripts(vm?.editingTarget);
    const spriteName = vm?.editingTarget ? vm.editingTarget.getName() : "Sprite";

    showAceEditorModal(`Edit Sprite as Text: ${spriteName}`, md, true, (newText) => {
      if (!newText.trim()) return;
      const topBlocks = ws.getTopBlocks(true);
      for (const b of topBlocks) {
        b.dispose(true);
      }
      ScratchBlocksParser.importMarkdownToWorkspace(newText, 100, 100);
    });
  }

  function exportFullProjectContextText() {
    if (!vm) return;

    const stage = vm.runtime.getTargetForStage();
    const globalVars = stage ? Object.values(stage.variables || {}).filter((v) => v.type === "").map((v) => v.name).join(", ") || "None" : "None";
    const globalLists = stage ? Object.values(stage.variables || {}).filter((v) => v.type === "list").map((v) => v.name).join(", ") || "None" : "None";
    const broadcasts = stage ? Object.values(stage.variables || {}).filter((v) => v.type === "broadcast_msg").map((v) => v.name).join(", ") || "None" : "None";

    let text = `# Project Context\n\n`;
    text += `## Global Project State\n`;
    text += `- Global Variables: ${globalVars}\n`;
    text += `- Global Lists: ${globalLists}\n`;
    text += `- Broadcast Messages: ${broadcasts}\n\n`;
    text += `---\n\n`;

    const targets = vm.runtime.targets || [];
    for (const target of targets) {
      const name = target.getName();
      const costumes = (target.getCostumes ? target.getCostumes() : []).map((c) => c.name).filter(Boolean).join(", ") || "None";
      const sounds = (target.getSounds ? target.getSounds() : []).map((s) => s.name).filter(Boolean).join(", ") || "None";
      const localVars = Object.values(target.variables || {}).filter((v) => v.type === "").map((v) => v.name).join(", ") || "None";
      const localLists = Object.values(target.variables || {}).filter((v) => v.type === "list").map((v) => v.name).join(", ") || "None";

      let scripts = "";
      if (target === vm.editingTarget) {
        scripts = BlockDecompiler.decompileAllWorkspaceScripts(target);
      } else {
        scripts = VmBlockDecompiler.decompileAllTargetScripts(target);
      }

      text += `## ${target.isStage ? "Stage" : `Sprite: ${name}`}\n`;
      text += `### Properties\n`;
      text += `- Name: ${name}\n`;
      text += `- Is Stage: ${target.isStage}\n`;
      if (!target.isStage) {
        text += `- Position: (x: ${target.x}, y: ${target.y})\n`;
        text += `- Direction: ${target.direction}\n`;
        text += `- Size: ${target.size}%\n`;
      }
      text += `- Costumes: ${costumes}\n`;
      text += `- Sounds: ${sounds}\n`;
      text += `- Local Variables: ${localVars}\n`;
      text += `- Local Lists: ${localLists}\n\n`;
      text += `### Scripts\n\n`;
      text += (scripts ? "```scratch\n" + scripts + "\n```" : "No scripts") + "\n\n";
      text += `---\n\n`;
    }

    const blocksRef = ScratchBlocksExporter.generateAllBlocksMarkdown();
    text += blocksRef;

    showPlainTextViewerModal("Project Text Context", text);
  }

  function editBlockStackAsText(block) {
    if (!block) return;
    const root = block.getRootBlock();
    const text = BlockDecompiler.decompileStack(root, "", vm?.editingTarget);
    const xy = root.getRelativeToSurfaceXY();

    showAceEditorModal("Edit Stack as Text", text, true, (newText) => {
      if (!newText.trim()) return;
      root.dispose(true);
      ScratchBlocksParser.importMarkdownToWorkspace(newText, xy.x, xy.y);
    });
  }

  const origWorkspaceShowContextMenu = ScratchBlocks.WorkspaceSvg.prototype.showContextMenu_;
  ScratchBlocks.WorkspaceSvg.prototype.showContextMenu_ = function (e) {
    if (this.options.readOnly || this.isFlyout) {
      return origWorkspaceShowContextMenu.call(this, e);
    }

    const origShow = ScratchBlocks.ContextMenu.show;
    ScratchBlocks.ContextMenu.show = function (event, menuOptions, rtl) {
      ScratchBlocks.ContextMenu.show = origShow;
      if (Array.isArray(menuOptions)) {
        menuOptions.unshift(
          {
            text: "Edit Sprite as Text",
            enabled: true,
            callback: () => editActiveSpriteAsText()
          },
          {
            text: "Export Project Context",
            enabled: true,
            callback: () => exportFullProjectContextText()
          }
        );
      }
      return origShow.call(this, event, menuOptions, rtl);
    };

    try {
      origWorkspaceShowContextMenu.call(this, e);
    } finally {
      ScratchBlocks.ContextMenu.show = origShow;
    }
  };

  const origBlockShowContextMenu = ScratchBlocks.BlockSvg.prototype.showContextMenu_;
  ScratchBlocks.BlockSvg.prototype.showContextMenu_ = function (e) {
    if (this.workspace.options.readOnly) {
      return origBlockShowContextMenu.call(this, e);
    }

    const self = this;
    const origShow = ScratchBlocks.ContextMenu.show;
    ScratchBlocks.ContextMenu.show = function (event, menuOptions, rtl) {
      ScratchBlocks.ContextMenu.show = origShow;
      if (Array.isArray(menuOptions)) {
        menuOptions.unshift({
          text: "Edit as Text",
          enabled: true,
          callback: () => editBlockStackAsText(self)
        });
      }
      return origShow.call(this, event, menuOptions, rtl);
    };

    try {
      origBlockShowContextMenu.call(this, e);
    } finally {
      ScratchBlocks.ContextMenu.show = origShow;
    }
  };

  window.addEventListener("paste", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    const clipData = e.clipboardData?.getData("text");
    if (!clipData) return;

    const clean = clipData.trim();
    if (
      clean.startsWith("when") ||
      clean.startsWith("define") ||
      clean.startsWith("<xml") ||
      clean.startsWith("set [") ||
      clean.startsWith("set pen") ||
      clean.startsWith("erase") ||
      clean.startsWith("pen") ||
      clean.startsWith("delete ") ||
      clean.startsWith("add ") ||
      clean.startsWith("go to") ||
      clean.includes("```scratch") ||
      clean.includes("[scratchblocks]") ||
      clean.includes("forever") ||
      clean.includes("repeat ")
    ) {
      e.preventDefault();
      ScratchBlocksParser.importMarkdownToWorkspace(clean);
    }
  });

  const cycleState = { lastKey: null, index: 0, list: [] };

  async function jumpToBlock(targetId, blockId) {
    if (vm && targetId && vm.editingTarget && vm.editingTarget.id !== targetId) {
      vm.setEditingTarget(targetId);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    const ws = ScratchBlocks.getMainWorkspace();
    if (!ws) return;
    const block = ws.getBlockById(blockId);
    if (!block) return;

    const metrics = ws.getMetrics ? ws.getMetrics() : null;
    const xy = block.getRelativeToSurfaceXY();
    const scale = ws.scale || 1;

    if (metrics) {
      const targetX = -xy.x * scale + metrics.viewWidth / 2 - (block.width * scale) / 2;
      const targetY = -xy.y * scale + metrics.viewHeight / 2 - (block.height * scale) / 2;
      ws.scroll(targetX, targetY);
    }

    if (block.select) block.select();
    if (ws.glowBlock) {
      ws.glowBlock(block.id, true);
      setTimeout(() => {
        try { ws.glowBlock(block.id, false); } catch (_) {}
      }, 800);
    }
  }

  function findProcedureInstances(procCode) {
    const ws = ScratchBlocks.getMainWorkspace();
    const currentTargetId = vm?.editingTarget?.id;
    let defs = [], calls = [];
    for (const block of ws.getAllBlocks()) {
      if (block.type === "procedures_definition") {
        const label = block.getChildren()[0];
        if (label?.getProcCode?.() === procCode) {
          defs.push({ targetId: currentTargetId, blockId: block.id });
        }
      } else if (block.type === "procedures_call") {
        if (block.getProcCode?.() === procCode) {
          calls.push({ targetId: currentTargetId, blockId: block.id });
        }
      }
    }
    return [...defs, ...calls];
  }

  function findVariableInstances(varId) {
    const ws = ScratchBlocks.getMainWorkspace();
    const currentTargetId = vm?.editingTarget?.id;
    const uses = [];
    for (const block of ws.getAllBlocks()) {
      const varModels = block.getVarModels?.() || [];
      for (const v of varModels) {
        if (v.getId() === varId) {
          uses.push({ targetId: currentTargetId, blockId: block.id });
          break;
        }
      }
    }
    return uses;
  }

  function findBroadcastInstances(broadcastName) {
    const uses = [];
    const targets = vm?.runtime?.targets || [];
    for (const target of targets) {
      if (!target.isOriginal) continue;
      const blocks = target.blocks?._blocks;
      if (!blocks) continue;
      for (const id of Object.keys(blocks)) {
        const b = blocks[id];
        if (b.opcode === "event_whenbroadcastreceived" && b.fields?.BROADCAST_OPTION?.value === broadcastName) {
          uses.push({ targetId: target.id, blockId: id });
        } else if (b.opcode === "event_broadcast" || b.opcode === "event_broadcastandwait") {
          const menuId = b.inputs?.BROADCAST_INPUT?.block;
          if (blocks[menuId]?.fields?.BROADCAST_OPTION?.value === broadcastName) {
            uses.push({ targetId: target.id, blockId: id });
          }
        }
      }
    }
    return uses;
  }

  function cycleThroughMatches(key, matches, clickedBlockId) {
    if (!matches || matches.length === 0) return;
    if (cycleState.lastKey !== key) {
      cycleState.lastKey = key;
      cycleState.list = matches;
      const clickedIdx = matches.findIndex((m) => m.blockId === clickedBlockId);
      cycleState.index = clickedIdx !== -1 ? (clickedIdx + 1) % matches.length : 0;
    } else {
      cycleState.index = (cycleState.index + 1) % cycleState.list.length;
    }
    const current = cycleState.list[cycleState.index];
    jumpToBlock(current.targetId, current.blockId);
  }

  const originalDoBlockClick = ScratchBlocks.Gesture.prototype.doBlockClick_;
  ScratchBlocks.Gesture.prototype.doBlockClick_ = function () {
    const event = this.mostRecentEvent_;
    const isMiddleClick = event && event.button === 1;
    const isShiftClick = event && event.shiftKey && event.button === 0;

    if (isMiddleClick || isShiftClick) {
      let block = this.startBlock_;
      for (; block; block = block.getParent ? block.getParent() : block.getSurroundParent()) {
        if (block.type === "procedures_definition" || block.type === "procedures_call") {
          let procCode = block.type === "procedures_definition" ? block.getChildren()[0]?.getProcCode?.() : block.getProcCode?.();
          if (procCode) {
            cycleThroughMatches("proc:" + procCode, findProcedureInstances(procCode), block.id);
            return;
          }
        }
        if (block.type?.startsWith("data_") || (block.getVarModels && block.getVarModels().length > 0)) {
          const varModels = block.getVarModels ? block.getVarModels() : [];
          const varId = varModels[0]?.getId() || (block.getVars ? block.getVars()[0] : null);
          if (varId) {
            cycleThroughMatches("var:" + varId, findVariableInstances(varId), block.id);
            return;
          }
        }
        if (block.type === "event_whenbroadcastreceived" || block.type === "event_broadcast" || block.type === "event_broadcastandwait") {
          let broadcastName = block.type === "event_whenbroadcastreceived"
            ? block.getField("BROADCAST_OPTION")?.getText()
            : block.getChildren().find((c) => c.type === "event_broadcast_menu")?.getField("BROADCAST_OPTION")?.getText();
          if (broadcastName) {
            cycleThroughMatches("broadcast:" + broadcastName, findBroadcastInstances(broadcastName), block.id);
            return;
          }
        }
      }
    }
    originalDoBlockClick.call(this);
  };

  console.info("Workspace and block context menus initialized.");
})();
