/**
 * Decode uplink function
 * 
 * @param {object} input
 * @param {number[]} input.bytes Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
 * @param {number} input.fPort Uplink fPort.
 * @param {Record<string, string>} input.variables Object containing the configured device variables.
 * 
 * @returns {{data: object}} Object representing the decoded payload.
 */
function decodeUplink(input) {
    var port  = input.fPort;
    var bytes = input.bytes;
    var len   = bytes.length;
    var app   = bytes[0];
    var data  = {};
    if (port == 1 && (app == 0x45 || app == 0x50)) {
        function setAlarms(off) {
            var bits = bytes[off];
            data.alarm = {
              waterLeak: (bits&0x01)!=0,
              wrongInstallation: (bits&0x02)!=0,
              overflow: (bits&0x04)!=0,
              burst: (bits&0x08)!=0,
              reverseFlow: (bits&0x10)!=0,
              lowBattery: (bits&0x20)!=0,
            };
            data.diameter = bits&0x40 >> 6;
            data.medium = bits&0x80 >> 7;
        }
        function temperature(off) {
            if (len > off) {
                var t = ((bytes[off]<<8) + (bytes[off+1]));
                if (t >= 32768)
                    t -= 65536;
                data.temperature = t/10;
            }
        }
        if (len < 46) {
            data.value = (bytes[4]&0xF0 << 24) + (bytes[3] << 16) + (bytes[2] << 8) + bytes[1];
            data.reverseFlow = (bytes[4]&0x0F << 24) + (bytes[7] << 16) + (bytes[6] << 8) + bytes[5];
            setAlarms(8);
            temperature(9);
        }
        else {
            function toInt(off) {
                return (bytes[off  ]      ) |
                       (bytes[off+1] << 8 ) |
                       (bytes[off+2] << 16) |
                       (bytes[off+3] << 24);
            }
            function toDate(off) {
                return new Date(toInt(off)*1000 + new Date(2000, 0, 1).getTime());
            }
            data.value = toInt(1);
            data.date = toDate(5).toISOString();
            setAlarms(45);
            temperature(46);
            var value = toInt(9);
            var date = toDate(13);
            data.log = [{
                value: value,
                date: date.toISOString()
            }];
            for (var off = 17, i = 0; i < 14; off += 2) {
                var delta = bytes[off] | (bytes[off+1]<<8);
                if (delta >= 32768)
                    delta -= 65536;
                value -= delta;
                date = new Date(date.getTime()-3600000);
                data.log[++i] = { value: value, date: date.toISOString(), delta: delta };
            }
        }
    }
    return {
        data: data
    };
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
