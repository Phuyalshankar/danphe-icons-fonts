'use strict';
/**
 * 🐬 DANPHE ASSET CLIENT — TITAN-BUS SERIAL & SISO CLIENT
 * Zero external dependencies.
 */

class DanpheAssetClient {
    constructor(titanBusInstance = null) {
        this.bus = titanBusInstance || (typeof window !== 'undefined' ? (window.TitanMicroBus || window.TitanBus || window.TitanSisoBus) : null);
        this.iconCache = new Map();
        this.fontCache = new Map();
        this.setupBusListeners();
    }

    setupBusListeners() {
        if (!this.bus) return;
        if (this.bus.on) {
            this.bus.on('asset:icon', (data) => {
                if (data && data.opcode !== undefined) {
                    this.iconCache.set(data.opcode, data.svg);
                }
            });
            this.bus.on('asset:font', (data) => {
                if (data && data.opcode !== undefined) {
                    this.fontCache.set(data.opcode, data.css);
                }
            });
        }
    }

    requestIcon(opcode, options = {}) {
        const code = parseInt(opcode, 10) || 0;
        if (this.iconCache.has(code)) {
            return this.iconCache.get(code);
        }
        if (this.bus && this.bus.write) {
            this.bus.write(0x4701, code);
        }
        return null;
    }

    requestFont(opcode, selector = '') {
        const code = parseInt(opcode, 10) || 0;
        if (this.fontCache.has(code)) {
            return this.fontCache.get(code);
        }
        if (this.bus && this.bus.write) {
            this.bus.write(0x4702, code);
        }
        return null;
    }
}

module.exports = {
    DanpheAssetClient
};
