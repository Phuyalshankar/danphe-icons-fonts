#pragma once
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚡ TITAN COMPONENT BRIDGE — PURE C++ TITAN-BUS DISPATCHER & SISO ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 * Dispatches pure C++ Adaptive Components directly into Titan-Bus 24-byte packets.
 * 0ms latency. Zero heap allocation. Sub-100 lines.
 */

#include "danphe_adaptive_components.hpp"
#include <functional>
#include <iostream>

namespace DanpheAdaptive {

using TitanPacketCallback = std::function<void(const uint8_t packet[24])>;

class TitanComponentBridge {
public:
    /**
     * 🚀 Dispatch Adaptive Button directly to Titan-Bus (24-byte packet)
     */
    static void dispatchButton(const ButtonDef& btn, TitanPacketCallback onPacket) {
        uint8_t packet[24];
        btn.toTitanBinary(packet);
        if (onPacket) {
            onPacket(packet);
        }
    }

    /**
     * 🚀 Dispatch Adaptive Card directly to Titan-Bus (24-byte packet)
     */
    static void dispatchCard(const CardDef& card, TitanPacketCallback onPacket) {
        uint8_t packet[24];
        card.toTitanBinary(packet);
        if (onPacket) {
            onPacket(packet);
        }
    }

    /**
     * 📡 Format 24-Byte Titan Packet to Hex String for Telemetry & Debug
     */
    static std::string toHexStream(const uint8_t packet[24]) {
        static const char hexChars[] = "0123456789ABCDEF";
        std::string hex;
        hex.reserve(24 * 3);
        for (int i = 0; i < 24; ++i) {
            hex.push_back(hexChars[(packet[i] >> 4) & 0x0F]);
            hex.push_back(hexChars[packet[i] & 0x0F]);
            if (i < 23) hex.push_back(' ');
        }
        return hex;
    }
};

} // namespace DanpheAdaptive
