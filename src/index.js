'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐬 DANPHE ICONS & FONTS — STANDALONE NATIVE VECTOR & TYPOGRAPHY SUITE
 * ═══════════════════════════════════════════════════════════════════════════
 * Zero dependencies. Works in Node.js, Web Browser, C++ & Dolphin.
 * Featuring 2-Byte SISO Serial Bus Architecture (Register 0x4701 & 0x4702).
 */

const { ICONS, ICONS_557, ICONS_551, ICONS_256, RAW_ICONS, TOTAL_ICONS, getIcon } = require('./icons');
const { FONTS_256, CATEGORIES, RAW_FONTS, getFont } = require('./fonts');
const {
    THEMES,
    ANIM_CLASSES,
    ANIM_KEYFRAMES_CSS,
    TITAN_ICON,
    TITAN_ANIM,
    TWIN_ICON_PAIRS,
    renderAdaptiveIconSVG,
    getIconSVG,
    getFontCSS
} = require('./render');
const { DanpheAssetClient, siso } = require('./client');

const DanpheAssets = {
    // 🎨 Icon Bank
    ICONS,
    ICONS_557,
    ICONS_551,
    ICONS_256,
    RAW_ICONS,
    TOTAL_ICONS,
    getIcon,

    // 🔤 Font Bank
    FONTS_256,
    CATEGORIES,
    RAW_FONTS,
    getFont,

    // ⚡ Render & Themes
    THEMES,
    ANIM_CLASSES,
    ANIM_KEYFRAMES_CSS,
    TITAN_ICON,
    TITAN_ANIM,
    TWIN_ICON_PAIRS,
    renderAdaptiveIconSVG,
    getIconSVG,
    getFontCSS,

    // 🌐 Titan-Bus Serial & SISO Client
    DanpheAssetClient,
    siso,

    // 🚀 Direct Single-Line SISO Convenience APIs
    readIcon: (op, opts) => siso.readIcon(op, opts),
    writeIcon: (op, opts) => siso.writeIcon(op, opts),
    readIcons: (ops, opts) => siso.readIcons(ops, opts),
    readFont: (op, sel) => siso.readFont(op, sel),
    writeFont: (op, sel) => siso.writeFont(op, sel),
    rangeIcons: (s, e, opts) => siso.rangeIcons(s, e, opts),
    chunkIcons: (sz, pg, opts) => siso.chunkIcons(sz, pg, opts),
    allIcons: (opts) => siso.allIcons(opts),
    rangeFonts: (s, e) => siso.rangeFonts(s, e),
    allFonts: () => siso.allFonts()
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DanpheAssets;
}

if (typeof window !== 'undefined') {
    window.DanpheAssets = DanpheAssets;
    window.siso = siso;
    window.DANPHE_ICONS_256 = ICONS_256;
    window.DANPHE_FONTS_256 = FONTS_256;
    window.renderAdaptiveIconSVG = renderAdaptiveIconSVG;
    window.DanpheAssetClient = DanpheAssetClient;
}
