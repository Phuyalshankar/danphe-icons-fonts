'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐬 DANPHE ICONS & FONTS — STANDALONE NATIVE VECTOR & TYPOGRAPHY SUITE
 * ═══════════════════════════════════════════════════════════════════════════
 * Zero dependencies. Works in Node.js, Web Browser, C++ & Dolphin.
 */

const { ICONS_256, RAW_ICONS, getIcon } = require('./icons');
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
const { DanpheAssetClient } = require('./client');

const DanpheAssets = {
    ICONS_256,
    RAW_ICONS,
    getIcon,
    FONTS_256,
    CATEGORIES,
    RAW_FONTS,
    getFont,
    THEMES,
    ANIM_CLASSES,
    ANIM_KEYFRAMES_CSS,
    TITAN_ICON,
    TITAN_ANIM,
    TWIN_ICON_PAIRS,
    renderAdaptiveIconSVG,
    getIconSVG,
    getFontCSS,
    DanpheAssetClient
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DanpheAssets;
}

if (typeof window !== 'undefined') {
    window.DanpheAssets = DanpheAssets;
    window.DANPHE_ICONS_256 = ICONS_256;
    window.DANPHE_FONTS_256 = FONTS_256;
    window.renderAdaptiveIconSVG = renderAdaptiveIconSVG;
    window.DanpheAssetClient = DanpheAssetClient;
}
