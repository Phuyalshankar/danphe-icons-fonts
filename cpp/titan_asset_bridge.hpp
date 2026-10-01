#pragma once
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🏔️ TITAN ASSET BRIDGE — SERIALLY DISTRIBUTED VECTOR & FONT STREAM
 * ═══════════════════════════════════════════════════════════════════════════
 * Connects Danphe Icons (256) & Fonts (256) to Titan-Bus SISO Binary Protocol.
 * Emits standardized 24-byte Titan frames for zero-dependency universal frameworks.
 */

#include "danphe_icons_data.hpp"
#include "danphe_fonts_data.hpp"
#include <vector>
#include <cstring>

namespace TitanAssetBridge {

// Titan Protocol Constants
static const uint16_t TITAN_SIGNATURE = 0x5442; // 'TB'
static const uint8_t  TITAN_VERSION   = 0x02;
static const uint8_t  CMD_ICON_STREAM = 0x22;   // DISPLAY / VECTOR WRITE
static const uint8_t  CMD_FONT_STREAM = 0x23;   // FONT TYPOGRAPHY WRITE

/**
 * Builds a 24-byte Titan Binary Packet with Icon SVG payload.
 * Can be sent over TCP, WebSocket, IPC, or Serial UART.
 */
inline std::vector<uint8_t> serializeIcon(uint8_t opcode, int size = 24, const std::string& color = "currentColor") {
    std::string svg = DanpheIcons::renderSVG(opcode, size, color);
    uint32_t payloadLen = static_cast<uint32_t>(svg.length());
    
    std::vector<uint8_t> packet(24 + payloadLen);
    
    // 24-Byte Titan Header (Big-Endian)
    packet[0] = (TITAN_SIGNATURE >> 8) & 0xFF;
    packet[1] = TITAN_SIGNATURE & 0xFF;
    packet[2] = TITAN_VERSION;
    packet[3] = CMD_ICON_STREAM;
    packet[4] = 0x00; // flags
    packet[5] = opcode; // target opcode
    packet[6] = 0x00; packet[7] = 0x00; // routing
    
    // Target Node ID (4 bytes)
    packet[8] = 0; packet[9] = 0; packet[10] = 0; packet[11] = 1;
    
    // Payload Length (4 bytes)
    packet[12] = (payloadLen >> 24) & 0xFF;
    packet[13] = (payloadLen >> 16) & 0xFF;
    packet[14] = (payloadLen >> 8)  & 0xFF;
    packet[15] = payloadLen & 0xFF;
    
    // Sequence No (4 bytes) & Session ID (2 bytes) + Reserved (2 bytes)
    for (int i = 16; i < 24; ++i) packet[i] = 0;
    
    // Copy Payload
    std::memcpy(&packet[24], svg.data(), payloadLen);
    return packet;
}

/**
 * Builds a 24-byte Titan Binary Packet with Font CSS payload.
 */
inline std::vector<uint8_t> serializeFont(uint8_t opcode, const std::string& selector = "") {
    std::string css = DanpheFonts::renderCSS(opcode, selector);
    uint32_t payloadLen = static_cast<uint32_t>(css.length());
    
    std::vector<uint8_t> packet(24 + payloadLen);
    packet[0] = (TITAN_SIGNATURE >> 8) & 0xFF;
    packet[1] = TITAN_SIGNATURE & 0xFF;
    packet[2] = TITAN_VERSION;
    packet[3] = CMD_FONT_STREAM;
    packet[4] = 0x00;
    packet[5] = opcode;
    for (int i = 6; i < 12; ++i) packet[i] = 0;
    
    packet[12] = (payloadLen >> 24) & 0xFF;
    packet[13] = (payloadLen >> 16) & 0xFF;
    packet[14] = (payloadLen >> 8)  & 0xFF;
    packet[15] = payloadLen & 0xFF;
    for (int i = 16; i < 24; ++i) packet[i] = 0;
    
    std::memcpy(&packet[24], css.data(), payloadLen);
    return packet;
}

} // namespace TitanAssetBridge
