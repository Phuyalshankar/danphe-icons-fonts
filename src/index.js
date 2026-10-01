'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐬 DANPHE ICONS & FONTS — ULTRA-LIGHTWEIGHT TITAN-BUS CLIENT BRIDGE
 * ═══════════════════════════════════════════════════════════════════════════
 * Zero external dependencies. Zero Node bloat.
 * Connects directly to Titan-Bus SISO stream for 0ms icon & font distribution.
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
        // Listen for Titan Binary Asset Frames (CMD 0x22: Icon, CMD 0x23: Font)
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

    /**
     * Request an icon by OpCode (0 - 255)
     */
    requestIcon(opcode, options = {}) {
        const code = parseInt(opcode, 10) || 0;
        if (this.iconCache.has(code)) {
            return this.iconCache.get(code);
        }
        if (this.bus && this.bus.write) {
            // Send request via Titan Register or SISO stream
            this.bus.write(0x4701, code); // Write requested OpCode to register
        }
        return null;
    }

    /**
     * Request a font by OpCode (0 - 255)
     */
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DanpheAssetClient };
}
if (typeof window !== 'undefined') {
    window.DanpheAssetClient = DanpheAssetClient;
}
