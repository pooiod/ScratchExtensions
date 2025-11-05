// Name: FilePile
// ID: P7FilePile
// Description: Easy file sharing and distribution extension using MQTT.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: dev
// Unsandboxed: true
// WIP: false
// Created: Nov 3, 2025
// Docs: /docs/#/FilePile
// Notes: Uses wss://broker.emqx.io:8084/mqtt and paho-mqtt/1.0.1/mqttws31.min.js for communication.

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    async function waitForPaho() {
        if (typeof Paho !== 'undefined') return;
        if (!document.querySelector('script[src*="mqttws31.min.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js';
            document.head.appendChild(script);
        }
        for (let i = 0; i < 100; i++) {
            if (typeof Paho !== 'undefined') return;
            await new Promise(r => setTimeout(r, 100));
        }
    }

    function randDigits(n) {
        let s = '';
        for (let i = 0; i < n; i++) s += String(Math.floor(Math.random() * 10));
        return s;
    }

    function toBase64(str) {
        try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { return ''; }
    }

    function fromBase64(b) {
        try { return decodeURIComponent(escape(atob(b))); } catch (e) { return ''; }
    }

    function hexToString(hex) {
        if (!hex) return '';
        hex = hex.replace(/[^0-9a-fA-F]/g, '');
        const len = hex.length;
        const bytes = new Uint8Array(Math.ceil(len / 2));
        for (let i = 0; i < bytes.length; i++) {
            const j = i * 2;
            bytes[i] = parseInt(hex.substr(j, 2) || '00', 16);
        }
        try { return new TextDecoder().decode(bytes); } catch (e) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return s; }
    }

    function stringToHex(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str || '');
        let out = '';
        for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
        return out;
    }

    function binaryToString(bits) {
        bits = (bits || '').replace(/[^01]/g, '');
        const bytes = [];
        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.substr(i, 8).padEnd(8, '0');
            bytes.push(parseInt(byte, 2));
        }
        try { return new TextDecoder().decode(new Uint8Array(bytes)); } catch (e) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return s; }
    }

    function stringToBinary(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str || '');
        let out = '';
        for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(2).padStart(8, '0');
        return out;
    }

    class FilePile {
        constructor() {
            this.client = null;
            this.connected = false;
            this.files = {};
            this.room = '0';
            this.downloads = {};
            this.polls = {};
            this.seeders = {};
            this.fileSeeders = {};
            this.displayName = 'Piler' + randDigits(4);
            this.integrityForHello = this._integrity('Hello, world');
            this.searchResponses = {};
            this._nextSearchId = 1;
            this._announceTimer = null;
            this._pruneTimer = null;
            this.MAX_CHUNK_BYTES = 524288;
            this.DEFAULT_RETRIES = 6;
            this.DEFAULT_CONCURRENCY = 8;
            this.MinSearchTime = 5;
        }

        getInfo() {
            return {
                id: 'P7FilePile',
                name: 'FilePile',
                color1: '#4C7C8E',
                blocks: [
                    {
                        opcode: 'activeFiles',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Active files'
                    },
                    {
                        opcode: 'getRoom',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Room'
                    },
                    {
                        opcode: 'currentSeeders',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Connected users'
                    },

                    "---",

                    {
                        opcode: 'setDisplayName',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set display name to [DISPLAYNAME]',
                        arguments: {
                            DISPLAYNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.displayName
                            }
                        }
                    },
                    {
                        opcode: 'setRoom',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set room [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.room
                            }
                        }
                    },
                    {
                        opcode: 'changeMinSearchTime',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set search time to [TIME]',
                        arguments: {
                            TIME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.MinSearchTime
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'addFile',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add file [CONTENT] as [NAME] format [FORMAT]',
                        arguments: {
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, world'
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            },
                            FORMAT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'fileFormats',
                                defaultValue: 'Raw'
                            }
                        }
                    },
                    {
                        opcode: 'removeFile',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove file [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'removeFiles',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove all files'
                    },

                    "---",

                    {
                        opcode: 'getFile',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get content from file [FILENAME] as [FORMAT]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            },
                            FORMAT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'fileFormats',
                                defaultValue: 'Raw'
                            }
                        }
                    },
                    {
                        opcode: 'search',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Search for [THING] by [MODE]',
                        arguments: {
                            THING: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello'
                            },
                            MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'searchModes',
                                defaultValue: 'File Name'
                            }
                        }
                    },
                    {
                        opcode: 'computeIntegrity',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Integrity ID of [CONTENT]',
                        arguments: {
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, world'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'startDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Start downloading [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt:' + this.integrityForHello
                            }
                        }
                    },
                    {
                        opcode: 'pauseDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Pause download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'resumeDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Resume download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'cancelDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Cancel download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'exportDownload',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Export download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'importDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Import download [JSON]',
                        arguments: {
                            JSON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'listDownloads',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Working downloads'
                    },
                    {
                        opcode: 'estimateSpeed',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Estimate speed [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'progress',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Progress of download [FILE]',
                        arguments: {
                            FILE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    }
                ],
                menus: {
                    searchModes: {
                        acceptReporters: true,
                        items: ['File Name', 'File Text', 'File Content']
                    },
                    fileFormats: {
                        acceptReporters: true,
                        items: ['Raw', 'Binary', 'Hex', 'Base64']
                    }
                }
            };
        }

        _sanitizeString(str) {
            return str.replace(/[^a-zA-Z0-9`~!@#$%^&*()_\-+=\[\]{}\\|;'",.<>/? ]/g, '').replace(/ /g, '_').replace(/[^a-zA-Z0-9`~!@#$%^&*()_\-+=\[\]{}\\|;'",.<>/?_]/g, '#');
        }

        async _makeSureConnected() {
            await waitForPaho();
            if (this.client && this.connected) return;
            if (typeof Paho === 'undefined') return;
            const clientId = this.displayName + '_' + Date.now();
            this.client = new Paho.MQTT.Client('broker.emqx.io', 8084, '/mqtt', clientId);
            this.client.onMessageArrived = m => this._onMessage(m);
            this.client.onConnectionLost = () => {
                this.connected = false;
                if (this._announceTimer) clearInterval(this._announceTimer);
                if (this._pruneTimer) clearInterval(this._pruneTimer);
            };
            await new Promise(resolve => {
                this.client.connect({
                    useSSL: true,
                    onSuccess: () => {
                        this.connected = true;
                        try { this.client.subscribe('FilePile/' + this.room); } catch (e) { }
                        this._announce();
                        this._announceTimer = setInterval(() => {
                            if (this.client && this.connected) this._announce();
                        }, 10000);
                        this._pruneTimer = setInterval(() => {
                            this._pruneSeeders();
                        }, 10000);
                        resolve();
                    },
                    onFailure: () => resolve()
                });
            });
        }

        _announce() {
            if (!this.client) return;
            const msg = new Paho.MQTT.Message(JSON.stringify({
                type: 'announce',
                name: this.displayName,
                time: Date.now()
            }));
            msg.destinationName = 'FilePile/' + this.room;
            try { this.client.send(msg); } catch (e) { }
        }

        _pruneSeeders() {
            const now = Date.now();
            for (const k in this.seeders) {
                if (now - this.seeders[k] > 30000) delete this.seeders[k];
            }
            for (const f in this.fileSeeders) {
                for (const p in this.fileSeeders[f]) {
                    if (now - this.fileSeeders[f][p] > 30000) delete this.fileSeeders[f][p];
                }
            }
        }

        async _onMessage(m) {
            try {
                const data = JSON.parse(m.payloadString);
                if (!data || !data.type) return;
                if (data.type === 'announce' && data.name) {
                    this.seeders[data.name] = Date.now();
                }
                if (data.type === 'search' && data.from && data.searchId) {
                    const results = await this._localSearchEntries(data.query, data.mode || 'File Name');
                    for (let i = 0; i < results.length; i++) {
                        const r = results[i];
                        const payload = {
                            type: 'result',
                            to: data.from,
                            searchId: data.searchId,
                            file: r.file,
                            integrity: r.integrity,
                            sizeBits: r.sizeBits,
                            score: r.score,
                            from: this.displayName
                        };
                        if (i % 1000 === 0) await new Promise(r => setTimeout(r, 0));
                        const msg = new Paho.MQTT.Message(JSON.stringify(payload));
                        msg.destinationName = 'FilePile/' + this.room;
                        try { this.client.send(msg); } catch (e) { }
                    }
                }
                if (data.type === 'result' && data.to === this.displayName && data.searchId) {
                    const sid = data.searchId;
                    if (!this.searchResponses[sid]) this.searchResponses[sid] = [];
                    if (!data.file || !data.integrity) return;
                    const exists = this.searchResponses[sid].some(r => r.file === data.file && r.integrity === data.integrity);
                    if (!exists) {
                        this.searchResponses[sid].push({
                            file: data.file,
                            integrity: data.integrity,
                            sizeBits: data.sizeBits || 0,
                            score: data.score || 0,
                            from: data.from
                        });
                    }
                    if (data.file && data.from) {
                        this.fileSeeders[data.file] = this.fileSeeders[data.file] || {};
                        this.fileSeeders[data.file][data.from] = Date.now();
                    }
                }
                if (data.type === 'request' && data.file && data.from) {
                    const entry = this.files[data.file];
                    if (!entry) return;
                    if (data.integrity && entry.integrity !== data.integrity) return;
                    const bytes = new TextEncoder().encode(entry.content || '');
                    const chunkSize = Math.min(this.MAX_CHUNK_BYTES, Math.max(1, bytes.length));
                    const totalChunks = Math.max(1, Math.ceil(bytes.length / chunkSize));
                    const idx = (typeof data.chunkIndex === 'number') ? data.chunkIndex : 0;
                    if (idx < 0 || idx >= totalChunks) return;
                    const start = idx * chunkSize;
                    const end = Math.min(bytes.length, start + chunkSize);
                    const slice = bytes.slice(start, end);
                    let chunkStr = '';
                    try { chunkStr = fromBase64(toBase64(new TextDecoder().decode(slice))); } catch (e) { chunkStr = new TextDecoder().decode(slice); }
                    const payload = {
                        type: 'chunk',
                        to: data.from,
                        file: data.file,
                        integrity: entry.integrity,
                        chunkIndex: idx,
                        totalChunks: totalChunks,
                        content: toBase64(chunkStr),
                        from: this.displayName
                    };
                    const msg = new Paho.MQTT.Message(JSON.stringify(payload));
                    msg.destinationName = 'FilePile/' + this.room;
                    try { this.client.send(msg); } catch (e) { }
                }
                if (data.type === 'chunk' && data.to === this.displayName && data.file) {
                    if (!data.file || !data.integrity) return;
                    const key = data.file + '::' + data.integrity;
                    const dl = this.downloads[key];
                    if (!dl) return;
                    if (dl.totalChunks == null) dl.totalChunks = data.totalChunks;
                    if (!dl.received) dl.received = {};
                    if (typeof dl.received[data.chunkIndex] !== 'undefined') return;
                    const now = Date.now();
                    const chunkStr = fromBase64(data.content || '');
                    dl.received[data.chunkIndex] = chunkStr;
                    dl.receivedCount = Object.keys(dl.received).length;
                    const bytes = (chunkStr || '').length;
                    if (!dl.speedHistory) dl.speedHistory = [];
                    if (dl.lastChunkTime && dl.lastChunkBytes != null) {
                        const dt = (now - dl.lastChunkTime) / 1000;
                        if (dt > 0) {
                            const kb = (bytes) / 1024;
                            const kbps = kb / dt;
                            dl.speedHistory.push(kbps);
                            if (dl.speedHistory.length > 20) dl.speedHistory.shift();
                        }
                    }
                    dl.lastChunkTime = now;
                    dl.lastChunkBytes = bytes;
                    if (dl.inactivityTimer) {
                        clearTimeout(dl.inactivityTimer);
                        dl.inactivityTimer = null;
                    }
                    dl.inactivityTimer = setTimeout(() => {
                        dl.lastChunkTime = null;
                        dl.lastChunkBytes = null;
                    }, 2000);
                    if (dl.requestedTimers && dl.requestedTimers[data.chunkIndex]) {
                        clearTimeout(dl.requestedTimers[data.chunkIndex]);
                        delete dl.requestedTimers[data.chunkIndex];
                    }
                    if (dl.outstanding && dl.outstanding[data.chunkIndex]) {
                        delete dl.outstanding[data.chunkIndex];
                    }
                    if (dl.receivedCount >= (dl.totalChunks || 0)) {
                        const parts = [];
                        for (let i = 0; i < dl.totalChunks; i++) parts.push(dl.received[i] || '');
                        const content = parts.join('');
                        const fullIntegrity = this._integrity(content);
                        if (fullIntegrity === dl.integrity) {
                            this.files[dl.file] = { content: content, integrity: dl.integrity, sizeBits: content.length * 8 };
                        }
                        if (dl.completionPoll) {
                            clearInterval(dl.completionPoll);
                            dl.completionPoll = null;
                        }
                        for (const t in dl.requestedTimers) clearTimeout(dl.requestedTimers[t]);
                        delete this.downloads[key];
                    } else {
                        if (!dl.paused) this._requestNextChunks(dl);
                    }
                }
            } catch (e) { }
        }

        _integrity(content) {
            let hash = 0;
            if (!content) return '000000';
            for (let i = 0; i < content.length; i++) hash = (hash + content.charCodeAt(i)) % 1000000;
            return ('000000' + hash).slice(-6);
        }

        _parseQueryToOrClauses(q) {
            const parts = q.split(/\s+OR\s+/i).map(s => s.trim()).filter(Boolean);
            const orClauses = parts.map(clause => {
                const tokens = [];
                let cur = '';
                let inQuotes = false;
                for (let i = 0; i < clause.length; i++) {
                    const ch = clause[i];
                    if (ch === '"') { inQuotes = !inQuotes; cur += ch; continue; }
                    if (!inQuotes && ch === ' ') { if (cur) { tokens.push(cur); cur = ''; } continue; }
                    cur += ch;
                }
                if (cur) tokens.push(cur);
                const filters = [];
                tokens.forEach(tok => {
                    let neg = false;
                    if (tok.startsWith('-"') && tok.endsWith('"')) { neg = true; tok = tok.slice(2, -1); }
                    else if (tok.startsWith('-"')) { neg = true; tok = tok.slice(2); if (tok.endsWith('"')) tok = tok.slice(0, -1); }
                    else if (tok.startsWith('-')) { neg = true; tok = tok.slice(1); }
                    let m;
                    if ((m = tok.match(/^filetype:(.+)$/i))) {
                        const ext = m[1].toLowerCase();
                        filters.push({ type: 'filetype', ext, neg });
                        return;
                    }
                    if ((m = tok.match(/^filename:(.+)$/i))) {
                        const name = m[1].toLowerCase();
                        filters.push({ type: 'filename', name, neg });
                        return;
                    }
                    if ((m = tok.match(/^integrity:(\d{6})$/i))) {
                        filters.push({ type: 'integrity', val: m[1], neg });
                        return;
                    }
                    if ((m = tok.match(/^size([<>=])(\d+)$/i))) {
                        filters.push({ type: 'size', op: m[1], val: parseInt(m[2], 10), neg });
                        return;
                    }
                    if ((m = tok.match(/^"(.+)"$/))) {
                        const text = m[1].toLowerCase();
                        filters.push({ type: 'text', text, neg });
                        return;
                    }
                    if (tok === '*') {
                        filters.push({ type: 'all', neg });
                        return;
                    }
                    filters.push({ type: 'text', text: tok.toLowerCase(), neg });
                });
                return filters;
            });
            return orClauses;
        }

        _entryMatchesOrClauses(entry, orClauses, mode) {
            const name = entry.file.toLowerCase();
            const integrity = (entry.integrity || '').toString();
            const size = entry.sizeBits || 0;
            const contentLower = entry.content && entry.content.toLowerCase ? entry.content.toLowerCase() : '';
            const hexContent = this._toHex(entry.content || '');
            for (let i = 0; i < orClauses.length; i++) {
                const clause = orClauses[i];
                let clauseOk = true;
                for (let j = 0; j < clause.length; j++) {
                    const f = clause[j];
                    let ok = true;
                    if (f.type === 'filetype') {
                        const parts = name.split('.');
                        const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
                        ok = (ext === f.ext);
                    } else if (f.type === 'filename') {
                        ok = name.indexOf(f.name) !== -1;
                    } else if (f.type === 'integrity') {
                        ok = integrity === f.val;
                    } else if (f.type === 'size') {
                        if (f.op === '>') ok = size > f.val;
                        else if (f.op === '<') ok = size < f.val;
                        else ok = size === f.val;
                    } else if (f.type === 'text') {
                        if (mode === 'File Name') {
                            ok = name.indexOf(f.text) !== -1;
                        } else if (mode === 'File Text') {
                            ok = contentLower.indexOf(f.text) !== -1;
                        } else if (mode === 'File Content') {
                            ok = hexContent.indexOf(f.text) !== -1;
                        } else {
                            ok = name.indexOf(f.text) !== -1 || contentLower.indexOf(f.text) !== -1 || hexContent.indexOf(f.text) !== -1;
                        }
                    } else if (f.type === 'all') {
                        ok = true;
                    }
                    if (f.neg) ok = !ok;
                    if (!ok) { clauseOk = false; break; }
                }
                if (clauseOk) return true;
            }
            return false;
        }

        _scoreEntryAgainstQuery(entry, query, mode) {
            const q = (query || '').toString().toLowerCase();
            if (q === '*') return 1;
            if (mode === 'File Name') {
                const name = entry.file.toLowerCase();
                if (name === q) return 1;
                const max = Math.max(name.length, q.length);
                if (max === 0) return 1;
                const dist = this._lev(name, q);
                return 1 - (dist / max);
            } else if (mode === 'File Text') {
                const content = (entry.content || '').toString().toLowerCase();
                if (content === q) return 1;
                const max = Math.max(content.length, q.length);
                if (max === 0) return 1;
                const dist = this._lev(content, q);
                return 1 - (dist / max);
            } else if (mode === 'File Content') {
                const hex = this._toHex(entry.content || '');
                if (hex === q) return 1;
                const max = Math.max(hex.length, q.length);
                if (max === 0) return 1;
                const dist = this._lev(hex, q);
                return 1 - (dist / max);
            } else {
                return this._scoreEntryAgainstQuery(entry, query, 'File Name');
            }
        }

        _lev(a, b) {
            const m = a.length, n = b.length;
            const dp = new Array(m + 1);
            for (let i = 0; i <= m; i++) {
                dp[i] = new Array(n + 1);
                dp[i][0] = i;
            }
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
                }
            }
            return dp[m][n];
        }

        async _localSearchEntries(query, mode) {
            const res = [];
            const orClauses = this._parseQueryToOrClauses(query || '');
            const fileNames = Object.keys(this.files);
            for (let i = 0; i < fileNames.length; i++) {
                const name = fileNames[i];
                const e = this.files[name];
                const entry = { file: name, integrity: e.integrity || this._integrity(e.content || ''), sizeBits: e.sizeBits || ((e.content || '').length * 8), content: e.content };
                if (this._entryMatchesOrClauses(entry, orClauses, mode)) {
                    entry.score = this._scoreEntryAgainstQuery(entry, query, mode);
                    res.push(entry);
                }
                if (i % 1000 === 0) await new Promise(r => setTimeout(r, 0));
            }
            return res;
        }

        _toHex(str) {
            const encoder = new TextEncoder();
            const bytes = encoder.encode(str || '');
            let out = '';
            for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
            return out;
        }

        async search(args) {
            await this._makeSureConnected();
            const queryRaw = (args.THING || '').toString();
            const mode = args.MODE || 'File Name';
            const sid = 's' + (this._nextSearchId++);
            this.searchResponses[sid] = [];
            const msg = new Paho.MQTT.Message(JSON.stringify({
                type: 'search',
                query: queryRaw,
                from: this.displayName,
                searchId: sid,
                mode: mode
            }));
            msg.destinationName = 'FilePile/' + this.room;
            try { if (this.client) this.client.send(msg); } catch (e) { }
            const baseTime = this.MinSearchTime * 1000;
            const start = Date.now();
            let timeout = baseTime;
            while (true) {
                await new Promise(r => setTimeout(r, timeout));
                const count = (this.searchResponses[sid] || []).length;
                const extraSec = Math.min(59, Math.floor(count / 50));
                if (extraSec > 0) {
                    timeout = baseTime + extraSec * 2000;
                } else {
                    break;
                }
                if ((Date.now() - start) > 60000) break;
            }
            const local = await this._localSearchEntries(queryRaw, mode);
            const remote = this.searchResponses[sid] || [];
            const combined = [];
            const seen = {};
            local.forEach(r => {
                const key = r.file + '::' + r.integrity;
                if (!seen[key]) { combined.push(r); seen[key] = true; }
            });
            remote.forEach(r => {
                if (!r.file || !r.integrity) return;
                const entry = { file: r.file, integrity: r.integrity, sizeBits: r.sizeBits || 0, from: r.from };
                const key = entry.file + '::' + entry.integrity;
                if (!seen[key]) {
                    entry.score = this._scoreEntryAgainstQuery(entry, queryRaw, mode);
                    combined.push(entry);
                    seen[key] = true;
                }
                if (r.file && r.from) {
                    this.fileSeeders[r.file] = this.fileSeeders[r.file] || {};
                    this.fileSeeders[r.file][r.from] = Date.now();
                }
            });
            combined.sort((a, b) => (b.score || 0) - (a.score || 0));
            const out = combined.map(e => e.file + ':' + e.integrity);
            delete this.searchResponses[sid];
            return out.join(", ");
        }

        _ensureDownloadObject(file, integrity, chunkSize) {
            if (!file || !integrity) return null;
            const key = file + '::' + integrity;
            if (!this.downloads[key]) {
                const seeders = this.fileSeeders[file] ? Object.keys(this.fileSeeders[file]).length : 0;
                const concurrency = Math.max(2, Math.min(12, Math.floor(Math.max(this.DEFAULT_CONCURRENCY, seeders * 2))));
                this.downloads[key] = {
                    file: file,
                    integrity: integrity,
                    chunkSize: chunkSize || this.MAX_CHUNK_BYTES,
                    totalChunks: null,
                    received: {},
                    receivedCount: 0,
                    paused: false,
                    retries: {},
                    requestedTimers: {},
                    outstanding: {},
                    speedHistory: [],
                    lastChunkTime: null,
                    lastChunkBytes: null,
                    inactivityTimer: null,
                    completionPoll: null,
                    lastProgressCount: 0,
                    lastProgressTime: 0,
                    concurrency: concurrency
                };
            }
            return this.downloads[key];
        }

        async startDownload(args) {
            await this._makeSureConnected();
            let input = (args.FILENAME || '').toString();
            try {
                const parsed = JSON.parse(input);
                if (parsed && parsed.file && parsed.integrity) {
                    const file = parsed.file;
                    const integrity = parsed.integrity;
                    const chunkSize = parsed.chunkSize || this.MAX_CHUNK_BYTES;
                    const dl = this._ensureDownloadObject(file, integrity, chunkSize);
                    if (!dl) return;
                    if (parsed.totalChunks) dl.totalChunks = parsed.totalChunks;
                    if (parsed.received) {
                        dl.received = parsed.received;
                        dl.receivedCount = Object.keys(dl.received).length;
                    }
                    dl.paused = false;
                    dl.lastProgressCount = dl.receivedCount || 0;
                    dl.lastProgressTime = Date.now();
                    this._requestNextChunks(dl);
                    return;
                }
            } catch (e) { }
            let name = input;
            let wantedIntegrity = null;
            if (name.indexOf(':') !== -1) {
                const parts = name.split(':');
                wantedIntegrity = parts.pop();
                name = parts.join(':');
            }
            if (wantedIntegrity) {
                if (this.files[name] && this.files[name].integrity && this.files[name].integrity !== wantedIntegrity) return;
            }
            const attemptStart = async () => {
                if (wantedIntegrity == null) {
                    const res = await this.search({ THING: name, MODE: 'File Name' });
                    const arr = res.split(',').map(x => x.trim()).filter(x => x);
                    if (arr.length === 0) return null;
                    const first = arr[0];
                    if (!first.startsWith(name)) return null;
                    wantedIntegrity = first.split(':')[1];
                }
                if (this.files[name] && this.files[name].integrity && this.files[name].integrity === wantedIntegrity) return null;
                const dl = this._ensureDownloadObject(name, wantedIntegrity, this.MAX_CHUNK_BYTES);
                if (!dl) return null;
                dl.paused = false;
                dl.totalChunks = null;
                dl.lastProgressCount = dl.receivedCount || 0;
                dl.lastProgressTime = Date.now();
                this._requestNextChunks(dl);
                if (dl.completionPoll) {
                    clearInterval(dl.completionPoll);
                    dl.completionPoll = null;
                }
                dl.completionPoll = setInterval(() => {
                    const cur = this.downloads[name + '::' + wantedIntegrity];
                    if (!cur) {
                        clearInterval(dl.completionPoll);
                        return;
                    }
                    const progress = cur.receivedCount || 0;
                    if (progress === (cur.lastProgressCount || 0)) {
                        if (Date.now() - (cur.lastProgressTime || 0) > 2000) {
                            cur.lastChunkTime = null;
                            cur.lastChunkBytes = null;
                        }
                    } else {
                        cur.lastProgressCount = progress;
                        cur.lastProgressTime = Date.now();
                    }
                }, 500);
                return dl;
            };
            let dl = await attemptStart();
            if (dl) return;
            if (this.polls[name]) return;
            this.polls[name] = setInterval(async () => {
                const d = await attemptStart();
                if (d) {
                    clearInterval(this.polls[name]);
                    delete this.polls[name];
                }
            }, 10000);
        }

        _requestNextChunks(dl) {
            if (!dl || dl.paused) return;
            const concurrency = dl.concurrency || this.DEFAULT_CONCURRENCY;
            if (!dl.outstanding) dl.outstanding = {};
            let outstandingCount = Object.keys(dl.outstanding || {}).length;
            const tryFill = () => {
                while (outstandingCount < concurrency) {
                    let next = -1;
                    if (dl.totalChunks != null) {
                        for (let i = 0; i < dl.totalChunks; i++) {
                            if (!dl.received[i] && !dl.outstanding[i]) { next = i; break; }
                        }
                        if (next === -1) break;
                    } else {
                        let i = 0;
                        while (dl.received[i] || dl.outstanding[i]) i++;
                        next = i;
                    }
                    outstandingCount++;
                    dl.outstanding[next] = true;
                    dl.retries[next] = dl.retries[next] || 0;
                    const payload = { type: 'request', file: dl.file, integrity: dl.integrity, from: this.displayName, chunkIndex: next };
                    const msg = new Paho.MQTT.Message(JSON.stringify(payload));
                    msg.destinationName = 'FilePile/' + this.room;
                    try { if (this.client) this.client.send(msg); } catch (e) { }
                    const retryFn = () => {
                        if (!this.downloads[dl.file + '::' + dl.integrity]) return;
                        if (dl.retries[next] >= this.DEFAULT_RETRIES) {
                            if (dl.requestedTimers && dl.requestedTimers[next]) {
                                clearTimeout(dl.requestedTimers[next]);
                                delete dl.requestedTimers[next];
                            }
                            if (dl.outstanding && dl.outstanding[next]) delete dl.outstanding[next];
                            outstandingCount = Object.keys(dl.outstanding || {}).length;
                            return;
                        }
                        dl.retries[next]++;
                        const p = new Paho.MQTT.Message(JSON.stringify(payload));
                        p.destinationName = 'FilePile/' + this.room;
                        try { if (this.client) this.client.send(p); } catch (e) { }
                        dl.requestedTimers[next] = setTimeout(retryFn, 1500);
                    };
                    dl.requestedTimers[next] = setTimeout(retryFn, 1500);
                }
            };
            tryFill();
        }

        async pauseDownload(args) {
            await this._makeSureConnected();
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    this.downloads[k].paused = true;
                    for (const t in this.downloads[k].requestedTimers) {
                        clearTimeout(this.downloads[k].requestedTimers[t]);
                    }
                    this.downloads[k].requestedTimers = {};
                    this.downloads[k].outstanding = {};
                    if (this.downloads[k].completionPoll) { clearInterval(this.downloads[k].completionPoll); this.downloads[k].completionPoll = null; }
                    if (this.downloads[k].inactivityTimer) { clearTimeout(this.downloads[k].inactivityTimer); this.downloads[k].inactivityTimer = null; }
                }
            }
            if (this.polls[fname]) {
                clearInterval(this.polls[fname]);
                delete this.polls[fname];
            }
        }

        async resumeDownload(args) {
            await this._makeSureConnected();
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    dl.paused = false;
                    if (!dl.completionPoll) {
                        dl.completionPoll = setInterval(() => {
                            const cur = this.downloads[k];
                            if (!cur) return;
                            const progress = cur.receivedCount || 0;
                            if (progress === (cur.lastProgressCount || 0)) {
                                if (Date.now() - (cur.lastProgressTime || 0) > 2000) {
                                    cur.lastChunkTime = null;
                                    cur.lastChunkBytes = null;
                                }
                            } else {
                                cur.lastProgressCount = progress;
                                cur.lastProgressTime = Date.now();
                            }
                        }, 500);
                    }
                    this._requestNextChunks(dl);
                }
            }
        }

        async cancelDownload(args) {
            await this._makeSureConnected();
            const fname = (args.FILENAME || '').toString();
            for (const k in Object.assign({}, this.downloads)) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    if (dl && dl.requestedTimers) for (const t in dl.requestedTimers) clearTimeout(dl.requestedTimers[t]);
                    if (dl && dl.completionPoll) clearInterval(dl.completionPoll);
                    if (dl && dl.inactivityTimer) clearTimeout(dl.inactivityTimer);
                    delete this.downloads[k];
                }
            }
            if (this.polls[fname]) {
                clearInterval(this.polls[fname]);
                delete this.polls[fname];
            }
        }

        async exportDownload(args) {
            await this._makeSureConnected();
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    const exported = {
                        file: dl.file,
                        integrity: dl.integrity,
                        chunkSize: dl.chunkSize,
                        totalChunks: dl.totalChunks,
                        received: dl.received || {}
                    };
                    return JSON.stringify(exported);
                }
            }
            return '{}';
        }

        async importDownload(args) {
            await this._makeSureConnected();
            const json = (args.JSON || '').toString();
            try {
                const parsed = JSON.parse(json);
                if (!parsed.file || !parsed.integrity) return;
                const dl = this._ensureDownloadObject(parsed.file, parsed.integrity, parsed.chunkSize || this.MAX_CHUNK_BYTES);
                if (!dl) return;
                if (parsed.totalChunks) dl.totalChunks = parsed.totalChunks;
                if (parsed.received) {
                    dl.received = parsed.received;
                    dl.receivedCount = Object.keys(dl.received).length;
                }
                dl.paused = false;
                this._requestNextChunks(dl);
            } catch (e) { }
        }

        async listDownloads() {
            const out = [];
            for (const k in this.downloads) {
                if (k.indexOf('::') === -1) continue;
                const d = this.downloads[k];
                if (!d || !d.file || !d.integrity) continue;
                out.push(d.file + ':' + d.integrity);
            }
            return out.join(", ");
        }

        async estimateSpeed(args) {
            await this._makeSureConnected();
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    if (!dl.lastChunkTime) return 0;
                    if (!dl.speedHistory || dl.speedHistory.length === 0) return 0;
                    const sum = dl.speedHistory.reduce((a, b) => a + b, 0);
                    const avg = sum / dl.speedHistory.length;
                    return Math.round(avg);
                }
            }
            return 0;
        }

        async activeFiles() {
            const keys = Object.keys(this.files || {});
            return keys.join(", ");
        }

        async getRoom() {
            await this._makeSureConnected();
            return this.room;
        }

        async changeMinSearchTime(args) {
            await this._makeSureConnected();
            this.room = args.KEY;
            try { if (this.client) this.client.subscribe('FilePile/' + this.room); } catch (e) { }
        }

        async changeMinSearchTime(args) {
            await this._makeSureConnected();
            this.MinSearchTime = args.TIME;
        }

        async addFile(args) {
            await this._makeSureConnected();
            const name = this._sanitizeString(args.NAME || '');
            if (!name) return;
            const format = (args.FORMAT || 'Raw');
            const rawContent = (args.CONTENT || '').toString();
            let content = '';
            if (format === 'Raw') content = rawContent;
            else if (format === 'Hex') content = hexToString(rawContent);
            else if (format === 'Base64') content = fromBase64(rawContent);
            else if (format === 'Binary') content = binaryToString(rawContent);
            this.files[name] = {
                content,
                integrity: this._integrity(content),
                sizeBits: (content || '').length * 8
            };
        }

        async removeFile(args) {
            await this._makeSureConnected();
            delete this.files[args.FILENAME];
        }

        async removeFiles() {
            await this._makeSureConnected();
            this.files = {};
        }

        async progress(args) {
            await this._makeSureConnected();
            const f = args.FILE;
            for (const k in this.downloads) {
                if (k.indexOf(f + '::') === 0) {
                    const dl = this.downloads[k];
                    const total = dl.totalChunks || 0;
                    const rec = dl.receivedCount || 0;
                    if (total > 0) return Math.floor((rec / total) * 100);
                    return rec > 0 ? 1 : 0;
                }
            }
            if (this.files[f]) return 100;
            return 0;
        }

        async getFile(args) {
            await this._makeSureConnected();
            const f = (args.FILENAME || '').toString();
            const format = (args.FORMAT || 'Raw');
            if (!this.files[f]) return '';
            const content = this.files[f].content || '';
            if (format === 'Raw') return content;
            if (format === 'Hex') return stringToHex(content);
            if (format === 'Base64') return toBase64(content);
            if (format === 'Binary') return stringToBinary(content);
            return content;
        }

        async setDisplayName(args) {
            await this._makeSureConnected();
            this.displayName = args.DISPLAYNAME;
        }

        async currentSeeders() {
            await this._makeSureConnected();
            this._pruneSeeders();
            var seeders = Object.keys(this.seeders).filter(item => item !== this.displayName);
            return seeders.join(", ");
        }

        async computeIntegrity(args) {
            await this._makeSureConnected();
            return this._integrity((args.CONTENT || '').toString());
        }
    }

    Scratch.extensions.register(new FilePile());
})(Scratch);
