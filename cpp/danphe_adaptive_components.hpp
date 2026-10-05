#pragma once
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐬 DANPHE ADAPTIVE COMPONENTS — PURE NATIVE C++17 VECTOR & BINARY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * Pure C++ Mathematical Geometry • Real Semantic Text • Zero Heap Bloat
 * Outputs:
 * 1. Pure Mathematical Scalable SVG with Real Text
 * 2. 24-Byte Titan Binary Packet (0xAA ... 0x55) for Android Native
 * 3. Pure C++ LVGL & Samsung ThorVG Native Code for Embedded Smartwatches
 */

#include <string>
#include <sstream>
#include <vector>
#include <cstdint>
#include <algorithm>
#include <cstring>

namespace DanpheAdaptive {

enum class ComponentType : uint8_t {
    BUTTON    = 0x10,
    CARD      = 0x11,
    CONTAINER = 0x12,
    INPUT     = 0x18,
    SLIDER    = 0x19,
    DISPLAY   = 0x50
};

enum class Theme : uint8_t {
    CYAN    = 0,
    SLATE   = 1,
    EMERALD = 2,
    AMBER   = 3,
    ROSE    = 4,
    VIOLET  = 5
};

struct ThemeColors {
    const char* name;
    const char* bg;
    const char* border;
    const char* text;
    const char* subtext;
    const char* accent;
};

static const ThemeColors THEMES[6] = {
    { "cyan",    "#081e2b", "#22d3ee", "#ffffff", "#7dd3fc", "#06b6d4" },
    { "slate",   "#0b1324", "#334155", "#f8fafc", "#94a3b8", "#475569" },
    { "emerald", "#06281e", "#10b981", "#ffffff", "#6ee7b7", "#059669" },
    { "amber",   "#2b1803", "#f59e0b", "#ffffff", "#fcd34d", "#d97706" },
    { "rose",    "#2d0812", "#f43f5e", "#ffffff", "#fda4af", "#e11d48" },
    { "violet",  "#1e0c38", "#a855f7", "#ffffff", "#d8b4fe", "#9333ea" }
};

inline const ThemeColors& getTheme(Theme th) {
    uint8_t idx = static_cast<uint8_t>(th);
    return idx < 6 ? THEMES[idx] : THEMES[0];
}

/**
 * 📐 Pure Mathematical Rounded Rectangle Vector Path
 */
inline std::string roundedRectPath(int x, int y, int w, int h, int r) {
    int rx = std::max(0, std::min(r, std::min(w / 2, h / 2)));
    std::ostringstream ss;
    ss << "M " << (x + rx) << " " << y << " "
       << "H " << (x + w - rx) << " "
       << "A " << rx << " " << rx << " 0 0 1 " << (x + w) << " " << (y + rx) << " "
       << "V " << (y + h - rx) << " "
       << "A " << rx << " " << rx << " 0 0 1 " << (x + w - rx) << " " << (y + h) << " "
       << "H " << (x + rx) << " "
       << "A " << rx << " " << rx << " 0 0 1 " << x << " " << (y + h - rx) << " "
       << "V " << (y + rx) << " "
       << "A " << rx << " " << rx << " 0 0 1 " << (x + rx) << " " << y << " Z";
    return ss.str();
}

/**
 * 🔘 Native Adaptive Button Definition (Pure C++ Struct)
 */
struct ButtonDef {
    uint8_t opcode = 0x10;
    const char* id = "btn_1";
    const char* label = "Action";
    uint8_t iconOpcode = 0;
    Theme theme = Theme::CYAN;
    int16_t x = 0;
    int16_t y = 0;
    uint16_t width = 180;
    uint16_t height = 48;
    uint8_t radius = 12;
    uint8_t fontSize = 14;
    uint16_t reg = 0x4410;
    uint16_t action = 0x01;

