'use strict';
/**
 * 🐬 DANPHE ASSET CLIENT — TITAN-BUS SERIAL & SISO CLIENT
 * ═══════════════════════════════════════════════════════════════════════════
 * Single-line instant Icon and Typography Serial SISO Engine.
 * Zero external dependencies. Sub-millisecond latency.
 *
 * Usage:
 *   const { siso } = require('danphe-icons-fonts');
 *   const svg = siso.readIcon(280);
 *   siso.writeIcon(280);
 *   const list = siso.readIcons([10, 50, 58]);
 *   const css = siso.readFont(32);
 *   const toolIcons = siso.rangeIcons(270, 286);
 *   const chunk10 = siso.chunkIcons(10, 0); // items 0-9
 *   siso.on(0x4201, (toolCode) => { ... });
 */

const { getIcon, ICONS_557, TOTAL_ICONS } = require('./icons');
const { getFont, FONTS_256 } = require('./fonts');
const { getIconSVG, renderAdaptiveIconSVG, getFontCSS } = require('./render');

class DanpheAssetClient {
    constructor(titanBusInstance = null) {
        this.bus = titanBusInstance || (typeof window !== 'undefined' ? (window.TitanMicroBus || window.TitanBus || window.TitanSisoBus || window.titanSisoBridge) : null);
        this.iconCache = new Map();
        this.fontCache = new Map();
        this.listeners = new Map();
        this.registers = new Map();

        // Standard registers for asset highway
        this.REG = {
            ASSET_ICON: 0x4701,
            ASSET_FONT: 0x4702,
            ASSET_ANIM: 0x4703,
            ACTIVE_TOOL: 0x4201,
            ACTION_TRIGGER: 0x4407
        };

        // High-level sub-namespaces for clean chaining
        this.icons = {
            read: (op, opts) => this.readIcon(op, opts),
            write: (op, opts) => this.writeIcon(op, opts),
            readMany: (ops, opts) => this.readIcons(ops, opts),
            range: (s, e, opts) => this.rangeIcons(s, e, opts),
            chunk: (sz, pg, opts) => this.chunkIcons(sz, pg, opts),
            all: (opts) => this.allIcons(opts),
            get: (op) => getIcon(op)
        };

        this.fonts = {
            read: (op, sel) => this.readFont(op, sel),
            write: (op, sel) => this.writeFont(op, sel),
            range: (s, e) => this.rangeFonts(s, e),
            all: () => this.allFonts(),
            get: (op) => getFont(op)
        };

        this.setupBusListeners();
    }

    setupBusListeners() {
        if (!this.bus) return;
        if (typeof this.bus.on === 'function') {
            this.bus.on('asset:icon', (data) => {
                if (data && data.opcode !== undefined) {
                    this.iconCache.set(data.opcode, data.svg);
                    this._emitLocal(0x4701, data.opcode);
                }
            });
            this.bus.on('asset:font', (data) => {
                if (data && data.opcode !== undefined) {
                    this.fontCache.set(data.opcode, data.css);
                    this._emitLocal(0x4702, data.opcode);
                }
            });
            this.bus.on('change', (evt) => {
                if (evt && evt.register !== undefined) {
                    this.registers.set(evt.register, evt.value);
                    this._emitLocal(evt.register, evt.value);
                    if (evt.register === 0x4701) {
                        this.readIcon(evt.value);
                    } else if (evt.register === 0x4702) {
                        this.readFont(evt.value);
                    }
                }
            });
        }
    }

    /**
     * Subscribe to serial events or register updates
     * e.g. siso.on(0x4201, (tool) => { ... })
     * e.g. siso.on('icon', (opcode) => { ... })
     */
    on(eventOrReg, callback) {
        const key = typeof eventOrReg === 'number' ? ('reg:' + eventOrReg) : String(eventOrReg);
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Also proxy to underlying bus if available
        if (this.bus && typeof this.bus.on === 'function') {
            try { this.bus.on(eventOrReg, callback); } catch (_) {}
        }

        return () => this.off(eventOrReg, callback);
    }

