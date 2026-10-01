# 🐬 Danphe Icons & Fonts 256 — Dolphin Language Master Tutorial

Welcome to the definitive guide for integrating **Danphe Icons & Fonts 256** into **Dolphin Language (`dolphin-cpp`)** projects.

This tutorial covers everything from basic `.dolphin` script rendering to real-time **Titan-Bus SISO streaming**, **Nepali Devanagari typography**, and **embedded hardware displays (LVGL & Dot Matrix)**.

---

## 📑 Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Project Installation](#2-project-installation)
3. [Basic Usage in Dolphin Scripts](#3-basic-usage-in-dolphin-scripts)
4. [Rendering Pure Vector SVG Icons](#4-rendering-pure-vector-svg-icons)
5. [Applying 256 Offline Fonts & Typography](#5-applying-256-offline-fonts--typography)
6. [Titan-Bus SISO Real-Time Serial Streaming](#6-titan-bus-siso-real-time-serial-streaming)
7. [Embedded & Microcontroller Usage (ESP32, STM32, LVGL)](#7-embedded--microcontroller-usage-esp32-stm32-lvgl)
8. [Performance & Best Practices](#8-performance--best-practices)

---

## 1. Architectural Overview

In traditional web and mobile stacks, icons and fonts add tens of megabytes of bloat (`node_modules`, TTF/WOFF2 font binaries, Babel bundles). 

`danphe-icons-fonts` was engineered specifically to solve this:
* **Pure C++17 Header Generation:** The entire 256 vector SVG bank (`danphe_icons_data.hpp`) is **only 46 KB** and compiles directly into native machine code.
* **100% Offline-First Typography:** 256 typographic presets (`danphe_fonts_data.hpp`, **only 43 KB**) requiring zero Google Fonts or external internet requests.
* **Titan-Bus Integration:** Assets can be dispatched serially via 24-byte binary packets or 6-byte SISO registers.
* **Sub-Microsecond Speed:** Generating an SVG takes less than `0.001ms`.

---

## 2. Project Installation

### Method A: Git Submodule (Recommended for Dolphin Projects)

In your Dolphin project root:

```bash
git submodule add https://github.com/Phuyalshankar/danphe-icons-fonts.git modules/danphe-icons-fonts
```

### Method B: Direct Git Clone

```bash
cd your-dolphin-project
git clone https://github.com/Phuyalshankar/danphe-icons-fonts.git modules/danphe-icons-fonts
```

Your project directory will look like:
```text
my-dolphin-app/
├── main.dolphin
└── modules/
    └── danphe-icons-fonts/
        ├── cpp/
        │   ├── danphe_icons_data.hpp
        │   ├── danphe_fonts_data.hpp
        │   └── titan_asset_bridge.hpp
        └── src/
            └── index.js
```

---

## 3. Basic Usage in Dolphin Scripts

Create a file named `app.dolphin`:

```dolphin
// 🐬 Native Dolphin Application with Danphe Icons & Fonts
import "@dolphin/web"
import "@danphe-icons-fonts"

println("==================================================")
println("  🐬 DOLPHIN NATIVE ICONS & FONTS SERVER          ")
println("==================================================")

var app = HTTP.Server()

app.get("/", fn(req, res) {
    // 1. Render Icon 0x10 (Rocket) with custom size and cyan color
    var iconSvg = DanpheIcons.svg(0x10, { size: 48, color: "#38bdf8" })

    // 2. Render Font 32 (Sagarmatha Nepali Devanagari) CSS
    var fontCss = DanpheFonts.css(32, ".nepali-hero")

    var html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { background: #020617; color: #f8fafc; font-family: sans-serif; padding: 40px; }
            ${fontCss}
        </style>
    </head>
    <body>
        <div style="display:flex; align-items:center; gap:16px;">
            ${iconSvg}
            <h1 class="nepali-hero">नमस्ते! डाँफे युआई नेटिभ डल्फिनमा स्वागत छ 🚀</h1>
        </div>
    </body>
    </html>
    `
    res.html(html)
})

app.listen(3000)
println("🚀 Server running at http://localhost:3000")
```

Run it natively with Dolphin:

```bash
dolphin run app.dolphin
```

---

## 4. Rendering Pure Vector SVG Icons

### By OpCode (0x00 to 0xFF):

Every icon is mapped to an 8-bit unsigned OpCode (0 to 255):

```dolphin
// Opcode 0x00: Standby Phone
var phoneIcon = DanpheIcons.svg(0x00)

// Opcode 0x10: Launch Rocket
var rocketIcon = DanpheIcons.svg(0x10, { size: 32, color: "#f43f5e" })

// Opcode 0xA0 (160): National Flag of Nepal
var nepalFlag = DanpheIcons.svg(160, { size: 40 })
```

### With 8 Animation Modes:

Dolphin C++ natively injects hardware-accelerated CSS animations:

```dolphin
// Pulse animation
var pulseIcon = DanpheIcons.svg(0x10, { anim: "pulse" })

// Spin 360° animation
var spinIcon = DanpheIcons.svg(0x02, { anim: "spin" })

// Neon Glow animation
var glowIcon = DanpheIcons.svg(0xA0, { anim: "glow" })
```

Supported animation sub-opcodes: `static`, `pulse`, `spin`, `bounce`, `ring`, `ripple`, `wave`, `flash`, `glow`.

---

## 5. Applying 256 Offline Fonts & Typography

Danphe Fonts 256 requires zero external network connections (completely independent of Google Fonts).

### Category Map:
* **OpCodes 0x00 - 0x1F (0 - 31):** Hardware Displays (7-Segment Red LED, 14-Segment HUD, 16x16 Matrix LCD, 5x7 Dot-Matrix)
* **OpCodes 0x20 - 0x3F (32 - 63):** Nepali Devanagari (Sagarmatha, Kalimati, Mangal, Kantipur, Mukti)
* **OpCodes 0x40 - 0x5F (64 - 95):** Cyberpunk & Sci-Fi Neon Shaders
* **OpCodes 0x60 - 0x7F (96 - 127):** Cinematic Title & 3D Extrusion
* **OpCodes 0x80 - 0x9F (128 - 159):** Luxury & Editorial Serif
* **OpCodes 0xA0 - 0xBF (160 - 191):** Modern Swiss Grotesk Sans
* **OpCodes 0xC0 - 0xDF (192 - 223):** Handwritten & Calligraphy Brush
* **OpCodes 0xE0 - 0xFF (224 - 255):** Monospace Terminal & Retro 3D Art

### Usage in Dolphin:

```dolphin
// Get 7-Segment LED font styling
var ledStyle = DanpheFonts.css(0x00, ".digital-speedometer")

// Get Authentic Nepali Devanagari styling
var nepaliStyle = DanpheFonts.css(0x20, ".nepali-masthead")

// Get 16x16 Matrix LCD Terminal styling
var lcdStyle = DanpheFonts.css(0x02, ".matrix-lcd")
```

---

## 6. Titan-Bus SISO Real-Time Serial Streaming

Titan-Bus allows streaming icons and typography across threads, processes, and remote devices in 0ms.

```dolphin
import "@dolphin/titan"

var bus = Titan.Bus()

// Listen for Icon Stream requests on SISO Register 0x4701
bus.onRegister(0x4701, fn(requestedOpcode) {
    println("⚡ [Titan-Bus] Streaming Icon OpCode: " + requestedOpcode)
    
    // Build 24-byte Titan Frame
    var frame = TitanAssetBridge.serializeIcon(requestedOpcode)
    
    // Broadcast serially to all connected subscribers (Web, Mobile, MCU)
    bus.broadcastBinary(frame)
})
```

---

## 7. Embedded & Microcontroller Usage (ESP32, STM32, LVGL)

Because `danphe_icons_data.hpp` and `danphe_fonts_data.hpp` are pure standard C++17 with header-only structures, they compile directly onto microcontrollers via `dolphin flash`:

```dolphin
// IoT Device Firmware (runs on ESP32 / RP2040)
import "@dolphin/mcu"

pin led(2, OUTPUT)

fn setup() {
    println("Booting Everest Bus LCD Screen...")
}

loop {
    // Toggle status indicator
    led.toggle()
    sleep(1000)
}
```

Flash directly to an ESP32:

```bash
dolphin flash app.dolphin esp32 COM3
```

In LVGL, the C++ coordinate paths can be passed directly to LVGL canvas draw buffers with virtually zero RAM overhead.

---

## 8. Performance & Best Practices

1. **Header-Only Inlining:** `DanpheIcons::renderSVG` and `DanpheFonts::renderCSS` inline at `-O2` / `-O3`, resulting in zero function call overhead.
2. **Binary Embedding:** The icon and font definitions live in `.rodata` (read-only memory) in your executable, consuming zero heap allocations.
3. **No Garbage Collection:** Unlike JavaScript string concatenations that trigger GC pauses, Dolphin C++ builds SVG buffers in contiguous memory.

---

## 🤝 Community & Support

* **GitHub Repository:** [https://github.com/Phuyalshankar/danphe-icons-fonts](https://github.com/Phuyalshankar/danphe-icons-fonts)
* **Author:** Shankar Phuyal & Danphe UI Team
* **License:** MIT
