'use strict';
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐬 DANPHE ICONS & FONTS — TITAN-BUS SERIAL DISTRIBUTION TEST SERVER
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 * - Full 256 Vector Icons Grid & Interactive OpCode Slider (0 - 255)
 * - Full 256 Fonts Grid & Interactive OpCode Slider (0 - 255)
 * - 8 Multi-Stage Vector Animations (Pulse, Spin, Bounce, Ring, Ripple, Wave, Flash, Glow)
 * - Real-Time Dynamic Telemetry (Live WiFi Waves, Battery Charge %, Speedometer Gauge, Heartbeat ECG)
 * - Titan-Bus SISO integration
 */

const http = require('http');

// 1. Link & Load Titan-Bus
let TitanBus = null;
try {
    TitanBus = require('D:/titan-bus');
    console.log('⚡ [Titan-Bus] Loaded native Titan-Bus from D:\\titan-bus');
} catch (e) {
    console.warn('[Titan-Bus] Could not load D:\\titan-bus:', e.message);
}

// 2. Load 256 Icons & 256 Fonts databases
let iconsData = null;
try {
    iconsData = require('D:/danphe-ui/danphe_icons.json');
} catch(e) {}

let fontsData = null;
try {
    const { FONTS_256 } = require('D:/danphe-ui/fonts/FONTS_256');
    fontsData = FONTS_256;
} catch(e) {}

let adaptive = null;
let AdaptiveButton = null;
let AdaptiveCard = null;
let AdaptiveInput = null;
try {
    adaptive = require('D:/danphe-3/src/adaptive');
    AdaptiveButton = adaptive.AdaptiveButton;
    AdaptiveCard = adaptive.AdaptiveCard;
    AdaptiveInput = adaptive.AdaptiveInput;
    console.log('🐬 [Adaptive] Loaded pure Dolphin-UB Adaptive Components (Button, Card, Input, Inputs256)');
} catch(e) {
    console.warn('[Adaptive] Could not load adaptive components:', e.message);
}

function getIconData(opcode) {
    const op = parseInt(opcode, 10) || 0;
    const item = (iconsData && iconsData[op]) ? iconsData[op] : { name: 'icon_' + op, path: '<circle cx="12" cy="12" r="9"/>' };
    let elements = item.path || '<circle cx="12" cy="12" r="9"/>';
    elements = elements.replace(/\s*(fill="none"|stroke="[^"]*"|stroke-width="[^"]*"|stroke-linecap="round"|stroke-linejoin="round")/g, '').trim();
    return { opcode: op, name: item.name || ('icon_' + op), elements };
}