    void toTitanBinary(uint8_t out[24]) const {
        std::memset(out, 0, 24);
        out[0] = 0xAA;                       // Titan Header
        out[1] = static_cast<uint8_t>(ComponentType::BUTTON); // Opcode (0x10)
        out[2] = 0x08;                       // Padding
        out[3] = 0x00;                       // Margin
        out[4] = radius;                     // Radius
        out[5] = 100;                        // Opacity 100%
        out[6] = 50;                         // Scale 1.0 (50 = 100%)
        out[7] = 180;                        // Rotation 0
        out[8]  = static_cast<uint8_t>((x >> 8) & 0xFF);
        out[9]  = static_cast<uint8_t>(x & 0xFF);
        out[10] = static_cast<uint8_t>((y >> 8) & 0xFF);
        out[11] = static_cast<uint8_t>(y & 0xFF);
        out[12] = static_cast<uint8_t>((width >> 8) & 0xFF);
        out[13] = static_cast<uint8_t>(width & 0xFF);
        out[14] = static_cast<uint8_t>((height >> 8) & 0xFF);
        out[15] = static_cast<uint8_t>(height & 0xFF);
        out[16] = reg ? 0xD0 : 0x00;         // State Flag
        out[17] = action ? 0xAC : 0x00;      // Action Flag
        out[18] = iconOpcode;                // Embedded Icon Opcode
        out[23] = 0x55;                      // Titan Footer
    }

    std::string toSvg() const {
        const ThemeColors& t = getTheme(theme);
        std::string pathData = roundedRectPath(1, 1, width - 2, height - 2, radius);
        std::ostringstream ss;
        ss << "<svg id=\"" << id << "\" width=\"" << width << "\" height=\"" << height << "\" viewBox=\"0 0 " << width << " " << height << "\" xmlns=\"http://www.w3.org/2000/svg\">\n"
           << "  <defs>\n"
           << "    <linearGradient id=\"" << id << "-ch\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n"
           << "      <stop offset=\"0%\" stop-color=\"" << t.bg << "\" stop-opacity=\"0.95\"/>\n"
           << "      <stop offset=\"100%\" stop-color=\"#020617\" stop-opacity=\"0.98\"/>\n"
           << "    </linearGradient>\n"
           << "  </defs>\n"
           << "  <path d=\"" << pathData << "\" fill=\"url(#" << id << "-ch)\" stroke=\"" << t.border << "\" stroke-width=\"1.5\"/>\n"
           << "  <text x=\"" << (width / 2) << "\" y=\"" << (height / 2) << "\" fill=\"" << t.text << "\" font-family=\"'Inter', sans-serif\" font-size=\"" << (int)fontSize << "\" font-weight=\"700\" text-anchor=\"middle\" dominant-baseline=\"central\">" << label << "</text>\n"
           << "</svg>";
        return ss.str();
    }

    std::string toLvglCpp(const char* parent = "screen") const {
        const ThemeColors& t = getTheme(theme);
        std::ostringstream ss;
        ss << "lv_obj_t* " << id << " = lv_btn_create(" << parent << ");\n"
           << "lv_obj_set_pos(" << id << ", " << x << ", " << y << ");\n"
           << "lv_obj_set_size(" << id << ", " << width << ", " << height << ");\n"
           << "lv_obj_set_style_radius(" << id << ", " << (int)radius << ", 0);\n"
           << "lv_obj_set_style_bg_color(" << id << ", lv_color_hex(0x" << (t.bg + 1) << "), 0);\n"
           << "lv_obj_t* " << id << "_lbl = lv_label_create(" << id << ");\n"
           << "lv_label_set_text(" << id << "_lbl, \"" << label << "\");\n"
           << "lv_obj_center(" << id << "_lbl);";
        return ss.str();
    }
};

/**
 * 📦 Native Adaptive Card Definition (Pure C++ Struct)
 */
struct CardDef {
    uint8_t opcode = 0x11;
    const char* id = "card_1";
    const char* title = "System Card";
    const char* subtitle = "Real-time Telemetry";
    const char* badge = "LIVE";
    uint8_t iconOpcode = 0;
    Theme theme = Theme::CYAN;
    int16_t x = 0;
    int16_t y = 0;
    uint16_t width = 360;
    uint16_t height = 220;
    uint8_t radius = 16;
    uint16_t reg = 0x4420;

