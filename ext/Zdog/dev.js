// Zdog Scratch extension

(function(Scratch) {

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    class Zdoggy {
        constructor() {
            this.world = {};
            this.renders = {
                svg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                canvas: document.createElement('canvas')
            };
            this.illo = new Zdog.Illustration({
                element: this.renders.canvas,
            });
        }

        getInfo() {
            return {
                id: 'P7Zdog',
                name: 'Zdog',
                color1: '#eeaa00',
                color2: '#ee6622',
                blocks: [
                    {
                        opcode: 'getRender',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get render using width [WIDTH] and height [HEIGHT]',
                        arguments: {
                            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'RENDER_TYPE', defaultValue: 'svg' },
                            WIDTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: '100' },
                            HEIGHT: { type: Scratch.ArgumentType.NUMBER, defaultValue: '100' }
                        }
                    },
                    {
                        opcode: 'onBeforeRender',
                        blockType: Scratch.BlockType.EVENT,
                        text: 'On before render',
                        arguments: {}
                    },

                    "---",

                    {
                        opcode: 'newWorld',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'New world',
                        arguments: {}
                    },
                    {
                        opcode: 'setWorldRotation',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Rotate world to [ROT]',
                        arguments: {
                            ROT: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'setCameraZoom',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set world zoom to [ZOOM]',
                        arguments: {
                            ZOOM: { type: Scratch.ArgumentType.NUMBER, defaultValue: '1' }
                        }
                    },

                    "---",

                    {
                        opcode: 'removeShape',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove shape [NAME]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' }
                        }
                    },
                    {
                        opcode: 'scaleShape',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Scale shape [NAME] to [SIZE]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' },
                            SIZE: { type: Scratch.ArgumentType.STRING, defaultValue: '1, 1, 1' }
                        }
                    },
                    {
                        opcode: 'moveShape',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Move shape [NAME] to [POS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' },
                            POS: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'rotateShape',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Rotate shape [NAME] to [ROTATION]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' },
                            ROTATION: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'copyShape',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Copy shape [NAME]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' }
                        }
                    },
                    {
                        opcode: 'copyShapes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Copy shape with children [NAME]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' }
                        }
                    },
                    {
                        opcode: 'setProps',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set props of [NAME] to [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'width: "120", height: "80", stroke: "20", color: "#E62"' }
                        }
                    },
                    {
                        opcode: 'setProp',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set [PROP] of [NAME] to [VALUE]',
                        arguments: {
                            PROP: { type: Scratch.ArgumentType.STRING, menu: 'PROP_MENU', defaultValue: 'width' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' },
                            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: '0' }
                        }
                    },
                    {
                        opcode: 'getShapeProp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get [PROP] from [NAME]',
                        arguments: {
                            PROP: { type: Scratch.ArgumentType.STRING, menu: 'PROP_MENU', defaultValue: 'width' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' }
                        }
                    },
                    {
                        opcode: 'getShapes',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get shapes',
                        arguments: {}
                    },

                    "---",

                    {
                        opcode: 'createGroup',
                        blockType: Scratch.BlockType.CONDITIONAL,
                        text: 'Create group [NAME]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'group1' }
                        }
                    },
                    {
                        opcode: 'createAnchor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create anchor [NAME] at position [POS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'anchor1' },
                            POS: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },

                    {
                        opcode: 'createRectangle',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create rectangle [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'rect1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'width: "120", height: "80", stroke: "20", color: "#E62"' }
                        }
                    },
                    {
                        opcode: 'createRoundedRectangle',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create rounded rectangle [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'rounded1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'width: "120", height: "80", cornerRadius: "30", stroke: "20", color: "#EA0"' }
                        }
                    },
                    {
                        opcode: 'createEllipse',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create ellipse [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'ellipse1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'diameter: "80", stroke: "20", color: "#C25"' }
                        }
                    },
                    {
                        opcode: 'createPolygon',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create polygon [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'polygon1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'radius: "60", sides: "5", stroke: "20", color: "#EA0"' }
                        }
                    },
                    {
                        opcode: 'createHemisphere',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create hemisphere [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'hemisphere1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'diameter: "120", stroke: "false", color: "#C25", backface: "#EA0"' }
                        }
                    },
                    {
                        opcode: 'createCone',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create cone [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'cone1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'diameter: "70", length: "90", stroke: "false", color: "#636", backface: "#C25"' }
                        }
                    },
                    {
                        opcode: 'createCylinder',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create cylinder [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'cylinder1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'diameter: "80", length: "120", stroke: "false", color: "#C25", backface: "#E62"' }
                        }
                    },
                    {
                        opcode: 'createBox',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Create box [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'box1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'width: "120", height: "100", depth: "80", stroke: "false", color: "#C25", leftFace: "#EA0", rightFace: "#E62", topFace: "#ED0", bottomFace: "#636"' }
                        }
                    },
                    {
                        opcode: 'createShape',
                        blockType: Scratch.BlockType.CONDITIONAL,
                        text: 'Create shape [NAME] with props [PROPS]',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'shape1' },
                            PROPS: { type: Scratch.ArgumentType.STRING, defaultValue: 'key: "val", key2: 4, key3: true' }
                        }
                    },

                    "---",

                    {
                        opcode: 'pathMoveTo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Move pointer to [POS]',
                        arguments: {
                            POS: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'pathLineTo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Draw line to [POS]',
                        arguments: {
                            POS: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'pathArcTo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Draw arc [BEND] to [POS]',
                        arguments: {
                            BEND: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            POS: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'pathBezierTo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Draw bezier [START] [CONTROL] to [POS]',
                        arguments: {
                            START: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            CONTROL: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            POS: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'pathClose',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Close path',
                        arguments: {}
                    },

                    "---",

                    {
                        opcode: 'expandProps',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Expend props [PROPS1] by [PROPS2]',
                        arguments: {
                            PROPS1: { type: Scratch.ArgumentType.STRING, defaultValue: 'key: "val", key2: 4, key3: true' },
                            PROPS2: { type: Scratch.ArgumentType.STRING, defaultValue: 'key: "val", key2: 4, key3: true' }
                        }
                    },
                    {
                        opcode: 'createVector3',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Create vector3 X:[X] Y:[Y] Z:[Z]',
                        arguments: {
                            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
                            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' },
                            Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }
                        }
                    },
                    {
                        opcode: 'getVectorProp',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get [VECTOR_PROP] from vector3 [VECTOR3]',
                        arguments: {
                            VECTOR_PROP: { type: Scratch.ArgumentType.STRING, menu: 'VECTOR_PROP_MENU', defaultValue: 'x' },
                            VECTOR3: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'addVector',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Add vector [VECTOR]',
                        arguments: {
                            VECTOR: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'subtractVector',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Subtract vector [VECTOR]',
                        arguments: {
                            VECTOR: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'multiplyVector',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Multiply vector [VECTOR]',
                        arguments: {
                            VECTOR: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'rotateVector',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Rotate vector [VECTOR1] by [VECTOR2]',
                        arguments: {
                            VECTOR1: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            VECTOR2: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'getMagnitude',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get magnitude of vectors [VECTOR1] and [VECTOR2]',
                        arguments: {
                            VECTOR1: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            VECTOR2: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    },
                    {
                        opcode: 'lerpVector',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Lerp vector [VECTOR1] to [VECTOR2] by [VALUE]',
                        arguments: {
                            VECTOR1: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            VECTOR2: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: '0.5' }
                        }
                    },
                    {
                        opcode: 'modVector',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Mod [VECTOR1] by [VECTOR2]',
                        arguments: {
                            VECTOR1: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' },
                            VECTOR2: { type: Scratch.ArgumentType.STRING, defaultValue: '0, 0, 0' }
                        }
                    }
                ],
                menus: {
                    RENDER_TYPE: ['png', 'svg'],
                    PROP_MENU: ['addTo', 'width', 'height', 'depth', 'radius', 'sides', 'diameter', 'length', 'stroke', 'color', 'leftFace', 'rightFace', 'topFace', 'bottomFace', 'cornerRadius', 'backface'],
                    VECTOR_PROP_MENU: ['x', 'y', 'z']
                }
            };
        }

        getRender({ TYPE, WIDTH, HEIGHT }) {
            this.illo.setSize(WIDTH, HEIGHT);
            this.illo.updateRenderGraph(this.illo);
            this.illo.renderGraph(this.illo);

            return this.renders.canvas.toDataURL(TYPE || "png");
        }

        createRectangle({ NAME, PROPS }) { // 'width: "120", height: "80", stroke: "20", color: "#E62"'
            this.world[NAME] = new Zdog.Rect({
                addTo: this.illo,
                width: 120,
                height: 80,
                stroke: 20,
                color: '#E62',
            });
        }
    }

    /** This extension is using https://zzz.dog */ (function(t,e){if(typeof module=="object"&&module.exports){module.exports=e()}else{t.Zdog=e()}})(this,function t(){var e={};e.TAU=Math.PI*2;e.extend=function(t,e){for(var r in e){t[r]=e[r]}return t};e.lerp=function(t,e,r){return(e-t)*r+t};e.modulo=function(t,e){return(t%e+e)%e};var s={2:function(t){return t*t},3:function(t){return t*t*t},4:function(t){return t*t*t*t},5:function(t){return t*t*t*t*t}};e.easeInOut=function(t,e){if(e==1){return t}t=Math.max(0,Math.min(1,t));var r=t<.5;var i=r?t:1-t;i/=.5;var n=s[e]||s[2];var o=n(i);o/=2;return r?o:1-o};return e});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e()}else{t.Zdog.CanvasRenderer=e()}})(this,function t(){var n={isCanvas:true};n.begin=function(t){t.beginPath()};n.move=function(t,e,r){t.moveTo(r.x,r.y)};n.line=function(t,e,r){t.lineTo(r.x,r.y)};n.bezier=function(t,e,r,i,n){t.bezierCurveTo(r.x,r.y,i.x,i.y,n.x,n.y)};n.closePath=function(t){t.closePath()};n.setPath=function(){};n.renderPath=function(e,r,t,i){this.begin(e,r);t.forEach(function(t){t.render(e,r,n)});if(i){this.closePath(e,r)}};n.stroke=function(t,e,r,i,n){if(!r){return}t.strokeStyle=i;t.lineWidth=n;t.stroke()};n.fill=function(t,e,r,i){if(!r){return}t.fillStyle=i;t.fill()};n.end=function(){};return n});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e()}else{t.Zdog.SvgRenderer=e()}})(this,function t(){var o={isSvg:true};var e=o.round=function(t){return Math.round(t*1e3)/1e3};function s(t){return e(t.x)+","+e(t.y)+" "}o.begin=function(){};o.move=function(t,e,r){return"M"+s(r)};o.line=function(t,e,r){return"L"+s(r)};o.bezier=function(t,e,r,i,n){return"C"+s(r)+s(i)+s(n)};o.closePath=function(){return"Z"};o.setPath=function(t,e,r){e.setAttribute("d",r)};o.renderPath=function(e,r,t,i){var n="";t.forEach(function(t){n+=t.render(e,r,o)});if(i){n+=this.closePath(e,r)}this.setPath(e,r,n)};o.stroke=function(t,e,r,i,n){if(!r){return}e.setAttribute("stroke",i);e.setAttribute("stroke-width",n)};o.fill=function(t,e,r,i){var n=r?i:"none";e.setAttribute("fill",n)};o.end=function(t,e){t.appendChild(e)};return o});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"))}else{var r=t.Zdog;r.Vector=e(r)}})(this,function t(r){function e(t){this.set(t)}var h=r.TAU;e.prototype.set=function(t){this.x=t&&t.x||0;this.y=t&&t.y||0;this.z=t&&t.z||0;return this};e.prototype.write=function(t){if(!t){return this}this.x=t.x!=undefined?t.x:this.x;this.y=t.y!=undefined?t.y:this.y;this.z=t.z!=undefined?t.z:this.z;return this};e.prototype.rotate=function(t){if(!t){return}this.rotateZ(t.z);this.rotateY(t.y);this.rotateX(t.x);return this};e.prototype.rotateZ=function(t){i(this,t,"x","y")};e.prototype.rotateX=function(t){i(this,t,"y","z")};e.prototype.rotateY=function(t){i(this,t,"x","z")};function i(t,e,r,i){if(!e||e%h===0){return}var n=Math.cos(e);var o=Math.sin(e);var s=t[r];var a=t[i];t[r]=s*n-a*o;t[i]=a*n+s*o}e.prototype.isSame=function(t){if(!t){return false}return this.x===t.x&&this.y===t.y&&this.z===t.z};e.prototype.add=function(t){if(!t){return this}this.x+=t.x||0;this.y+=t.y||0;this.z+=t.z||0;return this};e.prototype.subtract=function(t){if(!t){return this}this.x-=t.x||0;this.y-=t.y||0;this.z-=t.z||0;return this};e.prototype.multiply=function(t){if(t==undefined){return this}if(typeof t=="number"){this.x*=t;this.y*=t;this.z*=t}else{this.x*=t.x!=undefined?t.x:1;this.y*=t.y!=undefined?t.y:1;this.z*=t.z!=undefined?t.z:1}return this};e.prototype.transform=function(t,e,r){this.multiply(r);this.rotate(e);this.add(t);return this};e.prototype.lerp=function(t,e){this.x=r.lerp(this.x,t.x||0,e);this.y=r.lerp(this.y,t.y||0,e);this.z=r.lerp(this.z,t.z||0,e);return this};e.prototype.magnitude=function(){var t=this.x*this.x+this.y*this.y+this.z*this.z;return n(t)};function n(t){if(Math.abs(t-1)<1e-8){return 1}return Math.sqrt(t)}e.prototype.magnitude2d=function(){var t=this.x*this.x+this.y*this.y;return n(t)};e.prototype.copy=function(){return new e(this)};return e});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./vector"),require("./canvas-renderer"),require("./svg-renderer"))}else{var r=t.Zdog;r.Anchor=e(r,r.Vector,r.CanvasRenderer,r.SvgRenderer)}})(this,function t(n,e,r,i){var o=n.TAU;var s={x:1,y:1,z:1};function a(t){this.create(t||{})}a.prototype.create=function(t){this.children=[];n.extend(this,this.constructor.defaults);this.setOptions(t);this.translate=new e(t.translate);this.rotate=new e(t.rotate);this.scale=new e(s).multiply(this.scale);this.origin=new e;this.renderOrigin=new e;if(this.addTo){this.addTo.addChild(this)}};a.defaults={};a.optionKeys=Object.keys(a.defaults).concat(["rotate","translate","scale","addTo"]);a.prototype.setOptions=function(t){var e=this.constructor.optionKeys;for(var r in t){if(e.indexOf(r)!=-1){this[r]=t[r]}}};a.prototype.addChild=function(t){if(this.children.indexOf(t)!=-1){return}t.remove();t.addTo=this;this.children.push(t)};a.prototype.removeChild=function(t){var e=this.children.indexOf(t);if(e!=-1){this.children.splice(e,1)}};a.prototype.remove=function(){if(this.addTo){this.addTo.removeChild(this)}};a.prototype.update=function(){this.reset();this.children.forEach(function(t){t.update()});this.transform(this.translate,this.rotate,this.scale)};a.prototype.reset=function(){this.renderOrigin.set(this.origin)};a.prototype.transform=function(e,r,i){this.renderOrigin.transform(e,r,i);this.children.forEach(function(t){t.transform(e,r,i)})};a.prototype.updateGraph=function(){this.update();this.updateFlatGraph();this.flatGraph.forEach(function(t){t.updateSortValue()});this.flatGraph.sort(a.shapeSorter)};a.shapeSorter=function(t,e){return t.sortValue-e.sortValue};Object.defineProperty(a.prototype,"flatGraph",{get:function(){if(!this._flatGraph){this.updateFlatGraph()}return this._flatGraph},set:function(t){this._flatGraph=t}});a.prototype.updateFlatGraph=function(){this.flatGraph=this.getFlatGraph()};a.prototype.getFlatGraph=function(){var t=[this];return this.addChildFlatGraph(t)};a.prototype.addChildFlatGraph=function(r){this.children.forEach(function(t){var e=t.getFlatGraph();Array.prototype.push.apply(r,e)});return r};a.prototype.updateSortValue=function(){this.sortValue=this.renderOrigin.z};a.prototype.render=function(){};a.prototype.renderGraphCanvas=function(e){if(!e){throw new Error("ctx is "+e+". "+"Canvas context required for render. Check .renderGraphCanvas( ctx ).")}this.flatGraph.forEach(function(t){t.render(e,r)})};a.prototype.renderGraphSvg=function(e){if(!e){throw new Error("svg is "+e+". "+"SVG required for render. Check .renderGraphSvg( svg ).")}this.flatGraph.forEach(function(t){t.render(e,i)})};a.prototype.copy=function(t){var e={};var r=this.constructor.optionKeys;r.forEach(function(t){e[t]=this[t]},this);n.extend(e,t);var i=this.constructor;return new i(e)};a.prototype.copyGraph=function(t){var e=this.copy(t);this.children.forEach(function(t){t.copyGraph({addTo:e})});return e};a.prototype.normalizeRotate=function(){this.rotate.x=n.modulo(this.rotate.x,o);this.rotate.y=n.modulo(this.rotate.y,o);this.rotate.z=n.modulo(this.rotate.z,o)};function h(r){return function(t){function e(t){this.create(t||{})}e.prototype=Object.create(r.prototype);e.prototype.constructor=e;e.defaults=n.extend({},r.defaults);n.extend(e.defaults,t);e.optionKeys=r.optionKeys.slice(0);Object.keys(e.defaults).forEach(function(t){if(!e.optionKeys.indexOf(t)!=1){e.optionKeys.push(t)}});e.subclass=h(e);return e}}a.subclass=h(a);return a});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e()}else{t.Zdog.Dragger=e()}})(this,function t(){var r=typeof window!="undefined";var e="mousedown";var i="mousemove";var n="mouseup";if(r){if(window.PointerEvent){e="pointerdown";i="pointermove";n="pointerup"}else if("ontouchstart"in window){e="touchstart";i="touchmove";n="touchend"}}function o(){}function s(t){this.create(t||{})}s.prototype.create=function(t){this.onDragStart=t.onDragStart||o;this.onDragMove=t.onDragMove||o;this.onDragEnd=t.onDragEnd||o;this.bindDrag(t.startElement)};s.prototype.bindDrag=function(t){t=this.getQueryElement(t);if(!t){return}t.style.touchAction="none";t.addEventListener(e,this)};s.prototype.getQueryElement=function(t){if(typeof t=="string"){t=document.querySelector(t)}return t};s.prototype.handleEvent=function(t){var e=this["on"+t.type];if(e){e.call(this,t)}};s.prototype.onmousedown=s.prototype.onpointerdown=function(t){this.dragStart(t,t)};s.prototype.ontouchstart=function(t){this.dragStart(t,t.changedTouches[0])};s.prototype.dragStart=function(t,e){t.preventDefault();this.dragStartX=e.pageX;this.dragStartY=e.pageY;if(r){window.addEventListener(i,this);window.addEventListener(n,this)}this.onDragStart(e)};s.prototype.ontouchmove=function(t){this.dragMove(t,t.changedTouches[0])};s.prototype.onmousemove=s.prototype.onpointermove=function(t){this.dragMove(t,t)};s.prototype.dragMove=function(t,e){t.preventDefault();var r=e.pageX-this.dragStartX;var i=e.pageY-this.dragStartY;this.onDragMove(e,r,i)};s.prototype.onmouseup=s.prototype.onpointerup=s.prototype.ontouchend=s.prototype.dragEnd=function(){window.removeEventListener(i,this);window.removeEventListener(n,this);this.onDragEnd()};return s});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./anchor"),require("./dragger"))}else{var r=t.Zdog;r.Illustration=e(r,r.Anchor,r.Dragger)}})(this,function t(e,r,a){function i(){}var h=e.TAU;var n=r.subclass({element:undefined,centered:true,zoom:1,dragRotate:false,resize:false,onPrerender:i,onDragStart:i,onDragMove:i,onDragEnd:i,onResize:i});e.extend(n.prototype,a.prototype);n.prototype.create=function(t){r.prototype.create.call(this,t);a.prototype.create.call(this,t);this.setElement(this.element);this.setDragRotate(this.dragRotate);this.setResize(this.resize)};n.prototype.setElement=function(t){t=this.getQueryElement(t);if(!t){throw new Error("Zdog.Illustration element required. Set to "+t)}var e=t.nodeName.toLowerCase();if(e=="canvas"){this.setCanvas(t)}else if(e=="svg"){this.setSvg(t)}};n.prototype.setSize=function(t,e){t=Math.round(t);e=Math.round(e);if(this.isCanvas){this.setSizeCanvas(t,e)}else if(this.isSvg){this.setSizeSvg(t,e)}};n.prototype.setResize=function(t){this.resize=t;if(!this.resizeListener){this.resizeListener=this.onWindowResize.bind(this)}if(t){window.addEventListener("resize",this.resizeListener);this.onWindowResize()}else{window.removeEventListener("resize",this.resizeListener)}};n.prototype.onWindowResize=function(){this.setMeasuredSize();this.onResize(this.width,this.height)};n.prototype.setMeasuredSize=function(){var t,e;var r=this.resize=="fullscreen";if(r){t=window.innerWidth;e=window.innerHeight}else{var i=this.element.getBoundingClientRect();t=i.width;e=i.height}this.setSize(t,e)};n.prototype.renderGraph=function(t){if(this.isCanvas){this.renderGraphCanvas(t)}else if(this.isSvg){this.renderGraphSvg(t)}};n.prototype.updateRenderGraph=function(t){this.updateGraph();this.renderGraph(t)};n.prototype.setCanvas=function(t){this.element=t;this.isCanvas=true;this.ctx=this.element.getContext("2d");this.setSizeCanvas(t.width,t.height)};n.prototype.setSizeCanvas=function(t,e){this.width=t;this.height=e;var r=this.pixelRatio=window.devicePixelRatio||1;this.element.width=this.canvasWidth=t*r;this.element.height=this.canvasHeight=e*r;var i=r>1&&!this.resize;if(i){this.element.style.width=t+"px";this.element.style.height=e+"px"}};n.prototype.renderGraphCanvas=function(t){t=t||this;this.prerenderCanvas();r.prototype.renderGraphCanvas.call(t,this.ctx);this.postrenderCanvas()};n.prototype.prerenderCanvas=function(){var t=this.ctx;t.lineCap="round";t.lineJoin="round";t.clearRect(0,0,this.canvasWidth,this.canvasHeight);t.save();if(this.centered){var e=this.width/2*this.pixelRatio;var r=this.height/2*this.pixelRatio;t.translate(e,r)}var i=this.pixelRatio*this.zoom;t.scale(i,i);this.onPrerender(t)};n.prototype.postrenderCanvas=function(){this.ctx.restore()};n.prototype.setSvg=function(t){this.element=t;this.isSvg=true;this.pixelRatio=1;var e=t.getAttribute("width");var r=t.getAttribute("height");this.setSizeSvg(e,r)};n.prototype.setSizeSvg=function(t,e){this.width=t;this.height=e;var r=t/this.zoom;var i=e/this.zoom;var n=this.centered?-r/2:0;var o=this.centered?-i/2:0;this.element.setAttribute("viewBox",n+" "+o+" "+r+" "+i);if(this.resize){this.element.removeAttribute("width");this.element.removeAttribute("height")}else{this.element.setAttribute("width",t);this.element.setAttribute("height",e)}};n.prototype.renderGraphSvg=function(t){t=t||this;o(this.element);this.onPrerender(this.element);r.prototype.renderGraphSvg.call(t,this.element)};function o(t){while(t.firstChild){t.removeChild(t.firstChild)}}n.prototype.setDragRotate=function(t){if(!t){return}else if(t===true){t=this}this.dragRotate=t;this.bindDrag(this.element)};n.prototype.dragStart=function(){this.dragStartRX=this.dragRotate.rotate.x;this.dragStartRY=this.dragRotate.rotate.y;a.prototype.dragStart.apply(this,arguments)};n.prototype.dragMove=function(t,e){var r=e.pageX-this.dragStartX;var i=e.pageY-this.dragStartY;var n=Math.min(this.width,this.height);var o=r/n*h;var s=i/n*h;this.dragRotate.rotate.x=this.dragStartRX-s;this.dragRotate.rotate.y=this.dragStartRY-o;a.prototype.dragMove.apply(this,arguments)};return n});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./vector"))}else{var r=t.Zdog;r.PathCommand=e(r.Vector)}})(this,function t(i){function e(t,e,r){this.method=t;this.points=e.map(n);this.renderPoints=e.map(o);this.previousPoint=r;this.endRenderPoint=this.renderPoints[this.renderPoints.length-1];if(t=="arc"){this.controlPoints=[new i,new i]}}function n(t){if(t instanceof i){return t}else{return new i(t)}}function o(t){return new i(t)}e.prototype.reset=function(){var i=this.points;this.renderPoints.forEach(function(t,e){var r=i[e];t.set(r)})};e.prototype.transform=function(e,r,i){this.renderPoints.forEach(function(t){t.transform(e,r,i)})};e.prototype.render=function(t,e,r){return this[this.method](t,e,r)};e.prototype.move=function(t,e,r){return r.move(t,e,this.renderPoints[0])};e.prototype.line=function(t,e,r){return r.line(t,e,this.renderPoints[0])};e.prototype.bezier=function(t,e,r){var i=this.renderPoints[0];var n=this.renderPoints[1];var o=this.renderPoints[2];return r.bezier(t,e,i,n,o)};var h=9/16;e.prototype.arc=function(t,e,r){var i=this.previousPoint;var n=this.renderPoints[0];var o=this.renderPoints[1];var s=this.controlPoints[0];var a=this.controlPoints[1];s.set(i).lerp(n,h);a.set(o).lerp(n,h);return r.bezier(t,e,s,a,o)};return e});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./vector"),require("./path-command"),require("./anchor"))}else{var r=t.Zdog;r.Shape=e(r,r.Vector,r.PathCommand,r.Anchor)}})(this,function t(e,r,p,i){var n=i.subclass({stroke:1,fill:false,color:"#333",closed:true,visible:true,path:[{}],front:{z:1},backface:true});n.prototype.create=function(t){i.prototype.create.call(this,t);this.updatePath();this.front=new r(t.front||this.front);this.renderFront=new r(this.front);this.renderNormal=new r};var d=["move","line","bezier","arc"];n.prototype.updatePath=function(){this.setPath();this.updatePathCommands()};n.prototype.setPath=function(){};n.prototype.updatePathCommands=function(){var u;this.pathCommands=this.path.map(function(t,e){var r=Object.keys(t);var i=r[0];var n=t[i];var o=r.length==1&&d.indexOf(i)!=-1;if(!o){i="line";n=t}var s=i=="line"||i=="move";var a=Array.isArray(n);if(s&&!a){n=[n]}i=e===0?"move":i;var h=new p(i,n,u);u=h.endRenderPoint;return h})};n.prototype.reset=function(){this.renderOrigin.set(this.origin);this.renderFront.set(this.front);this.pathCommands.forEach(function(t){t.reset()})};n.prototype.transform=function(e,r,i){this.renderOrigin.transform(e,r,i);this.renderFront.transform(e,r,i);this.renderNormal.set(this.renderOrigin).subtract(this.renderFront);this.pathCommands.forEach(function(t){t.transform(e,r,i)});this.children.forEach(function(t){t.transform(e,r,i)})};n.prototype.updateSortValue=function(){var t=this.pathCommands.length;var e=this.pathCommands[0].endRenderPoint;var r=this.pathCommands[t-1].endRenderPoint;var i=t>2&&e.isSame(r);if(i){t-=1}var n=0;for(var o=0;o<t;o++){n+=this.pathCommands[o].endRenderPoint.z}this.sortValue=n/t};n.prototype.render=function(t,e){var r=this.pathCommands.length;if(!this.visible||!r){return}this.isFacingBack=this.renderNormal.z>0;if(!this.backface&&this.isFacingBack){return}if(!e){throw new Error("Zdog renderer required. Set to "+e)}var i=r==1;if(e.isCanvas&&i){this.renderCanvasDot(t,e)}else{this.renderPath(t,e)}};var o=e.TAU;n.prototype.renderCanvasDot=function(t){var e=this.getLineWidth();if(!e){return}t.fillStyle=this.getRenderColor();var r=this.pathCommands[0].endRenderPoint;t.beginPath();var i=e/2;t.arc(r.x,r.y,i,0,o);t.fill()};n.prototype.getLineWidth=function(){if(!this.stroke){return 0}if(this.stroke==true){return 1}return this.stroke};n.prototype.getRenderColor=function(){var t=typeof this.backface=="string"&&this.isFacingBack;var e=t?this.backface:this.color;return e};n.prototype.renderPath=function(t,e){var r=this.getRenderElement(t,e);var i=this.pathCommands.length==2&&this.pathCommands[1].method=="line";var n=!i&&this.closed;var o=this.getRenderColor();e.renderPath(t,r,this.pathCommands,n);e.stroke(t,r,this.stroke,o,this.getLineWidth());e.fill(t,r,this.fill,o);e.end(t,r)};var s="http://www.w3.org/2000/svg";n.prototype.getRenderElement=function(t,e){if(!e.isSvg){return}if(!this.svgElement){this.svgElement=document.createElementNS(s,"path");this.svgElement.setAttribute("stroke-linecap","round");this.svgElement.setAttribute("stroke-linejoin","round")}return this.svgElement};return n});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./anchor"))}else{var r=t.Zdog;r.Group=e(r.Anchor)}})(this,function t(r){var e=r.subclass({updateSort:false,visible:true});e.prototype.updateSortValue=function(){var e=0;this.flatGraph.forEach(function(t){t.updateSortValue();e+=t.sortValue});this.sortValue=e/this.flatGraph.length;if(this.updateSort){this.flatGraph.sort(r.shapeSorter)}};e.prototype.render=function(e,r){if(!this.visible){return}this.flatGraph.forEach(function(t){t.render(e,r)})};e.prototype.updateFlatGraph=function(){var t=[];this.flatGraph=this.addChildFlatGraph(t)};e.prototype.getFlatGraph=function(){return[this]};return e});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./shape"))}else{var r=t.Zdog;r.Rect=e(r.Shape)}})(this,function t(e){var r=e.subclass({width:1,height:1});r.prototype.setPath=function(){var t=this.width/2;var e=this.height/2;this.path=[{x:-t,y:-e},{x:t,y:-e},{x:t,y:e},{x:-t,y:e}]};return r});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./shape"))}else{var r=t.Zdog;r.RoundedRect=e(r.Shape)}})(this,function t(e){var r=e.subclass({width:1,height:1,cornerRadius:.25,closed:false});r.prototype.setPath=function(){var t=this.width/2;var e=this.height/2;var r=Math.min(t,e);var i=Math.min(this.cornerRadius,r);var n=t-i;var o=e-i;var s=[{x:n,y:-e},{arc:[{x:t,y:-e},{x:t,y:-o}]}];if(o){s.push({x:t,y:o})}s.push({arc:[{x:t,y:e},{x:n,y:e}]});if(n){s.push({x:-n,y:e})}s.push({arc:[{x:-t,y:e},{x:-t,y:o}]});if(o){s.push({x:-t,y:-o})}s.push({arc:[{x:-t,y:-e},{x:-n,y:-e}]});if(n){s.push({x:n,y:-e})}this.path=s};return r});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./shape"))}else{var r=t.Zdog;r.Ellipse=e(r.Shape)}})(this,function t(e){var r=e.subclass({diameter:1,width:undefined,height:undefined,quarters:4,closed:false});r.prototype.setPath=function(){var t=this.width!=undefined?this.width:this.diameter;var e=this.height!=undefined?this.height:this.diameter;var r=t/2;var i=e/2;this.path=[{x:0,y:-i},{arc:[{x:r,y:-i},{x:r,y:0}]}];if(this.quarters>1){this.path.push({arc:[{x:r,y:i},{x:0,y:i}]})}if(this.quarters>2){this.path.push({arc:[{x:-r,y:i},{x:-r,y:0}]})}if(this.quarters>3){this.path.push({arc:[{x:-r,y:-i},{x:0,y:-i}]})}};return r});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./shape"))}else{var r=t.Zdog;r.Polygon=e(r,r.Shape)}})(this,function t(e,r){var i=r.subclass({sides:3,radius:.5});var n=e.TAU;i.prototype.setPath=function(){this.path=[];for(var t=0;t<this.sides;t++){var e=t/this.sides*n-n/4;var r=Math.cos(e)*this.radius;var i=Math.sin(e)*this.radius;this.path.push({x:r,y:i})}};return i});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./vector"),require("./anchor"),require("./ellipse"))}else{var r=t.Zdog;r.Hemisphere=e(r,r.Vector,r.Anchor,r.Ellipse)}})(this,function t(e,r,i,n){var o=n.subclass({fill:true});var u=e.TAU;o.prototype.create=function(){n.prototype.create.apply(this,arguments);this.apex=new i({addTo:this,translate:{z:this.diameter/2}});this.renderCentroid=new r};o.prototype.updateSortValue=function(){this.renderCentroid.set(this.renderOrigin).lerp(this.apex.renderOrigin,3/8);this.sortValue=this.renderCentroid.z};o.prototype.render=function(t,e){this.renderDome(t,e);n.prototype.render.apply(this,arguments)};o.prototype.renderDome=function(t,e){if(!this.visible){return}var r=this.getDomeRenderElement(t,e);var i=Math.atan2(this.renderNormal.y,this.renderNormal.x);var n=this.diameter/2*this.renderNormal.magnitude();var o=this.renderOrigin.x;var s=this.renderOrigin.y;if(e.isCanvas){var a=i+u/4;var h=i-u/4;t.beginPath();t.arc(o,s,n,a,h)}else if(e.isSvg){i=(i-u/4)/u*360;this.domeSvgElement.setAttribute("d","M "+-n+",0 A "+n+","+n+" 0 0 1 "+n+",0");this.domeSvgElement.setAttribute("transform","translate("+o+","+s+" ) rotate("+i+")")}e.stroke(t,r,this.stroke,this.color,this.getLineWidth());e.fill(t,r,this.fill,this.color);e.end(t,r)};var s="http://www.w3.org/2000/svg";o.prototype.getDomeRenderElement=function(t,e){if(!e.isSvg){return}if(!this.domeSvgElement){this.domeSvgElement=document.createElementNS(s,"path");this.domeSvgElement.setAttribute("stroke-linecap","round");this.domeSvgElement.setAttribute("stroke-linejoin","round")}return this.domeSvgElement};return o});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./path-command"),require("./shape"),require("./group"),require("./ellipse"))}else{var r=t.Zdog;r.Cylinder=e(r,r.PathCommand,r.Shape,r.Group,r.Ellipse)}})(this,function t(e,r,i,n,o){function s(){}var a=n.subclass({color:"#333",updateSort:true});a.prototype.create=function(){n.prototype.create.apply(this,arguments);this.pathCommands=[new r("move",[{}]),new r("line",[{}])]};a.prototype.render=function(t,e){this.renderCylinderSurface(t,e);n.prototype.render.apply(this,arguments)};a.prototype.renderCylinderSurface=function(t,e){if(!this.visible){return}var r=this.getRenderElement(t,e);var i=this.frontBase;var n=this.rearBase;var o=i.renderNormal.magnitude();var s=i.diameter*o+i.getLineWidth();this.pathCommands[0].renderPoints[0].set(i.renderOrigin);this.pathCommands[1].renderPoints[0].set(n.renderOrigin);if(e.isCanvas){t.lineCap="butt"}e.renderPath(t,r,this.pathCommands);e.stroke(t,r,true,this.color,s);e.end(t,r);if(e.isCanvas){t.lineCap="round"}};var h="http://www.w3.org/2000/svg";a.prototype.getRenderElement=function(t,e){if(!e.isSvg){return}if(!this.svgElement){this.svgElement=document.createElementNS(h,"path")}return this.svgElement};a.prototype.copyGraph=s;var u=o.subclass();u.prototype.copyGraph=s;var p=i.subclass({diameter:1,length:1,frontFace:undefined,fill:true});var d=e.TAU;p.prototype.create=function(){i.prototype.create.apply(this,arguments);this.group=new a({addTo:this,color:this.color,visible:this.visible});var t=this.length/2;var e=this.backface||true;this.frontBase=this.group.frontBase=new o({addTo:this.group,diameter:this.diameter,translate:{z:t},rotate:{y:d/2},color:this.color,stroke:this.stroke,fill:this.fill,backface:this.frontFace||e,visible:this.visible});this.rearBase=this.group.rearBase=this.frontBase.copy({translate:{z:-t},rotate:{y:0},backface:e})};p.prototype.render=function(){};var c=["stroke","fill","color","visible"];c.forEach(function(e){var r="_"+e;Object.defineProperty(p.prototype,e,{get:function(){return this[r]},set:function(t){this[r]=t;if(this.frontBase){this.frontBase[e]=t;this.rearBase[e]=t;this.group[e]=t}}})});return p});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./vector"),require("./path-command"),require("./anchor"),require("./ellipse"))}else{var r=t.Zdog;r.Cone=e(r,r.Vector,r.PathCommand,r.Anchor,r.Ellipse)}})(this,function t(e,r,i,n,o){var s=o.subclass({length:1,fill:true});var v=e.TAU;s.prototype.create=function(){o.prototype.create.apply(this,arguments);this.apex=new n({addTo:this,translate:{z:this.length}});this.renderApex=new r;this.renderCentroid=new r;this.tangentA=new r;this.tangentB=new r;this.surfacePathCommands=[new i("move",[{}]),new i("line",[{}]),new i("line",[{}])]};s.prototype.updateSortValue=function(){this.renderCentroid.set(this.renderOrigin).lerp(this.apex.renderOrigin,1/3);this.sortValue=this.renderCentroid.z};s.prototype.render=function(t,e){this.renderConeSurface(t,e);o.prototype.render.apply(this,arguments)};s.prototype.renderConeSurface=function(t,e){if(!this.visible){return}this.renderApex.set(this.apex.renderOrigin).subtract(this.renderOrigin);var r=this.renderNormal.magnitude();var i=this.renderApex.magnitude2d();var n=this.renderNormal.magnitude2d();var o=Math.acos(n/r);var s=Math.sin(o);var a=this.diameter/2*r;var h=a*s<i;if(!h){return}var u=Math.atan2(this.renderNormal.y,this.renderNormal.x)+v/2;var p=i/s;var d=Math.acos(a/p);var c=this.tangentA;var f=this.tangentB;c.x=Math.cos(d)*a*s;c.y=Math.sin(d)*a;f.set(this.tangentA);f.y*=-1;c.rotateZ(u);f.rotateZ(u);c.add(this.renderOrigin);f.add(this.renderOrigin);this.setSurfaceRenderPoint(0,c);this.setSurfaceRenderPoint(1,this.apex.renderOrigin);this.setSurfaceRenderPoint(2,f);var l=this.getSurfaceRenderElement(t,e);e.renderPath(t,l,this.surfacePathCommands);e.stroke(t,l,this.stroke,this.color,this.getLineWidth());e.fill(t,l,this.fill,this.color);e.end(t,l)};var a="http://www.w3.org/2000/svg";s.prototype.getSurfaceRenderElement=function(t,e){if(!e.isSvg){return}if(!this.surfaceSvgElement){this.surfaceSvgElement=document.createElementNS(a,"path");this.surfaceSvgElement.setAttribute("stroke-linecap","round");this.surfaceSvgElement.setAttribute("stroke-linejoin","round")}return this.surfaceSvgElement};s.prototype.setSurfaceRenderPoint=function(t,e){var r=this.surfacePathCommands[t].renderPoints[0];r.set(e)};return s});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./anchor"),require("./shape"),require("./rect"))}else{var r=t.Zdog;r.Box=e(r,r.Anchor,r.Shape,r.Rect)}})(this,function t(e,r,i,n){var o=n.subclass();o.prototype.copyGraph=function(){};var s=e.TAU;var a=["frontFace","rearFace","leftFace","rightFace","topFace","bottomFace"];var h=e.extend({},i.defaults);delete h.path;a.forEach(function(t){h[t]=true});e.extend(h,{width:1,height:1,depth:1,fill:true});var u=r.subclass(h);u.prototype.create=function(t){r.prototype.create.call(this,t);this.updatePath();this.fill=this.fill};u.prototype.updatePath=function(){a.forEach(function(t){this[t]=this[t]},this)};a.forEach(function(e){var r="_"+e;Object.defineProperty(u.prototype,e,{get:function(){return this[r]},set:function(t){this[r]=t;this.setFace(e,t)}})});u.prototype.setFace=function(t,e){var r=t+"Rect";var i=this[r];if(!e){this.removeChild(i);return}var n=this.getFaceOptions(t);n.color=typeof e=="string"?e:this.color;if(i){i.setOptions(n)}else{i=this[r]=new o(n)}i.updatePath();this.addChild(i)};u.prototype.getFaceOptions=function(t){return{frontFace:{width:this.width,height:this.height,translate:{z:this.depth/2}},rearFace:{width:this.width,height:this.height,translate:{z:-this.depth/2},rotate:{y:s/2}},leftFace:{width:this.depth,height:this.height,translate:{x:-this.width/2},rotate:{y:-s/4}},rightFace:{width:this.depth,height:this.height,translate:{x:this.width/2},rotate:{y:s/4}},topFace:{width:this.width,height:this.depth,translate:{y:-this.height/2},rotate:{x:-s/4}},bottomFace:{width:this.width,height:this.depth,translate:{y:this.height/2},rotate:{x:s/4}}}[t]};var p=["color","stroke","fill","backface","front","visible"];p.forEach(function(o){var t="_"+o;Object.defineProperty(u.prototype,o,{get:function(){return this[t]},set:function(n){this[t]=n;a.forEach(function(t){var e=this[t+"Rect"];var r=typeof this[t]=="string";var i=o=="color"&&r;if(e&&!i){e[o]=n}},this)}})});return u});(function(t,e){if(typeof module=="object"&&module.exports){module.exports=e(require("./boilerplate"),require("./canvas-renderer"),require("./svg-renderer"),require("./vector"),require("./anchor"),require("./dragger"),require("./illustration"),require("./path-command"),require("./shape"),require("./group"),require("./rect"),require("./rounded-rect"),require("./ellipse"),require("./polygon"),require("./hemisphere"),require("./cylinder"),require("./cone"),require("./box"))}else if(typeof define=="function"&&define.amd){define("zdog",[],t.Zdog)}})(this,function t(e,r,i,n,o,s,a,h,u,p,d,c,f,l,v,y,m,g){e.CanvasRenderer=r;e.SvgRenderer=i;e.Vector=n;e.Anchor=o;e.Dragger=s;e.Illustration=a;e.PathCommand=h;e.Shape=u;e.Group=p;e.Rect=d;e.RoundedRect=c;e.Ellipse=f;e.Polygon=l;e.Hemisphere=v;e.Cylinder=y;e.Cone=m;e.Box=g;return e});

    Scratch.extensions.register(new Zdoggy());
})(Scratch);
