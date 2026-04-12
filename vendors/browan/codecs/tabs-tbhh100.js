function decodeUplink(input) {
    const bytes = input.bytes;
    const fPort = input.fPort;
    const len = bytes.length;

    if (fPort === 222 && len === 17) {
        const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        const bootloader = hex.slice(2, 10).match(/../g).reverse().join('');
        const HW_ID = hex.slice(10, 18).match(/../g).reverse().join('');
        const FW_CRC = hex.slice(18, 26).match(/../g).reverse().join('');
        return { data: { fPort, bootloader, HW_ID, FW_CRC } };
    }
    else if (fPort === 204 && len === 12) {
        const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        const thh_keepalive = parseInt(hex.slice(2, 6).match(/../g).reverse().join(''), 16);
        const thh_Monitor = parseInt(hex.slice(8, 12).match(/../g).reverse().join(''), 16);
        const thh_temptrig = bytes[7];
        const thh_rhtrig = bytes[9];
        return { data: { fPort, len, thh_keepalive, thh_Monitor, thh_temptrig, thh_rhtrig } };
    }
    else if (fPort === 103 && len === 8) {
        const battery_volt = (25 + (bytes[1] & 0x0F)) / 10;
        const temperature = (bytes[2] & 0x7F) - 32;
        const humidity = bytes[3] & 0x3F;
        const thh_type = (bytes[0] >> 4) & 0x01;
        return { data: { fPort, battery_volt, temperature, humidity, thh_type, CO2: 0, VOC: 0 } };
    }
    return { data: { fPort, payloadlength: len, message: 'Invalid fPort or payload length' } };
}   

/**
 * Encode downlink function.
 * 
 * @param {object} input
 * @param {object} input.data Object representing the payload that must be encoded.
 * @param {Record<string, string>} input.variables Object containing the configured device variables.
 * 
 * @returns {{bytes: number[]}} Byte array containing the downlink payload.
 */
function encodeDownlink(input) {
  return {
    // bytes: [225, 230, 255, 0]
  };
}
