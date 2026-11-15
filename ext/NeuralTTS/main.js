(function(Scratch) {
    'use strict';

    const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
    const MESPEAK_BASE = 'https://cdn.jsdelivr.net/npm/mespeak@2.0.4/';
    const KOKORO_STYLE_DIM = 256;
    const KOKORO_MAX_FRAMES = 510;
    const CALIBRATION_STORAGE_KEY = 'neuraltts_voice_calibration_v3';

    const LANG_MAP = {
        'en-us': 'en-US',
        'en-gb': 'en-GB',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'hi': 'hi-IN',
        'it': 'it-IT',
        'pt-br': 'pt-BR'
    };

    const ID_LANG_PREFIX = {
        a: 'en-us',
        b: 'en-gb',
        j: 'ja',
        z: 'zh',
        e: 'es',
        f: 'fr',
        h: 'hi',
        i: 'it',
        p: 'pt-br'
    };

    class P7NeuralTTS {
        constructor() {
            this.voices = [];
            this.customVoices = new Map();
            this.customVersion = 0;
            this.voiceEmbeddingCache = new Map();
            this.voiceAcousticCache = new Map();
            this.allVoicesCalibrated = false;
            this.neuralQueue = Promise.resolve();
            this.currentVoice = 'af_heart';
            this.speed = 1.0;
            this.neuralAvailable = typeof WebAssembly === 'object';
            this.neuralDisabledReason = this.neuralAvailable ? '' : 'WebAssembly is not supported in this browser';
            this.kokoroMod = null;
            this.kokoroInstance = null;
            this.kokoroPromise = null;
            this.transcriber = null;
            this.transcriberPromise = null;
            this.loadProgress = 0;
            this.audioMatchProgress = 0;
            this.loadFiles = new Map();
            this.meSpeakReady = false;
            this.meSpeakPromise = null;
            this.audioCtx = null;
            this.currentSource = null;
            this.lastEngine = 'none';
            this.speakToken = 0;
            this.loadCalibrationCache();
            this.prefetchLibraryVoices();
        }

        getInfo() {
            return {
                id: 'P7NeuralTTS',
                name: 'Neural TTS',
                color1: '#5865f2',
                color2: '#4752c4',
                blocks: [
                    {
                        opcode: 'loadNeural',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'load neural voices'
                    },
                    {
                        opcode: 'isNeuralLoaded',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'neural voices loaded?'
                    },
                    {
                        opcode: 'getLoadProgress',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'neural load progress'
                    },
                    '---',
                    {
                        opcode: 'speak',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'speak [TEXT]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello world!'
                            }
                        }
                    },
                    {
                        opcode: 'stopSpeaking',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'stop speaking'
                    },
                    {
                        opcode: 'getSpeechDataUri',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'speech [TEXT] as data uri',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello world!'
                            }
                        }
                    },
                    {
                        opcode: 'setVoice',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set voice to [VOICE]',
                        arguments: {
                            VOICE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'VOICES',
                                defaultValue: 'am_adam'
                            }
                        }
                    },
                    {
                        opcode: 'setSpeed',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set speed to [SPEED]',
                        arguments: {
                            SPEED: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'addBlendedVoice',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add voice [NAME] by blending [VOICE1] and [VOICE2] at [MIX]%',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Custom Blend'
                            },
                            VOICE1: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'VOICES',
                                defaultValue: 'af_heart'
                            },
                            VOICE2: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'VOICES',
                                defaultValue: 'am_adam'
                            },
                            MIX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            }
                        }
                    },
                    {
                        opcode: 'addCustomVoiceFromUrl',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'add voice [NAME] from url [URL]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Custom Voice'
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/af_bella.bin'
                            }
                        }
                    },
                    {
                        opcode: 'addVoiceFromAudioSample',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'create voice [NAME] from audio [URL]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Matched Voice'
                            },
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https://yyf.mubilop.com/file/4f2ec8fdcd786cfe/vector.mp3'
                            }
                        }
                    },
                    {
                        opcode: 'getAudioMatchProgress',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'audio voice match progress'
                    },
                    {
                        opcode: 'removeCustomVoice',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'remove custom voice [NAME]',
                        arguments: {
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Custom Blend'
                            }
                        }
                    },
                    {
                        opcode: 'exportCustomVoices',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'export custom voice [VOICE]',
                        arguments: {
                            VOICE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'CUSTOM_VOICES',
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'importCustomVoices',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'import custom voice [DATA]',
                        arguments: {
                            DATA: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'canUseNeural',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'can use neural voices?'
                    },
                    {
                        opcode: 'getVoice',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'current voice'
                    },
                    {
                        opcode: 'getVoicesList',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'available voices'
                    }
                ],
                menus: {
                    VOICES: {
                        acceptReporters: true,
                        items: 'getVoiceMenu'
                    },
                    CUSTOM_VOICES: {
                        acceptReporters: true,
                        items: 'getCustomVoiceMenu'
                    }
                }
            };
        }

        loadCalibrationCache() {
            try {
                if (typeof localStorage === 'undefined') return;
                const raw = localStorage.getItem(CALIBRATION_STORAGE_KEY);
                if (!raw) return;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object') return;
                for (const [id, feat] of Object.entries(parsed)) {
                    if (feat && typeof feat.f0 === 'number') {
                        this.voiceAcousticCache.set(id, {
                            ...feat,
                            mel: Array.isArray(feat.mel) ? new Float32Array(feat.mel) : null,
                            mfcc: Array.isArray(feat.mfcc) ? new Float32Array(feat.mfcc) : null
                        });
                    }
                }
            } catch (e) {}
        }

        saveCalibrationCache() {
            try {
                if (typeof localStorage === 'undefined') return;
                const out = {};
                for (const [id, feat] of this.voiceAcousticCache.entries()) {
                    out[id] = {
                        ...feat,
                        mel: feat.mel ? Array.from(feat.mel) : null,
                        mfcc: feat.mfcc ? Array.from(feat.mfcc) : null
                    };
                }
                localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(out));
            } catch (e) {}
        }

        refreshMenus() {
            try {
                if (Scratch && Scratch.vm && Scratch.vm.extensionManager && typeof Scratch.vm.extensionManager.refreshBlocks === 'function') {
                    Scratch.vm.extensionManager.refreshBlocks('neuraltts');
                }
            } catch (e) {}
        }

        getVoiceMenu() {
            const items = this.voices.map(v => ({ text: v.name, value: v.id }));
            for (const cv of this.customVoices.values()) {
                items.push({ text: `${cv.id} (Custom)`, value: cv.id });
            }
            if (items.length > 0) return items;
            const fallbackId = this.currentVoice || 'af_heart';
            return [{ text: `(loading voices) ${fallbackId}`, value: fallbackId }];
        }

        getCustomVoiceMenu() {
            const items = [];
            for (const cv of this.customVoices.values()) {
                items.push({ text: cv.id, value: cv.id });
            }
            return items.length > 0 ? items : [{ text: '(no custom voices)', value: '' }];
        }

        inferLangCodeFromId(id) {
            const prefix = String(id || '').slice(0, 1).toLowerCase();
            return ID_LANG_PREFIX[prefix] || 'en-us';
        }

        formatVoiceNameFromId(id) {
            const parts = String(id || '').split('_');
            const raw = parts.length > 1 ? parts.slice(1).join(' ') : String(id || '');
            return raw.replace(/\b\w/g, c => c.toUpperCase());
        }

        normalizeLang(langRaw, id) {
            const lower = String(langRaw || '').toLowerCase();
            if (LANG_MAP[lower]) return LANG_MAP[lower];
            if (lower) return langRaw;
            const inferred = this.inferLangCodeFromId(id);
            return LANG_MAP[inferred] || 'en-US';
        }

        buildProfileFromLibrary(id, info) {
            const rawGender = String((info && info.gender) || '').toLowerCase();
            const isMale = rawGender ? rawGender.startsWith('m') : (String(id).length > 1 && String(id)[1].toLowerCase() === 'm');
            const gender = isMale ? 'm' : 'f';
            const kokoroLang = (info && info.language) ? String(info.language) : this.inferLangCodeFromId(id);
            const lang = this.normalizeLang(kokoroLang, id);
            const labelBase = (info && info.name) ? info.name : this.formatVoiceNameFromId(id);
            const labelLang = lang.toUpperCase();
            const labelGender = gender === 'f' ? 'Female' : 'Male';
            let hash = 0;
            for (let i = 0; i < String(id).length; i++) {
                hash = (hash * 31 + String(id).charCodeAt(i)) % 997;
            }
            const normOffset = ((hash % 11) - 5) / 5;
            const pitch = isMale ? (0.85 + normOffset * 0.14) : (1.18 + normOffset * 0.14);
            const msPitch = Math.round(isMale ? (39 + normOffset * 9) : (64 + normOffset * 9));
            const msVar = (isMale ? 'm' : 'f') + String((hash % (isMale ? 7 : 5)) + 1);
            return {
                id,
                name: `${labelBase} (${labelLang} ${labelGender})`,
                lang,
                kokoroLang,
                gender,
                pitch,
                rateMul: 1.0 + normOffset * 0.04,
                msPitch,
                msVar
            };
        }

        syncVoicesFromLibrary(voicesObj) {
            if (!voicesObj || typeof voicesObj !== 'object') return;
            const next = [];
            for (const [id, info] of Object.entries(voicesObj)) {
                if (!id || id.startsWith('__custom_')) continue;
                next.push(this.buildProfileFromLibrary(id, info));
            }
            if (next.length > 0) {
                this.voices = next;
                if (!this.customVoices.has(this.currentVoice) && !this.voices.some(v => v.id === this.currentVoice)) {
                    this.currentVoice = this.voices[0].id;
                }
                this.refreshMenus();
            }
        }

        async fetchRepoVoices() {
            try {
                const res = await fetch(`https://huggingface.co/api/models/${KOKORO_MODEL}/tree/main/voices`);
                if (!res.ok) return;
                const list = await res.json();
                if (!Array.isArray(list)) return;
                const voicesObj = {};
                for (const item of list) {
                    if (item && typeof item.path === 'string' && item.path.endsWith('.bin')) {
                        const id = item.path.replace(/^voices\//, '').replace(/\.bin$/, '');
                        if (id) voicesObj[id] = {};
                    }
                }
                if (Object.keys(voicesObj).length > 0 && this.voices.length === 0) {
                    this.syncVoicesFromLibrary(voicesObj);
                }
            } catch (e) {}
        }

        async importKokoroModule() {
            if (this.kokoroMod) return this.kokoroMod;
            const mod = await import('https://esm.run/kokoro-js');
            this.kokoroMod = mod;
            const modVoices = (mod && mod.VOICES) || (mod && mod.KokoroTTS && mod.KokoroTTS.voices);
            if (modVoices) {
                this.syncVoicesFromLibrary(modVoices);
            } else if (this.voices.length === 0) {
                await this.fetchRepoVoices();
            }
            return mod;
        }

        prefetchLibraryVoices() {
            if (!this.neuralAvailable) {
                this.fetchRepoVoices();
                return;
            }
            this.importKokoroModule().catch(() => {
                this.fetchRepoVoices();
            });
        }

        getAudioContext() {
            if (!this.audioCtx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (AC) this.audioCtx = new AC();
            }
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume().catch(() => {});
            }
            return this.audioCtx;
        }

        getVoiceProfile(id) {
            if (this.customVoices.has(id)) {
                return this.customVoices.get(id);
            }
            const found = this.voices.find(v => v.id === id);
            if (found) return found;
            if (id) return this.buildProfileFromLibrary(id, null);
            return this.voices[0] || this.buildProfileFromLibrary('af_heart', null);
        }

        resampleMono(samples, fromRate, toRate) {
            if (!samples || samples.length === 0 || fromRate === toRate) return samples;
            const ratio = fromRate / toRate;
            const outLen = Math.max(1, Math.round(samples.length / ratio));
            const out = new Float32Array(outLen);
            for (let i = 0; i < outLen; i++) {
                const pos = i * ratio;
                const idx = Math.floor(pos);
                const frac = pos - idx;
                const a = samples[Math.min(idx, samples.length - 1)];
                const b = samples[Math.min(idx + 1, samples.length - 1)];
                out[i] = a + (b - a) * frac;
            }
            return out;
        }

        async ensureTranscriber() {
            if (this.transcriber) return this.transcriber;
            if (this.transcriberPromise) return this.transcriberPromise;
            this.transcriberPromise = (async () => {
                const tf = await import('https://esm.run/@huggingface/transformers');
                const asr = await tf.pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
                    dtype: 'q8',
                    device: 'wasm'
                });
                this.transcriber = asr;
                return asr;
            })().catch((err) => {
                this.transcriberPromise = null;
                throw err;
            });
            return this.transcriberPromise;
        }

        async transcribeAudioSample(mono, sampleRate) {
            try {
                const asr = await this.ensureTranscriber();
                const audio16k = this.resampleMono(mono, sampleRate, 16000);
                const result = await asr(audio16k, { return_timestamps: true });
                const rawText = String((result && result.text) || '').replace(/\[.*?\]|\(.*?\)/g, '').trim();
                const alphaCount = (rawText.match(/[a-zA-Z]/g) || []).length;
                let speechSlice = mono;
                if (result && Array.isArray(result.chunks) && result.chunks.length > 0) {
                    let minStart = Infinity;
                    let maxEnd = -Infinity;
                    for (const ch of result.chunks) {
                        if (ch && Array.isArray(ch.timestamp)) {
                            const s = typeof ch.timestamp[0] === 'number' ? ch.timestamp[0] : 0;
                            const e = typeof ch.timestamp[1] === 'number' ? ch.timestamp[1] : (mono.length / sampleRate);
                            if (s < minStart) minStart = s;
                            if (e > maxEnd) maxEnd = e;
                        }
                    }
                    if (Number.isFinite(minStart) && Number.isFinite(maxEnd) && maxEnd > minStart) {
                        const i0 = Math.max(0, Math.floor((minStart - 0.04) * sampleRate));
                        const i1 = Math.min(mono.length, Math.ceil((maxEnd + 0.04) * sampleRate));
                        if (i1 - i0 >= sampleRate * 0.25) {
                            speechSlice = mono.subarray(i0, i1);
                        }
                    }
                }
                const hasText = alphaCount >= 3 && rawText.length <= 160;
                return {
                    hasText,
                    text: hasText ? rawText : 'She had your dark suit in greasy wash water all year.',
                    speechSlice
                };
            } catch (e) {
                return {
                    hasText: false,
                    text: 'She had your dark suit in greasy wash water all year.',
                    speechSlice: mono
                };
            }
        }

        fftMagnitude(realInput) {
            const N = realInput.length;
            const re = new Float32Array(N);
            const im = new Float32Array(N);
            re.set(realInput);
            let j = 0;
            for (let i = 0; i < N; i++) {
                if (i < j) {
                    const tr = re[i];
                    re[i] = re[j];
                    re[j] = tr;
                }
                let m = N >> 1;
                while (m >= 1 && j >= m) {
                    j -= m;
                    m >>= 1;
                }
                j += m;
            }
            for (let size = 2; size <= N; size <<= 1) {
                const half = size >> 1;
                const angleStep = (-2 * Math.PI) / size;
                for (let i = 0; i < N; i += size) {
                    for (let k = 0; k < half; k++) {
                        const angle = angleStep * k;
                        const wr = Math.cos(angle);
                        const wi = Math.sin(angle);
                        const idx1 = i + k;
                        const idx2 = idx1 + half;
                        const tr = wr * re[idx2] - wi * im[idx2];
                        const ti = wr * im[idx2] + wi * re[idx2];
                        re[idx2] = re[idx1] - tr;
                        im[idx2] = im[idx1] - ti;
                        re[idx1] += tr;
                        im[idx1] += ti;
                    }
                }
            }
            const mag = new Float32Array(N >> 1);
            for (let i = 0; i < mag.length; i++) {
                mag[i] = Math.hypot(re[i], im[i]);
            }
            return mag;
        }

        weightedQuantile(sortedItems, q) {
            if (sortedItems.length === 0) return 155;
            let totalW = 0;
            for (const item of sortedItems) totalW += item.w;
            if (totalW <= 0) return sortedItems[Math.floor(sortedItems.length * q)].f0;
            const target = totalW * q;
            let acc = 0;
            for (const item of sortedItems) {
                acc += item.w;
                if (acc >= target) return item.f0;
            }
            return sortedItems[sortedItems.length - 1].f0;
        }

        extractAudioFeatures(rawSamples, rawSampleRate) {
            const sr = 24000;
            const samples = this.resampleMono(rawSamples, rawSampleRate || 24000, sr);
            const len = samples.length;
            const frameSize = 720;
            const yinW = 360;
            const hop = 360;
            const fftSize = 1024;
            const hann = new Float32Array(fftSize);
            for (let i = 0; i < fftSize; i++) {
                hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
            }
            let globalPeak = 0;
            const maxScan = Math.min(len, sr * 18);
            for (let i = 0; i < maxScan; i++) {
                const a = Math.abs(samples[i]);
                if (a > globalPeak) globalPeak = a;
            }
            if (globalPeak < 1e-5) {
                return {
                    f0: 155,
                    f0Low: 140,
                    f0High: 170,
                    f0Confidence: 0.5,
                    brightness: 0.5,
                    warmth: 0.5,
                    chestRatio: 0.25,
                    f1Ratio: 0.45,
                    f2Ratio: 0.22,
                    f3Ratio: 0.08,
                    tilt: 0,
                    breathiness: 0.3,
                    rateMul: 1.0,
                    mel: new Float32Array(12),
                    mfcc: new Float32Array(12)
                };
            }
            const rmsThreshold = globalPeak * 0.075;
            const minLag = Math.floor(sr / 340);
            const maxLag = Math.min(yinW, Math.ceil(sr / 65));
            const diff = new Float32Array(maxLag + 1);
            const cmnd = new Float32Array(maxLag + 1);
            const f0Weighted = [];
            let hnrSum = 0;
            let hnrCount = 0;
            let activeFrames = 0;
            const melSum = new Float32Array(12);
            let centroidSum = 0;
            let warmthSum = 0;
            let chestSum = 0;
            let f1Sum = 0;
            let f2Sum = 0;
            let f3Sum = 0;
            let breathSum = 0;
            let specWeightSum = 0;
            let specFrames = 0;
            const frameRmsList = [];
            const melMin = 2595 * Math.log10(1 + 90 / 700);
            const melMax = 2595 * Math.log10(1 + 7200 / 700);
            const melEdges = new Float32Array(14);
            for (let b = 0; b <= 13; b++) {
                const m = melMin + ((melMax - melMin) * b) / 13;
                melEdges[b] = 700 * (Math.pow(10, m / 2595) - 1);
            }

            for (let start = 0; start + frameSize <= maxScan; start += hop) {
                let sum = 0;
                for (let i = 0; i < frameSize; i++) {
                    sum += samples[start + i];
                }
                const frameMean = sum / frameSize;
                let sumSq = 0;
                for (let i = 0; i < frameSize; i++) {
                    const v = samples[start + i] - frameMean;
                    sumSq += v * v;
                }
                const rms = Math.sqrt(sumSq / frameSize);
                frameRmsList.push(rms);
                if (rms < rmsThreshold) continue;
                activeFrames++;

                diff[0] = 0;
                cmnd[0] = 1;
                let runningSum = 0;
                for (let tau = 1; tau <= maxLag; tau++) {
                    let s = 0;
                    for (let j = 0; j < yinW; j++) {
                        const d = (samples[start + j] - frameMean) - (samples[start + j + tau] - frameMean);
                        s += d * d;
                    }
                    diff[tau] = s;
                    runningSum += s;
                    cmnd[tau] = runningSum > 1e-12 ? (s * tau) / runningSum : 1;
                }

                let bestTau = -1;
                for (let tau = minLag; tau <= maxLag; tau++) {
                    if (cmnd[tau] < 0.20) {
                        while (tau + 1 <= maxLag && cmnd[tau + 1] < cmnd[tau]) {
                            tau++;
                        }
                        bestTau = tau;
                        break;
                    }
                }
                if (bestTau === -1) {
                    let minVal = 1;
                    let minTau = -1;
                    for (let tau = minLag; tau <= maxLag; tau++) {
                        if (cmnd[tau] < minVal) {
                            minVal = cmnd[tau];
                            minTau = tau;
                        }
                    }
                    if (minVal < 0.40) {
                        bestTau = minTau;
                    }
                }

                let frameVoicedness = 0.25;
                if (bestTau > 0) {
                    let refinedTau = bestTau;
                    if (bestTau > minLag && bestTau < maxLag) {
                        const s0 = cmnd[bestTau - 1];
                        const s1 = cmnd[bestTau];
                        const s2 = cmnd[bestTau + 1];
                        const denom = 2 * (2 * s1 - s2 - s0);
                        if (Math.abs(denom) > 1e-9) {
                            const shift = (s0 - s2) / denom;
                            if (Math.abs(shift) < 1) {
                                refinedTau += shift;
                            }
                        }
                    }
                    const f0 = sr / refinedTau;
                    const clarity = Math.max(0, 1 - cmnd[bestTau]);
                    frameVoicedness = 0.35 + clarity * 0.65;
                    f0Weighted.push({ f0, w: rms * clarity });
                    hnrSum += clarity;
                    hnrCount++;
                }

                if (specFrames < 180) {
                    const winBuf = new Float32Array(fftSize);
                    for (let i = 0; i < frameSize; i++) {
                        winBuf[i] = (samples[start + i] - frameMean) * hann[i];
                    }
                    const mag = this.fftMagnitude(winBuf);
                    const binHz = sr / fftSize;
                    let magSum = 0;
                    let freqMagSum = 0;
                    let lowEnergy = 0;
                    let chestEnergy = 0;
                    let f1Energy = 0;
                    let f2Energy = 0;
                    let f3Energy = 0;
                    let midEnergy = 0;
                    let highEnergy = 0;
                    let totalEnergy = 0;
                    let speechBandEnergy = 0;
                    let logFlatSum = 0;
                    let flatCount = 0;
                    let flatArithSum = 0;
                    const frameMel = new Float32Array(12);
                    for (let k = 1; k < mag.length; k++) {
                        const hz = k * binHz;
                        if (hz > 7600) break;
                        const mVal = mag[k];
                        const pVal = mVal * mVal;
                        magSum += mVal;
                        freqMagSum += hz * mVal;
                        totalEnergy += pVal;
                        if (hz >= 85 && hz <= 600) lowEnergy += pVal;
                        if (hz >= 85 && hz <= 280) chestEnergy += pVal;
                        if (hz > 280 && hz <= 850) f1Energy += pVal;
                        if (hz > 850 && hz <= 2400) f2Energy += pVal;
                        if (hz > 2400 && hz <= 4500) f3Energy += pVal;
                        if (hz >= 85 && hz <= 4500) speechBandEnergy += pVal;
                        if (hz >= 140 && hz <= 2400) midEnergy += pVal;
                        if (hz >= 2500 && hz <= 7400) highEnergy += pVal;
                        if (hz >= 300 && hz <= 5800) {
                            logFlatSum += Math.log(pVal + 1e-12);
                            flatArithSum += pVal;
                            flatCount++;
                        }
                        if (hz >= melEdges[0] && hz <= melEdges[12]) {
                            for (let b = 0; b < 12; b++) {
                                if (hz >= melEdges[b] && hz <= melEdges[b + 2]) {
                                    const center = melEdges[b + 1];
                                    const w = hz <= center
                                        ? (hz - melEdges[b]) / Math.max(1, center - melEdges[b])
                                        : (melEdges[b + 2] - hz) / Math.max(1, melEdges[b + 2] - center);
                                    frameMel[b] += pVal * Math.max(0, w);
                                }
                            }
                        }
                    }
                    if (magSum > 1e-6 && totalEnergy > 1e-9 && speechBandEnergy > 1e-9) {
                        const centroidHz = freqMagSum / magSum;
                        const wFrame = rms * frameVoicedness;
                        centroidSum += Math.max(0, Math.min(1, (centroidHz - 450) / 2600)) * wFrame;
                        warmthSum += Math.max(0, Math.min(1, lowEnergy / totalEnergy)) * wFrame;
                        chestSum += (chestEnergy / speechBandEnergy) * wFrame;
                        f1Sum += (f1Energy / speechBandEnergy) * wFrame;
                        f2Sum += (f2Energy / speechBandEnergy) * wFrame;
                        f3Sum += (f3Energy / speechBandEnergy) * wFrame;
                        const hfRatio = highEnergy / Math.max(1e-9, midEnergy + highEnergy);
                        const flatness = flatCount > 0 && flatArithSum > 1e-12
                            ? Math.exp(logFlatSum / flatCount) / (flatArithSum / flatCount)
                            : 0.2;
                        breathSum += Math.max(0, Math.min(1, hfRatio * 0.65 + Math.min(1, flatness * 2.2) * 0.35)) * wFrame;
                        let melMean = 0;
                        const logMel = new Float32Array(12);
                        for (let b = 0; b < 12; b++) {
                            logMel[b] = Math.log(frameMel[b] + 1e-7);
                            melMean += logMel[b];
                        }
                        melMean /= 12;
                        for (let b = 0; b < 12; b++) {
                            melSum[b] += (logMel[b] - melMean) * wFrame;
                        }
                        specWeightSum += wFrame;
                        specFrames++;
                    }
                }
            }

            f0Weighted.sort((a, b) => a.f0 - b.f0);
            const f0Low = this.weightedQuantile(f0Weighted, 0.25);
            const medianF0 = this.weightedQuantile(f0Weighted, 0.50);
            const f0High = this.weightedQuantile(f0Weighted, 0.75);
            const f0Confidence = activeFrames > 0 ? Math.min(1, f0Weighted.length / activeFrames) : 0.4;
            const avgHnr = hnrCount > 0 ? hnrSum / hnrCount : 0.65;
            const brightness = specWeightSum > 0 ? centroidSum / specWeightSum : 0.5;
            const warmth = specWeightSum > 0 ? warmthSum / specWeightSum : 0.5;
            const chestRatio = specWeightSum > 0 ? chestSum / specWeightSum : 0.25;
            const f1Ratio = specWeightSum > 0 ? f1Sum / specWeightSum : 0.45;
            const f2Ratio = specWeightSum > 0 ? f2Sum / specWeightSum : 0.22;
            const f3Ratio = specWeightSum > 0 ? f3Sum / specWeightSum : 0.08;
            const breathiness = specWeightSum > 0
                ? (breathSum / specWeightSum) * 0.65 + (1 - Math.min(1, avgHnr)) * 0.35
                : 0.3;
            const mel = new Float32Array(12);
            if (specWeightSum > 0) {
                for (let b = 0; b < 12; b++) {
                    mel[b] = melSum[b] / specWeightSum;
                }
            }
            let tilt = 0;
            for (let b = 0; b < 12; b++) {
                tilt += (b - 5.5) * mel[b];
            }
            tilt /= 143;

            const mfcc = new Float32Array(12);
            const dctScale = Math.sqrt(2 / 12);
            for (let c = 0; c < 12; c++) {
                let s = 0;
                const k = c + 1;
                for (let b = 0; b < 12; b++) {
                    s += mel[b] * Math.cos((Math.PI * k * (b + 0.5)) / 12);
                }
                mfcc[c] = s * dctScale;
            }

            let peaks = 0;
            let activeTime = 0;
            for (let i = 1; i < frameRmsList.length - 1; i++) {
                if (frameRmsList[i] >= rmsThreshold) {
                    activeTime += hop / sr;
                    if (frameRmsList[i] > frameRmsList[i - 1] && frameRmsList[i] > frameRmsList[i + 1] && frameRmsList[i] > rmsThreshold * 1.55) {
                        peaks++;
                    }
                }
            }
            const syllRate = activeTime > 0.25 ? peaks / activeTime : 4.2;
            const rateMul = Math.max(0.88, Math.min(1.14, 0.9 + (syllRate - 3.0) * 0.045));

            return {
                f0: medianF0,
                f0Low,
                f0High,
                f0Confidence,
                brightness,
                warmth,
                chestRatio,
                f1Ratio,
                f2Ratio,
                f3Ratio,
                tilt,
                breathiness,
                rateMul,
                mel,
                mfcc
            };
        }

        estimateVoiceDescriptor(profile) {
            if (this.voiceAcousticCache.has(profile.id)) {
                return this.voiceAcousticCache.get(profile.id);
            }
            const pitch = Number(profile.pitch) || (profile.gender === 'm' ? 0.85 : 1.15);
            const isMale = profile.gender === 'm';
            const f0 = isMale
                ? Math.max(78, Math.min(175, 118 * Math.pow(pitch / 0.88, 1.1)))
                : Math.max(150, Math.min(285, 200 * Math.pow(pitch / 1.18, 1.05)));
            const brightness = Math.max(0.1, Math.min(0.95, isMale ? (0.28 + (pitch - 0.65) * 0.7) : (0.45 + (pitch - 1.0) * 0.85)));
            const warmth = Math.max(0.1, Math.min(0.95, 1 - brightness * 0.75));
            return {
                f0,
                f0Low: f0 * 0.88,
                f0High: f0 * 1.12,
                f0Confidence: 0.75,
                brightness,
                warmth,
                chestRatio: isMale ? 0.35 : 0.16,
                f1Ratio: 0.44,
                f2Ratio: 0.22,
                f3Ratio: 0.08,
                tilt: (brightness - 0.5) * 0.5,
                breathiness: 0.3,
                rateMul: Number(profile.rateMul) || 1.0,
                mel: null,
                mfcc: null
            };
        }

        featureVector(feat) {
            const vec = new Float64Array(35);
            vec[0] = Math.log2(Math.max(55, feat.f0 || 155)) * 3.8;
            vec[1] = Math.log2(Math.max(55, feat.f0Low || feat.f0 || 140)) * 2.8;
            vec[2] = Math.log2(Math.max(55, feat.f0High || feat.f0 || 170)) * 2.0;
            vec[3] = (feat.brightness || 0.5) * 2.0;
            vec[4] = (feat.warmth || 0.5) * 2.0;
            vec[5] = (feat.chestRatio || 0.25) * 3.0;
            vec[6] = (feat.f1Ratio || 0.45) * 2.2;
            vec[7] = (feat.f2Ratio || 0.22) * 2.0;
            vec[8] = (feat.f3Ratio || 0.08) * 2.0;
            vec[9] = (feat.breathiness || 0.3) * 1.8;
            vec[10] = (feat.tilt || 0) * 2.6;
            if (feat.mel) {
                for (let i = 0; i < 12; i++) vec[11 + i] = feat.mel[i] * 0.50;
            }
            if (feat.mfcc) {
                for (let i = 0; i < 12; i++) vec[23 + i] = feat.mfcc[i] * 0.60;
            }
            return vec;
        }

        acousticDistance(a, b, sameText = false) {
            const pitchWeight = a.f0Confidence !== undefined ? (2.6 + 2.0 * a.f0Confidence) : 3.8;
            const pitchDiff = Math.log2(Math.max(55, a.f0) / Math.max(55, b.f0)) * pitchWeight;
            const lowDiff = Math.log2(Math.max(55, a.f0Low || a.f0) / Math.max(55, b.f0Low || b.f0)) * (pitchWeight * 0.75);
            const highDiff = Math.log2(Math.max(55, a.f0High || a.f0) / Math.max(55, b.f0High || b.f0)) * (pitchWeight * 0.45);
            const brightDiff = (a.brightness - b.brightness) * 1.6;
            const warmDiff = (a.warmth - b.warmth) * 1.5;
            const chestDiff = ((a.chestRatio || 0.25) - (b.chestRatio || 0.25)) * 3.0;
            const f1Diff = ((a.f1Ratio || 0.45) - (b.f1Ratio || 0.45)) * 2.2;
            const f2Diff = ((a.f2Ratio || 0.22) - (b.f2Ratio || 0.22)) * 2.0;
            const f3Diff = ((a.f3Ratio || 0.08) - (b.f3Ratio || 0.08)) * 2.0;
            const breathDiff = ((a.breathiness || 0.3) - (b.breathiness || 0.3)) * 1.6;
            const tiltDiff = ((a.tilt || 0) - (b.tilt || 0)) * 2.5;
            let distSq = pitchDiff * pitchDiff + lowDiff * lowDiff + highDiff * highDiff
                + brightDiff * brightDiff + warmDiff * warmDiff
                + chestDiff * chestDiff + f1Diff * f1Diff + f2Diff * f2Diff + f3Diff * f3Diff
                + breathDiff * breathDiff + tiltDiff * tiltDiff;
            const melScale = sameText ? 1.8 : 0.9;
            const mfccScale = sameText ? 2.4 : 0.85;
            if (a.mel && b.mel) {
                let melDiff = 0;
                for (let i = 0; i < 12; i++) {
                    const d = a.mel[i] - b.mel[i];
                    melDiff += d * d;
                }
                distSq += (melDiff / 12) * melScale;
            }
            if (a.mfcc && b.mfcc) {
                let mfccDiff = 0;
                for (let i = 0; i < 12; i++) {
                    const d = a.mfcc[i] - b.mfcc[i];
                    mfccDiff += d * d;
                }
                distSq += (mfccDiff / 12) * mfccScale;
            }
            return Math.sqrt(distSq);
        }

        projectSimplex(vec) {
            const n = vec.length;
            const sorted = Float64Array.from(vec).sort((a, b) => b - a);
            let cumSum = 0;
            let theta = 0;
            for (let i = 0; i < n; i++) {
                cumSum += sorted[i];
                const t = (cumSum - 1) / (i + 1);
                if (sorted[i] - t > 0) {
                    theta = t;
                }
            }
            const out = new Float64Array(n);
            for (let i = 0; i < n; i++) {
                out[i] = Math.max(0, vec[i] - theta);
            }
            return out;
        }

        solveSimplexBlend(poolItems, targetFeatures, maxVoices) {
            const M = poolItems.length;
            if (M === 0) return [];
            const targetVec = this.featureVector(targetFeatures);
            const mat = poolItems.map(item => this.featureVector(item.desc));
            const pitchPenalty = poolItems.map(item => {
                const medDiff = Math.log2(Math.max(55, item.desc.f0) / Math.max(55, targetFeatures.f0));
                const lowDiff = Math.log2(Math.max(55, item.desc.f0Low || item.desc.f0) / Math.max(55, targetFeatures.f0Low || targetFeatures.f0));
                return (medDiff * medDiff * 4.5) + (lowDiff * lowDiff * 2.5);
            });
            const D = targetVec.length;
            let w = new Float64Array(M);
            w.fill(1 / M);
            const lr = 0.06;
            for (let step = 0; step < 110; step++) {
                const pred = new Float64Array(D);
                for (let k = 0; k < M; k++) {
                    const wk = w[k];
                    if (wk <= 0) continue;
                    const mk = mat[k];
                    for (let d = 0; d < D; d++) {
                        pred[d] += wk * mk[d];
                    }
                }
                const grad = new Float64Array(M);
                for (let k = 0; k < M; k++) {
                    let g = pitchPenalty[k];
                    const mk = mat[k];
                    for (let d = 0; d < D; d++) {
                        g += 2 * (pred[d] - targetVec[d]) * mk[d];
                    }
                    grad[k] = w[k] - lr * g;
                }
                w = this.projectSimplex(grad);
            }
            const ranked = [];
            for (let k = 0; k < M; k++) {
                if (w[k] > 0.01) {
                    ranked.push({ id: poolItems[k].profile.id, weight: w[k] });
                }
            }
            ranked.sort((a, b) => b.weight - a.weight);
            return this.normalizeWeights(ranked.slice(0, maxVoices));
        }

        async downloadAllVoiceEmbeddings(voiceProfiles, onProgress) {
            const queue = voiceProfiles.map(v => v.id);
            const total = Math.max(1, queue.length);
            let done = 0;
            const workers = [];
            const concurrency = 8;
            for (let i = 0; i < concurrency; i++) {
                workers.push((async () => {
                    while (queue.length > 0) {
                        const id = queue.shift();
                        if (!id) continue;
                        try {
                            await this.resolveVoiceEmbedding(id);
                        } catch (e) {}
                        done++;
                        if (onProgress) onProgress(done / total);
                    }
                })());
            }
            await Promise.all(workers);
        }

        async synthesizeWithWeights(weights, text) {
            const tts = this.kokoroInstance;
            if (!tts || !weights || weights.length === 0) return null;
            const embeddings = await Promise.all(
                weights.map(w => this.resolveVoiceEmbedding(w.id))
            );
            const len = Math.min(...embeddings.map(e => e.length));
            const blended = new Float32Array(len);
            for (let k = 0; k < weights.length; k++) {
                const wt = weights[k].weight;
                const emb = embeddings[k];
                for (let i = 0; i < len; i++) {
                    blended[i] += emb[i] * wt;
                }
            }
            const primary = this.getVoiceProfile(weights[0].id);
            const proxyId = this.findProxyVoiceId(tts, primary.kokoroLang);
            const audio = await this.enqueueNeuralTask(async () => {
                const origModel = tts.model;
                tts.model = async (inputs) => {
                    if (inputs && inputs.input_ids && inputs.style && inputs.style.constructor) {
                        const dims = inputs.input_ids.dims;
                        const lastDim = dims[dims.length - 1];
                        const numTokens = Math.min(Math.max(lastDim - 2, 0), KOKORO_MAX_FRAMES - 1);
                        const offset = numTokens * KOKORO_STYLE_DIM;
                        const customSlice = blended.slice(offset, offset + KOKORO_STYLE_DIM);
                        if (customSlice.length === KOKORO_STYLE_DIM) {
                            const TensorCtor = inputs.style.constructor;
                            const customStyle = new TensorCtor('float32', customSlice, [1, KOKORO_STYLE_DIM]);
                            return origModel({ ...inputs, style: customStyle });
                        }
                    }
                    return origModel(inputs);
                };
                try {
                    return await tts.generate(text, { voice: proxyId, speed: 1.0 });
                } finally {
                    tts.model = origModel;
                }
            });
            if (!audio || !this.validateAudioWaveform(audio.audio).valid) return null;
            return audio;
        }

        async calibrateAllVoices() {
            const allPool = this.voices.filter(v => !v.id.startsWith('__custom_'));
            if (allPool.length === 0) return;
            await this.downloadAllVoiceEmbeddings(allPool, (frac) => {
                this.audioMatchProgress = Math.max(this.audioMatchProgress, Math.round(45 + frac * 13));
            });
            if (!this.kokoroInstance || !this.neuralAvailable) return;
            let changed = false;
            const calibText = 'She had your dark suit in greasy wash water all year.';
            const total = Math.max(1, allPool.length);
            for (let idx = 0; idx < allPool.length; idx++) {
                const profile = allPool[idx];
                if (!this.voiceAcousticCache.has(profile.id)) {
                    try {
                        const audio = await this.synthesizeWithWeights([{ id: profile.id, weight: 1 }], calibText);
                        if (audio && audio.audio) {
                            const feat = this.extractAudioFeatures(audio.audio, audio.sampling_rate || 24000);
                            this.voiceAcousticCache.set(profile.id, feat);
                            changed = true;
                        }
                    } catch (e) {}
                }
                this.audioMatchProgress = Math.max(this.audioMatchProgress, Math.round(58 + ((idx + 1) / total) * 17));
            }
            this.allVoicesCalibrated = true;
            if (changed) {
                this.saveCalibrationCache();
            }
        }

        normalizeWeights(weights) {
            const merged = new Map();
            for (const w of weights) {
                if (!w || w.weight <= 0.01) continue;
                merged.set(w.id, (merged.get(w.id) || 0) + w.weight);
            }
            let total = 0;
            for (const val of merged.values()) total += val;
            if (total <= 0) {
                const fallbackId = (this.voices[0] && this.voices[0].id) || this.currentVoice || 'af_heart';
                return [{ id: fallbackId, weight: 1 }];
            }
            const arr = [];
            for (const [id, val] of merged.entries()) {
                arr.push({ id, weight: val / total });
            }
            arr.sort((a, b) => b.weight - a.weight);
            return arr;
        }

        async findBestVoiceMatch(targetFeatures, matchText, sameText = false) {
            if (this.voices.length === 0) {
                await this.importKokoroModule().catch(() => {});
                if (this.voices.length === 0) {
                    await this.fetchRepoVoices();
                }
            }
            if (this.kokoroInstance && this.neuralAvailable && !this.allVoicesCalibrated) {
                await this.calibrateAllVoices();
            }
            this.audioMatchProgress = Math.max(this.audioMatchProgress, 75);
            const allPool = this.voices.filter(v => !v.id.startsWith('__custom_'));
            if (allPool.length === 0) {
                throw new Error('No library voices available');
            }
            const poolItems = allPool.map(profile => ({
                profile,
                desc: this.estimateVoiceDescriptor(profile),
                dist: 0
            }));
            for (const item of poolItems) {
                item.dist = this.acousticDistance(targetFeatures, item.desc, false);
            }
            poolItems.sort((a, b) => a.dist - b.dist);

            const englishItems = poolItems.filter(it => String(it.profile.lang || '').toLowerCase().startsWith('en'));
            const blendPool = englishItems.length >= 6 ? englishItems : poolItems;

            const recipe2 = this.solveSimplexBlend(blendPool, targetFeatures, 2);
            const recipe3 = this.solveSimplexBlend(blendPool, targetFeatures, 3);
            const recipe4 = this.solveSimplexBlend(blendPool, targetFeatures, 4);
            const recipeAll3 = this.solveSimplexBlend(poolItems, targetFeatures, 3);

            if (!this.kokoroInstance || !this.neuralAvailable) {
                this.audioMatchProgress = 95;
                return recipe3;
            }

            const phrase = String(matchText || 'She had your dark suit in greasy wash water all year.').trim();
            const topSingles = blendPool.slice(0, Math.min(6, blendPool.length)).map(it => [{ id: it.profile.id, weight: 1 }]);
            const candidateRecipes = [
                ...topSingles,
                recipe2,
                recipe3,
                recipe4,
                recipeAll3
            ];

            const uniqueRecipes = [];
            const seenKeys = new Set();
            for (const r of candidateRecipes) {
                const norm = this.normalizeWeights(r);
                const key = norm.map(x => `${x.id}:${x.weight.toFixed(2)}`).join('|');
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueRecipes.push(norm);
                }
            }

            const evaluated = [];
            const evalTotal = Math.max(1, uniqueRecipes.length);
            for (let idx = 0; idx < uniqueRecipes.length; idx++) {
                const recipe = uniqueRecipes[idx];
                try {
                    const audio = await this.synthesizeWithWeights(recipe, phrase);
                    if (audio && audio.audio) {
                        const feat = this.extractAudioFeatures(audio.audio, audio.sampling_rate || 24000);
                        const d = this.acousticDistance(targetFeatures, feat, sameText);
                        evaluated.push({ recipe, dist: d });
                    }
                } catch (e) {}
                this.audioMatchProgress = Math.max(this.audioMatchProgress, Math.round(75 + ((idx + 1) / evalTotal) * 14));
            }

            if (evaluated.length === 0) {
                return recipe3;
            }
            evaluated.sort((a, b) => a.dist - b.dist);
            let bestRecipe = evaluated[0].recipe;
            let bestDist = evaluated[0].dist;

            if (bestRecipe.length === 1 && evaluated.length >= 2) {
                const vA = bestRecipe[0].id;
                const vB = evaluated[1].recipe[0].id;
                if (vA !== vB) {
                    const testPair = this.normalizeWeights([{ id: vA, weight: 0.72 }, { id: vB, weight: 0.28 }]);
                    try {
                        const audio = await this.synthesizeWithWeights(testPair, phrase);
                        if (audio && audio.audio) {
                            const feat = this.extractAudioFeatures(audio.audio, audio.sampling_rate || 24000);
                            const d = this.acousticDistance(targetFeatures, feat, sameText);
                            if (d < bestDist) {
                                bestDist = d;
                                bestRecipe = testPair;
                            }
                        }
                    } catch (e) {}
                }
            }
            this.audioMatchProgress = Math.max(this.audioMatchProgress, 91);

            if (bestRecipe.length >= 2) {
                for (let round = 0; round < 2; round++) {
                    const step = round === 0 ? 0.14 : 0.07;
                    let improved = false;
                    for (let idx = 0; idx < bestRecipe.length; idx++) {
                        for (const dir of [-1, 1]) {
                            const trial = bestRecipe.map((w, k) => ({
                                id: w.id,
                                weight: k === idx ? Math.max(0.02, w.weight + dir * step) : w.weight
                            }));
                            const normTrial = this.normalizeWeights(trial);
                            try {
                                const audio = await this.synthesizeWithWeights(normTrial, phrase);
                                if (audio && audio.audio) {
                                    const feat = this.extractAudioFeatures(audio.audio, audio.sampling_rate || 24000);
                                    const d = this.acousticDistance(targetFeatures, feat, sameText);
                                    if (d < bestDist) {
                                        bestDist = d;
                                        bestRecipe = normTrial;
                                        improved = true;
                                    }
                                }
                            } catch (e) {}
                        }
                    }
                    this.audioMatchProgress = Math.max(this.audioMatchProgress, round === 0 ? 95 : 98);
                    if (!improved) break;
                }
            }

            return bestRecipe;
        }

        validateAudioWaveform(samples) {
            if (!samples || samples.length < 256) {
                return { valid: false, reason: 'audio output too short or empty' };
            }
            const n = samples.length;
            let sum = 0;
            let sumSq = 0;
            let peak = 0;
            let clipCount = 0;
            let crossCorr = 0;
            for (let i = 0; i < n; i++) {
                const x = samples[i];
                if (!Number.isFinite(x)) {
                    return { valid: false, reason: 'NaN or non-finite samples detected' };
                }
                const ax = x < 0 ? -x : x;
                if (ax > peak) peak = ax;
                if (ax >= 0.995) clipCount++;
                sum += x;
                sumSq += x * x;
                if (i > 0) {
                    crossCorr += x * samples[i - 1];
                }
            }
            if (peak < 0.002) {
                return { valid: false, reason: 'silent audio output' };
            }
            if (peak > 4.0) {
                return { valid: false, reason: 'corrupted amplitude spike' };
            }
            const mean = sum / n;
            const meanSq = sumSq / n;
            const rms = Math.sqrt(meanSq);
            if (rms < 0.0005) {
                return { valid: false, reason: 'near-silent RMS energy' };
            }
            if (rms > 1.2) {
                return { valid: false, reason: 'excessive RMS energy' };
            }
            if (Math.abs(mean) > 0.35 && rms < Math.abs(mean) * 1.1) {
                return { valid: false, reason: 'DC offset corruption' };
            }
            if (clipCount / n > 0.25) {
                return { valid: false, reason: 'excessive clipping distortion' };
            }
            const varianceSum = sumSq - n * mean * mean;
            if (varianceSum <= 1e-9) {
                return { valid: false, reason: 'flat or constant waveform' };
            }
            const centeredCorr = crossCorr - (n - 1) * mean * mean;
            const lag1 = centeredCorr / varianceSum;
            if (!Number.isFinite(lag1) || lag1 < 0.15) {
                return { valid: false, reason: 'uncorrelated noise/static output' };
            }
            return { valid: true, reason: '' };
        }

        async verifyKokoroInstance(instance) {
            if (!instance || typeof instance.generate !== 'function') {
                return { valid: false, reason: 'missing generate function' };
            }
            const voiceKeys = instance.voices ? Object.keys(instance.voices) : [];
            const testVoice = voiceKeys.includes('af_heart') ? 'af_heart' : (voiceKeys[0] || 'af_heart');
            try {
                const res = await instance.generate('test', { voice: testVoice, speed: 1.0 });
                return this.validateAudioWaveform(res && res.audio);
            } catch (e) {
                return { valid: false, reason: e && e.message ? e.message : 'self-test generation error' };
            }
        }

        handleLoadProgress(info) {
            if (!info || typeof info !== 'object') return;
            if (info.status === 'ready') {
                this.loadProgress = Math.max(this.loadProgress, 99);
                return;
            }
            if (info.file) {
                const prev = this.loadFiles.get(info.file) || { loaded: 0, total: 0, progress: 0 };
                const loaded = typeof info.loaded === 'number' ? info.loaded : prev.loaded;
                const total = typeof info.total === 'number' && info.total > 0 ? info.total : prev.total;
                let pct = prev.progress;
                if (info.status === 'done') {
                    pct = 100;
                } else if (typeof info.progress === 'number') {
                    pct = Math.max(0, Math.min(100, info.progress));
                } else if (total > 0) {
                    pct = Math.max(0, Math.min(100, (loaded / total) * 100));
                }
                this.loadFiles.set(info.file, {
                    loaded: info.status === 'done' && total > 0 ? total : loaded,
                    total,
                    progress: pct
                });
            }
            let totalBytes = 0;
            let loadedBytes = 0;
            let sumPct = 0;
            let count = 0;
            for (const entry of this.loadFiles.values()) {
                count++;
                sumPct += entry.progress;
                if (entry.total > 0) {
                    totalBytes += entry.total;
                    loadedBytes += Math.min(entry.loaded, entry.total);
                }
            }
            let overall = 0;
            if (totalBytes > 0) {
                overall = (loadedBytes / totalBytes) * 100;
            } else if (count > 0) {
                overall = sumPct / count;
            }
            this.loadProgress = Math.max(this.loadProgress, Math.min(99, Math.round(overall)));
        }

        async ensureKokoro() {
            if (!this.neuralAvailable) {
                throw new Error(this.neuralDisabledReason || 'Neural TTS unavailable');
            }
            if (this.kokoroInstance) return this.kokoroInstance;
            if (this.kokoroPromise) return this.kokoroPromise;
            this.loadFiles.clear();
            this.loadProgress = 0;
            this.kokoroPromise = (async () => {
                const mod = await this.importKokoroModule();
                const KokoroTTS = mod.KokoroTTS;
                let instance = null;
                if (navigator.gpu) {
                    try {
                        const gpuInstance = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
                            dtype: 'fp32',
                            device: 'webgpu',
                            progress_callback: (info) => this.handleLoadProgress(info)
                        });
                        const check = await this.verifyKokoroInstance(gpuInstance);
                        if (check.valid) {
                            instance = gpuInstance;
                        } else {
                            console.warn('[NeuralTTS] WebGPU backend produced invalid audio (' + check.reason + '), falling back to WASM.');
                        }
                    } catch (e) {
                        console.warn('[NeuralTTS] WebGPU backend failed (' + (e && e.message ? e.message : e) + '), falling back to WASM.');
                        instance = null;
                    }
                    if (!instance) {
                        this.loadFiles.clear();
                        this.loadProgress = 0;
                    }
                }
                if (!instance) {
                    const wasmInstance = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
                        dtype: 'q8',
                        device: 'wasm',
                        progress_callback: (info) => this.handleLoadProgress(info)
                    });
                    const check = await this.verifyKokoroInstance(wasmInstance);
                    if (!check.valid) {
                        throw new Error('WASM self-test produced invalid audio (' + check.reason + ')');
                    }
                    instance = wasmInstance;
                }
                this.kokoroInstance = instance;
                if (instance && instance.voices) {
                    this.syncVoicesFromLibrary(instance.voices);
                }
                this.neuralAvailable = true;
                this.neuralDisabledReason = '';
                this.loadProgress = 100;
                return instance;
            })().catch((err) => {
                this.neuralAvailable = false;
                this.neuralDisabledReason = err && err.message ? err.message : 'Failed to load neural model';
                this.kokoroInstance = null;
                this.kokoroPromise = null;
                this.loadFiles.clear();
                this.loadProgress = 0;
                throw err;
            });
            return this.kokoroPromise;
        }

        normalizeEmbeddingArray(rawFloats) {
            if (!rawFloats || rawFloats.length === 0) {
                throw new Error('Empty voice embedding');
            }
            const targetLen = KOKORO_MAX_FRAMES * KOKORO_STYLE_DIM;
            const out = new Float32Array(targetLen);
            const frameCount = Math.floor(rawFloats.length / KOKORO_STYLE_DIM);
            if (frameCount <= 0) {
                const padded = new Float32Array(KOKORO_STYLE_DIM);
                for (let i = 0; i < Math.min(rawFloats.length, KOKORO_STYLE_DIM); i++) {
                    padded[i] = Number(rawFloats[i]) || 0;
                }
                for (let f = 0; f < KOKORO_MAX_FRAMES; f++) {
                    out.set(padded, f * KOKORO_STYLE_DIM);
                }
                return out;
            }
            const copyFrames = Math.min(frameCount, KOKORO_MAX_FRAMES);
            for (let i = 0; i < copyFrames * KOKORO_STYLE_DIM; i++) {
                out[i] = Number(rawFloats[i]) || 0;
            }
            if (copyFrames < KOKORO_MAX_FRAMES) {
                const lastOffset = (copyFrames - 1) * KOKORO_STYLE_DIM;
                const lastFrame = out.subarray(lastOffset, lastOffset + KOKORO_STYLE_DIM);
                for (let f = copyFrames; f < KOKORO_MAX_FRAMES; f++) {
                    out.set(lastFrame, f * KOKORO_STYLE_DIM);
                }
            }
            return out;
        }

        base64ToFloat32(b64) {
            const binary = atob(b64);
            const u8 = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                u8[i] = binary.charCodeAt(i);
            }
            return this.normalizeEmbeddingArray(new Float32Array(u8.buffer));
        }

        float32ToBase64(f32) {
            const u8 = new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength);
            return this.uint8ToBase64(u8);
        }

        async fetchUrlEmbedding(source) {
            const trimmed = String(source || '').trim();
            if (!trimmed) throw new Error('Empty voice URL');
            if (trimmed.startsWith('[')) {
                const arr = JSON.parse(trimmed);
                if (!Array.isArray(arr)) throw new Error('Invalid JSON embedding');
                return this.normalizeEmbeddingArray(arr);
            }
            const res = await fetch(trimmed);
            if (!res.ok) throw new Error('Failed to fetch custom voice');
            const contentType = (res.headers.get('content-type') || '').toLowerCase();
            if (contentType.includes('json') || trimmed.toLowerCase().endsWith('.json')) {
                const arr = await res.json();
                const flat = Array.isArray(arr[0]) ? arr.flat(Infinity) : arr;
                return this.normalizeEmbeddingArray(flat);
            }
            const buf = await res.arrayBuffer();
            if (buf.byteLength >= 4 && (buf.byteLength % 4 === 0)) {
                const f32 = new Float32Array(buf);
                return this.normalizeEmbeddingArray(f32);
            }
            throw new Error('Invalid binary voice embedding');
        }

        async resolveVoiceEmbedding(voiceId, visited = new Set()) {
            if (visited.has(voiceId)) {
                throw new Error('Circular custom voice reference');
            }
            if (this.voiceEmbeddingCache.has(voiceId)) {
                return this.voiceEmbeddingCache.get(voiceId);
            }
            if (this.customVoices.has(voiceId)) {
                visited.add(voiceId);
                const cv = this.customVoices.get(voiceId);
                let data;
                if (cv.type === 'embedding' && cv.embeddingB64) {
                    data = this.base64ToFloat32(cv.embeddingB64);
                } else if (cv.type === 'multiBlend') {
                    const embeddings = await Promise.all(
                        cv.weights.map(w => this.resolveVoiceEmbedding(w.id, new Set(visited)))
                    );
                    const len = Math.min(...embeddings.map(e => e.length));
                    data = new Float32Array(len);
                    for (let k = 0; k < cv.weights.length; k++) {
                        const wt = cv.weights[k].weight;
                        const emb = embeddings[k];
                        for (let i = 0; i < len; i++) {
                            data[i] += emb[i] * wt;
                        }
                    }
                } else if (cv.type === 'blend') {
                    const [d1, d2] = await Promise.all([
                        this.resolveVoiceEmbedding(cv.voice1, new Set(visited)),
                        this.resolveVoiceEmbedding(cv.voice2, new Set(visited))
                    ]);
                    const len = Math.min(d1.length, d2.length);
                    data = new Float32Array(len);
                    const t = cv.mix;
                    const s = 1 - t;
                    for (let i = 0; i < len; i++) {
                        data[i] = d1[i] * s + d2[i] * t;
                    }
                } else if (cv.embeddingB64) {
                    data = this.base64ToFloat32(cv.embeddingB64);
                } else {
                    data = await this.fetchUrlEmbedding(cv.url);
                }
                this.voiceEmbeddingCache.set(voiceId, data);
                return data;
            }
            const url = `https://huggingface.co/${KOKORO_MODEL}/resolve/main/voices/${encodeURIComponent(voiceId)}.bin`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch voice ${voiceId}`);
            const buf = await res.arrayBuffer();
            const f32 = this.normalizeEmbeddingArray(new Float32Array(buf));
            this.voiceEmbeddingCache.set(voiceId, f32);
            return f32;
        }

        enqueueNeuralTask(task) {
            const run = this.neuralQueue.then(task, task);
            this.neuralQueue = run.catch(() => {});
            return run;
        }

        findProxyVoiceId(tts, kokoroLang) {
            const voicesObj = (tts && tts.voices) || {};
            const keys = Object.keys(voicesObj);
            if (keys.length === 0) return 'af_heart';
            const target = String(kokoroLang || 'en-us').toLowerCase();
            const match = keys.find(k => voicesObj[k] && String(voicesObj[k].language || '').toLowerCase() === target);
            if (match) return match;
            return keys.includes('af_heart') ? 'af_heart' : keys[0];
        }

        loadScript(url) {
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = url;
                s.async = true;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        }

        async ensureMeSpeak() {
            if (this.meSpeakReady && window.meSpeak) return window.meSpeak;
            if (this.meSpeakPromise) return this.meSpeakPromise;
            this.meSpeakPromise = (async () => {
                if (!window.meSpeak) {
                    await this.loadScript(MESPEAK_BASE + 'mespeak.min.js');
                }
                if (!window.meSpeak) throw new Error('meSpeak failed to load');
                const cfgRes = await fetch(MESPEAK_BASE + 'mespeak_config.json');
                if (!cfgRes.ok) throw new Error('meSpeak config failed');
                const cfg = await cfgRes.json();
                window.meSpeak.loadConfig(cfg);
                const usRes = await fetch(MESPEAK_BASE + 'voices/en/en-us.json');
                if (!usRes.ok) throw new Error('meSpeak en-us voice failed');
                window.meSpeak.loadVoice(await usRes.json());
                try {
                    const ukRes = await fetch(MESPEAK_BASE + 'voices/en/en-rp.json');
                    if (ukRes.ok) window.meSpeak.loadVoice(await ukRes.json());
                } catch (e) {}
                this.meSpeakReady = true;
                return window.meSpeak;
            })().catch((err) => {
                this.meSpeakPromise = null;
                throw err;
            });
            return this.meSpeakPromise;
        }

        uint8ToBase64(u8) {
            const chunkSize = 8192;
            let binary = '';
            for (let i = 0; i < u8.length; i += chunkSize) {
                const chunk = u8.subarray(i, Math.min(i + chunkSize, u8.length));
                binary += String.fromCharCode.apply(null, chunk);
            }
            return btoa(binary);
        }

        encodeWavDataUri(floatData, sampleRate) {
            const sr = Math.max(8000, Math.round(sampleRate || 24000));
            const numSamples = floatData.length;
            const buffer = new ArrayBuffer(44 + numSamples * 2);
            const view = new DataView(buffer);
            const writeStr = (offset, str) => {
                for (let i = 0; i < str.length; i++) {
                    view.setUint8(offset + i, str.charCodeAt(i));
                }
            };
            writeStr(0, 'RIFF');
            view.setUint32(4, 36 + numSamples * 2, true);
            writeStr(8, 'WAVE');
            writeStr(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, sr, true);
            view.setUint32(28, sr * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            writeStr(36, 'data');
            view.setUint32(40, numSamples * 2, true);
            let offset = 44;
            for (let i = 0; i < numSamples; i++) {
                const s = Math.max(-1, Math.min(1, floatData[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                offset += 2;
            }
            return 'data:audio/wav;base64,' + this.uint8ToBase64(new Uint8Array(buffer));
        }

        playAudioBuffer(floatData, sampleRate, token) {
            return new Promise((resolve) => {
                if (token !== this.speakToken) {
                    resolve();
                    return;
                }
                const ctx = this.getAudioContext();
                if (!ctx || !floatData || floatData.length === 0) {
                    resolve();
                    return;
                }
                const buffer = ctx.createBuffer(1, floatData.length, sampleRate || 24000);
                buffer.getChannelData(0).set(floatData);
                const src = ctx.createBufferSource();
                src.buffer = buffer;
                src.connect(ctx.destination);
                src.onended = () => {
                    if (this.currentSource === src) this.currentSource = null;
                    resolve();
                };
                this.currentSource = src;
                src.start();
            });
        }

        playRawWavBuffer(arrayBuffer, token) {
            return new Promise((resolve) => {
                if (token !== this.speakToken) {
                    resolve();
                    return;
                }
                const ctx = this.getAudioContext();
                if (!ctx) {
                    resolve();
                    return;
                }
                ctx.decodeAudioData(arrayBuffer.slice(0), (decoded) => {
                    if (token !== this.speakToken) {
                        resolve();
                        return;
                    }
                    const src = ctx.createBufferSource();
                    src.buffer = decoded;
                    src.connect(ctx.destination);
                    src.onended = () => {
                        if (this.currentSource === src) this.currentSource = null;
                        resolve();
                    };
                    this.currentSource = src;
                    src.start();
                }, () => resolve());
            });
        }

        async generateNeuralAudio(text, profile) {
            const tts = await this.ensureKokoro();
            const isCustom = this.customVoices.has(profile.id);
            const hasCached = isCustom || this.voiceEmbeddingCache.has(profile.id);
            const embedding = hasCached ? await this.resolveVoiceEmbedding(profile.id) : null;
            const audio = await this.enqueueNeuralTask(async () => {
                if (embedding) {
                    const proxyId = isCustom ? this.findProxyVoiceId(tts, profile.kokoroLang) : profile.id;
                    const origModel = tts.model;
                    tts.model = async (inputs) => {
                        if (inputs && inputs.input_ids && inputs.style && inputs.style.constructor) {
                            const dims = inputs.input_ids.dims;
                            const lastDim = dims[dims.length - 1];
                            const numTokens = Math.min(Math.max(lastDim - 2, 0), KOKORO_MAX_FRAMES - 1);
                            const offset = numTokens * KOKORO_STYLE_DIM;
                            const customSlice = embedding.slice(offset, offset + KOKORO_STYLE_DIM);
                            if (customSlice.length === KOKORO_STYLE_DIM) {
                                const TensorCtor = inputs.style.constructor;
                                const customStyle = new TensorCtor('float32', customSlice, [1, KOKORO_STYLE_DIM]);
                                return origModel({ ...inputs, style: customStyle });
                            }
                        }
                        return origModel(inputs);
                    };
                    try {
                        return await tts.generate(text, {
                            voice: proxyId,
                            speed: this.speed
                        });
                    } finally {
                        tts.model = origModel;
                    }
                }
                return await tts.generate(text, {
                    voice: profile.id,
                    speed: this.speed
                });
            });
            const check = this.validateAudioWaveform(audio && audio.audio);
            if (!check.valid) {
                this.neuralAvailable = false;
                this.neuralDisabledReason = 'Neural synthesis produced invalid audio (' + check.reason + ')';
                throw new Error(this.neuralDisabledReason);
            }
            return audio;
        }

        async speakWithNeural(text, profile, token) {
            const audio = await this.generateNeuralAudio(text, profile);
            if (token !== this.speakToken) return;
            this.lastEngine = 'neural';
            await this.playAudioBuffer(audio.audio, audio.sampling_rate || 24000, token);
        }

        async generateMeSpeakWav(text, profile) {
            const ms = await this.ensureMeSpeak();
            const msVoice = profile.lang === 'en-GB' && ms.isVoiceLoaded('en/en-rp') ? 'en/en-rp' : 'en/en-us';
            const speedWpm = Math.max(80, Math.min(450, Math.round(175 * this.speed * profile.rateMul)));
            const raw = ms.speak(text, {
                voice: msVoice,
                variant: profile.msVar,
                pitch: profile.msPitch,
                speed: speedWpm,
                rawdata: 'array'
            });
            if (!raw) throw new Error('meSpeak synthesis failed');
            return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
        }

        async speakWithMeSpeak(text, profile, token) {
            const u8 = await this.generateMeSpeakWav(text, profile);
            if (token !== this.speakToken) return;
            this.lastEngine = 'mespeak';
            await this.playRawWavBuffer(u8.buffer, token);
        }

        speakWithBrowser(text, profile, token) {
            return new Promise((resolve) => {
                if (!('speechSynthesis' in window) || token !== this.speakToken) {
                    resolve();
                    return;
                }
                this.lastEngine = 'browser';
                window.speechSynthesis.cancel();
                const allVoices = window.speechSynthesis.getVoices();
                const langBase = String(profile.lang || 'en-US').split('-')[0].toLowerCase();
                const langFiltered = allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langBase));
                const voices = langFiltered.length > 0 ? langFiltered : allVoices;
                const exactPool = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(String(profile.lang || 'en-US').toLowerCase()));
                const pool = exactPool.length > 0 ? exactPool : voices;
                const femaleHints = ['female', 'woman', 'zira', 'hazel', 'susan', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'libby', 'sonia', 'aria', 'jenny'];
                const maleHints = ['male', 'man', 'david', 'mark', 'george', 'daniel', 'ryan', 'guy', 'alex', 'fred', 'oliver'];
                const hints = profile.gender === 'f' ? femaleHints : maleHints;
                const genderPool = pool.filter(v => hints.some(h => v.name.toLowerCase().includes(h)));
                const finalPool = genderPool.length > 0 ? genderPool : pool;

                const ut = new SpeechSynthesisUtterance(text);
                ut.lang = profile.lang;
                if (finalPool.length > 0) {
                    const idx = this.voices.findIndex(v => v.id === profile.id);
                    ut.voice = finalPool[(idx >= 0 ? idx : 0) % finalPool.length];
                }
                ut.pitch = Math.max(0.4, Math.min(2.0, profile.pitch));
                ut.rate = Math.max(0.5, Math.min(2.0, this.speed * profile.rateMul));
                ut.onend = () => resolve();
                ut.onerror = () => resolve();
                window.speechSynthesis.speak(ut);
            });
        }

        async speak(args) {
            const text = String(args.TEXT ?? '').trim();
            if (!text) return;
            this.stopSpeaking();
            const token = this.speakToken;
            const profile = this.getVoiceProfile(this.currentVoice);

            if (this.neuralAvailable) {
                try {
                    await this.speakWithNeural(text, profile, token);
                    return;
                } catch (e) {
                    console.warn('[NeuralTTS] Swapping to programmatic TTS:', e && e.message ? e.message : e);
                }
            } else {
                console.warn('[NeuralTTS] Swapping to programmatic TTS:', this.neuralDisabledReason || 'Neural TTS unavailable');
            }

            if (token !== this.speakToken) return;

            try {
                await this.speakWithMeSpeak(text, profile, token);
                return;
            } catch (e) {
                console.warn('[NeuralTTS] meSpeak failed, swapping to browser SpeechSynthesis:', e && e.message ? e.message : e);
            }

            if (token !== this.speakToken) return;

            await this.speakWithBrowser(text, profile, token);
        }

        async getSpeechDataUri(args) {
            const text = String(args.TEXT ?? '').trim();
            if (!text) return '';
            const profile = this.getVoiceProfile(this.currentVoice);

            if (this.neuralAvailable) {
                try {
                    const audio = await this.generateNeuralAudio(text, profile);
                    this.lastEngine = 'neural';
                    return this.encodeWavDataUri(audio.audio, audio.sampling_rate || 24000);
                } catch (e) {
                    console.warn('[NeuralTTS] Swapping to programmatic TTS for data URI:', e && e.message ? e.message : e);
                }
            } else {
                console.warn('[NeuralTTS] Swapping to programmatic TTS for data URI:', this.neuralDisabledReason || 'Neural TTS unavailable');
            }

            try {
                const u8 = await this.generateMeSpeakWav(text, profile);
                this.lastEngine = 'mespeak';
                return 'data:audio/wav;base64,' + this.uint8ToBase64(u8);
            } catch (e) {
                console.warn('[NeuralTTS] Programmatic TTS data URI generation failed:', e && e.message ? e.message : e);
            }

            return '';
        }

        resolveVoiceId(query) {
            const str = String(query ?? '').trim();
            if (!str) return null;
            if (this.customVoices.has(str)) return str;
            const lower = str.toLowerCase();
            for (const cv of this.customVoices.values()) {
                if (cv.id.toLowerCase() === lower || cv.name.toLowerCase() === lower || `${cv.id} (custom)`.toLowerCase() === lower) {
                    return cv.id;
                }
            }
            const found = this.voices.find(v => v.id === str || v.id.toLowerCase() === lower || v.name.toLowerCase() === lower);
            return found ? found.id : null;
        }

        async setVoice(args) {
            let id = this.resolveVoiceId(args.VOICE);
            if (!id && this.voices.length === 0) {
                try {
                    await this.importKokoroModule();
                    id = this.resolveVoiceId(args.VOICE);
                } catch (e) {}
                if (!id && this.voices.length === 0) {
                    await this.fetchRepoVoices();
                    id = this.resolveVoiceId(args.VOICE);
                }
            }
            if (!id && this.voices.length === 0) {
                const raw = String(args.VOICE ?? '').trim();
                if (raw) id = raw;
            }
            if (id) {
                this.currentVoice = id;
                if (this.neuralAvailable) {
                    try {
                        await this.resolveVoiceEmbedding(id);
                    } catch (e) {}
                }
            }
        }

        setSpeed(args) {
            const n = Number(args.SPEED);
            if (!Number.isNaN(n)) {
                this.speed = Math.max(0.5, Math.min(2.0, n));
            }
        }

        stopSpeaking() {
            this.speakToken++;
            if (this.currentSource) {
                try {
                    this.currentSource.onended = null;
                    this.currentSource.stop();
                } catch (e) {}
                this.currentSource = null;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }

        async loadNeural() {
            if (!this.neuralAvailable) return;
            try {
                await Promise.all([
                    this.ensureKokoro(),
                    this.resolveVoiceEmbedding(this.currentVoice).catch(() => {})
                ]);
            } catch (e) {}
        }

        isNeuralLoaded() {
            return Boolean(this.kokoroInstance);
        }

        getLoadProgress() {
            if (this.kokoroInstance) return 100;
            return this.loadProgress;
        }

        getAudioMatchProgress() {
            return this.audioMatchProgress;
        }

        addBlendedVoice(args) {
            const name = String(args.NAME ?? '').trim();
            if (!name) return;
            const v1 = this.resolveVoiceId(args.VOICE1) || String(args.VOICE1 ?? 'af_heart').trim();
            const v2 = this.resolveVoiceId(args.VOICE2) || String(args.VOICE2 ?? 'am_adam').trim();
            const rawMix = Number(args.MIX);
            const mix = Number.isNaN(rawMix) ? 0.5 : Math.max(0, Math.min(100, rawMix)) / 100;
            const p1 = this.getVoiceProfile(v1);
            const p2 = this.getVoiceProfile(v2);
            const base = mix < 0.5 ? p1 : p2;
            this.customVersion++;
            this.voiceEmbeddingCache.delete(name);
            this.customVoices.set(name, {
                id: name,
                name,
                type: 'blend',
                voice1: v1,
                voice2: v2,
                mix,
                version: this.customVersion,
                lang: base.lang,
                kokoroLang: base.kokoroLang || 'en-us',
                gender: base.gender,
                pitch: p1.pitch * (1 - mix) + p2.pitch * mix,
                rateMul: p1.rateMul * (1 - mix) + p2.rateMul * mix,
                msPitch: Math.round(p1.msPitch * (1 - mix) + p2.msPitch * mix),
                msVar: base.msVar
            });
            this.refreshMenus();
        }

        addCustomVoiceFromUrl(args) {
            const name = String(args.NAME ?? '').trim();
            const url = String(args.URL ?? '').trim();
            if (!name || !url) return;
            this.customVersion++;
            this.voiceEmbeddingCache.delete(name);
            this.customVoices.set(name, {
                id: name,
                name,
                type: 'url',
                url,
                version: this.customVersion,
                lang: 'en-US',
                kokoroLang: 'en-us',
                gender: 'f',
                pitch: 1.0,
                rateMul: 1.0,
                msPitch: 50,
                msVar: 'f2'
            });
            this.refreshMenus();
        }

        async addVoiceFromAudioSample(args) {
            const name = String(args.NAME ?? '').trim();
            const url = String(args.URL ?? '').trim();
            if (!name || !url) return;
            this.audioMatchProgress = 2;
            let progressTimer = null;
            try {
                if (this.neuralAvailable && !this.kokoroInstance) {
                    progressTimer = setInterval(() => {
                        const mapped = 2 + Math.round((this.getLoadProgress() / 100) * 23);
                        if (mapped > this.audioMatchProgress) {
                            this.audioMatchProgress = Math.min(25, mapped);
                        }
                    }, 150);
                    await this.ensureKokoro().catch(() => null);
                    clearInterval(progressTimer);
                    progressTimer = null;
                }
                if (this.voices.length === 0) {
                    await this.importKokoroModule().catch(() => {});
                    if (this.voices.length === 0) {
                        await this.fetchRepoVoices();
                    }
                }
                this.audioMatchProgress = 25;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch audio sample');
                const arrBuf = await res.arrayBuffer();
                let ctx = this.getAudioContext();
                if (!ctx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!AC) throw new Error('Web Audio API unavailable');
                    ctx = new AC();
                }
                const decoded = await ctx.decodeAudioData(arrBuf);
                this.audioMatchProgress = 32;
                const len = decoded.length;
                const mono = new Float32Array(len);
                const chCount = decoded.numberOfChannels;
                for (let c = 0; c < chCount; c++) {
                    const ch = decoded.getChannelData(c);
                    for (let i = 0; i < len; i++) {
                        mono[i] += ch[i] / chCount;
                    }
                }
                const transcription = await this.transcribeAudioSample(mono, decoded.sampleRate);
                this.audioMatchProgress = 40;
                const features = this.extractAudioFeatures(transcription.speechSlice, decoded.sampleRate);
                this.audioMatchProgress = 45;
                const weights = await this.findBestVoiceMatch(features, transcription.text, transcription.hasText);
                const primary = this.getVoiceProfile(weights[0].id);
                let pitch = 0;
                let msPitch = 0;
                for (const w of weights) {
                    const p = this.getVoiceProfile(w.id);
                    pitch += p.pitch * w.weight;
                    msPitch += p.msPitch * w.weight;
                }
                this.customVersion++;
                this.voiceEmbeddingCache.delete(name);
                this.customVoices.set(name, {
                    id: name,
                    name,
                    type: 'multiBlend',
                    weights,
                    version: this.customVersion,
                    lang: primary.lang,
                    kokoroLang: 'en-us',
                    gender: primary.gender,
                    pitch,
                    rateMul: features.rateMul || primary.rateMul,
                    msPitch: Math.round(msPitch),
                    msVar: primary.msVar
                });
                this.refreshMenus();
                if (this.neuralAvailable) {
                    try {
                        await this.resolveVoiceEmbedding(name);
                    } catch (e) {}
                }
                this.audioMatchProgress = 100;
            } catch (e) {
                if (progressTimer) clearInterval(progressTimer);
                this.audioMatchProgress = 0;
                console.warn('[NeuralTTS] Could not match voice from audio sample:', e && e.message ? e.message : e);
            }
        }

        removeCustomVoice(args) {
            const name = String(args.NAME ?? '').trim();
            if (!name) return;
            this.customVoices.delete(name);
            this.voiceEmbeddingCache.delete(name);
            if (this.currentVoice === name) {
                this.currentVoice = (this.voices[0] && this.voices[0].id) || 'af_heart';
            }
            this.refreshMenus();
        }

        serializeCustomVoice(cv) {
            const entry = {
                id: cv.id,
                name: cv.name,
                type: cv.type,
                lang: cv.lang || 'en-US',
                kokoroLang: cv.kokoroLang || 'en-us',
                gender: cv.gender || 'f',
                pitch: typeof cv.pitch === 'number' ? cv.pitch : 1.0,
                rateMul: typeof cv.rateMul === 'number' ? cv.rateMul : 1.0,
                msPitch: typeof cv.msPitch === 'number' ? cv.msPitch : 50,
                msVar: cv.msVar || 'f2'
            };
            if (cv.type === 'blend') {
                entry.voice1 = cv.voice1;
                entry.voice2 = cv.voice2;
                entry.mix = cv.mix;
            } else if (cv.type === 'multiBlend') {
                entry.weights = Array.isArray(cv.weights) ? cv.weights.map(w => ({ id: w.id, weight: w.weight })) : [];
            } else if (cv.type === 'url') {
                entry.url = cv.url;
                if (String(cv.url || '').startsWith('blob:') && this.voiceEmbeddingCache.has(cv.id)) {
                    entry.type = 'embedding';
                    entry.embeddingB64 = this.float32ToBase64(this.voiceEmbeddingCache.get(cv.id));
                }
            } else if (cv.type === 'embedding') {
                if (cv.embeddingB64) {
                    entry.embeddingB64 = cv.embeddingB64;
                } else if (this.voiceEmbeddingCache.has(cv.id)) {
                    entry.embeddingB64 = this.float32ToBase64(this.voiceEmbeddingCache.get(cv.id));
                }
            }
            return entry;
        }

        exportCustomVoices(args) {
            const query = String((args && args.VOICE) ?? '').trim();
            if (!query) return '';
            let cv = this.customVoices.get(query);
            if (!cv) {
                const lower = query.toLowerCase();
                for (const item of this.customVoices.values()) {
                    if (item.id.toLowerCase() === lower || item.name.toLowerCase() === lower) {
                        cv = item;
                        break;
                    }
                }
            }
            if (!cv) return '';
            return JSON.stringify({
                format: 'neuraltts-custom-voice-v1',
                voice: this.serializeCustomVoice(cv)
            });
        }

        importCustomVoices(args) {
            const raw = String(args.DATA ?? '').trim();
            if (!raw) return;
            try {
                const parsed = JSON.parse(raw);
                let list = [];
                if (Array.isArray(parsed)) {
                    list = parsed;
                } else if (parsed && Array.isArray(parsed.voices)) {
                    list = parsed.voices;
                } else if (parsed && parsed.voice && typeof parsed.voice === 'object') {
                    list = [parsed.voice];
                } else if (parsed && typeof parsed === 'object' && (parsed.id || parsed.name)) {
                    list = [parsed];
                }
                let importedCount = 0;
                for (const item of list) {
                    if (!item || typeof item !== 'object') continue;
                    const id = String(item.id || item.name || '').trim();
                    if (!id) continue;
                    const name = String(item.name || id).trim();
                    const type = String(item.type || '').trim();
                    this.customVersion++;
                    this.voiceEmbeddingCache.delete(id);
                    const baseMeta = {
                        id,
                        name,
                        version: this.customVersion,
                        lang: String(item.lang || 'en-US'),
                        kokoroLang: String(item.kokoroLang || 'en-us'),
                        gender: String(item.gender || 'f'),
                        pitch: typeof item.pitch === 'number' && !Number.isNaN(item.pitch) ? item.pitch : 1.0,
                        rateMul: typeof item.rateMul === 'number' && !Number.isNaN(item.rateMul) ? item.rateMul : 1.0,
                        msPitch: typeof item.msPitch === 'number' && !Number.isNaN(item.msPitch) ? Math.round(item.msPitch) : 50,
                        msVar: String(item.msVar || 'f2')
                    };
                    if (type === 'blend' && item.voice1 && item.voice2) {
                        const mixVal = typeof item.mix === 'number' && !Number.isNaN(item.mix)
                            ? Math.max(0, Math.min(1, item.mix > 1 ? item.mix / 100 : item.mix))
                            : 0.5;
                        this.customVoices.set(id, {
                            ...baseMeta,
                            type: 'blend',
                            voice1: String(item.voice1),
                            voice2: String(item.voice2),
                            mix: mixVal
                        });
                        importedCount++;
                    } else if (type === 'multiBlend' && Array.isArray(item.weights) && item.weights.length > 0) {
                        const weights = this.normalizeWeights(item.weights.map(w => ({
                            id: String(w.id || ''),
                            weight: Number(w.weight) || 0
                        })).filter(w => w.id));
                        if (weights.length > 0) {
                            this.customVoices.set(id, {
                                ...baseMeta,
                                type: 'multiBlend',
                                weights
                            });
                            importedCount++;
                        }
                    } else if (type === 'embedding' && typeof item.embeddingB64 === 'string' && item.embeddingB64.length > 0) {
                        const f32 = this.base64ToFloat32(item.embeddingB64);
                        this.voiceEmbeddingCache.set(id, f32);
                        this.customVoices.set(id, {
                            ...baseMeta,
                            type: 'embedding',
                            embeddingB64: item.embeddingB64
                        });
                        importedCount++;
                    } else if (type === 'url' && typeof item.url === 'string' && item.url.trim()) {
                        this.customVoices.set(id, {
                            ...baseMeta,
                            type: 'url',
                            url: item.url.trim(),
                            embeddingB64: typeof item.embeddingB64 === 'string' ? item.embeddingB64 : undefined
                        });
                        if (typeof item.embeddingB64 === 'string' && item.embeddingB64.length > 0) {
                            this.voiceEmbeddingCache.set(id, this.base64ToFloat32(item.embeddingB64));
                        }
                        importedCount++;
                    }
                }
                if (importedCount > 0) {
                    this.refreshMenus();
                }
            } catch (e) {
                console.warn('[NeuralTTS] Failed to import custom voices:', e && e.message ? e.message : e);
            }
        }

        canUseNeural() {
            return Boolean(this.neuralAvailable);
        }

        getVoice() {
            return this.currentVoice;
        }

        getVoicesList() {
            const ids = this.voices.map(v => v.id);
            for (const id of this.customVoices.keys()) {
                ids.push(id);
            }
            return JSON.stringify(ids);
        }
    }

    Scratch.extensions.register(new P7NeuralTTS());
})(Scratch);
