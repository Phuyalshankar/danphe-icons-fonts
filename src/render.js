'use strict';
/**
 * 🐬 DANPHE ICONS & FONTS — UNIVERSAL SVG & CSS RENDER ENGINE
 * Supports: Adaptive circular ring badges, raw vectors, keyframe animations & CSS fonts.
 */

const { ICONS_256, getIcon } = require('./icons');
const { FONTS_256, getFont } = require('./fonts');

const THEMES = {
    slate:   { bg: '#0f172a', ring: '#334155', glow: '#64748b', text: '#94a3b8' },
    emerald: { bg: '#064e3b', ring: '#059669', glow: '#10b981', text: '#34d399' },
    purple:  { bg: '#3b0764', ring: '#7e22ce', glow: '#a855f7', text: '#c084fc' },
    amber:   { bg: '#451a03', ring: '#b45309', glow: '#f59e0b', text: '#fbbf24' },
    red:     { bg: '#450a0a', ring: '#b91c1c', glow: '#ef4444', text: '#f87171' },
    cyan:    { bg: '#083344', ring: '#0891b2', glow: '#06b6d4', text: '#22d3ee' },
    blue:    { bg: '#172554', ring: '#1d4ed8', glow: '#3b82f6', text: '#60a5fa' },
    rose:    { bg: '#4c0519', ring: '#be123c', glow: '#f43f5e', text: '#fb7185' }
};

const ANIM_CLASSES = {
    0: '',
    1: 'titan-anim-pulse',
    2: 'titan-anim-spin',
    3: 'titan-anim-bounce',
    4: 'titan-anim-ring',
    5: 'titan-anim-ripple',
    6: 'titan-anim-wave',
    7: 'titan-anim-flash',
    8: 'titan-anim-glow'
};

const ANIM_KEYFRAMES_CSS = `
@keyframes titan-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.82; } }
@keyframes titan-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes titan-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes titan-ring { 0% { transform: rotate(0); } 10%, 30%, 50%, 70%, 90% { transform: rotate(-12deg); } 20%, 40%, 60%, 80% { transform: rotate(12deg); } 100% { transform: rotate(0); } }
@keyframes titan-ripple { 0% { transform: scale(0.95); stroke-opacity: 0.8; } 50% { transform: scale(1.05); stroke-opacity: 0.3; } 100% { transform: scale(0.95); stroke-opacity: 0.8; } }
@keyframes titan-wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.6); } }
@keyframes titan-flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
@keyframes titan-glow { 0%, 100% { filter: drop-shadow(0 0 4px currentColor); } 50% { filter: drop-shadow(0 0 12px currentColor); } }

.titan-anim-pulse { animation: titan-pulse 1.8s infinite ease-in-out; transform-origin: center; }
.titan-anim-spin { animation: titan-spin 1.5s infinite linear; transform-origin: center; }
.titan-anim-bounce { animation: titan-bounce 1s infinite ease-in-out; transform-origin: center; }
.titan-anim-ring { animation: titan-ring 1.2s infinite ease-in-out; transform-origin: center; }
.titan-anim-ripple { animation: titan-ripple 2s infinite ease-in-out; transform-origin: center; }
.titan-anim-wave { animation: titan-wave 1s infinite ease-in-out; transform-origin: center; }
.titan-anim-flash { animation: titan-flash 0.6s infinite ease-in-out; transform-origin: center; }
.titan-anim-glow { animation: titan-glow 1.5s infinite ease-in-out; transform-origin: center; }
`;

const TITAN_ICON = {
    IDLE: 0,
    INCOMING_VOICE: 1,
    INCOMING_VIDEO: 2,
    OUTGOING_VOICE: 3,
    MISSED_CALL: 4,
    CONNECTED_CALL: 5,
    MIC_MUTE: 6,
    CHAT: 7,
    VOICEMAIL: 8,
    HEADSET: 9,
    CALL_FORWARD: 10,
    CALL_HOLD: 11,
    CALL_TRANSFER: 12,
    CONFERENCE: 13,
    RECORDING: 14,
    DTMF_KEYPAD: 15,
    SPEAKERPHONE: 16,
    SIM_CARD: 180,
    NETWORK_TRUNK: 181,
    SRTP_SHIELD: 182,
    PADLOCK_LOCKED: 192,
    USER_AVATAR: 225,
    SETTINGS_GEAR: 226,
    GLOBAL_SEARCH: 232,
    TITAN_ALL_HIGHWAY: 255
};

const TITAN_ANIM = {
    STATIC: 0,
    PULSE: 1,
    SPIN: 2,
    BOUNCE: 3,
    RING: 4,
    RIPPLE: 5,
    WAVE: 6,
    FLASH: 7,
    GLOW: 8
};