    off(eventOrReg, callback) {
        const key = typeof eventOrReg === 'number' ? ('reg:' + eventOrReg) : String(eventOrReg);
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(callback);
        }
        if (this.bus && typeof this.bus.off === 'function') {
            try { this.bus.off(eventOrReg, callback); } catch (_) {}
        }
    }

    _emitLocal(eventOrReg, data) {
        const key = typeof eventOrReg === 'number' ? ('reg:' + eventOrReg) : String(eventOrReg);
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(cb => {
                try { cb(data); } catch (e) { console.error('[DanpheAssetClient] listener error:', e); }
            });
        }
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(cb => {
                try { cb(eventOrReg, data); } catch (e) {}
            });
        }
    }

    /**
     * Direct serial bus register write
     */
    write(register, value) {
        const reg = parseInt(register, 10) || 0;
        const val = parseInt(value, 10) || 0;
        this.registers.set(reg, val);

        if (this.bus) {
            if (typeof this.bus.sendSisoPacket === 'function') {
                this.bus.sendSisoPacket(reg, val);
            } else if (typeof this.bus.write === 'function') {
                this.bus.write(reg, val);
            } else if (typeof this.bus.set === 'function') {
                this.bus.set(reg, val);
            }
        }
        this._emitLocal(reg, val);
        return val;
    }

    /**
     * Read current register value
     */
    read(register) {
        const reg = parseInt(register, 10) || 0;
        if (this.bus && typeof this.bus.get === 'function') {
            return this.bus.get(reg);
        }
        return this.registers.get(reg) || 0;
    }

    /**
     * 🎨 Single-line instant SVG read (0ms latency, synchronous return)
     * siso.readIcon(opcode, options)
     * e.g. siso.readIcon(280)
     * e.g. siso.readIcon('split', { size: 24, color: '#38bdf8' })
     */
    readIcon(opcode, options = {}) {
        let code = 0;
        if (typeof opcode === 'number') {
            code = opcode;
        } else if (typeof opcode === 'string') {
            const trimmed = opcode.trim();
            if (/^-?\d+$/.test(trimmed)) {
                code = parseInt(trimmed, 10);
            } else {
                const matched = getIcon(trimmed);
                code = matched ? matched.id : 0;
            }
        }

        const opts = typeof options === 'number' ? { size: options } : (options || {});
        const size = opts.size || 24;
        const color = opts.color || 'currentColor';
        const strokeWidth = opts.strokeWidth !== undefined ? opts.strokeWidth : 2;
        const anim = opts.anim || 0;
        const animClass = opts.animClass || '';
        const adaptive = opts.adaptive !== undefined ? opts.adaptive : (opts.circle !== undefined ? opts.circle : false);

        if (opts.raw === true) {
            return getIcon(code);
        }

        let svg = '';
        if (adaptive) {
            svg = renderAdaptiveIconSVG(code, opts.missedCount || 0, size, opts.forceCircle || null, anim, opts.active);
        } else {
            svg = getIconSVG(code, size, color, strokeWidth, animClass);
        }

        this.iconCache.set(code, svg);
        return svg;
    }

    /**
     * 📤 Single-line Icon Write (Sends to serial register 0x4701)
     * siso.writeIcon(opcode, options)
     */
    writeIcon(opcode, options = {}) {
        const raw = getIcon(opcode);
        const code = raw ? raw.id : (parseInt(opcode, 10) || 0);

        this.write(0x4701, code);
        this._emitLocal('icon', code);
        return this.readIcon(code, options);
    }

    /**
     * 📦 Batch read multiple icons from array of opcodes
     * const tools = siso.readIcons([10, 50, 58]);
     * const tools = siso.readIcons(['split', 'trim_left', 'trim_right']);
     */
    readIcons(opcodes = [], options = {}) {
        if (!Array.isArray(opcodes)) return [];
        return opcodes.map(op => {
            const raw = getIcon(op);
            return {
                opcode: raw ? raw.id : (parseInt(op, 10) || 0),
                id: raw ? raw.id : (parseInt(op, 10) || 0),
                name: raw ? raw.name : String(op),
                label: raw ? raw.label : String(op),
                theme: raw ? raw.theme : 'slate',
                path: raw ? raw.path : '',
                svg: this.readIcon(op, options)
            };
        });
    }

    /**
     * 🔤 Single-line instant Font CSS read (0ms latency, synchronous return)
     * siso.readFont(opcode, selector)
     * e.g. siso.readFont(32)
     */
    readFont(opcode, selectorOrOptions = '') {
        const code = parseInt(opcode, 10) || 0;
        if (typeof selectorOrOptions === 'object' && selectorOrOptions.raw === true) {
            return getFont(code);
        }

        const selector = typeof selectorOrOptions === 'string'
            ? selectorOrOptions
            : (selectorOrOptions && selectorOrOptions.selector ? selectorOrOptions.selector : '');

        const css = getFontCSS(code, selector);
        this.fontCache.set(code, css);
        return css;
    }

    /**
     * 📤 Single-line Font Write (Sends to serial register 0x4702)
     * siso.writeFont(opcode, selector)
     */
    writeFont(opcode, selectorOrOptions = '') {
        const code = parseInt(opcode, 10) || 0;
        this.write(0x4702, code);
        this._emitLocal('font', code);
        return this.readFont(code, selectorOrOptions);
    }

    /**
     * 🔁 Loop through range of icons (e.g. 0 to 25, 270 to 286, etc.)
     * for (const icon of siso.rangeIcons(0, 25)) { ... }
     */
    rangeIcons(start = 0, end = 25, options = {}) {
        const results = [];
        const min = Math.max(0, Math.min(start, end));
        const max = Math.min(TOTAL_ICONS - 1, Math.max(start, end));

        for (let i = min; i <= max; i++) {
            const raw = getIcon(i);
            results.push({
                opcode: i,
                id: i,
                name: raw.name,
                label: raw.label,
                theme: raw.theme,
                path: raw.path,
                svg: this.readIcon(i, options)
            });
        }
        return results;
    }

    /**
     * 📦 Chunked icons (e.g. 10 by 10 for paginated ribbons / grids)
     * const chunk0 = siso.chunkIcons(10, 0); // 0-9
     * const chunk1 = siso.chunkIcons(10, 1); // 10-19
     */
    chunkIcons(chunkSize = 10, pageIndex = 0, options = {}) {
        const start = pageIndex * chunkSize;
        const end = start + chunkSize - 1;
        return this.rangeIcons(start, end, options);
    }

    /**
     * 🌐 All icons (0 to 556)
     */
    allIcons(options = {}) {
        return this.rangeIcons(0, TOTAL_ICONS - 1, options);
    }

    /**
     * 🔁 Range of fonts (0 to 255)
     */
    rangeFonts(start = 0, end = 25) {
        const results = [];
        const min = Math.max(0, Math.min(start, end));
        const max = Math.min(255, Math.max(start, end));

        for (let i = min; i <= max; i++) {
            const raw = getFont(i);
            results.push({
                opcode: i,
                opcodeHex: raw.opcodeHex,
                name: raw.name,
                family: raw.family,
                weight: raw.weight,
                style: raw.style,
                letterSpacing: raw.letterSpacing,
                textTransform: raw.textTransform,
                textShadow: raw.textShadow,
                css: this.readFont(i)
            });
        }
        return results;
    }

    /**
     * 🌐 All fonts (0 to 255)
     */
    allFonts() {
        return this.rangeFonts(0, 255);
    }

    /**
     * Legacy asynchronous compatibility
     */
    requestIcon(opcode, options = {}) {
        return this.readIcon(opcode, options);
    }

    requestFont(opcode, selector = '') {
        return this.readFont(opcode, selector);
    }
}

// Default singleton instance
const siso = new DanpheAssetClient();

module.exports = {
    DanpheAssetClient,
    siso
};
