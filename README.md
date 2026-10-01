# 🐬 Danphe Icons & Fonts 256

> **The Universal Ultra-Lightweight Vector & Typography Engine with Titan-Bus SISO Serial Streaming.**  
> Pure C++17 Generation • 100% Offline Nepali & Hardware Typography • Zero Node Bloat • Sub-Microsecond Rendering.

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

// Render SVG Icon by Opcode (0x00 - 0xFF) or Name
var wifiSvg = Icon.render(0x62, { size: 32, color: "#38bdf8" })

// Apply Nepali Devanagari or Matrix LCD Font CSS
var nepaliStyle = Font.css(32, ".headline")

println("Rendered Native Icon: " + wifiSvg)
```

👉 **For the complete step-by-step Dolphin guide, see [TUTORIAL.md](TUTORIAL.md).**

---

### 2. ⚛️ React / Next.js / Vue

Install directly from Git via npm, yarn, or pnpm (no NPM registry required):

```bash
npm install github:Phuyalshankar/danphe-icons-fonts
```

Or with Yarn / Pnpm:

```bash
yarn add https://github.com/Phuyalshankar/danphe-icons-fonts.git
pnpm add github:Phuyalshankar/danphe-icons-fonts
```

Usage in React / Next.js:

```jsx
import { DanpheAssetClient } from 'danphe-icons-fonts';

const assets = new DanpheAssetClient();
const iconSvg = assets.requestIcon(0x10); // Rocket Icon
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

Add to your Android project's `settings.gradle.kts` and `app/build.gradle.kts` via JitPack or Git Submodule:

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
  const client = new DanpheAssetClient();
  const icon = client.requestIcon(0);
</script>
```

---

## 🌟 Key Features

1. **🎨 256 Pure Vector SVG Icons (OpCode 0x00 to 0xFF):**
   - Pure C++17 header generation.
   - Ultra-compact: Entire 256 vector database is **under 45 KB**!
   - 8 Animation Sub-Opcodes: Pulse, Spin, Bounce, Ring, Ripple, Wave, Flash, Neon Glow.

2. **🔤 256 Offline Fonts Suite (OpCode 0x00 to 0xFF):**
   - 100% Offline-First (Zero external Google Font dependencies).
   - Authentic Nepali Devanagari (Sagarmatha, Kalimati, Mangal, Mukti).
   - Hardware Displays: 7-Segment LED, 14-Segment HUD, 16x16 Matrix LCD, 5x7 Dot-Matrix.
   - Cyberpunk, Luxury Serif, Swiss Sans & Terminal Monospace.

3. **⚡ Titan-Bus SISO Serial Streaming:**
   - Integrated with Titan-Bus 2-Byte Register Highway (`0x4701` / `0x4702`).
   - Streams pure SVG frames and CSS serially to any connected client or hardware screen in real-time.

4. **🚫 Zero Bloat:**
   - 0 megabytes of `node_modules`.
   - No Babel, no Webpack, no heavy runtime dependencies.

---

## 🛠️ Testing Local Interactive Studio

Run the built-in standalone test server (pure built-in Node `http`, 0 dependencies):

```bash
node test_server.js
```

Open your browser at `http://localhost:8099` to interact with:
- The 0-255 OpCode Scrubber Slider with 60 FPS vector animations.
- The Live Hardware Telemetry Lab (WiFi waves, battery charge, speedometer gauge, heartbeat ECG).
- The Complete 256 Icons & 256 Fonts Gallery Grids.

---

## 📜 License

MIT © [Shankar Phuyal](https://github.com/Phuyalshankar) & Danphe UI Team
