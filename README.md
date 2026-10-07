# 🐬 Danphe Icons & Fonts 557

> **The Universal Ultra-Lightweight Vector & Typography Engine with Titan-Bus SISO Serial Streaming.**  
> 557 Pure Mathematical SVG Vectors • 256 Offline Fonts • 2-Byte SISO Serial Register Bus (`0x4701` / `0x4702`) • Sub-Microsecond 0ms Rendering • Zero NPM Bloat.

---

## ⚡ Quick Start: Single-Line SISO Serial API

Import `siso` directly and access icons and typography with zero boilerplate:

```javascript
const { siso } = require('danphe-icons-fonts');

// 1. Single-Line Instant Icon Read (0ms latency, pure SVG return)
const splitIcon = siso.readIcon(280);
const customIcon = siso.readIcon('split', { size: 24, color: '#38bdf8' });

// 2. Write Icon to Serial Bus (Sends 2-byte packet to register 0x4701)
siso.writeIcon(280);

// 3. Dynamic Array / Batch Read (e.g. on button click [10, 50, 58])
const activeIcons = siso.readIcons([10, 50, 58]);

// 4. Clean Range & Loop Support (e.g. 0 to 25 or 10-10 chunking)
const ribbonIcons = siso.rangeIcons(0, 25);
const chunk0 = siso.chunkIcons(10, 0); // items 0 to 9
const chunk1 = siso.chunkIcons(10, 1); // items 10 to 19

// 5. Single-Line Font Read & Write (Register 0x4702)
const nepaliFontCss = siso.readFont(32); // Sagarmatha Royal Devanagari
siso.writeFont(32);

// 6. Reactive Hardware Serial Bus Listener
siso.on(0x4201, (toolMode) => {
    console.log('Hardware MCU active tool changed:', toolMode);
});
```

---

## ⚛️ JSX / Dolphin Integration

Render icons effortlessly inside JSX components by referencing the Opcode:

```jsx
import React, { useState, useEffect } from 'react';
import { siso } from 'danphe-icons-fonts';

export function EditorToolbar() {
    const [tools, setTools] = useState([280, 273, 274, 281]);

    useEffect(() => {
        // Listen to hardware serial bus commands (e.g. Register 0x4201)
        return siso.on(0x4201, (cmd) => {
            if (cmd === 10) setTools([10, 50, 58]);
            else if (cmd === 20) setTools([412, 414, 553]);
        });
    }, []);

    return (
        <div className="flex gap-2 p-2 bg-slate-900 rounded-lg">
            {tools.map(code => (
                <button 
                    key={code}
                    onClick={() => siso.writeIcon(code)}
                    dangerouslySetInnerHTML={{ __html: siso.readIcon(code, { size: 22, color: '#38bdf8' }) }}
                    className="p-2 hover:bg-slate-800 rounded active:scale-95"
                />
            ))}
        </div>
    );
}
```

---

## 🚀 Fast Installation Manual (All Frameworks)

Install `danphe-icons-fonts` directly from GitHub across any stack without any NPM registry lock-in:

| Platform / Framework | Installation Method | Link / Guide |
|---|---|---|
| **🐬 Dolphin Language** | Native Git Submodule / Dolphin Include | [Dolphin Guide](#1-dolphin-language-native-c) • [Full Tutorial](TUTORIAL.md) |
| **⚛️ React / Next.js / Vue** | Direct Git Install | [Web Guide](#2-react--nextjs--vue) |
| **📱 Flutter / Dart** | Git Dependency | [Flutter Guide](#3-flutter--dart) |
| **🤖 Android (Kotlin / Native)** | Gradle Git / C++ CMake | [Android Guide](#4-android-native-kotlin) |
| **📟 Embedded C++ / LVGL / MCU** | Header-Only Include | [Embedded Guide](#5-embedded-c--lvgl--dot-matrix-esp32stm32) |
| **🌐 Vanilla HTML / JS** | Static / Titan-Bus Script | [Vanilla JS Guide](#6-vanilla-html--javascript) |

---

### 1. 🐬 Dolphin Language (Native C++)

In your Dolphin project directory, add this repository as a submodule or clone directly:

```bash
git submodule add https://github.com/Phuyalshankar/danphe-icons-fonts.git modules/danphe-icons-fonts
```

Import and use directly in `.dolphin` scripts:

```dolphin
import "@danphe-icons-fonts"

// Render SVG Icon by Opcode (0x00 - 0x22C) or Name
var wifiSvg = Icon.render(0x62, { size: 32, color: "#38bdf8" })

// Apply Nepali Devanagari or Matrix LCD Font CSS
var nepaliStyle = Font.css(32, ".headline")

println("Rendered Native Icon: " + wifiSvg)
```

---

### 2. ⚛️ React / Next.js / Vue

Install directly from Git via npm, yarn, or pnpm:

```bash
npm install github:Phuyalshankar/danphe-icons-fonts
```

Or with Yarn / Pnpm:

```bash
yarn add https://github.com/Phuyalshankar/danphe-icons-fonts.git
pnpm add github:Phuyalshankar/danphe-icons-fonts
```

---

### 3. 📱 Flutter / Dart

Add directly to your `pubspec.yaml` via Git dependency:

```yaml
dependencies:
  danphe_icons_fonts:
    git:
      url: https://github.com/Phuyalshankar/danphe-icons-fonts.git
      ref: main
```

---

### 4. 🤖 Android (Native Kotlin)

Add to your Android project's `settings.gradle.kts` and `app/build.gradle.kts` via Git Submodule:

```bash
git submodule add https://github.com/Phuyalshankar/danphe-icons-fonts.git app/src/main/cpp/danphe-icons-fonts
```

In your `CMakeLists.txt`:

```cmake
target_include_directories(native-lib PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/danphe-icons-fonts/cpp)
```

---

### 5. 📟 Embedded C++ / LVGL / Dot Matrix (ESP32/STM32)

Simply clone and include the header directly in your Arduino / ESP-IDF / STM32 / PlatformIO project:

```bash
git clone https://github.com/Phuyalshankar/danphe-icons-fonts.git
```

In your C++ file:

```cpp
#include "danphe-icons-fonts/cpp/danphe_icons_data.hpp"
#include "danphe-icons-fonts/cpp/danphe_fonts_data.hpp"

// Render SVG or coordinate stream in <0.001ms (Zero dependencies, ~40KB Flash footprint!)
std::string svg = DanpheIcons::renderSVG(0x10, 24, "#38bdf8");
std::string css = DanpheFonts::renderCSS(32, ".nepali-text");
```

---

### 6. 🌐 Vanilla HTML / JavaScript

```html
<script src="https://cdn.jsdelivr.net/gh/Phuyalshankar/danphe-icons-fonts@main/src/index.js"></script>
<script>
  const svg = siso.readIcon(280);
  document.getElementById('icon-box').innerHTML = svg;
</script>
```

---

## 🌟 Key Features

1. **🎨 557 Pure Vector SVG Icons (OpCode 0 to 556):**
   - Pure mathematical SVG paths with zero bloat.
   - NLE Fast Editing tools: Split (280), Trim Left (273), Trim Right (274), Undo (277), Redo (278), Delete (281), Duplicate (286).
   - Media Track Controls: Video (552), Audio (553), Text (554), Overlay (555), Layers (556).
   - 8 Animation Sub-Opcodes: Pulse, Spin, Bounce, Ring, Ripple, Wave, Flash, Neon Glow.

2. **🔤 256 Offline Fonts Suite (OpCode 0 to 255):**
   - 100% Offline-First (Zero external Google Font network dependencies).
   - Authentic Nepali Devanagari (Sagarmatha, Kalimati, Mangal, Mukti).
   - Hardware Displays: 7-Segment LED, 14-Segment HUD, 16x16 Matrix LCD, 5x7 Dot-Matrix, Nixie Tubes.
   - Cyberpunk, Luxury Serif, Swiss Sans & Terminal Monospace.

3. **⚡ Titan-Bus 2-Byte SISO Serial Register Highway:**
   - Standard Hardware Registers:
     - `0x4701` $\rightarrow$ **ASSET_ICON**
     - `0x4702` $\rightarrow$ **ASSET_FONT**
     - `0x4201` $\rightarrow$ **ACTIVE_TOOL**
     - `0x4407` $\rightarrow$ **ACTION_TRIGGER**
   - Streams pure SVG frames and CSS serially to any connected client or hardware screen in real-time.

4. **🚫 Zero Dependencies:**
   - 0 megabytes of external `node_modules`.
   - Pure vanilla JavaScript and standard C++17.

---

## 🛠️ Testing Local Interactive Studio

Run the built-in standalone test server:

```bash
node test_server.js
```

Open your browser at `http://localhost:8099` to interact with the full icons & typography workbench.

---

## 📜 License

MIT © [Shankar Phuyal](https://github.com/Phuyalshankar) & Danphe UI Team