function getIconSVG(opcode, size = 24, color = 'currentColor', strokeWidth = 2, animClass = '') {
    const { opcode: op, elements } = getIconData(opcode);
    const cls = `danphe-icon danphe-icon-${op} ${animClass}`.trim();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${elements}</svg>`;
}

function getFontData(opcode) {
    const op = parseInt(opcode, 10) || 0;
    const font = (fontsData && fontsData[op]) ? fontsData[op] : { name: 'Font ' + op, family: 'sans-serif', weight: '400' };
    const sel = `.danphe-font-${op}`;
    let css = `${sel} {\n`;
    css += `    font-family: ${font.family};\n`;
    css += `    font-weight: ${font.weight || '400'};\n`;
    if (font.style && font.style !== 'normal') css += `    font-style: ${font.style};\n`;
    if (font.letterSpacing && font.letterSpacing !== 'normal') css += `    letter-spacing: ${font.letterSpacing};\n`;
    if (font.textTransform && font.textTransform !== 'none') css += `    text-transform: ${font.textTransform};\n`;
    if (font.textShadow) css += `    text-shadow: ${font.textShadow};\n`;
    css += `}\n`;
    return { opcode: op, font, css };
}

// 3. Prebuild compact 551 array payloads for frontend instant inspection
const ALL_ICONS_COMPACT = [];
for (let i = 0; i < 551; ++i) {
    ALL_ICONS_COMPACT.push(getIconData(i));
}

const ALL_FONTS_COMPACT = [];
for (let i = 0; i < 256; ++i) {
    ALL_FONTS_COMPACT.push(getFontData(i));
}

// 4. Server
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    const url = new URL(req.url, 'http://localhost:8099');

    // Route: GET /api/icon/:opcode
    if (url.pathname.startsWith('/api/icon/')) {
        const parts = url.pathname.split('/');
        const opcode = parts[3] || '0';
        const size = url.searchParams.get('size') || 28;
        const color = url.searchParams.get('color') || '#38bdf8';
        const anim = url.searchParams.get('anim') || '';
        const svg = getIconSVG(opcode, size, color, 2, anim);

        if (TitanBus && TitanBus.write) {
            TitanBus.write(0x4701, parseInt(opcode, 10));
        }

        res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
        return res.end(svg);
    }

    // Route: GET /api/font/:opcode
    if (url.pathname.startsWith('/api/font/')) {
        const parts = url.pathname.split('/');
        const opcode = parts[3] || '0';
        const { css } = getFontData(opcode);

        if (TitanBus && TitanBus.write) {
            TitanBus.write(0x4702, parseInt(opcode, 10));
        }

        res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
        return res.end(css);
    }

    // Route: GET /api/adaptive/render
    if (url.pathname === '/api/adaptive/render') {
        const type = url.searchParams.get('type') || 'button';
        const label = url.searchParams.get('label') || 'सुरक्षित सुरु 🚀 (Start)';
        const variant = url.searchParams.get('variant') || 'text';
        const theme = url.searchParams.get('theme') || 'cyan';
        const radius = parseInt(url.searchParams.get('radius') || '14', 10);
        const icon = url.searchParams.get('icon') !== null ? parseInt(url.searchParams.get('icon'), 10) : undefined;

        let comp = null;
        if (type === 'card' && AdaptiveCard) {
            comp = new AdaptiveCard({
                title: label,
                subtitle: 'Dolphin-CPP UB Vector Chassis • 0ms SISO',
                badge: 'ONLINE',
                icon: icon,
                theme: theme,
                radius: radius,
                width: 360,
                height: 190
            });
        } else if (type === 'input') {
            const op = parseInt(url.searchParams.get('opcode') !== null ? url.searchParams.get('opcode') : (variant === 'password' ? '1' : (variant === 'search' ? '2' : (variant === 'floating' ? '3' : (variant === 'number' ? '32' : (variant === 'otp' ? '130' : (variant === 'select' ? '64' : (variant === 'switch' ? '67' : (variant === 'textarea' ? '160' : '0')))))))), 10);
            const anim = url.searchParams.get('anim') || '';
            const font = url.searchParams.get('font') || undefined;

            if (adaptive && adaptive.renderInputSVG) {
                const def = adaptive.getInputData(op);
                const inputLabel = (label && !label.includes('खोज्नुहोस्') && label !== 'सुरक्षित सुरु 🚀 (Start)') ? label : (def ? def.nepali : undefined);
                const svg = adaptive.renderInputSVG(op, { theme, anim, radius, label: inputLabel, fontFamily: font, icon });
                const toTitan = adaptive.inputToTitanBinary || adaptive.toTitanBinary;
                const bin = toTitan ? toTitan(op, { radius }) : new Uint8Array(24);
                const hex = Array.from(bin).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
                const toLvgl = adaptive.inputToLvglCpp || adaptive.toLvglCpp;
                const lvgl = toLvgl ? toLvgl(op, { theme, radius }) : '';

                if (TitanBus && TitanBus.write) {
                    TitanBus.write(0x4418, op);
                }

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ svg, hex, lvgl, opcode: op, def, type: 'input' }));
            }
        } else if (type === 'button') {
            const op = parseInt(url.searchParams.get('opcode') !== null ? url.searchParams.get('opcode') : '0', 10);
            const anim = url.searchParams.get('anim') || '';
            const style = url.searchParams.get('style') || undefined;

            if (adaptive && adaptive.renderButtonSVG) {
                const def = adaptive.getButtonData ? adaptive.getButtonData(op) : null;
                const buttonText = (label && label !== 'सुरक्षित सुरु 🚀 (Start)') ? label : (def ? def.nepali : 'सुरक्षित सुरु 🚀 (Start)');
                const chipId = url.searchParams.get('chipId') !== null ? parseInt(url.searchParams.get('chipId'), 10) : op;
                const svg = adaptive.renderButtonSVG(op, { theme, anim, radius, text: buttonText, style, icon, chipId });
                const bin = adaptive.buttonToTitanBinary ? adaptive.buttonToTitanBinary(op, { radius, chipId }) : new Uint8Array(24);
                const hex = Array.from(bin).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
                const siso = adaptive.buttonToSisoPacket ? adaptive.buttonToSisoPacket(chipId, 1) : new Uint8Array([0x53, 0x49, (chipId >> 8) & 0xFF, chipId & 0xFF, 0, 1]);
                const sisoHex = Array.from(siso).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
                const lvgl = adaptive.buttonToLvglCpp ? adaptive.buttonToLvglCpp(op, { theme, radius }) : '';

                if (TitanBus && TitanBus.write) {
                    TitanBus.write(0x4410, op);
                }

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ svg, hex, sisoHex, chipId, lvgl, opcode: op, def, type: 'button' }));
            } else if (AdaptiveButton) {
                comp = new AdaptiveButton({
                    label: label,
                    icon: icon,
                    theme: theme,
                    radius: radius,
                    width: 220,
                    height: 50
                });
            }
        }

        if (!comp) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Adaptive component engine not ready' }));
        }

        const bin = comp.toTitanBinary();
        const hex = Array.from(bin).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');

        if (TitanBus && TitanBus.write) {
            TitanBus.write(type === 'card' ? 0x4420 : 0x4410, bin[1]);
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
            svg: comp.toSvg(),
            hex: hex,
            lvgl: comp.toLvglCpp(),
            type: type
        }));
    }

    // Route: GET /api/bus/write
    if (url.pathname === '/api/bus/write') {
        const chipId = parseInt(url.searchParams.get('chipId') || '1', 10);
        const val = parseInt(url.searchParams.get('val') || '1', 10);
        if (TitanBus && TitanBus.write) {
            TitanBus.write(chipId, val);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', chipId, val, time: Date.now() }));
    }

    // Route: GET /api/status
    if (url.pathname === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: 'online',
            package: 'danphe-icons-fonts',
            cppVectorEngine: 'active',
            titanBusReady: TitanBus !== null,
            totalIcons: 551,
            totalFonts: 256,
            animationsSupported: 8
        }));
    }

    // Route: GET / (Visual Scrubber & Whole Grid Studio)
    if (url.pathname === '/' || url.pathname === '/demo') {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Danphe Icons & Fonts 256 — Animated & Real-Time Studio</title>
    <style>
        * { box-sizing: border-box; }
        body { margin:0; padding:24px; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#020617; color:#f8fafc; }
        h1, h2, h3 { margin:0; font-weight:800; }
        .badge { font-size:10px; font-family:monospace; padding:3px 8px; border-radius:6px; font-weight:bold; }
        .card { background:#0f172a; border:1px solid #1e293b; border-radius:16px; padding:20px; }
        .slider-box { background:linear-gradient(135deg, #091329 0%, #031024 100%); border:1px solid #1e3a8a; border-radius:16px; padding:24px; margin-bottom:28px; }
        input[type=range] { width:100%; height:10px; border-radius:5px; background:#1e293b; outline:none; -webkit-appearance:none; cursor:pointer; accent-color:#38bdf8; }
        .grid-icons, .grid-fonts { display:grid; gap:12px; max-height:500px; overflow-y:auto; padding:12px; background:#070d1e; border:1px solid #1e293b; border-radius:12px; }
        .grid-icons { grid-template-columns:repeat(auto-fill, minmax(115px, 1fr)); } .grid-fonts { grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); }
        .icon-item, .font-item { background:#0f172a; border:1px solid #1e293b; padding:12px; border-radius:12px; cursor:pointer; transition:all 0.15s ease; }
        .icon-item { text-align:center; padding:12px 8px; } .icon-item:hover, .icon-item.active { background:#0c2a4d; border-color:#38bdf8; transform:translateY(-2px); }
        .font-item:hover, .font-item.active { background:#092b23; border-color:#10b981; }
        .search-input { width:100%; max-width:320px; background:#0f172a; border:1px solid #334155; color:#fff; padding:8px 14px; border-radius:8px; font-size:13px; outline:none; }
        .search-input:focus { border-color:#38bdf8; }
        .anim-btn { background:#0f172a; border:1px solid #334155; color:#cbd5e1; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:bold; cursor:pointer; transition:all 0.15s ease; }
        .anim-btn:hover, .anim-btn.active { background:#0284c7; border-color:#38bdf8; color:#fff; shadow:0 0 10px rgba(56,189,248,0.5); }
        @keyframes titan-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.75; } }
        @keyframes titan-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes titan-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes titan-ring { 0% { transform: rotate(0); } 10%, 30%, 50%, 70%, 90% { transform: rotate(-14deg); } 20%, 40%, 60%, 80% { transform: rotate(14deg); } 100% { transform: rotate(0); } }
        @keyframes titan-ripple { 0% { transform: scale(0.9); opacity: 0.9; } 50% { transform: scale(1.15); opacity: 0.4; } 100% { transform: scale(0.9); opacity: 0.9; } }
        @keyframes titan-wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.4); } }
        @keyframes titan-flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
        @keyframes titan-glow { 0%, 100% { filter: drop-shadow(0 0 4px currentColor); } 50% { filter: drop-shadow(0 0 14px currentColor); } }
        .titan-anim-pulse svg, .titan-anim-pulse { animation: titan-pulse 1.4s infinite ease-in-out; transform-origin: center; display:inline-block; } .titan-anim-spin svg, .titan-anim-spin { animation: titan-spin 1.8s infinite linear; transform-origin: center; display:inline-block; }
        .titan-anim-bounce svg, .titan-anim-bounce { animation: titan-bounce 0.9s infinite ease-in-out; transform-origin: center; display:inline-block; } .titan-anim-ring svg, .titan-anim-ring { animation: titan-ring 1.1s infinite ease-in-out; transform-origin: center; display:inline-block; }
        .titan-anim-ripple svg, .titan-anim-ripple { animation: titan-ripple 1.8s infinite ease-in-out; transform-origin: center; display:inline-block; } .titan-anim-wave svg, .titan-anim-wave { animation: titan-wave 1s infinite ease-in-out; transform-origin: center; display:inline-block; }
        .titan-anim-flash svg, .titan-anim-flash { animation: titan-flash 0.6s infinite ease-in-out; transform-origin: center; display:inline-block; } .titan-anim-glow svg, .titan-anim-glow { animation: titan-glow 1.5s infinite ease-in-out; transform-origin: center; display:inline-block; }

        /* Scrollbar */
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#070d1e; }
        ::-webkit-scrollbar-thumb { background:#1e3a8a; border-radius:3px; }
    </style>
</head>
<body>
    <div style="max-width:1400px; margin:0 auto;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:18px; margin-bottom:24px;">
            <div>
                <h1 style="font-size:26px; color:#38bdf8; display:flex; align-items:center; gap:10px;">
                    🐬 Danphe Animated Icons (551) & Fonts (256)
                    <span class="badge" style="background:#0369a1; color:#e0f2fe;">REAL-TIME TELEMETRY</span>
                </h1>
                <p style="margin:6px 0 0; font-size:13px; color:#94a3b8;">
                    Pure C++ SVG Vectors • 8 Animation Sub-Opcodes • Dynamic Hardware Gauges • Titan-Bus Stream
                </p>
            </div>
            <div style="display:flex; gap:10px;">
                <div style="background:#042f2e; border:1px solid #0d9488; padding:8px 16px; border-radius:10px; text-align:right;">
                    <div style="font-size:11px; font-weight:bold; color:#2dd4bf;">TITAN-BUS: SISO ACTIVE</div>
                    <div style="font-size:10px; font-family:monospace; color:#99f6e4;">0x4400 (WIFI) • 0x4401 (BATT) • 0x4701 (ANIM)</div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <!-- ⚡ REAL-TIME DYNAMIC TELEMETRY LAB (WiFi, Battery, Speedo, ECG) -->
        <!-- ═══════════════════════════════════════════════════════════════════ -->
        <div style="background:linear-gradient(135deg, #130d2e 0%, #080517 100%); border:1px solid #4f46e5; border-radius:16px; padding:22px; margin-bottom:28px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
                <div>
                    <h2 style="font-size:18px; color:#a5b4fc; display:flex; align-items:center; gap:8px;">
                        📶 Real-Time Dynamic Hardware Telemetry Icons
                        <span class="badge" style="background:#3730a3; color:#e0e7ff;">0ms LIVE SYNC</span>
                    </h2>
                    <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Slide any hardware meter to watch the pure SVG vectors transform dynamically in real-time!</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
                <!-- 1. Live WiFi Wave -->
                <div style="background:#0b0821; border:1px solid #312e81; border-radius:14px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:12px; font-weight:bold; color:#a5b4fc;">WIFI SIGNAL TELEMETRY</span>
                        <span id="wifi-label" class="badge" style="background:#312e81; color:#c7d2fe;">85% (-52 dBm)</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
                        <div id="wifi-svg-container" style="width:54px; height:54px; display:flex; align-items:center; justify-content:center; background:#17113f; border:1px solid #4f46e5; border-radius:10px; color:#38bdf8;"></div>
                        <div style="flex:1;"><input type="range" id="wifi-slider" min="0" max="100" value="85" oninput="updateLiveWifi(this.value)"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#6366f1;"><span>0% Offline</span><span>50% Fair</span><span>100% 5GHz Strong</span></div>
                </div>
                <!-- 2. Live Battery -->
                <div style="background:#0b0821; border:1px solid #312e81; border-radius:14px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:12px; font-weight:bold; color:#a5b4fc;">BATTERY CHARGE TELEMETRY</span>
                        <span id="battery-label" class="badge" style="background:#065f46; color:#a7f3d0;">75% Charging ⚡</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
                        <div id="battery-svg-container" style="width:54px; height:54px; display:flex; align-items:center; justify-content:center; background:#17113f; border:1px solid #4f46e5; border-radius:10px; color:#10b981;"></div>
                        <div style="flex:1;"><input type="range" id="battery-slider" min="0" max="100" value="75" oninput="updateLiveBattery(this.value)" style="accent-color:#10b981;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label style="font-size:11px; color:#cbd5e1; cursor:pointer; display:flex; align-items:center; gap:6px;">
                            <input type="checkbox" id="battery-charging-check" checked onchange="updateLiveBattery(document.getElementById('battery-slider').value)"> ⚡ Fast USB-C Charging
                        </label>
                    </div>
                </div>
                <!-- 3. Live Speedometer Gauge -->
                <div style="background:#0b0821; border:1px solid #312e81; border-radius:14px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:12px; font-weight:bold; color:#a5b4fc;">EVEREST BUS SPEEDOMETER</span>
                        <span id="speed-label" class="badge" style="background:#431407; color:#fdba74;">65 KM/H</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
                        <div id="speed-svg-container" style="width:54px; height:54px; display:flex; align-items:center; justify-content:center; background:#17113f; border:1px solid #4f46e5; border-radius:10px; color:#f97316;"></div>
                        <div style="flex:1;"><input type="range" id="speed-slider" min="0" max="220" value="65" oninput="updateLiveSpeed(this.value)" style="accent-color:#f97316;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#6366f1;"><span>0 Idle</span><span>80 Highway</span><span>220 Max</span></div>
                </div>
                <!-- 4. Live ECG Heartbeat Pulse -->
                <div style="background:#0b0821; border:1px solid #312e81; border-radius:14px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:12px; font-weight:bold; color:#a5b4fc;">REALTIME ECG HEARTBEAT</span>
                        <span id="pulse-label" class="badge" style="background:#4c0519; color:#fecdd3;">72 BPM Normal</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
                        <div id="pulse-svg-container" class="titan-anim-pulse" style="width:54px; height:54px; display:flex; align-items:center; justify-content:center; background:#17113f; border:1px solid #4f46e5; border-radius:10px; color:#f43f5e;"></div>
                        <div style="flex:1;"><input type="range" id="pulse-slider" min="40" max="180" value="72" oninput="updateLivePulse(this.value)" style="accent-color:#f43f5e;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#6366f1;"><span>40 Resting</span><span>72 Rest</span><span>180 Sprint</span></div>
                </div>
            </div>
        </div>

        <!-- 🐬 DOLPHIN-CPP UB & TITAN-BUS ADAPTIVE COMPONENTS LAB -->
        <div style="background:linear-gradient(135deg, #091728 0%, #030814 100%); border:1px solid #0284c7; border-radius:16px; padding:22px; margin-bottom:28px; box-shadow:0 10px 30px rgba(2,132,199,0.15);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
                <div>
                    <h2 style="font-size:18px; color:#38bdf8; display:flex; align-items:center; gap:8px;">
                        🐬 Dolphin-CPP UB & Titan-Bus Adaptive Components Lab
                        <span class="badge" style="background:#0369a1; color:#e0f2fe;">DOLPHIN-CPP UB ENGINE</span>
                    </h2>
                    <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Pure Mathematical Vector Chassis • Real Unicode Text • 24-Byte Titan Binary Stream • Pure C++ LVGL</p>
                </div>
            </div>

            <!-- Controls Row -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px; background:#040c1a; padding:14px; border-radius:12px; border:1px solid #1e293b;">
                <div>
                    <label style="font-size:11px; font-weight:bold; color:#7dd3fc; display:block; margin-bottom:4px;">COMPONENT TYPE</label>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button id="comp-type-btn" class="anim-btn active" onclick="setAdaptiveType('button')">🔘 Adaptive Button</button>
                        <button id="comp-type-card" class="anim-btn" onclick="setAdaptiveType('card')">📦 Adaptive Card</button>
                        <button id="comp-type-input" class="anim-btn" onclick="setAdaptiveType('input')">📝 Adaptive Input (All Variants)</button>
                    </div>
                </div>
                <div>
                    <label style="font-size:11px; font-weight:bold; color:#7dd3fc; display:block; margin-bottom:4px;">REAL DYNAMIC TEXT / PLACEHOLDER (NEPALI / UTF-8)</label>
                    <input type="text" id="adaptive-label-input" value="सुरक्षित सुरु 🚀 (Start)" oninput="updateAdaptivePreview()" style="width:100%; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:8px; padding:6px 10px; font-size:13px; font-family:'Inter', sans-serif;">
                </div>
                <div>
                    <label style="font-size:11px; font-weight:bold; color:#7dd3fc; display:block; margin-bottom:4px;">THEME (OKLCH PALETTE)</label>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #22d3ee; cursor:pointer;" onclick="setAdaptiveTheme('cyan')">Cyan</button> <button class="badge" style="background:#06281e; color:#34d399; border:1px solid #10b981; cursor:pointer;" onclick="setAdaptiveTheme('emerald')">Emerald</button> <button class="badge" style="background:#2b1803; color:#fbbf24; border:1px solid #f59e0b; cursor:pointer;" onclick="setAdaptiveTheme('amber')">Amber</button> <button class="badge" style="background:#2d0812; color:#fb7185; border:1px solid #f43f5e; cursor:pointer;" onclick="setAdaptiveTheme('rose')">Rose</button> <button class="badge" style="background:#1e0c38; color:#c084fc; border:1px solid #a855f7; cursor:pointer;" onclick="setAdaptiveTheme('violet')">Violet</button>
                    </div>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <label style="font-size:11px; font-weight:bold; color:#7dd3fc;">CORNER RADIUS</label>
                        <span id="radius-val" style="font-size:11px; font-family:monospace; color:#38bdf8;">14px</span>
                    </div>
                    <input type="range" id="adaptive-radius-slider" min="0" max="32" value="14" oninput="document.getElementById('radius-val').innerText = this.value + 'px'; updateAdaptivePreview();" style="width:100%; accent-color:#38bdf8;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <label style="font-size:11px; font-weight:bold; color:#7dd3fc;">🎯 STUDIO ICON LAYER</label>
                        <span id="adaptive-icon-badge" class="badge" style="background:#0284c7; color:#fff;">Auto (Default)</span>
                    </div>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(232)">🔍 Search</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(1)">🔒 Lock</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(32)">👤 User</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(18)">✉️ Mail</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(0)">📱 Phone</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(16)">⚡ Spark</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="setAdaptiveIcon(null)">🔄 Reset</button>
                    </div>
                </div>
            </div>

            <!-- Global Button 256 Variants Bar (Shown when type === 'button') -->
            <div id="adaptive-button-variant-bar" style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px; background:#040c1a; padding:14px; border-radius:12px; border:1px solid #1e293b;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px; font-weight:bold; color:#7dd3fc;">🔘 256 BUTTONS OP-CODE SLIDER:</span>
                        <span id="button-op-badge" class="badge" style="background:#0284c7; color:#fff; font-size:12px;">OpCode: 0 (0x00) • Solid Primary Action</span>
                    </div>
                    <span id="button-cat-badge" class="badge" style="background:#042f2e; color:#2dd4bf;">Primary & Core Actions</span>
                </div>
                <input type="range" id="button-opcode-slider" min="0" max="255" value="0" oninput="onButtonOpcodeChange(this.value)" style="width:100%; accent-color:#38bdf8;">
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                    <span style="font-size:11px; color:#7dd3fc; font-weight:bold;">PRESETS:</span>
                    <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(0)">🚀 Primary</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(1)">👻 Ghost Outline</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(2)">💊 Pill Capsule</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(3)">➕ FAB (+)</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(5)">⚡ Cyber 45°</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(6)">🪨 3D Neomorphic</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(7)">🪟 Frosted Glass</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(8)">💡 Neon Pulse</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(9)">🧱 Brutalist Retro</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(11)">⏳ Loading Spinner</button> <button class="badge" style="background:#0f172a; color:#ef4444; border:1px solid #ef4444; cursor:pointer;" onclick="jumpToButtonOpcode(13)">🗑️ Danger Trash</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToButtonOpcode(96)">🛒 Add Cart</button> <button class="badge" style="background:#0f172a; color:#10b981; border:1px solid #10b981; cursor:pointer;" onclick="jumpToButtonOpcode(100)">💳 eSewa Wallet</button> <button class="badge" style="background:#0f172a; color:#22c55e; border:1px solid #22c55e; cursor:pointer;" onclick="jumpToButtonOpcode(136)">💬 WhatsApp</button> <button class="badge" style="background:#0f172a; color:#a855f7; border:1px solid #a855f7; cursor:pointer;" onclick="jumpToButtonOpcode(160)">🎮 Play / Game</button> <button class="badge" style="background:#0f172a; color:#ec4899; border:1px solid #ec4899; cursor:pointer;" onclick="jumpToButtonOpcode(192)">🤖 AI Run</button> <button class="badge" style="background:#0f172a; color:#f97316; border:1px solid #f97316; cursor:pointer;" onclick="jumpToButtonOpcode(234)">🚀 Everest Ignition</button>
                </div>
            </div>

            <!-- Global Input 256 Variants Bar (Shown when type === 'input') -->
            <div id="adaptive-variant-bar" style="display:none; flex-direction:column; gap:10px; margin-bottom:14px; background:#040c1a; padding:14px; border-radius:12px; border:1px solid #1e293b;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:12px; font-weight:bold; color:#7dd3fc;">🎛️ 256 INPUTS OP-CODE SLIDER:</span>
                        <span id="input-op-badge" class="badge" style="background:#0284c7; color:#fff; font-size:12px;">OpCode: 0 (0x00) • Standard Text</span>
                    </div>
                    <span id="input-cat-badge" class="badge" style="background:#042f2e; color:#2dd4bf;">Text & Security</span>
                </div>
                <input type="range" id="input-opcode-slider" min="0" max="255" value="0" oninput="onInputOpcodeChange(this.value)" style="width:100%; accent-color:#38bdf8;">
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                    <span style="font-size:11px; color:#22d3ee; font-weight:bold;">STANDALONE:</span>
                    <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #06b6d4; cursor:pointer;" onclick="jumpToInputOpcode(69)">☑️ Checkbox</button> <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #06b6d4; cursor:pointer;" onclick="jumpToInputOpcode(70)">🔘 Radio</button> <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #06b6d4; cursor:pointer;" onclick="jumpToInputOpcode(67)">📲 Switch</button> <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #06b6d4; cursor:pointer;" onclick="jumpToInputOpcode(39)">🎚️ Slider</button> <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #06b6d4; cursor:pointer;" onclick="jumpToInputOpcode(131)">🔢 OTP</button> <button class="badge" style="background:#083344; color:#22d3ee; border:1px solid #06b6d4; cursor:pointer;" onclick="jumpToInputOpcode(64)">📋 Select</button>
                    <span style="font-size:11px; color:#94a3b8; font-weight:bold; margin-left:6px;">TEXT CHASSIS:</span>
                    <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(3)">🏷️ Floating</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(5)">➖ Underline</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(4)">☕ Filled</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(0)">📦 Outlined</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(6)">💊 Pill</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(7)">⚡ Cyber</button> <button class="badge" style="background:#0f172a; color:#38bdf8; border:1px solid #0284c7; cursor:pointer;" onclick="jumpToInputOpcode(160)">📝 TextArea</button>
                </div>
            </div>

            <!-- 3 Columns Preview -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
                <!-- Column 1: Live Rendered Vector Component -->
                <div style="background:#040916; border:1px solid #1e293b; border-radius:14px; padding:18px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:220px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px;">
                        <span style="font-size:11px; font-weight:bold; color:#64748b;">🖼️ PURE DOLPHIN-UB VECTOR FRAME</span>
                        <span id="adaptive-chip-badge" class="badge" style="background:#065f46; color:#a7f3d0; font-size:11px;">CHIP ID: #00</span>
                    </div>
                    <div id="adaptive-rendered-preview" style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;"></div>
                </div>

                <!-- Column 2: Titan-Bus 24-Byte Binary Highway Stream -->
                <div style="background:#040916; border:1px solid #1e293b; border-radius:14px; padding:18px; font-family:'JetBrains Mono', monospace;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:11px; font-weight:bold; color:#64748b;">⚡ TITAN-BUS SERIAL STREAM</span>
                        <span class="badge" style="background:#0369a1; color:#e0f2fe;">ACTIVE TX</span>
                    </div>
                    <div id="adaptive-titan-hex" style="font-size:11px; color:#38bdf8; background:#020617; padding:8px 10px; border-radius:8px; border:1px solid #0284c7; word-break:break-all; line-height:1.5; margin-bottom:8px;">AA 10 00 01 0E 64 32 B4 ... 55</div>
                    <div style="font-size:11px; color:#a5b4fc; margin-bottom:6px;"><span style="color:#64748b;">6-Byte SISO:</span> <span id="adaptive-titan-siso" style="color:#34d399; font-weight:bold;">53 49 00 00 00 01</span></div>
                    <div id="adaptive-serial-log" style="font-size:11px; color:#2dd4bf; background:#042f2e; border:1px solid #0d9488; padding:8px 10px; border-radius:8px; transition:all 0.2s ease;">⚡ CLICK BUTTON TO EMIT SERIAL TX PULSE</div>
                </div>

                <!-- Column 3: Pure C++ LVGL Code -->
                <div style="background:#040916; border:1px solid #1e293b; border-radius:14px; padding:18px; font-family:'JetBrains Mono', monospace;">
                    <div style="font-size:11px; font-weight:bold; color:#64748b; margin-bottom:8px;">⌚ PURE C++ LVGL & THORVG EMBEDDED CODE</div>
                    <pre id="adaptive-lvgl-code" style="margin:0; font-size:11px; color:#a5b4fc; background:#020617; padding:12px; border-radius:8px; border:1px solid #312e81; max-height:140px; overflow-y:auto; white-space:pre-wrap;"></pre>
                </div>
            </div>
        </div>

        <!-- 1. INTERACTIVE ICON SCRUBBER SLIDER + 8 ANIMATION MODES -->
        <div class="slider-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                    <h2 style="font-size:18px; color:#38bdf8;">🎚️ 551 Vector Icons Interactive Slider Scrubber</h2>
                    <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Slide from 0 to 550 to inspect every pure C++ SVG vector in real-time</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="badge" style="background:#0284c7; color:#fff; font-size:14px; padding:6px 14px;" id="icon-slider-badge">OpCode: 0 (0x00)</span>
                </div>
            </div>
            <input type="range" id="icon-slider" min="0" max="550" value="0" oninput="onIconSliderChange(this.value)">
            <div style="margin-top:16px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <span style="font-size:12px; font-weight:bold; color:#94a3b8; margin-right:4px;">✨ Animation Mode:</span>
                <button class="anim-btn active" onclick="setAnimMode('')">0: Static</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-pulse')">1: Pulse ❤️</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-spin')">2: Spin 🔄</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-bounce')">3: Bounce ⚡</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-ring')">4: Ring 🔔</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-ripple')">5: Ripple 🌊</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-wave')">6: Wave 〰️</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-flash')">7: Flash 🚨</button>
                <button class="anim-btn" onclick="setAnimMode('titan-anim-glow')">8: Neon Glow 💡</button>
            </div>
            <div style="display:flex; gap:20px; align-items:center; margin-top:20px; background:#071329; border:1px solid #1e3a8a; border-radius:12px; padding:16px;">
                <div id="slider-icon-preview" style="width:72px; height:72px; display:flex; align-items:center; justify-content:center; background:#0f172a; border:1px solid #38bdf8; border-radius:12px; color:#38bdf8; shrink-0;"></div>
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <h3 id="slider-icon-name" style="font-size:16px; color:#f8fafc;">idle_phone</h3>
                        <span id="slider-icon-hex" class="badge" style="background:#1e3a8a; color:#38bdf8;">0x00</span>
                    </div>
                    <div id="slider-icon-code" style="font-size:11px; font-family:monospace; color:#64748b; margin-top:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; background:#020617; padding:6px 10px; border-radius:6px; border:1px solid #1e293b;"></div>
                </div>
                <button onclick="copySliderSvg()" style="background:#0284c7; color:#fff; border:none; padding:10px 16px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;">📋 Copy SVG</button>
            </div>
        </div>

        <!-- 2. WHOLE 551 ICONS GALLERY GRID -->
        <div class="card" style="margin-bottom:32px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div>
                    <h2 style="font-size:18px; color:#38bdf8;">🎨 Whole Suite: All 551 Vector Icons Grid</h2>
                    <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Showing all 551 icons (Click any icon to jump slider to it)</p>
                </div>
                <input type="text" class="search-input" id="icon-search" placeholder="🔍 Search icons by name or hex..." oninput="filterIconGrid(this.value)">
            </div>
            <div class="grid-icons" id="icons-grid"></div>
        </div>

        <!-- 3. INTERACTIVE 256 FONTS SLIDER SCRUBBER (0 - 255) -->
        <div class="slider-box" style="border-color:#065f46; background:linear-gradient(135deg, #021a15 0%, #011410 100%);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                    <h2 style="font-size:18px; color:#10b981;">🎚️ 256 Offline Fonts Interactive Slider Scrubber</h2>
                    <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Slide to test all 256 typography presets: Nepali Devanagari, LED 7-Segment, Matrix LCD, Serif & Sans</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="badge" style="background:#059669; color:#fff; font-size:14px; padding:6px 14px;" id="font-slider-badge">OpCode: 0 (0x00)</span>
                </div>
            </div>
            <input type="range" id="font-slider" min="0" max="255" value="0" oninput="onFontSliderChange(this.value)" style="accent-color:#10b981;">
            <div style="margin-top:20px; background:#031d17; border:1px solid #065f46; border-radius:12px; padding:18px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div>
                        <h3 id="slider-font-name" style="font-size:16px; color:#f8fafc;">Danphe Seven-Segment Red LED Digital</h3>
                        <span id="slider-font-family" style="font-size:11px; font-family:monospace; color:#6ee7b7;">Consolas, monospace</span>
                    </div>
                    <span id="slider-font-hex" class="badge" style="background:#065f46; color:#a7f3d0;">0x00</span>
                </div>
                <div id="slider-font-preview" style="font-size:24px; color:#e2e8f0; line-height:1.4; padding:12px; background:#020617; border-radius:8px; border:1px solid #064e3b;">88:88:88 LED</div>
            </div>
        </div>

        <!-- 4. WHOLE 256 FONTS GALLERY GRID -->
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div>
                    <h2 style="font-size:18px; color:#10b981;">🔤 Whole Suite: All 256 Fonts Grid</h2>
                    <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Showing all 256 Typography Styles (Click any font to jump slider to it)</p>
                </div>
                <input type="text" class="search-input" id="font-search" placeholder="🔍 Search fonts by name, nepali, lcd, serif..." oninput="filterFontGrid(this.value)">
            </div>
            <div class="grid-fonts" id="fonts-grid"></div>
        </div>
    </div>

    <!-- Data Injection & Client Controller -->
    <script>
        const ICONS = ${JSON.stringify(ALL_ICONS_COMPACT)};
        const FONTS = ${JSON.stringify(ALL_FONTS_COMPACT)};
        let currentAnimClass = '';

        function renderSvg(item, size = 28, color = '#38bdf8', anim = '') {
            const cls = 'danphe-icon ' + anim;
            return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="\${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="\${cls}">\${item.elements}</svg>\`;
        }

        function setAnimMode(animClass) {
            currentAnimClass = animClass;
            document.querySelectorAll('.anim-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            const currentOp = document.getElementById('icon-slider').value;
            onIconSliderChange(currentOp);
        }

        // 1. Icon Slider
        function onIconSliderChange(val) {
            const op = parseInt(val, 10);
            currentAdaptiveIcon = op;
            const iconB = document.getElementById('adaptive-icon-badge');
            if (iconB) iconB.innerText = 'Studio Op: ' + op;
            const item = ICONS[op] || ICONS[0];
            const hex = '0x' + op.toString(16).toUpperCase().padStart(2, '0');

            document.getElementById('icon-slider-badge').innerText = \`OpCode: \${op} (\${hex})\`;
            document.getElementById('slider-icon-preview').innerHTML = renderSvg(item, 44, '#38bdf8', currentAnimClass);
            document.getElementById('slider-icon-name').innerText = item.name;
            document.getElementById('slider-icon-hex').innerText = hex;
            document.getElementById('slider-icon-code').innerText = renderSvg(item, 24, 'currentColor', currentAnimClass);

            document.querySelectorAll('.icon-item').forEach(el => el.classList.remove('active'));
            const gridEl = document.getElementById('grid-icon-' + op);
            if (gridEl) {
                gridEl.classList.add('active');
                gridEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            fetch('/api/icon/' + op + '?anim=' + currentAnimClass).catch(() => {});
        }

        function copySliderSvg() {
            const code = document.getElementById('slider-icon-code').innerText;
            navigator.clipboard.writeText(code);
            alert('Copied SVG Code to clipboard!');
        }

        // 2. Render Full Icons Grid
        function renderFullIconGrid(filter = '') {
            const container = document.getElementById('icons-grid');
            const q = filter.toLowerCase().trim();
            let html = '';

            for (let i = 0; i < ICONS.length; ++i) {
                const it = ICONS[i];
                const hex = '0x' + it.opcode.toString(16).toUpperCase().padStart(2, '0');
                if (q && !it.name.toLowerCase().includes(q) && !hex.toLowerCase().includes(q) && String(it.opcode) !== q) {
                    continue;
                }
                const svg = renderSvg(it, 26, '#38bdf8');
                html += \`
                <div class="icon-item \${i === 0 ? 'active' : ''}" id="grid-icon-\${i}" onclick="jumpToIcon(\${i})">
                    <div style="display:flex; justify-content:center; margin-bottom:6px;">\${svg}</div>
                    <div style="font-size:10px; font-weight:bold; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${it.name}</div>
                    <div style="font-size:9px; font-family:monospace; color:#38bdf8; margin-top:2px;">\${hex}</div>
                </div>\`;
            }
            container.innerHTML = html || '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#64748b;">No icons match search</div>';
        }

        function jumpToIcon(op) {
            document.getElementById('icon-slider').value = op;
            onIconSliderChange(op);
        }

        function filterIconGrid(val) {
            renderFullIconGrid(val);
        }

        // 3. Live Hardware Telemetry
        function updateLiveWifi(val) {
            const pct = parseInt(val, 10);
            const dbm = Math.round(-90 + (pct * 0.55));
            document.getElementById('wifi-label').innerText = \`\${pct}% (\${dbm} dBm)\`;
            
            // Dynamic WiFi SVG with dynamic signal levels
            const arc1 = pct > 15 ? '#38bdf8' : '#334155';
            const arc2 = pct > 45 ? '#38bdf8' : '#334155';
            const arc3 = pct > 75 ? '#38bdf8' : '#334155';
            const dot  = pct > 5  ? '#38bdf8' : '#ef4444';

            const svg = \`<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="\${arc3}"/>
                <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="\${arc2}"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="\${arc1}"/>
                <line x1="12" y1="20" x2="12.01" y2="20" stroke="\${dot}" stroke-width="3"/>
            </svg>\`;
            document.getElementById('wifi-svg-container').innerHTML = svg;
        }

        function updateLiveBattery(val) {
            const pct = parseInt(val, 10);
            const isCharging = document.getElementById('battery-charging-check').checked;
            const col = pct > 20 ? (pct > 50 ? '#10b981' : '#f59e0b') : '#ef4444';
            document.getElementById('battery-label').innerText = \`\${pct}% \${isCharging ? 'Charging ⚡' : 'Discharging'}\`;
            document.getElementById('battery-label').style.background = pct > 20 ? '#065f46' : '#450a0a';
            document.getElementById('battery-label').style.color = pct > 20 ? '#a7f3d0' : '#fca5a5';

            const fillW = Math.max(1, Math.round((pct / 100) * 14));
            let bolt = isCharging ? \`<polygon points="11 6 7 13 12 13 10 18 15 11 10 11 11 6" fill="\${col}" stroke="\${col}" stroke-width="1"/>\` : '';
            
            const svg = \`<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="\${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="6" width="18" height="12" rx="2"/>
                <line x1="22" y1="10" x2="22" y2="14"/>
                <rect x="4" y="8" width="\${fillW}" height="8" rx="1" fill="\${col}" opacity="0.6"/>
                \${bolt}
            </svg>\`;
            document.getElementById('battery-svg-container').innerHTML = svg;
        }

        function updateLiveSpeed(val) {
            const spd = parseInt(val, 10);
            document.getElementById('speed-label').innerText = \`\${spd} KM/H\`;
            
            // Speedometer needle rotation from -120deg to +120deg
            const angle = -120 + ((spd / 220) * 240);
            const col = spd > 100 ? '#ef4444' : (spd > 60 ? '#f97316' : '#38bdf8');

            const svg = \`<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="\${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 15l3.5-3.5" transform="rotate(\${angle} 12 15)"/>
                <path d="M20.3 18a9 9 0 1 0-16.6 0"/>
                <circle cx="12" cy="15" r="1.5" fill="\${col}"/>
            </svg>\`;
            document.getElementById('speed-svg-container').innerHTML = svg;
        }

        function updateLivePulse(val) {
            const bpm = parseInt(val, 10);
            const status = bpm > 100 ? 'Tachycardia / High' : (bpm < 60 ? 'Bradycardia' : 'Resting Normal');
            document.getElementById('pulse-label').innerText = \`\${bpm} BPM \${status}\`;

            // Adjust pulse animation speed based on BPM
            const dur = Math.max(0.3, (60 / bpm)).toFixed(2);
            const container = document.getElementById('pulse-svg-container');
            container.style.animationDuration = \`\${dur}s\`;

            const svg = \`<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>\`;
            container.innerHTML = svg;
        }

        // 4. Font Slider
        function onFontSliderChange(val) {
            const op = parseInt(val, 10);
            const item = FONTS[op] || FONTS[0];
            const hex = '0x' + op.toString(16).toUpperCase().padStart(2, '0');
            const f = item.font;

            document.getElementById('font-slider-badge').innerText = \`OpCode: \${op} (\${hex})\`;
            document.getElementById('slider-font-name').innerText = f.name;
            document.getElementById('slider-font-family').innerText = f.family || 'sans-serif';
            document.getElementById('slider-font-hex').innerText = hex;

            const previewEl = document.getElementById('slider-font-preview');
            previewEl.style.fontFamily = f.family;
            previewEl.style.fontWeight = f.weight || '400';
            previewEl.style.fontStyle = f.style || 'normal';
            previewEl.style.letterSpacing = f.letterSpacing || 'normal';
            previewEl.style.textTransform = f.textTransform || 'none';
            previewEl.style.textShadow = f.textShadow || 'none';
            previewEl.innerText = f.preview || 'Danphe UI Universal Typography 2026';

            document.querySelectorAll('.font-item').forEach(el => el.classList.remove('active'));
            const gridEl = document.getElementById('grid-font-' + op);
            if (gridEl) {
                gridEl.classList.add('active');
                gridEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            fetch('/api/font/' + op).catch(() => {});
        }

        // 5. Render Full Fonts Grid
        function renderFullFontGrid(filter = '') {
            const container = document.getElementById('fonts-grid');
            const q = filter.toLowerCase().trim();
            let html = '';

            for (let i = 0; i < FONTS.length; ++i) {
                const it = FONTS[i];
                const f = it.font;
                const hex = '0x' + it.opcode.toString(16).toUpperCase().padStart(2, '0');
                if (q && !f.name.toLowerCase().includes(q) && !hex.toLowerCase().includes(q) && !(f.family || '').toLowerCase().includes(q)) {
                    continue;
                }
                const inlineStyle = \`font-family:\${f.family}; font-weight:\${f.weight || '400'}; font-style:\${f.style || 'normal'}; letter-spacing:\${f.letterSpacing || 'normal'}; text-transform:\${f.textTransform || 'none'}; text-shadow:\${f.textShadow || 'none'};\`;
                html += \`
                <div class="font-item \${i === 0 ? 'active' : ''}" id="grid-font-\${i}" onclick="jumpToFont(\${i})">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:11px; font-weight:bold; color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:210px;">\${f.name}</span>
                        <span class="badge" style="background:#065f46; color:#a7f3d0;">\${hex}</span>
                    </div>
                    <div style="font-size:16px; color:#e2e8f0; \${inlineStyle}">\${f.preview || 'Danphe UI 2026'}</div>
                </div>\`;
            }
            container.innerHTML = html || '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#64748b;">No fonts match search</div>';
        }

        function jumpToFont(op) {
            document.getElementById('font-slider').value = op;
            onFontSliderChange(op);
        }

        function filterFontGrid(val) {
            renderFullFontGrid(val);
        }

        // 6. Adaptive Components Lab Handlers
        let currentAdaptiveType = 'button';
        let currentAdaptiveVariant = 'text';
        let currentAdaptiveTheme = 'cyan';
        let currentInputOpcode = 0;
        let currentButtonOpcode = 0;
        let currentAdaptiveIcon = null;

        function setAdaptiveIcon(op) {
            currentAdaptiveIcon = op;
            const b = document.getElementById('adaptive-icon-badge');
            if (b) b.innerText = (op === null ? 'Auto (Default)' : 'Studio Op: ' + op);
            updateAdaptivePreview();
        }

        function setAdaptiveType(type) {
            currentAdaptiveType = type;
            document.getElementById('comp-type-btn').classList.toggle('active', type === 'button');
            document.getElementById('comp-type-card').classList.toggle('active', type === 'card');
            document.getElementById('comp-type-input').classList.toggle('active', type === 'input');
            const btnBar = document.getElementById('adaptive-button-variant-bar');
            if (btnBar) btnBar.style.display = (type === 'button' ? 'flex' : 'none');
            const inpBar = document.getElementById('adaptive-variant-bar');
            if (inpBar) inpBar.style.display = (type === 'input' ? 'flex' : 'none');
            
            if (type === 'input') {
                document.getElementById('adaptive-label-input').value = 'यहाँ खोज्नुहोस् वा टाइप गर्नुहोस्...';
            } else if (type === 'card') {
                document.getElementById('adaptive-label-input').value = 'नेपाल टेलिकम्युनिकेसन (Titan Telemetry)';
            } else {
                document.getElementById('adaptive-label-input').value = 'सुरक्षित सुरु 🚀 (Start)';
            }
            updateAdaptivePreview();
        }

        function onButtonOpcodeChange(val) {
            currentAdaptiveType = 'button';
            currentButtonOpcode = parseInt(val, 10);
            const lbl = document.getElementById('adaptive-label-input');
            if (lbl && (lbl.value.includes('खोज्नुहोस्') || lbl.value === 'सुरक्षित सुरु 🚀 (Start)')) lbl.value = '';
            updateAdaptivePreview();
        }

        function jumpToButtonOpcode(op) {
            currentAdaptiveType = 'button';
            document.getElementById('comp-type-btn').classList.add('active');
            document.getElementById('comp-type-card').classList.remove('active');
            document.getElementById('comp-type-input').classList.remove('active');
            const btnBar = document.getElementById('adaptive-button-variant-bar');
            if (btnBar) btnBar.style.display = 'flex';
            const inpBar = document.getElementById('adaptive-variant-bar');
            if (inpBar) inpBar.style.display = 'none';
            currentButtonOpcode = op;
            const slider = document.getElementById('button-opcode-slider');
            if (slider) slider.value = op;
            const lbl = document.getElementById('adaptive-label-input');
            if (lbl && (lbl.value.includes('खोज्नुहोस्') || lbl.value === 'सुरक्षित सुरु 🚀 (Start)')) lbl.value = '';
            updateAdaptivePreview();
        }

        function onInputOpcodeChange(val) {
            currentAdaptiveType = 'input';
            currentInputOpcode = parseInt(val, 10);
            const lbl = document.getElementById('adaptive-label-input');
            if (lbl && (lbl.value.includes('खोज्नुहोस्') || lbl.value === 'सुरक्षित सुरु 🚀 (Start)')) lbl.value = '';
            updateAdaptivePreview();
        }

        function jumpToInputOpcode(op) {
            currentAdaptiveType = 'input';
            document.getElementById('comp-type-btn').classList.remove('active');
            document.getElementById('comp-type-card').classList.remove('active');
            document.getElementById('comp-type-input').classList.add('active');
            const btnBar = document.getElementById('adaptive-button-variant-bar');
            if (btnBar) btnBar.style.display = 'none';
            const inpBar = document.getElementById('adaptive-variant-bar');
            if (inpBar) inpBar.style.display = 'flex';
            currentInputOpcode = op;
            const slider = document.getElementById('input-opcode-slider');
            if (slider) slider.value = op;
            const lbl = document.getElementById('adaptive-label-input');
            if (lbl && (lbl.value.includes('खोज्नुहोस्') || lbl.value === 'सुरक्षित सुरु 🚀 (Start)')) lbl.value = '';
            updateAdaptivePreview();
        }

        function setAdaptiveTheme(theme) {
            currentAdaptiveTheme = theme;
            updateAdaptivePreview();
        }

        function updateAdaptivePreview() {
            const label = document.getElementById('adaptive-label-input').value || '';
            const radius = document.getElementById('adaptive-radius-slider').value || 14;
            const activeOpcode = currentAdaptiveType === 'button' ? currentButtonOpcode : currentInputOpcode;
            let url = '/api/adaptive/render?type=' + currentAdaptiveType + 
                        '&opcode=' + activeOpcode +
                        '&label=' + encodeURIComponent(label) + 
                        '&theme=' + currentAdaptiveTheme + 
                        '&anim=' + currentAnimClass +
                        '&radius=' + radius;
            if (currentAdaptiveIcon !== null) {
                url += '&icon=' + currentAdaptiveIcon;
            }

            fetch(url)
                .then(r => r.json())
                .then(data => {
                    if (data.svg) {
                        document.getElementById('adaptive-rendered-preview').innerHTML = data.svg;
                    }
                    if (data.hex) {
                        document.getElementById('adaptive-titan-hex').innerText = data.hex;
                    }
                    if (data.sisoHex) {
                        const sisoEl = document.getElementById('adaptive-titan-siso');
                        if (sisoEl) sisoEl.innerText = data.sisoHex;
                    }
                    if (data.chipId !== undefined) {
                        const chipEl = document.getElementById('adaptive-chip-badge');
                        if (chipEl) chipEl.innerText = 'CHIP ID: #' + String(data.chipId).padStart(2, '0');
                    }
                    if (data.lvgl) {
                        document.getElementById('adaptive-lvgl-code').innerText = data.lvgl;
                    }
                    if (data.def) {
                        const hex = '0x' + data.opcode.toString(16).toUpperCase().padStart(2, '0');
                        if (data.type === 'button') {
                            const opBadge = document.getElementById('button-op-badge');
                            if (opBadge) opBadge.innerText = 'OpCode: ' + data.opcode + ' (' + hex + ') • ' + data.def.name + ' (' + data.def.nepali + ')';
                            const catBadge = document.getElementById('button-cat-badge');
                            if (catBadge) catBadge.innerText = data.def.categoryName;
                        } else {
                            const opBadge = document.getElementById('input-op-badge');
                            if (opBadge) opBadge.innerText = 'OpCode: ' + data.opcode + ' (' + hex + ') • ' + data.def.name + ' (' + data.def.nepali + ')';
                            const catBadge = document.getElementById('input-cat-badge');
                            if (catBadge) catBadge.innerText = data.def.categoryName;
                        }
                    }
                })
                .catch(err => console.error('Adaptive render error:', err));
        }

        window.danpheEmitSerial = function(chipId, opcode, value) {
            const val = value !== undefined ? value : 1;
            const hexHi = (chipId >> 8) & 0xFF;
            const hexLo = chipId & 0xFF;
            const siso = '53 49 ' + hexHi.toString(16).toUpperCase().padStart(2, '0') + ' ' + hexLo.toString(16).toUpperCase().padStart(2, '0') + ' 00 01';
            const logEl = document.getElementById('adaptive-serial-log');
            if (logEl) {
                logEl.innerHTML = '<span style="color:#10b981; font-weight:bold;">⚡ TX PULSE:</span> Chip #' + chipId + ' ➔ Val: ' + val + ' <span style="color:#38bdf8;">[' + siso + ']</span>';
                logEl.style.borderColor = '#10b981';
                logEl.style.boxShadow = '0 0 12px rgba(16,185,129,0.4)';
                setTimeout(() => { if (logEl) { logEl.style.borderColor = '#0d9488'; logEl.style.boxShadow = 'none'; } }, 700);
            }
            fetch('/api/bus/write?chipId=' + chipId + '&val=' + val).catch(() => {});
        };

        // Initialize on load
        window.onload = function() {
            renderFullIconGrid();
            onIconSliderChange(0);
            renderFullFontGrid();
            onFontSliderChange(0);
            updateLiveWifi(85);
            updateLiveBattery(75);
            updateLiveSpeed(65);
            updateLivePulse(72);
            updateAdaptivePreview();
        };
    </script>
</body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
    }

    res.writeHead(404);
    res.end('Not Found');
});

const PORT = 8099;
server.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`  🐬 Danphe Animated Icons & Fonts Live on Port ${PORT}!   `);
    console.log(`  URL: http://localhost:${PORT}                             `);
    console.log(`  8 Animation Modes • Live WiFi, Battery, Gauge & ECG    `);
    console.log(`=========================================================`);
});
