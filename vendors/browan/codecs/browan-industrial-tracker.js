//Browan version:1.0.1
function decodeUplink(input) {
  let decoded = {};
  switch (input.fPort) {
    case 136:
      decoded.MovingMode = ((input.bytes[0] - ((input.bytes[0] >> 4) * 16)) % 8) % 2;
      decoded.NoGNSSFix = (input.bytes[0] - ((input.bytes[0] >> 4) * 16)) >> 3;
      decoded.GNSSerror = (input.bytes[0] >> 4);
      decoded.battery_volt = (25 + (input.bytes[1] - ((input.bytes[1] >> 4) * 16))) / 10;
      decoded.temperature = input.bytes[2] - 32;
      let int_lat = (input.bytes[3] + input.bytes[4] * 256 + input.bytes[5] * 65536 + (input.bytes[6] - ((input.bytes[6] >> 4))) * 16777216);
      let int_lon = (input.bytes[7] + input.bytes[8] * 256 + input.bytes[9] * 65536 + (input.bytes[10] - (((input.bytes[10] >> 5) << 1) * 16)) * 16777216);
      let bit_lon = ((input.bytes[10] >> 4) % 2);
      decoded.accuracy = Math.pow(2, ((input.bytes[10] >> 5) + 2));
      decoded.latitude = twocomplement_Lat(int_lat, 27) / 1000000;
      decoded.longitude = twocomplement_Long(bit_lon, int_lon, 28) / 1000000;
      decoded.altitude = 2;
      // Decoded data
      return {data: decoded};
  }
}

function twocomplement_Lat(inputNum, comtimes) {
  let count02 = (Math.pow(2, comtimes + 1)) - 1;
  let final_Lat;
  if ((inputNum >> comtimes) == 0) {
    final_Lat = inputNum;
    return final_Lat;
  } else {
    final_Lat = -(inputNum ^ count02) - 1;
    return final_Lat;
  }
}

function twocomplement_Long(firstbit, inputNum, comtimes) {
  let count02 = (Math.pow(2, comtimes + 1)) - 1;
  let final_Long;
  if (firstbit == 0) {
    final_Long = inputNum;
    return final_Long;
  } else {
    final_Long = -(inputNum ^ count02) - 1;
    return final_Long;
  }
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