const TWIN_ICON_PAIRS = {
    'eye': { active: 298, inactive: 299 },
    'eye_off': { active: 298, inactive: 299 },
    'lock': { active: 300, inactive: 301 },
    'unlock': { active: 300, inactive: 301 },
    'mic': { active: 412, inactive: 413 },
    'mic_mute': { active: 412, inactive: 413 },
    'video': { active: 411, inactive: 296 },
    'volume': { active: 414, inactive: 415 },
    'volume_mute': { active: 414, inactive: 415 },
    'play': { active: 417, inactive: 418 },
    'pause': { active: 417, inactive: 418 },
    'wifi': { active: 323, inactive: 324 },
    'sun': { active: 430, inactive: 431 },
    'moon': { active: 430, inactive: 431 }
};

function renderAdaptiveIconSVG(inputVal, missedCount = 0, size = 64, forceCircle = null, anim = 0, active = null) {
    let rawNum = 0;
    let isNegative = false;

    if (typeof inputVal === 'number') {
        isNegative = inputVal < 0;
        rawNum = Math.abs(inputVal);
    } else if (typeof inputVal === 'string') {
        const s = inputVal.trim().toLowerCase();
        if (s.startsWith('-')) {
            isNegative = true;
            rawNum = Math.abs(parseInt(s, 10)) || 0;
        } else if (!isNaN(Number(s))) {
            rawNum = parseInt(s, 10);
        } else if (TWIN_ICON_PAIRS[s]) {
            const pair = TWIN_ICON_PAIRS[s];
            rawNum = (active === false) ? pair.inactive : pair.active;
        } else {
            const matched = getIcon(s);
            rawNum = matched ? matched.id : 0;
        }
    }

    const op = rawNum <= 255 ? (rawNum & 0xFF) : rawNum;
    const iconData = getIcon(op);
    const circle = forceCircle !== null ? forceCircle : !isNegative;
    const t = THEMES[iconData.theme] || THEMES.slate;
    const animOp = parseInt(anim, 10) || 0;
    const animClass = ANIM_CLASSES[animOp] || '';

    if (circle) {
        let badgeSvg = '';
        if ((op === 4 || op === 255) && missedCount > 0) {
            badgeSvg = `<circle cx="25" cy="7" r="5" fill="#ef4444" stroke="#020617" stroke-width="1.5"/><text x="25" y="8.8" font-family="monospace, sans-serif" font-size="5.5" font-weight="bold" fill="#ffffff" text-anchor="middle">${missedCount}</text>`;
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" class="titan-adaptive-icon ${animClass}">
  <style>${ANIM_KEYFRAMES_CSS}</style>
  <circle cx="16" cy="16" r="15" fill="none" stroke="${t.glow}" stroke-opacity="0.25" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="13.5" fill="${t.bg}" fill-opacity="0.88" stroke="${t.glow}" stroke-width="1.4"/>
  <g transform="translate(4, 4)">${iconData.path}</g>
  ${badgeSvg}
</svg>`;
    } else {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" class="titan-adaptive-icon ${animClass}">
  <style>${ANIM_KEYFRAMES_CSS}</style>
  ${iconData.path}
</svg>`;
    }
}

function getIconSVG(opcode, size = 24, color = 'currentColor', strokeWidth = 2, animClass = '') {
    const icon = getIcon(opcode);
    const cls = `danphe-icon danphe-icon-${icon.id} ${animClass}`.trim();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${icon.path}</svg>`;
}

function getFontCSS(opcode, selector = '') {
    const font = getFont(opcode);
    const sel = selector || `.danphe-font-${font.opcode}`;
    let css = `${sel} {\n`;
    css += `  font-family: ${font.family};\n`;
    css += `  font-weight: ${font.weight || '400'};\n`;
    if (font.style && font.style !== 'normal') css += `  font-style: ${font.style};\n`;
    if (font.letterSpacing && font.letterSpacing !== 'normal') css += `  letter-spacing: ${font.letterSpacing};\n`;
    if (font.textTransform && font.textTransform !== 'none') css += `  text-transform: ${font.textTransform};\n`;
    if (font.textShadow) css += `  text-shadow: ${font.textShadow};\n`;
    css += `}\n`;
    return css;
}

module.exports = {
    THEMES,
    ANIM_CLASSES,
    ANIM_KEYFRAMES_CSS,
    TITAN_ICON,
    TITAN_ANIM,
    TWIN_ICON_PAIRS,
    renderAdaptiveIconSVG,
    getIconSVG,
    getFontCSS
};
