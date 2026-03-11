// A modified version of sharkpools-extensions.vercel.app/#:~:text=Pen%20Papers
// Adds: Single value effects, Image to image effects

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("Layers Plus must run unsandboxed!");

  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const render = vm.renderer;
  const isEditor = typeof scaffolding === "undefined";
  const papers = Object.create(null);

  if (!vm.extensionManager.isExtensionLoaded("pen")) runtime.extensionManager.loadExtensionIdSync("pen");

  const penExt = runtime.ext_pen;
  const defaultSkinID = penExt._getPenLayerID();
  papers["default"] = { skin: defaultSkinID, drawable: penExt._penDrawableId };

  const ogUpdateRenderQuality = render._updateRenderQuality;
  render._updateRenderQuality = function(...args) {
    ogUpdateRenderQuality.call(this, ...args);

    const quality = this.useHighQualityRender ? this.canvas.width / this._nativeSize[0] : 1;
    const papersArray = Object.values(papers);
    for (const paper of papersArray) {
      const skin = render._allSkins[paper.skin];
      if (skin && skin.setRenderQuality) skin.setRenderQuality(quality);
    }
  }

  class P7PLP {
    getInfo() {
      return {
        name: "Layers Plus",
        id: "P7PLP",
        blocks:[
          {
            opcode: "createPaper",
            blockType: Scratch.BlockType.COMMAND,
            text: "create new layer named [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "my-layer" }
            },
          },
          {
            opcode: "removePaper",
            blockType: Scratch.BlockType.COMMAND,
            text: "remove layer named [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          },
          {
            opcode: "eraseAllPapers",
            blockType: Scratch.BlockType.COMMAND,
            text: "erase all layers"
          },
          {
            opcode: "paperExists",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "layer [NAME] exists?",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "my-layer" }
            },
          },
          {
            opcode: "allPapers",
            blockType: Scratch.BlockType.REPORTER,
            text: "all layers"
          },
          "---",
          {
            opcode: "switchPaper",
            blockType: Scratch.BlockType.COMMAND,
            text: "switch layer to [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          },
          {
            opcode: "currentPaper",
            blockType: Scratch.BlockType.REPORTER,
            text: "current layer"
          },
          "---",
          {
            opcode: "paperDrawing",
            blockType: Scratch.BlockType.REPORTER,
            text: "data.uri of layer [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          },
          {
            opcode: "paperVisibility",
            blockType: Scratch.BlockType.COMMAND,
            text: "[TYPE] layer [NAME]",
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "VISIBILITY" },
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          },
          {
            opcode: "paperVisibe",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "is layer [NAME] showing?",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          },
          {
            opcode: "touchingPaper",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "is [TARGET] touching layer [NAME] ?",
            arguments: {
              TARGET: { type: Scratch.ArgumentType.STRING, menu: "TARGETS" },
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          },
          {
            opcode: "touchingPaperPoint",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "is layer [NAME] touching x [X] y[Y] ?",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" },
              X: { type: Scratch.ArgumentType.NUMBER },
              Y: { type: Scratch.ArgumentType.NUMBER }
            },
          },
          "---",
          {
            opcode: "applyEffect",
            blockType: Scratch.BlockType.COMMAND,
            text: "Apply [EFFECT] to [NAME] with value [VAL]",
            arguments: {
              EFFECT: { type: Scratch.ArgumentType.STRING, menu: "EFFECTS" },
              NAME: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" },
              VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            },
          },
          {
            opcode: "applyMultiEffect",
            blockType: Scratch.BlockType.COMMAND,
            text: "Apply[MULTIEFFECT] from [LAYER1] to [LAYER2]",
            arguments: {
              MULTIEFFECT: { type: Scratch.ArgumentType.STRING, menu: "MULTIEFFECTS" },
              LAYER1: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" },
              LAYER2: { type: Scratch.ArgumentType.STRING, menu: "PAPERS" }
            },
          }
        ],
        menus: {
          TARGETS: { acceptReporters: true, items: "getTargets" },
          PAPERS: { acceptReporters: true, items: "getPapers" },
          VISIBILITY:["show", "hide"],
          EFFECTS:["ghost", "invert", "blur", "brightness", "hue", "contrast", "greyscale", "saturation", "sepia", "pixelate", "twirl", "pinch"],
          MULTIEFFECTS:["push", "mask", "invert", "greyscale", "difference", "threshold"]
        },
      };
    }

    getPapers() {
      const keys = Object.keys(papers);
      return keys.length > 0 ? keys : ["default"];
    }

    getTarget(name, util) {
      if (name === "_myself_") return util.target;
      if (name === "_stage_") return runtime.getTargetForStage();
      return runtime.getSpriteTargetByName(name);
    }

    getTargets() {
      const spriteNames =[{ text: "myself", value: "_myself_" }, { text: "Stage", value: "_stage_" }];
      const targets = runtime.targets;
      for (let i = 1; i < targets.length; i++) {
        const target = targets[i];
        const name = target.getName();
        if (target.isOriginal) spriteNames.push({ text: name, value: name });
      }
      return spriteNames.length > 0 ? spriteNames : [""];
    }

    async _writeImageDataToPaper(paperName, imageData) {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext("2d");
        ctx.putImageData(imageData, 0, 0);

        const img = new Image();
        img.onload = () => {
          const quality = render.useHighQualityRender ? (render.canvas.width / render._nativeSize[0]) : 1;
          const skinId = render.createBitmapSkin(img, quality);
          
          const tempDrawableId = render.createDrawable("sprite");
          render.updateDrawableSkinId(tempDrawableId, skinId);
          render.updateDrawablePosition(tempDrawableId, [0, 0]);

          const paper = papers[paperName];
          if (paper) {
            render.penClear(paper.skin);
            render.penStamp(paper.skin, tempDrawableId);
            runtime.requestRedraw();
          }

          render.destroyDrawable(tempDrawableId, "sprite");
          render.destroySkin(skinId);
          resolve();
        };
        img.src = canvas.toDataURL("image/png");
      });
    }

    createPaper(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] === undefined) {
        const drawable = render.createDrawable("pen");
        const skin = render.createPenSkin();
        if (render.useHighQualityRender) {
          render._allSkins[skin].setRenderQuality(render.canvas.width / render._nativeSize[0]);
        }

        papers[name] = { skin, drawable };
        render.updateDrawableSkinId(drawable, skin);
        render._allDrawables[drawable].customDrawableName = "Layer: " + name;
        render._allDrawables[drawable].interactive = false;
        if (isEditor) runtime.once("BEFORE_EXECUTE", () => runtime.requestBlocksUpdate());
      }
    }

    removePaper(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (Object.keys(papers).length === 1) return;
      if (papers[name] !== undefined) {
        render.destroySkin(papers[name].skin);
        render.destroyDrawable(papers[name].drawable, "pen");
        delete papers[name];
        this.switchPaper({ NAME: Object.keys(papers)[0] });
        if (isEditor) runtime.once("BEFORE_EXECUTE", () => runtime.requestBlocksUpdate());
      }
    }

    eraseAllPapers() {
      const papersArray = Object.values(papers);
      for (const paper of papersArray) {
        render.penClear(paper.skin);
      }
      runtime.requestRedraw();
    }

    paperExists(args) {
      const name = Scratch.Cast.toString(args.NAME);
      return papers[name] !== undefined;
    }

    allPapers() {
      return JSON.stringify(Object.keys(papers));
    }

    switchPaper(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] !== undefined) penExt._penSkinId = papers[name].skin;
    }

    currentPaper() {
      const allPapers = Object.entries(papers);
      for (let i = 0; i < allPapers.length; i++) {
        const paper = allPapers[i];
        if (paper[1].skin === penExt._penSkinId) return paper[0];
      }
      return "";
    }

    paperDrawing(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] === undefined) return "";

      const imageData = render.extractDrawableScreenSpace(papers[name].drawable).imageData;
      var canvas = document.createElement("canvas");
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      canvas.getContext("2d").putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }

    paperVisibility(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] !== undefined) {
        const drawable = render._allDrawables[papers[name].drawable];
        drawable.updateVisible(args.TYPE === "show");
      }
    }

    paperVisibe(args) {
      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] !== undefined) {
        const drawable = render._allDrawables[papers[name].drawable];
        return drawable._visible;
      }
      return false;
    }

    touchingPaper(args, util) {
      const target = this.getTarget(args.TARGET, util);
      if (!target) return false;

      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] !== undefined) return render.isTouchingDrawables(target.drawableID, [papers[name].drawable]);
      return false;
    }

    touchingPaperPoint(args, util) {
      const name = Scratch.Cast.toString(args.NAME);
      if (papers[name] !== undefined) {
        const drawable = render._allDrawables[papers[name].drawable];
        drawable.updateCPURenderAttributes();
        return drawable.isTouching([
          Scratch.Cast.toNumber(args.X),
          Scratch.Cast.toNumber(args.Y)
        ]);
      }
      return false;
    }

    async applyEffect(args) {
      const name = Scratch.Cast.toString(args.NAME);
      const effect = Scratch.Cast.toString(args.EFFECT);
      const val = Scratch.Cast.toNumber(args.VAL);

      if (!papers[name]) return;

      const extracted = render.extractDrawableScreenSpace(papers[name].drawable);
      const imageData = extracted.imageData;
      const width = imageData.width;
      const height = imageData.height;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      let filterString = "";
      switch (effect) {
        case "blur": filterString = `blur(${val}px)`; break;
        case "brightness": filterString = `brightness(${100 + val}%)`; break;
        case "contrast": filterString = `contrast(${100 + val}%)`; break;
        case "greyscale": filterString = `grayscale(${val}%)`; break;
        case "hue": filterString = `hue-rotate(${val * 3.6}deg)`; break;
        case "invert": filterString = `invert(${val}%)`; break;
        case "saturation": filterString = `saturate(${100 + val}%)`; break;
        case "sepia": filterString = `sepia(${val}%)`; break;
        case "ghost": ctx.globalAlpha = 1 - (val / 100); break;
      }

      if (filterString !== "" || effect === "ghost") {
        ctx.putImageData(imageData, 0, 0);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.filter = filterString;
        if (effect === "ghost") tempCtx.globalAlpha = 1 - (val / 100);
        tempCtx.drawImage(canvas, 0, 0);
        await this._writeImageDataToPaper(name, tempCtx.getImageData(0, 0, width, height));
        return;
      }

      const data = imageData.data;
      const newData = new Uint8ClampedArray(data.length);
      
      const cx = width / 2;
      const cy = height / 2;
      const effectRadius = Math.max(cx, cy);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          
          if (effect === "pixelate") {
            const size = Math.max(1, Math.floor(val));
            const px = Math.floor(x / size) * size;
            const py = Math.floor(y / size) * size;
            const pi = (py * width + px) * 4;
            newData[i] = data[pi];
            newData[i+1] = data[pi+1];
            newData[i+2] = data[pi+2];
            newData[i+3] = data[pi+3];
          } else if (effect === "twirl") {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < effectRadius) {
              const angle = (val * Math.PI) / 180;
              const a = Math.atan2(dy, dx) + (angle * (effectRadius - dist) / effectRadius);
              let srcX = Math.round(cx + dist * Math.cos(a));
              let srcY = Math.round(cy + dist * Math.sin(a));
              
              srcX = Math.max(0, Math.min(width - 1, srcX));
              srcY = Math.max(0, Math.min(height - 1, srcY));
              
              const pi = (srcY * width + srcX) * 4;
              newData[i] = data[pi];
              newData[i+1] = data[pi+1];
              newData[i+2] = data[pi+2];
              newData[i+3] = data[pi+3];
            } else {
              newData[i] = data[i];
              newData[i+1] = data[i+1];
              newData[i+2] = data[i+2];
              newData[i+3] = data[i+3];
            }
          } else if (effect === "pinch") {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < effectRadius && dist > 0) {
              const amount = Math.max(-100, Math.min(100, val)) / 100;
              const percent = dist / effectRadius;
              const newPercent = amount > 0 ? Math.pow(percent, 1 + amount) : Math.pow(percent, 1 / (1 - amount));
              const newDist = newPercent * effectRadius;
              
              let srcX = Math.round(cx + (dx / dist) * newDist);
              let srcY = Math.round(cy + (dy / dist) * newDist);
              
              srcX = Math.max(0, Math.min(width - 1, srcX));
              srcY = Math.max(0, Math.min(height - 1, srcY));
              
              const pi = (srcY * width + srcX) * 4;
              newData[i] = data[pi];
              newData[i+1] = data[pi+1];
              newData[i+2] = data[pi+2];
              newData[i+3] = data[pi+3];
            } else {
              newData[i] = data[i];
              newData[i+1] = data[i+1];
              newData[i+2] = data[i+2];
              newData[i+3] = data[i+3];
            }
          } else {
            newData[i] = data[i];
            newData[i+1] = data[i+1];
            newData[i+2] = data[i+2];
            newData[i+3] = data[i+3];
          }
        }
      }

      const newImageData = new ImageData(newData, width, height);
      await this._writeImageDataToPaper(name, newImageData);
    }

    async applyMultiEffect(args) {
      const effect = Scratch.Cast.toString(args.MULTIEFFECT);
      const layer1Name = Scratch.Cast.toString(args.LAYER1);
      const layer2Name = Scratch.Cast.toString(args.LAYER2);

      if (!papers[layer1Name] || !papers[layer2Name]) return;

      const imgData1 = render.extractDrawableScreenSpace(papers[layer1Name].drawable).imageData;
      const imgData2 = render.extractDrawableScreenSpace(papers[layer2Name].drawable).imageData;

      const width = imgData2.width;
      const height = imgData2.height;
      const data1 = imgData1.data;
      const data2 = imgData2.data;
      const newData = new Uint8ClampedArray(data2.length);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const a1 = data1[i + 3];
          const a2 = data2[i + 3];

          const alphaInf = a1 / 255;

          if (effect === "push") {
            const r1 = data1[i];
            const g1 = data1[i + 1];
            
            const offsetY = ((r1 / 255) - 0.5) * 2 * height * alphaInf;
            const offsetX = ((g1 / 255) - 0.5) * 2 * width * alphaInf;

            let srcX = Math.round(x - offsetX);
            let srcY = Math.round(y - offsetY);
            
            srcX = Math.max(0, Math.min(width - 1, srcX));
            srcY = Math.max(0, Math.min(height - 1, srcY));

            const srcI = (srcY * width + srcX) * 4;
            newData[i] = data2[srcI];
            newData[i+1] = data2[srcI+1];
            newData[i+2] = data2[srcI+2];
            newData[i+3] = data2[srcI+3];
            
          } else {
            const b1 = (data1[i] * 0.299 + data1[i+1] * 0.587 + data1[i+2] * 0.114) / 255;

            if (effect === "mask") {
              newData[i] = data2[i];
              newData[i+1] = data2[i+1];
              newData[i+2] = data2[i+2];
              newData[i+3] = a2 * (1 - alphaInf) + (a2 * b1) * alphaInf;

            } else if (effect === "difference") {
              const diffR = Math.abs(data2[i] - data1[i]);
              const diffG = Math.abs(data2[i+1] - data1[i+1]);
              const diffB = Math.abs(data2[i+2] - data1[i+2]);

              newData[i] = data2[i] * (1 - alphaInf) + diffR * alphaInf;
              newData[i+1] = data2[i+1] * (1 - alphaInf) + diffG * alphaInf;
              newData[i+2] = data2[i+2] * (1 - alphaInf) + diffB * alphaInf;
              newData[i+3] = a2;

            } else if (effect === "invert") {
              const invR = Math.abs(data2[i] - (255 * b1));
              const invG = Math.abs(data2[i+1] - (255 * b1));
              const invB = Math.abs(data2[i+2] - (255 * b1));

              newData[i] = data2[i] * (1 - alphaInf) + invR * alphaInf;
              newData[i+1] = data2[i+1] * (1 - alphaInf) + invG * alphaInf;
              newData[i+2] = data2[i+2] * (1 - alphaInf) + invB * alphaInf;
              newData[i+3] = a2;

            } else if (effect === "greyscale") {
              const b2 = (data2[i] * 0.299 + data2[i+1] * 0.587 + data2[i+2] * 0.114);
              const effectAmount = b1 * alphaInf;

              newData[i] = data2[i] * (1 - effectAmount) + b2 * effectAmount;
              newData[i+1] = data2[i+1] * (1 - effectAmount) + b2 * effectAmount;
              newData[i+2] = data2[i+2] * (1 - effectAmount) + b2 * effectAmount;
              newData[i+3] = a2;

            } else if (effect === "threshold") {
              const b2Norm = (data2[i] * 0.299 + data2[i+1] * 0.587 + data2[i+2] * 0.114) / 255;
              
              newData[i] = data2[i];
              newData[i+1] = data2[i+1];
              newData[i+2] = data2[i+2];
              if (b2Norm < b1) {
                newData[i+3] = a2 * (1 - alphaInf);
              } else {
                newData[i+3] = a2;
              }

            } else {
              newData[i] = data2[i];
              newData[i+1] = data2[i+1];
              newData[i+2] = data2[i+2];
              newData[i+3] = a2;
            }
          }
        }
      }

      await this._writeImageDataToPaper(layer2Name, new ImageData(newData, width, height));
    }
  }

  Scratch.extensions.register(new P7PLP());
})(Scratch);
