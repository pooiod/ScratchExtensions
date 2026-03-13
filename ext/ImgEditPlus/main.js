(function(Scratch) {
    const vm = Scratch.vm;
    let canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    let ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    function randomcolor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }

    let pen = {
        x: 5, y: 5,
        color: randomcolor(),
        size: 1,
        outlineColor: randomcolor(),
        outlineSize: 0,
        erase: false,
        h: 0, s: 0, v: 0, a: 255
    };

    const toCX = (x) => canvas.width / 2 + Scratch.Cast.toNumber(x);
    const toCY = (y) => canvas.height / 2 - Scratch.Cast.toNumber(y);

    const hToRgb = (hex) => {
        let h = String(hex).startsWith('#') ? String(hex).slice(1) : String(hex);
        if(h.length === 3) h = h.split('').map(x => x + x).join('') + 'ff';
        else if(h.length === 4) h = h.split('').map(x => x + x).join('');
        else if(h.length === 6) h += 'ff';
        else if(h.length !== 8) return {r:0, g:0, b:0, a:255};
        let val = parseInt(h, 16);
        return {r: (val >>> 24) & 255, g: (val >>> 16) & 255, b: (val >>> 8) & 255, a: val & 255};
    };

    const rgbToHsv = (r, g, b) => {
        r/=255; g/=255; b/=255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max !== min) {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return[h * 360, s * 100, v * 100];
    };

    const hsvToRgb = (h, s, v) => {
        let r, g, b;
        h /= 360; s /= 100; v /= 100;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r=v; g=t; b=p; break;
            case 1: r=q; g=v; b=p; break;
            case 2: r=p; g=v; b=t; break;
            case 3: r=p; g=q; b=v; break;
            case 4: r=t; g=p; b=v; break;
            case 5: r=v; g=p; b=q; break;
        }
        return[Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const updateColor = () => {
        let rgb = hsvToRgb(pen.h, Math.max(0,Math.min(100,pen.s)), Math.max(0,Math.min(100,pen.v)));
        let a = Math.round(Math.max(0,Math.min(255,pen.a)));
        pen.color = `#${rgb[0].toString(16).padStart(2,'0')}${rgb[1].toString(16).padStart(2,'0')}${rgb[2].toString(16).padStart(2,'0')}${a.toString(16).padStart(2,'0')}`;
    };

    const reset = () => {
        canvas.width = 10;
        canvas.height = 10;
        ctx.clearRect(0, 0, 10, 10);
        ctx.fillStyle = '#808080';
        ctx.fillRect(1, 7, 5, 2);
        ctx.fillRect(2, 6, 5, 2);
        ctx.fillStyle = '#606060';
        ctx.fillRect(6, 3, 3, 4);
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(7, 2, 2, 2);
        let c = hToRgb(randomcolor());
        let hsv = rgbToHsv(c.r, c.g, c.b);
        pen = { x: 5, y: 5, color: randomcolor(), size: 1, outlineColor: randomcolor(), outlineSize: 0, erase: false, h: hsv[0], s: hsv[1], v: hsv[2], a: 255 };
    };

    vm.runtime.on('PROJECT_START', reset);
    vm.runtime.on('PROJECT_STOP_ALL', reset);
    reset();

    const loadI = (u) => new Promise(r => { let i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = u; });

    const applyStyle = () => {
        ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
        ctx.fillStyle = pen.color;
        ctx.strokeStyle = pen.outlineSize > 0 && !pen.erase ? pen.outlineColor : pen.color;
        ctx.lineWidth = pen.erase || pen.outlineSize === 0 ? pen.size : pen.outlineSize;
    };

    const defaultShader = `#define time iTime
#define resolution ( iResolution.xy )
#define iChannel0 iChannel0
#define gl_FragCoord fragCoord
#define gl_FragColor fragColor

#define PI 3.14159265

vec3 tex2D( sampler2D _tex, vec2 _p ){
  vec3 col = texture( _tex, _p ).xyz;
  if ( 0.5 < abs( _p.x - 0.5 ) ) {
    col = vec3( 0.1 );
  }
  return col;
}

float hash( vec2 _v ){
  return fract( sin( dot( _v, vec2( 89.44, 19.36 ) ) ) * 22189.22 );
}

float iHash( vec2 _v, vec2 _r ){
  float h00 = hash( vec2( floor( _v * _r + vec2( 0.0, 0.0 ) ) / _r ) );
  float h10 = hash( vec2( floor( _v * _r + vec2( 1.0, 0.0 ) ) / _r ) );
  float h01 = hash( vec2( floor( _v * _r + vec2( 0.0, 1.0 ) ) / _r ) );
  float h11 = hash( vec2( floor( _v * _r + vec2( 1.0, 1.0 ) ) / _r ) );
  vec2 ip = vec2( smoothstep( vec2( 0.0, 0.0 ), vec2( 1.0, 1.0 ), mod( _v*_r, 1. ) ) );
  return ( h00 * ( 1. - ip.x ) + h10 * ip.x ) * ( 1. - ip.y ) + ( h01 * ( 1. - ip.x ) + h11 * ip.x ) * ip.y;
}

float noise( vec2 _v ){
  float sum = 0.;
  for( int i=1; i<9; i++ )
  {
    sum += iHash( _v + vec2( i ), vec2( 2. * pow( 2., float( i ) ) ) ) / pow( 2., float( i ) );
  }
  return sum;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 uvn = uv;
  vec3 col = vec3( 0.0 );

  // tape wave
  uvn.x += ( noise( vec2( uvn.y, time ) ) - 0.5 )* 0.005;
  uvn.x += ( noise( vec2( uvn.y * 100.0, time * 10.0 ) ) - 0.5 ) * 0.01;

  // tape crease
  float tcPhase = clamp( ( sin( uvn.y * 8.0 - time * PI * 1.2 ) - 0.92 ) * noise( vec2( time ) ), 0.0, 0.01 ) * 10.0;
  float tcNoise = max( noise( vec2( uvn.y * 100.0, time * 10.0 ) ) - 0.5, 0.0 );
  uvn.x = uvn.x - tcNoise * tcPhase;

  // switching noise
  float snPhase = smoothstep( 0.03, 0.0, uvn.y );
  uvn.y += snPhase * 0.3;
  uvn.x += snPhase * ( ( noise( vec2( uv.y * 100.0, time * 10.0 ) ) - 0.5 ) * 0.2 );
    
  col = tex2D( iChannel0, uvn );
  col *= 1.0 - tcPhase;
  col = mix(
    col,
    col.yzx,
    snPhase
  );

  // bloom
  for( float x = -4.0; x < 2.5; x += 1.0 ){
    col.xyz += vec3(
      tex2D( iChannel0, uvn + vec2( x - 0.0, 0.0 ) * 7E-3 ).x,
      tex2D( iChannel0, uvn + vec2( x - 2.0, 0.0 ) * 7E-3 ).y,
      tex2D( iChannel0, uvn + vec2( x - 4.0, 0.0 ) * 7E-3 ).z
    ) * 0.1;
  }
  col *= 0.6;

  // ac beat
  col *= 1.0 + clamp( noise( vec2( 0.0, uv.y + time * 0.2 ) ) * 0.6 - 0.25, 0.0, 0.1 );

  gl_FragColor = vec4( col, 1.0 );
}

#undef gl_FragCoord
#undef gl_FragColor`.replace(/(\r\n|\n|\r)/g, '|');

    class ImageEditingPlus {
        getInfo() {
            return {
                id: 'P7IEPlus',
                name: 'Image Editing Plus',
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Colors'
                    },
                    {
                        opcode: 'hexWithTrans',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'hex of color [C] with transparency [A]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.COLOR,
                                defaultValue: randomcolor()
                            },
                            A: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            }
                        }
                    },
                    {
                        opcode: 'hexNoTrans',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '# [C]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.COLOR,
                                defaultValue: randomcolor()
                            }
                        }
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Exports'
                    },
                    {
                        opcode: 'exportImg',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'export edited image as [F]',
                        arguments: {
                            F: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'exportFormats',
                                defaultValue: 'png'
                            }
                        }
                    },
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Image Data'
                    },
                    {
                        opcode: 'getPix',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get pixel x [X] y [Y] from image',
                        arguments: {
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'getBox',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get pixels in box x1 [X1] y1 [Y1] x2[X2] y2 [Y2]',
                        arguments: {
                            X1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -5
                            },
                            Y1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -5
                            },
                            X2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5
                            },
                            Y2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5
                            }
                        }
                    },
                    {
                        opcode: 'getAllPix',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get all pixels in image'
                    },

                    {
                        opcode: 'getPenUri',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get data uri of pen',
                        hideFromPalette: !vm.runtime.ext_pen
                    },
                    {
                        opcode: 'getCostumeUri',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get costume [C]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'costume1'
                            }
                        }
                    },
                    {
                        opcode: 'fetchImage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fetch [U]',
                        arguments: {
                            U: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '/favicon.ico'
                            }
                        }
                    },
                    {
                        opcode: 'setListToArray',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set list [L] to array [A]',
                        arguments: {
                            L: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'lists',
                                defaultValue: 'list'
                            },
                            A: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '[]'
                            }
                        }
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Image manipulation'
                    },
                    {
                        opcode: 'createImg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'create image width [W] height [H]',
                        arguments: {
                            W: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            H: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'startEdit',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'start editing image [U]',
                        arguments: {
                            U: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'data:image/png;base64,'
                            }
                        }
                    },
                    {
                        opcode: 'resizeImg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'resize image width [W] height [H] mode [M]',
                        arguments: {
                            W: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 200
                            },
                            H: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 200
                            },
                            M: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'resizeModes',
                                defaultValue: 'fit'
                            }
                        }
                    },
                    {
                        opcode: 'cropImg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'crop image x1 [X1] y1 [Y1] x2 [X2] y2 [Y2]',
                        arguments: {
                            X1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -25
                            },
                            Y1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -25
                            },
                            X2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 25
                            },
                            Y2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 25
                            }
                        }
                    },
                    {
                        opcode: 'expandImg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'expand image width [W] height [H]',
                        arguments: {
                            W: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            },
                            H: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'clearImg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'clear editing image'
                    },

                    {
                        opcode: 'getW',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'width of image'
                    },
                    {
                        opcode: 'getH',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'height of image'
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Pen configs'
                    },
                    {
                        opcode: 'setPenPos',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pen pos x [X] y [Y]',
                        arguments: {
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'setPenC',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pen color [C]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: randomcolor()
                            }
                        }
                    },
                    {
                        opcode: 'setPenT',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pen thickness [V]',
                        arguments: {
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'setPenO',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pen outline to color [C] thickness [T]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: randomcolor()
                            },
                            T: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 2
                            }
                        }
                    },
                    {
                        opcode: 'changePenH',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'change pen hue [V]',
                        arguments: {
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'changePenS',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'change pen saturation [V]',
                        arguments: {
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'changePenB',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'change pen brightness [V]',
                        arguments: {
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'changePenA',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'change pen transparency [V]',
                        arguments: {
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'setPenMode',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set pen to mode[M]',
                        arguments: {
                            M: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'eraseModes',
                                defaultValue: 'erase'
                            }
                        }
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Drawing'
                    },
                    {
                        opcode: 'drawTo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw to x [X] y [Y]',
                        arguments: {
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            }
                        }
                    },
                    {
                        opcode: 'stampDot',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'stamp dot'
                    },
                    {
                        opcode: 'curveTo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'curve to cx [CX] cy [CY] x [X] y [Y]',
                        arguments: {
                            CX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            CY: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            X: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            Y: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'drawCirc',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw circle radius [R]',
                        arguments: {
                            R: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'drawSq',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw square width [W] height [H]',
                        arguments: {
                            W: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 20
                            },
                            H: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 20
                            }
                        }
                    },
                    {
                        opcode: 'drawTri',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'draw triangle x1 [X1] y1 [Y1] x2 [X2] y2 [Y2] x3 [X3] y3 [Y3]',
                        arguments: {
                            X1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -10
                            },
                            Y1: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -10
                            },
                            X2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            Y2: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            },
                            X3: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            },
                            Y3: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -10
                            }
                        }
                    },
                    {
                        opcode: 'fillBg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'fill background with [C]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: randomcolor()
                            }
                        }
                    },
                    {
                        opcode: 'repColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'replace color [C] with tolerance [V]',
                        arguments: {
                            C: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: randomcolor()
                            },
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'paintTol',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'paint with tolerance [V]',
                        arguments: {
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    {
                        opcode: 'stampImg',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'stamp image [U]',
                        arguments: {
                            U: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'data:image/png;base64,'
                            }
                        }
                    },

                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Processing'
                    },
                    {
                        opcode: 'runFilt',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'run filter [F] with value [V]',
                        arguments: {
                            F: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'filters',
                                defaultValue: 'blur'
                            },
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 5
                            }
                        }
                    },
                    {
                        opcode: 'runImgFilt',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'run img filter [M] from [U]',
                        arguments: {
                            M: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'imgFilters',
                                defaultValue: 'push'
                            },
                            U: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'data:image/png;base64,'
                            }
                        }
                    },
                    {
                        opcode: 'genPushFilter',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'generate push filter[F] with intensity [I] offset [O]',
                        arguments: {
                            F: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'pushFilters',
                                defaultValue: 'twirl'
                            },
                            I: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            O: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'genPerlin',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'generate perlin noise mode [M] scale [S] octaves [O] falloff [F] seed [SEED]',
                        arguments: {
                            M: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'perlinModes',
                                defaultValue: 'black and white'
                            },
                            S: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 10
                            },
                            O: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 4
                            },
                            F: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0.5
                            },
                            SEED: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'compressImage',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'compress [U] as format [F] with quality [V]',
                        arguments: {
                            U: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'data:image/png;base64,'
                            },
                            F: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'compressFormats',
                                defaultValue: 'png'
                            },
                            V: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 80
                            }
                        }
                    },
                    {
                        opcode: 'applyGLSL',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'apply shader [G] on editing image witn input [I]',
                        arguments: {
                            G: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: defaultShader
                            },
                            I: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    }
                ],

                menus: {
                    compressFormats: {
                        items: ['png (lossless)', 'png (lossy)', 'jpeg', 'webp']
                    },
                    pushFilters: {
                        items: ['twirl', 'fisheye', '3D tilt', 'wave', 'glitch', 'TV line']
                    },
                    perlinModes: {
                        items: ['push filter', 'black and white']
                    },
                    resizeModes: {
                        items: ['fit', 'stretch', 'cover']
                    },
                    eraseModes: {
                        items: ['erase', 'paint']
                    },
                    filters: {
                        items: ['ghost', 'invert', 'blur', 'brightness', 'hue', 'contrast', 'greyscale', 'saturation', 'sepia']
                    },
                    imgFilters: {
                        items: ['push', 'mask', 'invert', 'greyscale', 'difference', 'threshold']
                    },
                    exportFormats: {
                        items: ['png', 'jpeg', 'webp']
                    },
                    lists: '_getLists'
                }
            };
        }

        _getLists() {
            let t = vm.editingTarget || (vm.runtime.targets ? vm.runtime.targets[0] : null);
            if(!t || !t.variables) return ['list'];
            let ls = Object.values(t.variables).filter(v => v.type === 'list').map(v => v.name);
            return ls.length > 0 ? ls : ['list'];
        }

        hexWithTrans(a) {
            let c = hToRgb(a.C);
            let trans = Scratch.Cast.toNumber(a.A);
            let alpha = Math.round(Math.max(0, Math.min(100, 100 - trans)) * 2.55);
            return `#${c.r.toString(16).padStart(2,'0')}${c.g.toString(16).padStart(2,'0')}${c.b.toString(16).padStart(2,'0')}${alpha.toString(16).padStart(2,'0')}`;
        }
        hexNoTrans(a) { return this.hexWithTrans({ C: a.C, A: 0 }); }
        
        getPenUri() {
            if(!vm.runtime.ext_pen) return '';
            let id = vm.runtime.ext_pen._penDrawableId;
            if(id === undefined) return '';
            let skinId = vm.renderer._allDrawables[id].skin.id;
            let skin = vm.renderer._allSkins[skinId];
            return (skin && skin._canvas) ? skin._canvas.toDataURL() : '';
        }
        getCostumeUri(a, u) {
            let c = u.target.getCostumes().find(x => x.name === a.C);
            return c ? c.asset.encodeDataURI() : '';
        }
        async compressImage(a) {
            let i = await loadI(a.U);
            if(!i) return '';
            let c = document.createElement('canvas');
            c.width = i.width; c.height = i.height;
            c.getContext('2d').drawImage(i, 0, 0);
            let mime = a.F === 'jpeg' ? 'image/jpeg' : (a.F === 'webp' ? 'image/webp' : 'image/png');
            return c.toDataURL(mime, Scratch.Cast.toNumber(a.V) / 100);
        }
        genPushFilter(a) {
            let f = a.F, int = Scratch.Cast.toNumber(a.I), off = Scratch.Cast.toNumber(a.O);
            let w = canvas.width, h = canvas.height;
            let c = document.createElement('canvas'); c.width = w; c.height = h;
            let cc = c.getContext('2d');
            let d = cc.createImageData(w, h);
            let cx = w/2, cy = h/2;
            for(let y=0; y<h; y++) {
                for(let x=0; x<w; x++) {
                    let i = (y*w+x)*4;
                    let dx=0, dy=0, rx=x-cx, ry=y-cy, dist=Math.sqrt(rx*rx+ry*ry);
                    if(f==='twirl') {
                        let ang = Math.atan2(ry, rx) + (dist/off)*int;
                        dx = Math.cos(ang)*dist - rx; dy = Math.sin(ang)*dist - ry;
                    } else if(f==='fisheye') {
                        let fac = Math.pow(dist/off, int)*off;
                        dx = (rx/dist)*fac - rx; dy = (ry/dist)*fac - ry;
                    } else if(f==='3D tilt') {
                        dy = (y/h)*int; dx = (x/w)*int;
                    } else if(f==='wave') {
                        dx = Math.sin(y/off)*int;
                    } else if(f==='glitch') {
                        dx = (Math.random()-0.5)*int; dy = (Math.random()-0.5)*int;
                    } else if(f==='TV line') {
                        dx = (y%off)*int;
                    }
                    d.data[i] = Math.max(0, Math.min(255, 128+dx));
                    d.data[i+1] = Math.max(0, Math.min(255, 128+dy));
                    d.data[i+2] = 128; d.data[i+3] = 255;
                }
            }
            cc.putImageData(d, 0, 0);
            return c.toDataURL();
        }
        genPerlin(a) {
            let mode = a.M, scale = Scratch.Cast.toNumber(a.S), oct = Scratch.Cast.toNumber(a.O), fall = Scratch.Cast.toNumber(a.F), seed = a.SEED;
            let w = canvas.width, h = canvas.height;
            let c = document.createElement('canvas'); c.width = w; c.height = h;
            let cc = c.getContext('2d');
            cc.fillStyle = mode === 'push filter' ? '#808080' : '#000000';
            cc.fillRect(0,0,w,h);
            
            let s = 1234.5678;
            if (seed !== '') {
                let str = String(seed);
                s = 0;
                for (let i = 0; i < str.length; i++) s = (s << 5) - s + str.charCodeAt(i);
                if (s === 0) s = 1;
            } else {
                s = Math.random() * 1000000 + 1;
            }
            let rng = () => {
                let x = Math.sin(s++) * 10000;
                return x - Math.floor(x);
            };

            for(let i=1; i<=oct; i++) {
                let sw = Math.max(1, Math.floor(w / (scale * i))), sh = Math.max(1, Math.floor(h / (scale * i)));
                let tc = document.createElement('canvas'); tc.width = sw; tc.height = sh;
                let tcc = tc.getContext('2d');
                let d = tcc.createImageData(sw, sh);
                for(let j=0; j<d.data.length; j+=4) {
                    let v = rng()*255;
                    if(mode === 'push filter') {
                        d.data[j]=rng()*255; d.data[j+1]=rng()*255; d.data[j+2]=128; d.data[j+3]=255;
                    } else {
                        d.data[j]=v; d.data[j+1]=v; d.data[j+2]=v; d.data[j+3]=255;
                    }
                }
                tcc.putImageData(d, 0, 0);
                cc.globalAlpha = Math.pow(fall, i);
                cc.globalCompositeOperation = mode === 'push filter' ? 'overlay' : 'lighter';
                cc.drawImage(tc, 0, 0, w, h);
            }
            return c.toDataURL();
        }
        fetchImage(a) {
            return fetch(a.U).then(r=>r.blob()).then(b=>new Promise(res=>{let f=new FileReader();f.onload=()=>res(f.result);f.readAsDataURL(b);})).catch(()=>'');
        }
        setListToArray(a, u) {
            let l = u.target.lookupVariableByNameAndType(a.L, 'list');
            if(l) {
                try {
                    let arr = JSON.parse(a.A);
                    if(Array.isArray(arr)) l.value = arr.map(x=>String(x));
                } catch(e) {}
            }
        }
        createImg(a) {
            canvas.width = Math.max(1, Scratch.Cast.toNumber(a.W));
            canvas.height = Math.max(1, Scratch.Cast.toNumber(a.H));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        async startEdit(a) {
            let i = await loadI(a.U);
            if(!i) return;
            canvas.width = Math.max(1, i.width); canvas.height = Math.max(1, i.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(i, 0, 0);
        }
        resizeImg(a) {
            let w = Math.max(1, Scratch.Cast.toNumber(a.W)), h = Math.max(1, Scratch.Cast.toNumber(a.H)), m = a.M;
            let c = document.createElement('canvas'); c.width = w; c.height = h;
            let cc = c.getContext('2d');
            if(m === 'fit' || m === 'cover') {
                let r = m === 'fit' ? Math.min(w/canvas.width, h/canvas.height) : Math.max(w/canvas.width, h/canvas.height);
                let nw = canvas.width*r, nh = canvas.height*r;
                cc.drawImage(canvas, w/2-nw/2, h/2-nh/2, nw, nh);
            } else cc.drawImage(canvas, 0, 0, w, h);
            canvas.width = w; canvas.height = h;
            ctx.clearRect(0,0,w,h); ctx.drawImage(c, 0, 0);
        }
        cropImg(a) {
            let x1 = toCX(a.X1), y1 = toCY(a.Y1), x2 = toCX(a.X2), y2 = toCY(a.Y2);
            let w = Math.max(1, Math.abs(x2-x1)), h = Math.max(1, Math.abs(y2-y1));
            let sx = Math.min(x1, x2), sy = Math.min(y1, y2);
            let c = document.createElement('canvas'); c.width = w; c.height = h;
            c.getContext('2d').drawImage(canvas, sx, sy, w, h, 0, 0, w, h);
            canvas.width = w; canvas.height = h;
            ctx.clearRect(0,0,w,h); ctx.drawImage(c, 0, 0);
        }
        expandImg(a) {
            let w = Scratch.Cast.toNumber(a.W), h = Scratch.Cast.toNumber(a.H);
            let c = document.createElement('canvas'); c.width = Math.max(1, canvas.width+w*2); c.height = Math.max(1, canvas.height+h*2);
            c.getContext('2d').drawImage(canvas, w, h);
            canvas.width = c.width; canvas.height = c.height;
            ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(c, 0, 0);
        }
        setPenPos(a) { pen.x = toCX(a.X); pen.y = toCY(a.Y); }
        getW() { return canvas.width; }
        getH() { return canvas.height; }
        
        getPix(a) {
            let x = Math.round(toCX(a.X)), y = Math.round(toCY(a.Y));
            if(x<0||y<0||x>=canvas.width||y>=canvas.height) return '#00000000';
            let d = ctx.getImageData(x, y, 1, 1).data;
            return `#${d[0].toString(16).padStart(2,'0')}${d[1].toString(16).padStart(2,'0')}${d[2].toString(16).padStart(2,'0')}${d[3].toString(16).padStart(2,'0')}`;
        }
        getBox(a) {
            let x1 = toCX(a.X1), y1 = toCY(a.Y1), x2 = toCX(a.X2), y2 = toCY(a.Y2);
            let w = Math.max(1, Math.abs(x2-x1)), h = Math.max(1, Math.abs(y2-y1));
            let sx = Math.round(Math.max(0, Math.min(x1, x2))), sy = Math.round(Math.max(0, Math.min(y1, y2)));
            w = Math.round(w); h = Math.round(h);
            if(sx+w>canvas.width) w=canvas.width-sx; if(sy+h>canvas.height) h=canvas.height-sy;
            if(w<=0||h<=0) return '[]';
            let d = ctx.getImageData(sx, sy, w, h).data, r =[];
            for(let i=0; i<d.length; i+=4) r.push(`#${d[i].toString(16).padStart(2,'0')}${d[i+1].toString(16).padStart(2,'0')}${d[i+2].toString(16).padStart(2,'0')}${d[i+3].toString(16).padStart(2,'0')}`);
            return JSON.stringify(r);
        }
        getAllPix() {
            let d = ctx.getImageData(0, 0, canvas.width, canvas.height).data, r =[];
            for(let i=0; i<d.length; i+=4) r.push(`#${d[i].toString(16).padStart(2,'0')}${d[i+1].toString(16).padStart(2,'0')}${d[i+2].toString(16).padStart(2,'0')}${d[i+3].toString(16).padStart(2,'0')}`);
            return JSON.stringify(r);
        }
        
        setPenC(a) {
            let c = hToRgb(a.C);
            pen.color = `#${c.r.toString(16).padStart(2,'0')}${c.g.toString(16).padStart(2,'0')}${c.b.toString(16).padStart(2,'0')}${c.a.toString(16).padStart(2,'0')}`;
            let hsv = rgbToHsv(c.r, c.g, c.b);
            pen.h = hsv[0]; pen.s = hsv[1]; pen.v = hsv[2]; pen.a = c.a;
        }
        setPenT(a) { pen.size = Math.max(0, Scratch.Cast.toNumber(a.V)); }
        setPenO(a) {
            let c = hToRgb(a.C);
            pen.outlineColor = `#${c.r.toString(16).padStart(2,'0')}${c.g.toString(16).padStart(2,'0')}${c.b.toString(16).padStart(2,'0')}${c.a.toString(16).padStart(2,'0')}`;
            pen.outlineSize = Math.max(0, Scratch.Cast.toNumber(a.T));
        }
        changePenH(a) { pen.h += Scratch.Cast.toNumber(a.V); pen.h %= 360; if(pen.h<0) pen.h+=360; updateColor(); }
        changePenS(a) { pen.s += Scratch.Cast.toNumber(a.V); updateColor(); }
        changePenB(a) { pen.v += Scratch.Cast.toNumber(a.V); updateColor(); }
        changePenA(a) { pen.a -= Scratch.Cast.toNumber(a.V)*2.55; updateColor(); }
        setPenMode(a) { pen.erase = a.M === 'erase'; }
        
        drawTo(a) {
            let x = toCX(a.X), y = toCY(a.Y);
            ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
            ctx.strokeStyle = pen.color; ctx.lineWidth = pen.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(pen.x, pen.y); ctx.lineTo(x, y); ctx.stroke();
            pen.x = x; pen.y = y;
        }
        stampDot() {
            ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
            ctx.fillStyle = pen.color;
            ctx.beginPath(); ctx.arc(pen.x, pen.y, pen.size, 0, Math.PI*2); ctx.fill();
        }
        curveTo(a) {
            let cx = toCX(a.CX), cy = toCY(a.CY), x = toCX(a.X), y = toCY(a.Y);
            ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
            ctx.strokeStyle = pen.color; ctx.lineWidth = pen.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(pen.x, pen.y); ctx.quadraticCurveTo(cx, cy, x, y); ctx.stroke();
            pen.x = x; pen.y = y;
        }
        drawCirc(a) {
            applyStyle();
            ctx.beginPath(); ctx.arc(pen.x, pen.y, Scratch.Cast.toNumber(a.R), 0, Math.PI*2); ctx.fill();
            if(!pen.erase && pen.outlineSize > 0) ctx.stroke();
        }
        drawSq(a) {
            applyStyle();
            let w = Scratch.Cast.toNumber(a.W), h = Scratch.Cast.toNumber(a.H);
            ctx.fillRect(pen.x - w/2, pen.y - h/2, w, h);
            if(!pen.erase && pen.outlineSize > 0) ctx.strokeRect(pen.x - w/2, pen.y - h/2, w, h);
        }
        drawTri(a) {
            applyStyle();
            ctx.beginPath();
            ctx.moveTo(toCX(a.X1), toCY(a.Y1));
            ctx.lineTo(toCX(a.X2), toCY(a.Y2));
            ctx.lineTo(toCX(a.X3), toCY(a.Y3));
            ctx.closePath();
            ctx.fill();
            if(!pen.erase && pen.outlineSize > 0) ctx.stroke();
        }
        async stampImg(a) {
            let i = await loadI(a.U);
            if(!i) return;
            ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
            ctx.drawImage(i, pen.x - i.width/2, pen.y - i.height/2);
            if(!pen.erase && pen.outlineSize > 0) {
                ctx.strokeStyle = pen.outlineColor; ctx.lineWidth = pen.outlineSize;
                ctx.strokeRect(pen.x - i.width/2, pen.y - i.height/2, i.width, i.height);
            }
        }
        
        runFilt(a) {
            let f = a.F, v = Scratch.Cast.toNumber(a.V), s = '';
            if(f==='ghost') s = `opacity(${100-v}%)`;
            else if(f==='blur') s = `blur(${v}px)`;
            else if(f==='hue') s = `hue-rotate(${v}deg)`;
            else if(f==='greyscale') s = `grayscale(${v}%)`;
            else s = `${f}(${v}%)`;
            let c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
            let cc = c.getContext('2d'); cc.filter = s; cc.drawImage(canvas, 0, 0);
            ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(c, 0, 0);
        }
        async runImgFilt(a) {
            let i = await loadI(a.U);
            if(!i) return;
            let tc = document.createElement('canvas'); tc.width = canvas.width; tc.height = canvas.height;
            let tctx = tc.getContext('2d'); tctx.drawImage(i, 0, 0, canvas.width, canvas.height);
            let tData = tctx.getImageData(0,0,canvas.width,canvas.height).data;
            let mData = ctx.getImageData(0,0,canvas.width,canvas.height);
            let md = mData.data, w = canvas.width, h = canvas.height, m = a.M;
            if(m === 'push') {
                let res = new Uint8ClampedArray(md.length);
                for(let y=0; y<h; y++) {
                    for(let x=0; x<w; x++) {
                        let idx = (y*w+x)*4;
                        let nx = Math.min(Math.max(Math.floor(x + ((tData[idx]-128)/128)*50), 0), w-1);
                        let ny = Math.min(Math.max(Math.floor(y + ((tData[idx+1]-128)/128)*50), 0), h-1);
                        let nidx = (ny*w+nx)*4;
                        res[idx]=md[nidx]; res[idx+1]=md[nidx+1]; res[idx+2]=md[nidx+2]; res[idx+3]=md[nidx+3];
                    }
                }
                md.set(res);
            } else {
                for(let idx=0; idx<md.length; idx+=4) {
                    if(m==='mask') {
                        md[idx]*=tData[idx]/255; md[idx+1]*=tData[idx+1]/255; md[idx+2]*=tData[idx+2]/255; md[idx+3]*=tData[idx+3]/255;
                    } else if(m==='invert') {
                        md[idx]-=tData[idx]; md[idx+1]-=tData[idx+1]; md[idx+2]-=tData[idx+2];
                    } else if(m==='difference') {
                        md[idx]=Math.abs(md[idx]-tData[idx]); md[idx+1]=Math.abs(md[idx+1]-tData[idx+1]); md[idx+2]=Math.abs(md[idx+2]-tData[idx+2]);
                    } else if(m==='greyscale') {
                        let avg = (md[idx]+md[idx+1]+md[idx+2])/3, amt = tData[idx]/255;
                        md[idx]=md[idx]*(1-amt)+avg*amt; md[idx+1]=md[idx+1]*(1-amt)+avg*amt; md[idx+2]=md[idx+2]*(1-amt)+avg*amt;
                    } else if(m==='threshold') {
                        let avg = (md[idx]+md[idx+1]+md[idx+2])/3, t = (tData[idx]+tData[idx+1]+tData[idx+2])/3;
                        let v = avg>t?255:0; md[idx]=v; md[idx+1]=v; md[idx+2]=v;
                    }
                }
            }
            ctx.putImageData(mData, 0, 0);
        }
        fillBg(a) {
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = hToRgb(a.C).a < 255 ? this.hexWithTrans({C: a.C, A: 100 - (hToRgb(a.C).a/255)*100}) : a.C;
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        paintTol(a) {
            let tol = Scratch.Cast.toNumber(a.V), w = canvas.width, h = canvas.height;
            let sx = Math.floor(pen.x), sy = Math.floor(pen.y);
            if(sx<0||sy<0||sx>=w||sy>=h) return;
            let imgD = ctx.getImageData(0,0,w,h), d = imgD.data, idx = (sy*w+sx)*4;
            let tr=d[idx], tg=d[idx+1], tb=d[idx+2], ta=d[idx+3], c = hToRgb(pen.color);
            if(tr===c.r&&tg===c.g&&tb===c.b&&ta===c.a) return;
            let q = [sx, sy], seen = new Uint8Array(w*h);
            seen[sy*w+sx] = 1;
            while(q.length > 0) {
                let y = q.pop(), x = q.pop(), i = (y*w+x)*4;
                d[i]=c.r; d[i+1]=c.g; d[i+2]=c.b; d[i+3]=c.a;
                let n = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
                for(let p of n) {
                    let nx=p[0], ny=p[1];
                    if(nx>=0&&ny>=0&&nx<w&&ny<h&&!seen[ny*w+nx]) {
                        let ni=(ny*w+nx)*4, dr=d[ni]-tr, dg=d[ni+1]-tg, db=d[ni+2]-tb, da=d[ni+3]-ta;
                        if(Math.sqrt(dr*dr+dg*dg+db*db+da*da)<=tol) { seen[ny*w+nx]=1; q.push(nx, ny); }
                    }
                }
            }
            ctx.putImageData(imgD, 0, 0);
        }

        isvalid(inputImageDataURI) {
            return inputImageDataURI && inputImageDataURI !== "" && inputImageDataURI !== null && inputImageDataURI !== undefined && inputImageDataURI !== "null" && inputImageDataURI !== "undefined";
        }

        async applyGLSL(a) {
            const glslInput = String(a.G || "");
            const inputImageDataURI = String(a.I || "").trim();
            
            let glsl = glslInput.replace(/\|/g, '\n');

            const w = canvas.width;
            const h = canvas.height;
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            
            const gl = c.getContext('webgl2', { preserveDrawingBuffer: true });
            if (!gl) return;

            const cleanup = (g) => {
                const ext = g.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
            };

            const vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, `#version 300 es
            in vec2 p; out vec2 v_uv;
            void main(){ v_uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`);
            gl.compileShader(vs);

            const fs = gl.createShader(gl.FRAGMENT_SHADER);
            const fsSource = `#version 300 es
            precision highp float;
            in vec2 v_uv;
            uniform vec3 iResolution;
            uniform float iTime;
            uniform sampler2D iChannel0;
            uniform sampler2D iChannel1;
            out vec4 P7_OUT_COL;
            
            ${glsl}

            void main() {
                vec4 col = vec4(0.0);
                mainImage(col, v_uv * iResolution.xy);
                P7_OUT_COL = col;
            }`;

            gl.shaderSource(fs, fsSource);
            gl.compileShader(fs);

            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                const err = gl.getShaderInfoLog(fs);
                console.error("Shader Compile Error:", err);
                
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = 'red';
                
                const fontSize = Math.max(8, Math.floor(w / 25));
                ctx.font = `${fontSize}px monospace`;
                const lines = err.split('\n');
                let drawY = fontSize;
                
                for (let line of lines) {
                    if (drawY > h) break;
                    let words = line.split(' ');
                    let currentLine = '';
                    for (let word of words) {
                        let test = currentLine + word + ' ';
                        if (ctx.measureText(test).width > w - 10 && currentLine !== '') {
                            ctx.fillText(currentLine, 5, drawY);
                            currentLine = word + ' ';
                            drawY += fontSize;
                        } else {
                            currentLine = test;
                        }
                    }
                    ctx.fillText(currentLine, 5, drawY);
                    drawY += fontSize;
                }
                
                cleanup(gl);
                return;
            }

            const prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            gl.useProgram(prog);

            let img0 = null;
            if (inputImageDataURI !== "" && this.isvalid(inputImageDataURI)) {
                img0 = await loadI(inputImageDataURI);
            }
            if (!img0) img0 = canvas; 

            const setupTexture = (unit, source) => {
                const tex = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                return tex;
            };

            const t0 = setupTexture(0, img0);
            const t1 = setupTexture(1, canvas);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(prog, 'p');
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

            gl.uniform3f(gl.getUniformLocation(prog, 'iResolution'), w, h, 1.0);
            gl.uniform1f(gl.getUniformLocation(prog, 'iTime'), performance.now() / 1000);
            gl.uniform1i(gl.getUniformLocation(prog, 'iChannel0'), 0);
            gl.uniform1i(gl.getUniformLocation(prog, 'iChannel1'), 1);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(c, 0, 0);

            gl.deleteTexture(t0);
            gl.deleteTexture(t1);
            gl.deleteBuffer(buf);
            gl.deleteProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            cleanup(gl);
        }

        repColor(a) {
            let tol = Scratch.Cast.toNumber(a.V), t = hToRgb(a.C), c = hToRgb(pen.color);
            let imgD = ctx.getImageData(0,0,canvas.width,canvas.height), d = imgD.data;
            for(let i=0; i<d.length; i+=4) {
                let dr=d[i]-t.r, dg=d[i+1]-t.g, db=d[i+2]-t.b, da=d[i+3]-t.a;
                if(Math.sqrt(dr*dr+dg*dg+db*db+da*da)<=tol) { d[i]=c.r; d[i+1]=c.g; d[i+2]=c.b; d[i+3]=c.a; }
            }
            ctx.putImageData(imgD, 0, 0);
        }
        exportImg(a) { return canvas.toDataURL(a.F==='jpeg'?'image/jpeg':(a.F==='webp'?'image/webp':'image/png')); }
        clearImg() { reset(); }
    }
    Scratch.extensions.register(new ImageEditingPlus());
})(Scratch);
