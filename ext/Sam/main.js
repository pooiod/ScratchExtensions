// Sam Speech, generate speech from text using better sam (imrane03.github.io/better-sam)
// An extension by pooiod7 (github.com/pooiod)

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed!');
    }

    const opts = {
        debug: 1,
        pitch: 64,
        speed: 72,
        mouth: 128,
        throat: 128
    };
    const VOICE_PARAMS = {
        pitch: 'Pitch',
        speed: 'Speed',
        mouth: 'Mouth',
        throat: 'Throat'
    };

    const float32ToWavDataURI = (float32Array, sampleRate = 22050) => {
        const numChannels = 1;
        const bitDepth = 32;
        const format = 3;

        const buffer = new ArrayBuffer(44 + float32Array.length * 4);
        const view = new DataView(buffer);
        let offset = 0;

        const writeString = (s) => {
            for (let i = 0; i < s.length; i++) {
                view.setUint8(offset + i, s.charCodeAt(i));
            }
            offset += s.length;
        };

        const writeUint32 = (v) => {
            view.setUint32(offset, v, true);
            offset += 4;
        };

        const writeUint16 = (v) => {
            view.setUint16(offset, v, true);
            offset += 2;
        };

        writeString('RIFF');
        writeUint32(36 + float32Array.length * 4);
        writeString('WAVE');

        writeString('fmt ');
        writeUint32(16);
        writeUint16(format);
        writeUint16(numChannels);
        writeUint32(sampleRate);
        writeUint32(sampleRate * numChannels * (bitDepth / 8));
        writeUint16(numChannels * (bitDepth / 8));
        writeUint16(bitDepth);

        writeString('data');
        writeUint32(float32Array.length * 4);

        const floatView = new Float32Array(buffer, offset);
        floatView.set(float32Array);
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;

        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return 'data:audio/wav;base64,' + btoa(binary);
    };

    class SamSpeech {
        getInfo() {
            return {
                id: 'P7SamSpeech',
                name: 'SAM Speech',
                color1: '#cb00ddff',
                blocks: [
                    {
                        opcode: 'speakText',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Speak [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "What's up gamers!"
                            }
                        }
                    },
                    {
                        opcode: 'getSpeechDataURI',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Generate speech [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "What's up gamers!"
                            }
                        }
                    },

                    {
                        opcode: 'setVoiceParam',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set [PARAM] to [VALUE]',
                        arguments: {
                            PARAM: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'paramsMenu',
                                defaultValue: 'pitch'
                            },
                            VALUE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 64
                            }
                        }
                    },
                    {
                        opcode: 'getVoiceParam',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '[PARAM]',
                        arguments: {
                            PARAM: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'paramsMenu',
                                defaultValue: 'pitch'
                            }
                        }
                    },
                ],
                menus: {
                    paramsMenu: {
                        acceptReporters: false,
                        items: Object.keys(VOICE_PARAMS).map(key => ({
                            text: VOICE_PARAMS[key],
                            value: key
                        }))
                    }
                }
            };
        }

        speakText(args) {
            const text = String(args.TEXT);
            new SamJs(opts).speak(text);
        }

        getSpeechDataURI(args) {
            const text = String(args.TEXT);
            const sam = new SamJs(opts);
            
            try {
                const float32Array = sam.buf32(text);
                return float32ToWavDataURI(float32Array);
            } catch (e) {
                console.error("Something bad happened ᕲ:", e);
                return '';
            }
        }

        setVoiceParam(args) {
            const param = args.PARAM;
            let value = Number(args.VALUE);
            value = Math.max(0, Math.min(255, value));
            if (Object.prototype.hasOwnProperty.call(opts, param)) {
                opts[param] = value;
            }
        }

        getVoiceParam(args) {
            const param = args.PARAM;
            return opts[param] || 0;
        }
    }

    // SamJs.js v0.1.2 (minified) - A Javascript port of "SAM Software Automatic Mouth".
    // (c) 2017-2020 Christian Schiffler <c.schiffler@cyberspectrum.de>
    // @link(https://github.com/discordier/sam)*/
    !function(n,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(n=n||self).SamJs=e()}(this,(function(){"use strict";function matchesBitmask(n,e){return 0!=(n&e)}function text2Uint8Array(n){var e=new Uint8Array(n.length);return n.split("").forEach((function(n,r){e[r]=n.charCodeAt(0)})),e}function Uint32ToUint8Array(n){var e=new Uint8Array(4);return e[0]=n,e[1]=n>>8,e[2]=n>>16,e[3]=n>>24,e}function Uint16ToUint8Array(n){var e=new Uint8Array(2);return e[0]=n,e[1]=n>>8,e}var n=null;function PlayBuffer(e){if(null===n&&(n=new AudioContext),!n)throw new Error("No player available!");return function Play(n,e){return new Promise((function(r){for(var o=n.createBufferSource(),t=n.createBuffer(1,e.length,22050),a=t.getChannelData(0),i=0;i<e.length;i++)a[i]=e[i];o.buffer=t,o.connect(n.destination),o.onended=function(){r(!0)},o.start(0)}))}(n,e)}var e={" ":0,"!":2,'"':2,"#":2,$:2,"%":2,"&":2,"'":130,"(":0,")":0,"*":2,"+":2,",":2,"-":2,".":2,"/":2,0:3,1:3,2:3,3:3,4:3,5:3,6:3,7:3,8:3,9:3,":":2,";":2,"<":2,"=":2,">":2,"?":2,"@":2,A:192,B:168,C:176,D:172,E:192,F:160,G:184,H:160,I:192,J:188,K:160,L:172,M:168,N:172,O:192,P:160,Q:160,R:172,S:180,T:164,U:192,V:168,W:168,X:176,Y:192,Z:188,"[":0,"\\":0,"]":0,"^":2,_:0,"`":32},r=128,flags=function(n,r){return 0!=(e[n]&r)},flagsAt=function(n,e,r){return flags(n[e],r)},isOneOf=function(n,e){return-1!==e.indexOf(n)};function reciterRule(n){var e=n.split("="),o=e.pop(),t=e.join("=").split("("),a=t.pop().split(")"),i=t[0],H=a[0],E=a[1],A=["T","C","S"],s=["E","I","Y"],matches=function(n,e){return!!n.startsWith(H,e)&&(!!function(n,e){for(var o=i.length-1;o>-1;o--){var t=i[o];if(flags(t,r)){if(n[--e]!==t)return!1}else if(!{" ":function(){return!flagsAt(n,--e,r)},"#":function(){return flagsAt(n,--e,64)},".":function(){return flagsAt(n,--e,8)},"&":function(){return flagsAt(n,--e,16)||isOneOf(n.substr(--e,2),["CH","SH"])},"@":function(){if(flagsAt(n,--e,4))return!0;var r=n[e];if("H"!==r)return!1;if(!isOneOf(r,A))return!1;throw new Error("Is always false but happened? "+r)},"^":function(){return flagsAt(n,--e,32)},"+":function(){return isOneOf(n[--e],s)},":":function(){for(;e>=0&&flagsAt(n,e-1,32);)e--;return!0}}[t]())return!1}return!0}(n,e)&&function(n,e){for(var o=0;o<E.length;o++){var t=E[o];if(flags(t,r)){if(n[++e]!==t)return!1}else if(!{" ":function(){return!flagsAt(n,++e,r)},"#":function(){return flagsAt(n,++e,64)},".":function(){return flagsAt(n,++e,8)},"&":function(){return flagsAt(n,++e,16)||isOneOf(n.substr(++e-2,2),["HC","HS"])},"@":function(){if(flagsAt(n,++e,4))return!0;var r=n[e];if("H"!==r)return!1;if(!isOneOf(r,A))return!1;throw new Error("This should not be possible ",r)},"^":function(){return flagsAt(n,++e,32)},"+":function(){return isOneOf(n[++e],s)},":":function(){for(;flagsAt(n,e+1,32);)e++;return!0},"%":function(){return"E"!==n[e+1]?"ING"===n.substr(e+1,3)&&(e+=3,!0):flagsAt(n,e+2,r)?isOneOf(n[e+2],["R","S","D"])?(e+=2,!0):"L"!==n[e+2]?"FUL"===n.substr(e+2,3)&&(e+=4,!0):"Y"===n[e+3]&&(e+=3,!0):(e++,!0)}}[t]())return!1}return!0}(n,e+(H.length-1)))},result=function(n,e,r){if(matches(n,e))return console.log(t+" -> "+o),r(o,H.length),!0};return result.c=H[0],result}var o={};" (A.)=EH4Y. |(A) =AH| (ARE) =AAR| (AR)O=AXR|(AR)#=EH4R| ^(AS)#=EY4S|(A)WA=AX|(AW)=AO5| :(ANY)=EH4NIY|(A)^+#=EY5|#:(ALLY)=ULIY| (AL)#=UL|(AGAIN)=AXGEH4N|#:(AG)E=IHJ|(A)^%=EY|(A)^+:#=AE| :(A)^+ =EY4| (ARR)=AXR|(ARR)=AE4R| ^(AR) =AA5R|(AR)=AA5R|(AIR)=EH4R|(AI)=EY4|(AY)=EY5|(AU)=AO4|#:(AL) =UL|#:(ALS) =ULZ|(ALK)=AO4K|(AL)^=AOL| :(ABLE)=EY4BUL|(ABLE)=AXBUL|(A)VO=EY4|(ANG)+=EY4NJ|(ATARI)=AHTAA4RIY|(A)TOM=AE|(A)TTI=AE| (AT) =AET| (A)T=AH|(A)=AE| (B) =BIY4| (BE)^#=BIH|(BEING)=BIY4IHNX| (BOTH) =BOW4TH| (BUS)#=BIH4Z|(BREAK)=BREY5K|(BUIL)=BIH4L|(B)=B| (C) =SIY4| (CH)^=K|^E(CH)=K|(CHA)R#=KEH5|(CH)=CH| S(CI)#=SAY4|(CI)A=SH|(CI)O=SH|(CI)EN=SH|(CITY)=SIHTIY|(C)+=S|(CK)=K|(COMMODORE)=KAA4MAHDOHR|(COM)=KAHM|(CUIT)=KIHT|(CREA)=KRIYEY|(C)=K| (D) =DIY4| (DR.) =DAA4KTER|#:(DED) =DIHD|.E(D) =D|#:^E(D) =T| (DE)^#=DIH| (DO) =DUW| (DOES)=DAHZ|(DONE) =DAH5N|(DOING)=DUW4IHNX| (DOW)=DAW|#(DU)A=JUW|#(DU)^#=JAX|(D)=D| (E) =IYIY4|#:(E) =|':^(E) =| :(E) =IY|#(ED) =D|#:(E)D =|(EV)ER=EH4V|(E)^%=IY4|(ERI)#=IY4RIY|(ERI)=EH4RIH|#:(ER)#=ER|(ERROR)=EH4ROHR|(ERASE)=IHREY5S|(ER)#=EHR|(ER)=ER| (EVEN)=IYVEHN|#:(E)W=|@(EW)=UW|(EW)=YUW|(E)O=IY|#:&(ES) =IHZ|#:(E)S =|#:(ELY) =LIY|#:(EMENT)=MEHNT|(EFUL)=FUHL|(EE)=IY4|(EARN)=ER5N| (EAR)^=ER5|(EAD)=EHD|#:(EA) =IYAX|(EA)SU=EH5|(EA)=IY5|(EIGH)=EY4|(EI)=IY4| (EYE)=AY4|(EY)=IY|(EU)=YUW5|(EQUAL)=IY4KWUL|(E)=EH| (F) =EH4F|(FUL)=FUHL|(FRIEND)=FREH5ND|(FATHER)=FAA4DHER|(F)F=|(F)=F| (G) =JIY4|(GIV)=GIH5V| (G)I^=G|(GE)T=GEH5|SU(GGES)=GJEH4S|(GG)=G| B#(G)=G|(G)+=J|(GREAT)=GREY4T|(GON)E=GAO5N|#(GH)=| (GN)=N|(G)=G| (H) =EY4CH| (HAV)=/HAE6V| (HERE)=/HIYR| (HOUR)=AW5ER|(HOW)=/HAW|(H)#=/H|(H)=| (IN)=IHN| (I) =AY4|(I) =AY|(IN)D=AY5N|SEM(I)=IY| ANT(I)=AY|(IER)=IYER|#:R(IED) =IYD|(IED) =AY5D|(IEN)=IYEHN|(IE)T=AY4EH|(I')=AY5| :(I)^%=AY5| :(IE) =AY4|(I)%=IY|(IE)=IY4| (IDEA)=AYDIY5AH|(I)^+:#=IH|(IR)#=AYR|(IZ)%=AYZ|(IS)%=AYZ|I^(I)^#=IH|+^(I)^+=AY|#:^(I)^+=IH|(I)^+=AY|(IR)=ER|(IGH)=AY4|(ILD)=AY5LD| (IGN)=IHGN|(IGN) =AY4N|(IGN)^=AY4N|(IGN)%=AY4N|(ICRO)=AY4KROH|(IQUE)=IY4K|(I)=IH| (J) =JEY4|(J)=J| (K) =KEY4| (K)N=|(K)=K| (L) =EH4L|(LO)C#=LOW|L(L)=|#:^(L)%=UL|(LEAD)=LIYD| (LAUGH)=LAE4F|(L)=L| (M) =EH4M| (MR.) =MIH4STER| (MS.)=MIH5Z| (MRS.) =MIH4SIXZ|(MOV)=MUW4V|(MACHIN)=MAHSHIY5N|M(M)=|(M)=M| (N) =EH4N|E(NG)+=NJ|(NG)R=NXG|(NG)#=NXG|(NGL)%=NXGUL|(NG)=NX|(NK)=NXK| (NOW) =NAW4|N(N)=|(NON)E=NAH4N|(N)=N| (O) =OH4W|(OF) =AHV| (OH) =OW5|(OROUGH)=ER4OW|#:(OR) =ER|#:(ORS) =ERZ|(OR)=AOR| (ONE)=WAHN|#(ONE) =WAHN|(OW)=OW| (OVER)=OW5VER|PR(O)V=UW4|(OV)=AH4V|(O)^%=OW5|(O)^EN=OW|(O)^I#=OW5|(OL)D=OW4L|(OUGHT)=AO5T|(OUGH)=AH5F| (OU)=AW|H(OU)S#=AW4|(OUS)=AXS|(OUR)=OHR|(OULD)=UH5D|(OU)^L=AH5|(OUP)=UW5P|(OU)=AW|(OY)=OY|(OING)=OW4IHNX|(OI)=OY5|(OOR)=OH5R|(OOK)=UH5K|F(OOD)=UW5D|L(OOD)=AH5D|M(OOD)=UW5D|(OOD)=UH5D|F(OOT)=UH5T|(OO)=UW5|(O')=OH|(O)E=OW|(O) =OW|(OA)=OW4| (ONLY)=OW4NLIY| (ONCE)=WAH4NS|(ON'T)=OW4NT|C(O)N=AA|(O)NG=AO| :^(O)N=AH|I(ON)=UN|#:(ON)=UN|#^(ON)=UN|(O)ST=OW|(OF)^=AO4F|(OTHER)=AH5DHER|R(O)B=RAA|^R(O):#=OW5|(OSS) =AO5S|#:^(OM)=AHM|(O)=AA| (P) =PIY4|(PH)=F|(PEOPL)=PIY5PUL|(POW)=PAW4|(PUT) =PUHT|(P)P=|(P)S=|(P)N=|(PROF.)=PROHFEH4SER|(P)=P| (Q) =KYUW4|(QUAR)=KWOH5R|(QU)=KW|(Q)=K| (R) =AA5R| (RE)^#=RIY|(R)R=|(R)=R| (S) =EH4S|(SH)=SH|#(SION)=ZHUN|(SOME)=SAHM|#(SUR)#=ZHER|(SUR)#=SHER|#(SU)#=ZHUW|#(SSU)#=SHUW|#(SED)=ZD|#(S)#=Z|(SAID)=SEHD|^(SION)=SHUN|(S)S=|.(S) =Z|#:.E(S) =Z|#:^#(S) =S|U(S) =S| :#(S) =Z|##(S) =Z| (SCH)=SK|(S)C+=|#(SM)=ZUM|#(SN)'=ZUM|(STLE)=SUL|(S)=S| (T) =TIY4| (THE) #=DHIY| (THE) =DHAX|(TO) =TUX| (THAT)=DHAET| (THIS) =DHIHS| (THEY)=DHEY| (THERE)=DHEHR|(THER)=DHER|(THEIR)=DHEHR| (THAN) =DHAEN| (THEM) =DHAEN|(THESE) =DHIYZ| (THEN)=DHEHN|(THROUGH)=THRUW4|(THOSE)=DHOHZ|(THOUGH) =DHOW|(TODAY)=TUXDEY|(TOMO)RROW=TUMAA5|(TO)TAL=TOW5| (THUS)=DHAH4S|(TH)=TH|#:(TED)=TIXD|S(TI)#N=CH|(TI)O=SH|(TI)A=SH|(TIEN)=SHUN|(TUR)#=CHER|(TU)A=CHUW| (TWO)=TUW|&(T)EN =|(T)=T| (U) =YUW4| (UN)I=YUWN| (UN)=AHN| (UPON)=AXPAON|@(UR)#=UH4R|(UR)#=YUH4R|(UR)=ER|(U)^ =AH|(U)^^=AH5|(UY)=AY5| G(U)#=|G(U)%=|G(U)#=W|#N(U)=YUW|@(U)=UW|(U)=YUW| (V) =VIY4|(VIEW)=VYUW5|(V)=V| (W) =DAH4BULYUW| (WERE)=WER|(WA)SH=WAA|(WA)ST=WEY|(WA)S=WAH|(WA)T=WAA|(WHERE)=WHEHR|(WHAT)=WHAHT|(WHOL)=/HOWL|(WHO)=/HUW|(WH)=WH|(WAR)#=WEHR|(WAR)=WAOR|(WOR)^=WER|(WR)=R|(WOM)A=WUHM|(WOM)E=WIHM|(WEA)R=WEH|(WANT)=WAA5NT|ANS(WER)=ER|(W)=W| (X) =EH4KR| (X)=Z|(X)=KS| (Y) =WAY4|(YOUNG)=YAHNX| (YOUR)=YOHR| (YOU)=YUW| (YES)=YEHS| (Y)=Y|F(Y)=AY|PS(YCH)=AYK|#:^(Y)=IY|#:^(Y)I=IY| :(Y) =AY| :(Y)#=AY| :(Y)^+:#=IH| :(Y)^#=AY|(Y)=IH| (Z) =ZIY4|(Z)=Z".split("|").map((function(n){var e=reciterRule(n),r=e.c;o[r]=o[r]||[],o[r].push(e)}));var t='(A)=|(!)=.|(") =-AH5NKWOWT-|(")=KWOW4T-|(#)= NAH4MBER|($)= DAA4LER|(%)= PERSEH4NT|(&)= AEND|(\')=|(*)= AE4STERIHSK|(+)= PLAH4S|(,)=,| (-) =-|(-)=|(.)= POYNT|(/)= SLAE4SH|(0)= ZIY4ROW| (1ST)=FER4ST| (10TH)=TEH4NTH|(1)= WAH4N| (2ND)=SEH4KUND|(2)= TUW4| (3RD)=THER4D|(3)= THRIY4|(4)= FOH4R| (5TH)=FIH4FTH|(5)= FAY4V| (64) =SIH4KSTIY FOHR|(6)= SIH4KS|(7)= SEH4VUN| (8TH)=EY4TH|(8)= EY4T|(9)= NAY4N|(:)=.|(;)=.|(<)= LEH4S DHAEN|(=)= IY4KWULZ|(>)= GREY4TER DHAEN|(?)=?|(@)= AE6T|(^)= KAE4RIXT'.split("|").map(reciterRule);var a=254,i=255,H="*12345678".split(""),E=" *.*?*,*-*IYIHEHAEAAAHAOUHAXIXERUXOHRXLXWXYXWHR*L*W*Y*M*N*NXDXQ*S*SHF*TH/H/XZ*ZHV*DHCH**J*******EYAYOYAWOWUWB*****D*****G*****GX****P*****T*****K*****KX****ULUMUN".match(/.{1,2}/g),A=[32768,49408,49408,49408,49408,164,164,164,164,164,164,132,132,164,164,132,132,132,132,132,132,132,68,4164,4164,4164,4164,2124,3148,2124,1096,16460,9280,8256,8256,9280,64,64,9284,8260,8260,9284,8264,8256,76,8260,0,0,180,180,180,148,148,148,78,78,78,1102,1102,1102,78,78,78,78,78,78,75,75,75,1099,1099,1099,75,75,75,75,75,75,128,193,193],s=[0,4626,4626,4626,2056,2824,2312,2824,3592,3851,2822,4108,3082,1541,1541,3595,3082,3594,3082,2825,2056,2055,2825,2567,2310,2056,2054,2055,2055,2055,770,1285,514,514,514,514,514,514,1542,1542,2055,1542,1542,514,2312,1027,513,286,3597,3852,3852,3852,3598,3593,2054,513,514,1797,513,257,1798,513,514,1798,513,514,2056,514,514,1540,514,514,1798,513,1028,1798,257,1028,1479,1535];function full_match(n,e){var r=E.findIndex((function(r){return r===n+e&&"*"!==r[1]}));return-1!==r&&r}function wild_match(n){var e=E.findIndex((function(e){return e===n+"*"}));return-1!==e&&e}function phonemeHasFlag(n,e){return matchesBitmask(A[n],e)}var f=23,l=57,u=69,O=1,c=2,R=8192,I=4096,U=2048,N=1024,Y=256,T=128,S=64,h=32,W=16,g=8,L=4,p=2,v=1;function Parser(n){if(!n)return!1;var getPhoneme=function(n){if(n<0||n>o.length)throw new Error("Out of bounds: "+n);return n===o.length-1?i:o[n]},setPhoneme=function(n,e){console.log(n+" CHANGE: "+E[o[n]]+" -> "+E[e]),o[n]=e},insertPhoneme=function(n,t,a,i){console.log(n+" INSERT: "+E[t]);for(var H=o.length-1;H>=n;H--)o[H+1]=o[H],r[H+1]=getLength(H),e[H+1]=getStress(H);o[n]=t,r[n]=0|i,e[n]=a},getStress=function(n){return 0|e[n]},getLength=function(n){return 0|r[n]},setLength=function(n,e){if(console.log(n+' "'+E[o[n]]+'" SET LENGTH: '+r[n]+" -> "+e),0!=(128&e))throw new Error("Got the flag 0x80, see CopyStress() and SetPhonemeLength() comments!");if(n<0||n>o.length)throw new Error("Out of bounds: "+n);r[n]=e},e=[],r=[],o=[],t=0;!function Parser1(n,e,r){for(var o=0;o<n.length;o++){var t=n.toLowerCase();console.log('processing "'+t.substr(0,o)+"%c"+t.substr(o,2).toUpperCase()+"%c"+t.substr(o+2)+'"',"color: red;","color:normal;");var a=n[o],i=void 0;if(!1===(i=full_match(a,n[o+1]||"")))if(!1===(i=wild_match(a))){for(i=H.length;a!==H[i]&&i>0;)--i;if(0===i)throw Error("Could not parse char "+a);r(i)}else e(i);else o++,e(i)}}(n,(function(n){e[t]=0,r[t]=0,o[t++]=n}),(function(n){if(0!=(128&n))throw new Error("Got the flag 0x80, see CopyStress() and SetPhonemeLength() comments!");e[t-1]=n})),o[t]=i,PrintPhonemes(o,r,e),function Parser2(n,e,r,o){for(var t,handleUW_CH_J=function(t,a){switch(t){case 53:phonemeHasFlag(r(a-1),N)&&(console.log(a+" RULE: <ALVEOLAR> UW -> <ALVEOLAR> UX"),e(a,16));break;case 42:console.log(a+" RULE: CH -> CH CH+1"),n(a+1,43,o(a));break;case 44:console.log(a+" RULE: J -> J J+1"),n(a+1,45,o(a))}},changeAX=function(t,a){console.log(t+" RULE: "+E[r(t)]+" -> AX "+E[a]),e(t,13),n(t+1,a,o(t))},a=-1;(t=r(++a))!==i;)if(0!==t)if(phonemeHasFlag(t,W))console.log(phonemeHasFlag(t,h)?a+" RULE: insert YX following diphthong ending in IY sound":a+" RULE: insert WX following diphthong NOT ending in IY sound"),n(a+1,phonemeHasFlag(t,h)?21:20,o(a)),handleUW_CH_J(t,a);else if(78!==t)if(79!==t)if(80!==t)if(phonemeHasFlag(t,T)&&o(a))r(a+1)||(t=r(a+2))!==i&&phonemeHasFlag(t,T)&&o(a+2)&&(console.log(a+2+" RULE: Insert glottal stop between two stressed vowels with space between them"),n(a+2,31,0));else{var H=0===a?i:r(a-1);if(t!==f)if(24===t&&phonemeHasFlag(H,T))console.log(a+" <VOWEL> L* -> <VOWEL> LX"),e(a,19);else if(60!==H||32!==t)if(60!==t){if(72===t){var A=r(a+1);phonemeHasFlag(A,h)&&A!==i||(console.log(a+" K <VOWEL OR DIPTHONG NOT ENDING WITH IY> -> KX <VOWEL OR DIPTHONG NOT ENDING WITH IY>"),e(a,75),t=75)}phonemeHasFlag(t,v)&&32===H?(console.log(a+" RULE: S* "+E[t]+" -> S* "+E[t-12]),e(a,t-12)):phonemeHasFlag(t,v)||handleUW_CH_J(t,a),69!==t&&57!==t?console.log(a+": "+E[t]):a>0&&phonemeHasFlag(r(a-1),T)&&((t=r(a+1))||(t=r(a+2)),phonemeHasFlag(t,T)&&!o(a+1)&&(console.log(a+" Soften T or D following vowel or ER and preceding a pause -> DX"),e(a,30)))}else{var s=r(a+1);phonemeHasFlag(s,h)||s===i||(console.log(a+" RULE: G <VOWEL OR DIPTHONG NOT ENDING WITH IY> -> GX <VOWEL OR DIPTHONG NOT ENDING WITH IY>"),e(a,63))}else console.log(a+" G S -> G Z"),e(a,38);else switch(H){case u:console.log(a+" RULE: T* R* -> CH R*"),e(a-1,42);break;case l:console.log(a+" RULE: D* R* -> J* R*"),e(a-1,44);break;default:phonemeHasFlag(H,T)&&(console.log(a+" <VOWEL> R* -> <VOWEL> RX"),e(a,18))}}else changeAX(a,28);else changeAX(a,27);else changeAX(a,24)}(insertPhoneme,setPhoneme,getPhoneme,getStress),function CopyStress(n,e,r){for(var o,t=0;(o=n(t))!==i;){if(phonemeHasFlag(o,S)&&(o=n(t+1))!==i&&phonemeHasFlag(o,T)){var a=e(t+1);0!==a&&a<128&&r(t,a+1)}++t}}(getPhoneme,getStress,(function(n,r){console.log(n+' "'+E[o[n]]+'" SET STRESS: '+e[n]+" -> "+r),e[n]=r})),function SetPhonemeLength(n,e,r){for(var o,t=0;(o=n(t))!==i;){var a=e(t);r(t,0===a||a>127?255&s[o]:s[o]>>8),t++}}(getPhoneme,getStress,setLength),function AdjustLengths(n,e,r){console.log("AdjustLengths()");for(var o=0;n(o)!==i;o++)if(phonemeHasFlag(n(o),Y)){for(var t=o;--o>1&&!phonemeHasFlag(n(o),T););if(0===o)break;for(var a=o;o<t;o++)if(!phonemeHasFlag(n(o),R)||phonemeHasFlag(n(o),L)){var H=r(o);console.log(o+" RULE: Lengthen <!FRICATIVE> or <VOICED> "+E[n(o)]+" between VOWEL:"+E[n(a)]+" and PUNCTUATION:"+E[n(o)]+" by 1.5"),e(o,(H>>1)+H+1)}}for(var s,f=-1;(s=n(++f))!==i;){var l=f;if(phonemeHasFlag(s,T)){if(!phonemeHasFlag(s=n(++l),S)){18!==s&&19!==s||!phonemeHasFlag(n(++l),S)||(console.log(f+" RULE: <VOWEL "+E[n(f)]+">"+E[s]+" <CONSONANT: "+E[n(l)]+"> - decrease length of vowel by 1"),e(f,r(f)-1));continue}var u=s===i?S|v:A[s];if(!matchesBitmask(u,L)){if(matchesBitmask(u,v)){console.log(f+" <VOWEL> <UNVOICED PLOSIVE> - decrease vowel by 1/8th");var O=r(f);e(f,O-(O>>3))}continue}console.log(f+" RULE: <VOWEL> <VOWEL or VOICED CONSONANT> - increase vowel by 1/4 + 1");var c=r(f);e(f,(c>>2)+c+1)}else if(phonemeHasFlag(s,U))(s=n(++l))!==i&&phonemeHasFlag(s,p)&&(console.log(l+" RULE: <NASAL> <STOP CONSONANT> - set nasal = 5, consonant = 6"),e(l,6),e(l-1,5));else if(phonemeHasFlag(s,p)){for(;0===(s=n(++l)););s!==i&&phonemeHasFlag(s,p)&&(console.log(l+" RULE: <STOP CONSONANT> {optional silence} <STOP CONSONANT> - shorten both to 1/2 + 1"),e(l,1+(r(l)>>1)),e(f,1+(r(f)>>1)))}else l>0&&phonemeHasFlag(s,I)&&phonemeHasFlag(n(l-1),p)&&(console.log(l+" RULE: <STOP CONSONANT> <LIQUID> - decrease by 2"),e(l,r(l)-2))}}(getPhoneme,setLength,getLength),function ProlongPlosiveStopConsonantsCode41240(n,e,r){for(var o,t=-1;(o=n(++t))!==i;)if(phonemeHasFlag(o,p)){if(phonemeHasFlag(o,v)){var a=void 0,H=t;do{a=n(++H)}while(0===a);if(a!==i&&(phonemeHasFlag(a,g)||36===a||37===a))continue}e(t+1,o+1,r(t),255&s[o+1]),e(t+2,o+2,r(t),255&s[o+2]),t+=2}}(getPhoneme,insertPhoneme,getStress);for(var O=0;O<o.length;O++)if(o[O]>80){o[O]=i;break}return function InsertBreath(n,e,r,o,t,H){for(var E,A=255,s=0,f=-1;(E=n(++f))!==i;)if((s+=t(f))<232){if(phonemeHasFlag(E,Y)){s=0,r(f+1,a,0,0);continue}0===E&&(A=f)}else e(f=A,31),H(f,4),o(f,0),s=0,r(f+1,a,0,0)}(getPhoneme,setPhoneme,insertPhoneme,getStress,getLength,setLength),PrintPhonemes(o,r,e),o.map((function(n,o){return[n,0|r[o],0|e[o]]}))}function PrintPhonemes(n,e,r){function pad(n){var e="000"+n;return e.substr(e.length-3)}console.log("=================================="),console.log("Internal Phoneme presentation:"),console.log(" pos  idx  phoneme  length  stress"),console.log("----------------------------------");for(var loop=function(o){var t;console.log(" %s  %s  %s       %s     %s",pad(o),pad(n[o]),(t=n[o],n[o]<81?E[n[o]]:t===a?"  ":"??"),pad(e[o]),pad(r[o]))},o=0;o<n.length;o++)loop(o);console.log("==================================")}var D=[24,26,23,23,23],d=[0,224,230,236,243,249,0,6,12,6],m=[0,31,31,31,31,2,2,2,2,2,2,2,2,2,5,5,2,10,2,8,5,5,11,10,9,8,8,160,8,8,23,31,18,18,18,18,30,30,20,20,20,20,23,23,26,26,29,29,2,2,2,2,2,2,26,29,27,26,29,27,26,29,27,26,29,27,23,29,23,23,29,23,23,29,23,23,29,23,23,23],G=[0,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,4,4,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,0,1,0,1,0,5,5,5,5,5,4,4,2,0,1,2,0,1,2,0,1,2,0,1,2,0,2,2,0,1,3,0,2,3,0,2,160,160],F=[0,2,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,4,4,3,3,3,3,3,1,2,3,2,1,3,3,3,3,1,1,3,3,3,2,2,3,2,3,0,0,5,5,5,5,4,4,2,0,2,2,0,3,2,0,4,2,0,3,2,0,2,2,0,2,3,0,3,3,0,3,176,160],C=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,241,226,211,187,124,149,1,2,3,3,0,114,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,0,0,25,0,0,0,0,0,0,0,0,0],P=[0,5980947,5980947,5980947,5980947,7230474,6113294,5980690,5783064,5842970,5712918,5774868,5383184,5843988,6113294,4075538,5383182,5774866,4076050,7218192,5250060,6112270,5904394,3944978,7216654,5904394,7229960,5320198,7943686,6641158,7943686,5980945,6506758,6967046,5315078,7946758,6113550,5383440,6107913,6767114,4990984,6106890,6639366,6639366,7946758,6639365,7958022,0,5916690,5776922,5774868,5777946,5774866,5382668,5315078,5315078,5315078,7946758,7946758,7946758,7368198,7237126,7237126,6181894,6181894,6181894,5315078,5315078,5315078,7946758,7946758,7946758,6647046,6641162,7367946,6181894,6181894,6181894,556844,98067],w=[0,0,0,0,0,526861,461581,527630,527887,68879,68623,3087,68367,2316,461581,330508,68623,3087,396301,67597,2061,461838,2061,330252,67597,2061,526861,780,2313,198153,0,0,0,0,0,0,0,0,779,66827,779,1035,0,0,1,66827,920064,66050,593422,68879,3087,68879,3087,2061,2,260,0,2,260,0,1,260,0,1,260,0,0,0,0,0,0,0,0,461324,0,0,330240,0,1245199,1048591],b=[56,132,107,25,198,99,24,134,115,152,198,177,28,202,49,140,199,49,136,194,48,152,70,49,24,198,53,12,202,49,12,198,33,16,36,105,18,194,49,20,196,113,8,74,34,73,171,106,168,172,73,81,50,213,82,136,147,108,148,34,21,84,210,37,150,212,80,165,70,33,8,133,107,24,196,99,16,206,107,24,140,113,25,140,99,53,12,198,51,153,204,108,181,78,162,153,70,33,40,130,149,46,227,48,156,197,48,156,162,177,156,103,49,136,102,89,44,83,24,132,103,80,202,227,10,172,171,48,172,98,48,140,99,16,148,98,177,140,130,40,150,51,152,214,181,76,98,41,165,74,181,156,198,49,20,214,56,156,75,180,134,101,24,174,103,28,166,99,25,150,35,25,132,19,8,166,82,172,202,34,137,110,171,25,140,98,52,196,98,25,134,99,24,196,35,88,214,163,80,66,84,74,173,74,37,17,107,100,137,74,99,57,138,35,49,42,234,162,169,68,197,18,205,66,52,140,98,24,140,99,17,72,102,49,157,68,51,29,70,49,156,198,177,12,205,50,136,196,115,24,134,115,8,214,99,88,7,129,224,240,60,7,135,144,60,124,15,199,192,192,240,124,30,7,128,128,0,28,120,112,241,199,31,192,12,254,28,31,31,14,10,122,192,113,242,131,143,3,15,15,12,0,121,248,97,224,67,15,131,231,24,249,193,19,218,233,99,143,15,131,131,135,195,31,60,112,240,225,225,227,135,184,113,14,32,227,141,72,120,28,147,135,48,225,193,193,228,120,33,131,131,195,135,6,57,229,195,135,7,14,28,28,112,244,113,156,96,54,50,195,30,60,243,143,14,60,112,227,199,143,15,15,14,60,120,240,227,135,6,240,227,7,193,153,135,15,24,120,112,112,252,243,16,177,140,140,49,124,112,225,134,60,100,108,176,225,227,15,35,143,15,30,62,56,60,56,123,143,7,14,60,244,23,30,60,120,242,158,114,73,227,37,54,56,88,57,226,222,60,120,120,225,199,97,225,225,176,240,240,195,199,14,56,192,240,206,115,115,24,52,176,225,199,142,28,60,248,56,240,225,193,139,134,143,28,120,112,240,120,172,177,143,57,49,219,56,97,195,14,14,56,120,115,23,30,57,30,56,100,225,241,193,78,15,64,162,2,197,143,129,161,252,18,8,100,224,60,34,224,69,7,142,12,50,144,240,31,32,73,224,248,12,96,240,23,26,65,170,164,208,141,18,130,30,30,3,248,62,3,12,115,128,112,68,38,3,36,225,62,4,78,4,28,193,9,204,158,144,33,7,144,67,100,192,15,198,144,156,193,91,3,226,29,129,224,94,29,3,132,184,44,15,128,177,131,224,48,65,30,67,137,131,80,252,36,46,19,131,241,124,76,44,201,13,131,176,181,130,228,232,6,156,7,160,153,29,7,62,130,143,112,48,116,64,202,16,228,232,15,146,20,63,6,248,132,136,67,129,10,52,57,65,198,227,28,71,3,176,184,19,10,194,100,248,24,249,96,179,192,101,32,96,166,140,195,129,32,48,38,30,28,56,211,1,176,38,64,244,11,195,66,31,133,50,38,96,64,201,203,1,236,17,40,64,250,4,52,224,112,76,140,29,7,105,3,22,200,4,35,232,198,154,11,26,3,224,118,6,5,207,30,188,88,49,113,102,0,248,63,4,252,12,116,39,138,128,113,194,58,38,6,192,31,5,15,152,64,174,1,127,192,7,255,0,14,254,0,3,223,128,3,239,128,27,241,194,0,231,224,24,252,224,33,252,128,60,252,64,14,126,0,63,62,0,15,254,0,31,255,0,62,240,7,252,0,126,16,63,255,0,63,56,14,124,1,135,12,252,199,0,62,4,15,62,31,15,15,31,15,2,131,135,207,3,135,15,63,192,7,158,96,63,192,3,254,0,63,224,119,225,192,254,224,195,224,1,223,248,3,7,0,126,112,0,124,56,24,254,12,30,120,28,124,62,14,31,30,30,62,0,127,131,7,219,135,131,7,199,7,16,113,255,0,63,226,1,224,193,195,225,0,127,192,5,240,32,248,240,112,254,120,121,248,2,63,12,143,3,15,159,224,193,199,135,3,195,195,176,225,225,193,227,224,113,240,0,252,112,124,12,62,56,14,28,112,195,199,3,129,193,199,231,0,15,199,135,25,9,239,196,51,224,193,252,248,112,240,120,248,240,97,199,0,31,248,1,124,248,240,120,112,60,124,206,14,33,131,207,8,7,143,8,193,135,143,128,199,227,0,7,248,224,239,0,57,247,128,14,248,225,227,248,33,159,192,255,3,248,7,192,31,248,196,4,252,196,193,188,135,240,15,192,127,5,224,37,236,192,62,132,71,240,142,3,248,3,251,192,25,248,7,156,12,23,248,7,224,31,161,252,15,252,1,240,63,0,254,3,240,31,0,253,0,255,136,13,249,1,255,0,112,7,192,62,66,243,13,196,127,128,252,7,240,94,192,63,0,120,63,129,255,1,248,1,195,232,12,228,100,143,228,15,240,7,240,194,31,0,127,192,111,128,126,3,248,7,240,63,192,120,15,130,7,254,34,119,112,2,118,3,254,0,254,103,0,124,199,241,142,198,59,224,63,132,243,25,216,3,153,252,9,184,15,248,0,157,36,97,249,13,0,253,3,240,31,144,63,1,248,31,208,15,248,55,1,248,7,240,15,192,63,0,254,3,248,15,192,63,0,250,3,240,15,128,255,1,184,7,240,1,252,1,188,128,19,30,0,127,225,64,127,160,127,176,0,63,192,31,192,56,15,240,31,128,255,1,252,3,241,126,1,254,1,240,255,0,127,192,29,7,240,15,192,126,6,224,7,224,15,248,6,193,254,1,252,3,224,15,0,252],X=[10,14,19,24,27,23,21,16,20,14,18,14,18,18,16,13,15,11,18,14,11,9,6,6,6],K=[19,27,21,27,18,13],M=[84,73,67,63,40,44,31,37,45,73,49,36,30,51,37,29,69,24,50,30,24,83,46,54,86],V=[72,39,31,43,30,34];function trans(n,e){return(n*e>>8&255)<<1}var y=255,B=1;function AddInflection(n,e,r){var o,t=e;for(e<30?e=0:e-=30;127===(o=r[e]);)++e;for(;e!==t;)for(o+=n,r[e]=255&o;++e!==t&&255===r[e];);}function Renderer(n,e,r,o,t,H){e=void 0===e?64:255&e,r=void 0===r?128:255&r,o=void 0===o?128:255&o,t=255&(t||72),H=H||!1;for(var E=function CreateOutputBuffer(n){var e=new Uint8Array(n),r=0,o=0,writer=function(n,e){var r=16*(15&e);writer.ary(n,[r,r,r,r,r])};return writer.ary=function(n,t){if(((r+=[[162,167,167,127,128],[226,60,60,0,0],[225,60,59,0,0],[200,0,0,54,55],[199,0,0,54,54]][o][n])/50|0)>e.length)throw new Error("Buffer overflow, want "+(r/50|0)+" but buffersize is only "+e.length+"!");o=n;for(var a=0;a<5;a++)e[(r/50|0)+a]=t[a]},writer.get=function(){return e.slice(0,r/50|0)},writer}(441*n.reduce((function(n,e){return n+20*e[1]}),0)/50*t|0),A=function SetMouthThroat(n,e){var r=[[],[],[]];P.map((function(n,e){r[0][e]=255&n,r[1][e]=n>>8&255,r[2][e]=n>>16&255}));for(var o=5;o<30;o++)r[0][o]=trans(n,X[o-5]),r[1][o]=trans(e,M[o-5]);for(var t=0;t<6;t++)r[0][t+48]=trans(n,K[t]),r[1][t+48]=trans(e,V[t]);return r}(r,o),s=0,f=[];;){var l=n[s],u=l[0];if(u){if(u===i)return Render(f),E.get();u===a?(Render(f),f=[]):f.push(l)}++s}function Render(n){if(0!==n.length){var r=function CreateFrames(n,e,r){for(var o=[],t=[[],[],[]],a=[[],[],[]],i=[],H=0,E=0;E<e.length;E++){var A=e[E][0];A===O?AddInflection(B,H,o):A===c&&AddInflection(y,H,o);for(var s=d[e[E][2]],f=e[E][1];f>0;f--)t[0][H]=r[0][A],t[1][H]=r[1][A],t[2][H]=r[2][A],a[0][H]=255&w[A],a[1][H]=w[A]>>8&255,a[2][H]=w[A]>>16&255,i[H]=C[A],o[H]=n+s&255,H++}return[o,t,a,i]}(e,n,A),o=r[0],a=r[1],i=r[2],s=r[3],f=function CreateTransitions(n,e,r,o){for(var t,a,i=[n,e[0],e[1],e[2],r[0],r[1],r[2]],Read=function(n,e){if(n<0||n>i.length-1)throw new Error("Error invalid table in Read: "+n);return i[n][e]},interpolate=function(n,e,r,o){for(var t=o<0,a=Math.abs(o)%n,H=o/n|0,E=0,A=n;--A>0;){var s=Read(e,r)+H;if((E+=a)>=n&&(E-=n,t?s--:s&&s++),e<0||e>i.length-1)throw new Error("Error invalid table in Read: "+e);i[e][++r]=s,s+=H}},H=0,E=0;E<o.length-1;E++){var A=o[E][0],s=o[E+1][0],f=m[s],l=m[A];l===f?(t=G[A],a=G[s]):l<f?(t=F[s],a=G[s]):(t=G[A],a=F[A]);var u=(H+=o[E][1])+a,O=H-t,c=t+a;if(0==(c-2&128)){var R=o[E][1]>>1,I=o[E+1][1]>>1;interpolate(R+I,0,O,n[H+I]-n[H-R]);for(var U=1;U<7;U++)interpolate(c,U,O,Read(U,u)-Read(U,O))}}return H+o[o.length-1][1]&255}(o,a,i,n);if(!H)for(var l=0;l<o.length;l++)o[l]-=a[0][l]>>1;for(var u=[0,1,2,2,2,3,3,4,4,5,6,8,9,11,13,15,0],R=i[0].length-1;R>=0;R--)i[0][R]=u[i[0][R]],i[1][R]=u[i[1][R]],i[2][R]=u[i[2][R]];!function PrintOutput(n,e,r,o){function pad(n){var e="00000"+n;return e.substr(e.length-5)}console.log("==========================================="),console.log("Final data for speech output:"),console.log(" flags ampl1 freq1 ampl2 freq2 ampl3 freq3 pitch"),console.log("------------------------------------------------");for(var t=0;t<o.length;t++)console.log(" %s %s %s %s %s %s %s %s",pad(o[t]),pad(r[0][t]),pad(e[0][t]),pad(r[1][t]),pad(e[1][t]),pad(r[2][t]),pad(e[2][t]),pad(n[t])),t++;console.log("===========================================")}(o,a,i,s),function ProcessFrames(n,e,r,o,t,a){var RenderSample=function(n,e,r){var t,a=(7&e)-1,i=256*a&65535,H=248&e;function renderSample(n,e,r,o){var a=8,H=b[i+t];do{0!=(128&H)?E(n,e):E(r,o),H<<=1}while(--a)}if(0===H){var A=o[255&r]>>4^255;t=255&n;do{renderSample(3,26,4,6),t++,t&=255}while(255&++A);return t}t=255^H;var s=255&D[a];do{renderSample(2,5,1,s)}while(255&++t);return n},sinus=function(n){return 127*Math.sin(2*Math.PI*(n/256))|0},i=e,H=0,A=0,s=0,f=0,l=0,u=o[0],O=.75*u|0;for(;n;){var c=a[l];if(0!=(248&c))f=RenderSample(f,c,l),l+=2,n-=2,i=e;else{for(var R=[],I=256*H,U=256*A,N=256*s,Y=0;Y<5;Y++){var T=sinus(255&I>>8),S=sinus(255&U>>8),h=(255&N>>8)<129?-112:112,W=T*(15&t[0][l])+S*(15&t[1][l])+h*(15&t[2][l]);W/=32,W+=128,R[Y]=0|W,I+=256*r[0][l]/4,U+=256*r[1][l]/4,N+=256*r[2][l]/4}if(E.ary(0,R),0===--i){if(l++,0===--n)return;i=e}if(0!==--u){if(0!==--O||0===c){H+=r[0][l],A+=r[1][l],s+=r[2][l];continue}f=RenderSample(f,c,l)}}O=.75*(u=o[l])|0,H=0,A=0,s=0}}(f,t,a,o,i,s)}}}function SamProcess(n,e){void 0===e&&(e={});var r=Parser(n);return!1!==r&&Renderer(r,e.pitch,e.mouth,e.throat,e.speed,e.singmode)}var Z=function TextToPhonemes(n){return function(){for(var a=" "+n.toUpperCase(),i=0,H="",successCallback=function(n,e){i+=e,H+=n},E=0;i<a.length&&E++<1e4;){var A=a.toLowerCase();console.log('processing "'+A.substr(0,i)+"%c"+A[i].toUpperCase()+"%c"+A.substr(i+1)+'"',"color: red;","color:normal;");var s=a[i];if("."!==s||flagsAt(a,i+1,1)){if(flags(s,2)){t.some((function(n){return n(a,i,successCallback)}));continue}if(0!==e[s]){if(!flags(s,r))return!1;o[s].some((function(n){return n(a,i,successCallback)}));continue}H+=" ",i++}else H+=".",i++}return H}()},J=SamProcess,k=function SamBuffer(n,e){var r=SamProcess(n,e);return!1!==r&&function UInt8ArrayToFloat32Array(n){for(var e=new Float32Array(n.length),r=0;r<n.length;r++)e[r]=(n[r]-128)/256;return e}(r)};function SamJs(n){var e=this,r=n||{},ensurePhonetic=function(n,e){return e||r.phonetic?n.toUpperCase():Z(n)};this.buf8=function(n,e){return J(ensurePhonetic(n,e),r)},this.buf32=function(n,e){return k(ensurePhonetic(n,e),r)},this.speak=function(n,r){return PlayBuffer(e.buf32(n,r))},this.download=function(n,r){!function RenderBuffer(n){var e=new Uint8Array(44+n.length),r=0,write=function(n){e.set(n,r),r+=n.length};write(text2Uint8Array("RIFF")),write(Uint32ToUint8Array(n.length+12+16+8-8)),write(text2Uint8Array("WAVE")),write(text2Uint8Array("fmt ")),write(Uint32ToUint8Array(16)),write(Uint16ToUint8Array(1)),write(Uint16ToUint8Array(1)),write(Uint32ToUint8Array(22050)),write(Uint32ToUint8Array(22050)),write(Uint16ToUint8Array(1)),write(Uint16ToUint8Array(8)),write(text2Uint8Array("data")),write(Uint32ToUint8Array(n.length)),write(n);var o=new Blob([e],{type:"audio/vnd.wave"}),t=window.URL||window.webkitURL,a=t.createObjectURL(o),i=document.createElement("a");i.href=a,i.target="_blank",i.download="sam.wav",document.body.appendChild(i),i.click(),document.body.removeChild(i),t.revokeObjectURL(a)}(e.buf8(n,r))}}return SamJs.buf8=J,SamJs.buf32=k,SamJs.convert=Z,SamJs}));

    Scratch.extensions.register(new SamSpeech());
})(Scratch);
