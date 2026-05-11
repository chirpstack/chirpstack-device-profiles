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
    else if (fPort === 204 && len === 16) {
        const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        const mot_keepalive = parseInt(hex.slice(2, 6).match(/../g).reverse().join(''), 16);
        const mot_occupied = parseInt(hex.slice(8, 12).match(/../g).reverse().join(''), 16);
        const mot_free = bytes[7];
        const mot_trigct = parseInt(hex.slice(18, 22).match(/../g).reverse().join(''), 16);
        const mot_parmter = hex.slice(24, 32).match(/../g).reverse().join('');
        return { data: { fPort, len, mot_keepalive, mot_occupied, mot_free, mot_trigct, mot_parmter } };
    }
    else if (fPort === 102 && len === 8) {
        const battery_volt = (25 + (bytes[1] & 0x0F)) / 10;
        const temperature = (bytes[2] & 0x7F) - 32;
        const motion_st = bytes[0] & 0x01;
        const mot_timehex = bytes[4].toString(16).padStart(2, '0') + bytes[3].toString(16).padStart(2, '0');
        const mot_times = parseInt(mot_timehex, 16);
        const mot_counthex = bytes[6].toString(16).padStart(2, '0') + bytes[5].toString(16).padStart(2, '0');
        const mot_counts = parseInt(mot_counthex, 16);
        return { data: { fPort, battery_volt, temperature, mot_motionst: motion_st, mot_times, mot_counts } };
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