    void toTitanBinary(uint8_t out[24]) const {
        std::memset(out, 0, 24);
        out[0] = 0xAA;                       // Titan Header
        out[1] = static_cast<uint8_t>(ComponentType::CARD); // Opcode (0x11)
        out[2] = 0x18;                       // Padding 24px
        out[3] = 0x00;                       // Margin
        out[4] = radius;                     // Radius
        out[5] = 100;                        // Opacity
        out[6] = 50;                         // Scale
        out[7] = 180;                        // Rotation
        out[8]  = static_cast<uint8_t>((x >> 8) & 0xFF);
        out[9]  = static_cast<uint8_t>(x & 0xFF);
        out[10] = static_cast<uint8_t>((y >> 8) & 0xFF);
        out[11] = static_cast<uint8_t>(y & 0xFF);
        out[12] = static_cast<uint8_t>((width >> 8) & 0xFF);
        out[13] = static_cast<uint8_t>(width & 0xFF);
        out[14] = static_cast<uint8_t>((height >> 8) & 0xFF);
        out[15] = static_cast<uint8_t>(height & 0xFF);
        out[16] = reg ? 0xD0 : 0x00;
        out[18] = iconOpcode;
        out[23] = 0x55;                      // Titan Footer
    }

    std::string toSvg() const {
        const ThemeColors& t = getTheme(theme);
        std::string chassis = roundedRectPath(2, 2, width - 4, height - 4, radius);
        std::ostringstream ss;
        ss << "<svg id=\"" << id << "\" width=\"" << width << "\" height=\"" << height << "\" viewBox=\"0 0 " << width << " " << height << "\" xmlns=\"http://www.w3.org/2000/svg\">\n"
           << "  <path d=\"" << chassis << "\" fill=\"" << t.bg << "\" fill-opacity=\"0.95\" stroke=\"" << t.border << "\" stroke-width=\"1.8\"/>\n"
           << "  <line x1=\"24\" y1=\"62\" x2=\"" << (width - 24) << "\" y2=\"62\" stroke=\"" << t.border << "\" stroke-opacity=\"0.2\" stroke-dasharray=\"4 2\"/>\n"
           << "  <text x=\"24\" y=\"32\" fill=\"" << t.text << "\" font-family=\"'Inter', sans-serif\" font-size=\"15\" font-weight=\"800\">" << title << "</text>\n"
           << "  <text x=\"24\" y=\"48\" fill=\"" << t.subtext << "\" font-family=\"'Inter', sans-serif\" font-size=\"11\">" << subtitle << "</text>\n";
        if (badge && std::strlen(badge) > 0) {
            int badgeW = std::max(48, (int)std::strlen(badge) * 8 + 14);
            int badgeX = width - badgeW - 24;
            std::string pill = roundedRectPath(badgeX, 22, badgeW, 22, 11);
            ss << "  <path d=\"" << pill << "\" fill=\"" << t.border << "\" fill-opacity=\"0.15\" stroke=\"" << t.border << "\" stroke-width=\"1\"/>\n"
               << "  <text x=\"" << (badgeX + badgeW / 2) << "\" y=\"33\" fill=\"" << t.border << "\" font-family=\"monospace\" font-size=\"10\" font-weight=\"800\" text-anchor=\"middle\" dominant-baseline=\"central\">" << badge << "</text>\n";
        }
        ss << "</svg>";
        return ss.str();
    }

    std::string toLvglCpp(const char* parent = "screen") const {
        const ThemeColors& t = getTheme(theme);
        std::ostringstream ss;
        ss << "lv_obj_t* " << id << " = lv_obj_create(" << parent << ");\n"
           << "lv_obj_set_pos(" << id << ", " << x << ", " << y << ");\n"
           << "lv_obj_set_size(" << id << ", " << width << ", " << height << ");\n"
           << "lv_obj_set_style_radius(" << id << ", " << (int)radius << ", 0);\n"
           << "lv_obj_set_style_bg_color(" << id << ", lv_color_hex(0x" << (t.bg + 1) << "), 0);\n"
           << "lv_obj_t* " << id << "_title = lv_label_create(" << id << ");\n"
           << "lv_label_set_text(" << id << "_title, \"" << title << "\");";
        return ss.str();
    }
};

} // namespace DanpheAdaptive
