/*
  ELSYS payload decoder for ChirpStack v4.
  Based on the official Elsys payload decoder.
  www.elsys.se
  peter@elsys.se

  Adapted for chirpstack-device-profiles decodeUplink/encodeDownlink format.
*/

var TYPE_TEMP         = 0x01; // temp 2 bytes -3276.8°C to 3276.7°C
var TYPE_RH           = 0x02; // Humidity 1 byte 0-100%
var TYPE_ACC          = 0x03; // Acceleration 3 bytes X,Y,Z -128 to 127 +/-63=1G
var TYPE_LIGHT        = 0x04; // Light 2 bytes 0-65535 Lux
var TYPE_MOTION       = 0x05; // No of motion 1 byte 0-255
var TYPE_CO2          = 0x06; // CO2 2 bytes 0-65535 ppm
var TYPE_VDD          = 0x07; // Battery mV 2 bytes 0-65535
var TYPE_ANALOG1      = 0x08; // Analog input 1 2 bytes 0-65535 mV
var TYPE_GPS          = 0x09; // GPS 6 bytes lat(3),long(3)
var TYPE_PULSE1       = 0x0A; // Pulse input 1 relative 2 bytes
var TYPE_PULSE1_ABS   = 0x0B; // Pulse input 1 absolute 4 bytes
var TYPE_EXT_TEMP1    = 0x0C; // External temp 1 2 bytes -3276.8°C to 3276.7°C
var TYPE_EXT_DIGITAL  = 0x0D; // Digital input 1 byte
var TYPE_EXT_DISTANCE = 0x0E; // Distance sensor 2 bytes 0-65535 mm
var TYPE_ACC_MOTION   = 0x0F; // Acc motion 1 byte 0-255
var TYPE_IR_TEMP      = 0x10; // IR temperature 4 bytes internal(2),external(2)
var TYPE_OCCUPANCY    = 0x11; // Occupancy 1 byte
var TYPE_WATERLEAK    = 0x12; // Water leak 1 byte 0-255
var TYPE_GRIDEYE      = 0x13; // Grideye data 65 bytes
var TYPE_PRESSURE     = 0x14; // Pressure 4 bytes (hPa)
var TYPE_SOUND        = 0x15; // Sound 2 bytes (peak,avg)
var TYPE_PULSE2       = 0x16; // Pulse input 2 relative 2 bytes
var TYPE_PULSE2_ABS   = 0x17; // Pulse input 2 absolute 4 bytes
var TYPE_ANALOG2      = 0x18; // Analog input 2 2 bytes 0-65535 mV
var TYPE_EXT_TEMP2    = 0x19; // External temp 2 2 bytes -3276.8°C to 3276.7°C
var TYPE_EXT_DIGITAL2 = 0x1A; // Digital input 2 1 byte
var TYPE_EXT_ANALOG_UV= 0x1B; // Analog UV 4 bytes

function bin16dec(bin) {
    var num = bin & 0xFFFF;
    if (0x8000 & num)
        num = -(0x010000 - num);
    return num;
}

function bin8dec(bin) {
    var num = bin & 0xFF;
    if (0x80 & num)
        num = -(0x0100 - num);
    return num;
}

function DecodeElsysPayload(data) {
    var obj = {};
    for (var i = 0; i < data.length; i++) {
        switch (data[i]) {
            case TYPE_TEMP:
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.temperature = temp / 10;
                i += 2;
                break;
            case TYPE_RH:
                obj.humidity = data[i + 1];
                i += 1;
                break;
            case TYPE_ACC:
                obj.x = bin8dec(data[i + 1]);
                obj.y = bin8dec(data[i + 2]);
                obj.z = bin8dec(data[i + 3]);
                i += 3;
                break;
            case TYPE_LIGHT:
                obj.light = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_MOTION:
                obj.motion = data[i + 1];
                i += 1;
                break;
            case TYPE_CO2:
                obj.co2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_VDD:
                obj.vdd = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_ANALOG1:
                obj.analog1 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_GPS:
                obj.lat = (data[i + 1] << 16) | (data[i + 2] << 8) | (data[i + 3]);
                obj.long = (data[i + 4] << 16) | (data[i + 5] << 8) | (data[i + 6]);
                i += 6;
                break;
            case TYPE_PULSE1:
                obj.pulse1 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_PULSE1_ABS:
                obj.pulseAbs = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break;
            case TYPE_EXT_TEMP1:
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                obj.externalTemperature = temp / 10;
                i += 2;
                break;
            case TYPE_EXT_DIGITAL:
                obj.digital = data[i + 1];
                i += 1;
                break;
            case TYPE_EXT_DISTANCE:
                obj.distance = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_ACC_MOTION:
                obj.accMotion = data[i + 1];
                i += 1;
                break;
            case TYPE_IR_TEMP:
                var iTemp = (data[i + 1] << 8) | (data[i + 2]);
                iTemp = bin16dec(iTemp);
                var eTemp = (data[i + 3] << 8) | (data[i + 4]);
                eTemp = bin16dec(eTemp);
                obj.irInternalTemperature = iTemp / 10;
                obj.irExternalTemperature = eTemp / 10;
                i += 4;
                break;
            case TYPE_OCCUPANCY:
                obj.occupancy = data[i + 1];
                i += 1;
                break;
            case TYPE_WATERLEAK:
                obj.waterleak = data[i + 1];
                i += 1;
                break;
            case TYPE_GRIDEYE:
                var ref = data[i + 1];
                i++;
                obj.grideye = [];
                for (var j = 0; j < 64; j++) {
                    obj.grideye[j] = ref + (data[1 + i + j] / 10.0);
                }
                i += 64;
                break;
            case TYPE_PRESSURE:
                var press = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                obj.pressure = press / 1000;
                i += 4;
                break;
            case TYPE_SOUND:
                obj.soundPeak = data[i + 1];
                obj.soundAvg = data[i + 2];
                i += 2;
                break;
            case TYPE_PULSE2:
                obj.pulse2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_PULSE2_ABS:
                obj.pulseAbs2 = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break;
            case TYPE_ANALOG2:
                obj.analog2 = (data[i + 1] << 8) | (data[i + 2]);
                i += 2;
                break;
            case TYPE_EXT_TEMP2:
                var temp = (data[i + 1] << 8) | (data[i + 2]);
                temp = bin16dec(temp);
                if (typeof obj.externalTemperature2 === "number") {
                    obj.externalTemperature2 = [obj.externalTemperature2];
                }
                if (typeof obj.externalTemperature2 === "object") {
                    obj.externalTemperature2.push(temp / 10);
                } else {
                    obj.externalTemperature2 = temp / 10;
                }
                i += 2;
                break;
            case TYPE_EXT_DIGITAL2:
                obj.digital2 = data[i + 1];
                i += 1;
                break;
            case TYPE_EXT_ANALOG_UV:
                obj.analogUv = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | (data[i + 4]);
                i += 4;
                break;
            default:
                i = data.length;
                break;
        }
    }
    return obj;
}

// ChirpStack v4 / LoRa Alliance TS013 codec API
function decodeUplink(input) {
    return {
        data: DecodeElsysPayload(input.bytes),
    };
}

function encodeDownlink(input) {
    return {
        bytes: [],
    };
}
