function decodeUplink(input) {
  return {
    data: Decoder(input.fPort, input.bytes)
  };
}

function Decoder(port, bytes)
{
 // Decode an uplink message from a buffer
 // (array) of bytes to an object of fields.
 let decoded = {};
 if (bytes === null)
 return null;

 if (port === 1)
 {
 if ((bytes.length != 17) && (bytes.length < 19))
   return null;

 decoded._type = "full data";

 switch (bytes[0] & 0x3)
 {
   case 0: decoded.tripType = "None"; break;
   case 1: decoded.tripType = "Ignition"; break;
   case 2: decoded.tripType = "Movement"; break;
   case 3: decoded.tripType = "Run Detect"; break;
 }

 decoded.latitudeDeg = (bytes[0] & 0xF0) + bytes[1] * 256 +
 bytes[2] * 65536 + bytes[3] * 16777216;
 if (decoded.latitudeDeg >= 0x80000000) // 2^31
 decoded.latitudeDeg -= 0x100000000; // 2^32
 decoded.latitudeDeg /= 1e7;

 decoded.longitudeDeg = (bytes[4] & 0xF0) + bytes[5] * 256 +
 bytes[6] * 65536 + bytes[7] * 16777216;
 if (decoded.longitudeDeg >= 0x80000000) // 2^31
 decoded.longitudeDeg -= 0x100000000; // 2^32
 decoded.longitudeDeg /= 1e7;

 decoded.vExtGood = ((bytes[0] & 0x4) !== 0) ? true : false;
 decoded.gpsCurrent = ((bytes[0] & 0x8) !== 0) ? true : false;

 decoded.ignition = ((bytes[4] & 0x1) !== 0) ? true : false;
 decoded.digIn1 = ((bytes[4] & 0x2) !== 0) ? true : false;
 decoded.digIn2 = ((bytes[4] & 0x4) !== 0) ? true : false;
 decoded.digOut = ((bytes[4] & 0x8) !== 0) ? true : false;
 decoded.headingDeg = bytes[8] * 2;
 decoded.speedKmph = bytes[9];
 decoded.batV = bytes[10] * 0.02;

 decoded.vExt = 0.001 * (bytes[11] + bytes[12] * 256);
 decoded.vAin = 0.001 * (bytes[13] + bytes[14] * 256);

 decoded.tempC = bytes[15];
 if (decoded.tempC >= 0x80) // 2^7
 decoded.tempC -= 0x100; // 2^8
 decoded.gpsAccM = bytes[16];

 if (bytes.length < 19)
 {
 decoded.timestamp = null;
 decoded.time = null;
 }
 else
 {
 decoded.timestamp = bytes[17] + bytes[18] * 256;
 decoded.time = ResolveTime(decoded.timestamp, new Date())
 if (decoded.time != null)
 decoded.time = decoded.time.toISOString();
 }

 // Clean up the floats for display
 decoded.latitudeDeg = parseFloat(decoded.latitudeDeg.toFixed(7));
 decoded.longitudeDeg = parseFloat(decoded.longitudeDeg.toFixed(7));
 decoded.batV = parseFloat(decoded.batV.toFixed(3));
 decoded.vExt = parseFloat(decoded.vExt.toFixed(3));
 decoded.vAin = parseFloat(decoded.vAin.toFixed(3));
 }
 else if (port === 2)
 {
 if (bytes.length != 11)
 return null;

 decoded._type = "data part 1";

 switch (bytes[0] & 0x3)
 {
   case 0: decoded.tripType = "None"; break;
   case 1: decoded.tripType = "Ignition"; break;
   case 2: decoded.tripType = "Movement"; break;
   case 3: decoded.tripType = "Run Detect"; break;
 }

 decoded.latitudeDeg = (bytes[0] & 0xF0) + bytes[1] * 256 +
 bytes[2] * 65536 + bytes[3] * 16777216;
 if (decoded.latitudeDeg >= 0x80000000) // 2^31

 decoded.latitudeDeg -= 0x100000000; // 2^32
 decoded.latitudeDeg /= 1e7;

 decoded.longitudeDeg = (bytes[4] & 0xF0) + bytes[5] * 256 +
 bytes[6] * 65536 + bytes[7] * 16777216;
 if (decoded.longitudeDeg >= 0x80000000) // 2^31
 decoded.longitudeDeg -= 0x100000000; // 2^32
 decoded.longitudeDeg /= 1e7;

 decoded.vExtGood = ((bytes[0] & 0x4) !== 0) ? true : false;
 decoded.gpsCurrent = ((bytes[0] & 0x8) !== 0) ? true : false;

 decoded.ignition = ((bytes[4] & 0x1) !== 0) ? true : false;
 decoded.digIn1 = ((bytes[4] & 0x2) !== 0) ? true : false;
 decoded.digIn2 = ((bytes[4] & 0x4) !== 0) ? true : false;
 decoded.digOut = ((bytes[4] & 0x8) !== 0) ? true : false;
 decoded.headingDeg = bytes[8] * 2;
 decoded.speedKmph = bytes[9];
 decoded.batV = bytes[10] * 0.02;

 // Clean up the floats for display
 decoded.latitudeDeg = parseFloat(decoded.latitudeDeg.toFixed(7));
 decoded.longitudeDeg = parseFloat(decoded.longitudeDeg.toFixed(7));
 decoded.batV = parseFloat(decoded.batV.toFixed(3));
 }
 else if (port === 3)
 {
 if ((bytes.length != 6) && (bytes.length < 8)) return null;

 decoded._type = "data part 2";
 decoded.vExt = 0.001 * (bytes[0] + bytes[1] * 256);
 decoded.vAin = 0.001 * (bytes[2] + bytes[3] * 256);

 decoded.tempC = bytes[4];
 if (decoded.tempC >= 0x80) // 2^7
 decoded.tempC -= 0x100; // 2^8
 decoded.gpsAccM = bytes[5];

 if (bytes.length < 8)
 {
 decoded.timestamp = null;
 decoded.time = null;
 }
 else
 {
 decoded.timestamp = bytes[6] + bytes[7] * 256;
 decoded.time = ResolveTime(decoded.timestamp, new Date())
 if (decoded.time != null)
 decoded.time = decoded.time.toISOString();
 }

 // Clean up the floats for display
 decoded.vExt = parseFloat(decoded.vExt.toFixed(3));
 decoded.vAin = parseFloat(decoded.vAin.toFixed(3));
 }
 else if (port === 4)
 {
 if (bytes.length != 8)
 return null;

 decoded._type = "odometer";
 let runtimeS = bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
 decoded.runtime = Math.floor(runtimeS / 86400) + "d" +
 Math.floor(runtimeS % 86400 / 3600) + "h" +
 Math.floor(runtimeS % 3600 / 60) + "m" + (runtimeS % 60) + "s";
 decoded.distanceKm = 0.01 * (bytes[4] + bytes[5] * 256 +
 bytes[6] * 65536 + bytes[7] * 16777216);

  // Clean up the floats for display
 decoded.distanceKm = parseFloat(decoded.distanceKm.toFixed(2));
 }
 else if (port === 5)
 {
 if (bytes.length != 3)
 return null;

 decoded._type = "downlink ack";

 decoded.sequence = (bytes[0] & 0x7F);
 decoded.accepted = ((bytes[0] & 0x80) !== 0) ? true : false;
 decoded.fwMaj = bytes[1];
 decoded.fwMin = bytes[2];
 }
 return decoded;
}

function ResolveTime(timestamp, approxReceptionTime)
{
 if (timestamp === 65535) return null;

 let approxUnixTime = Math.round(approxReceptionTime.getTime() / 1000);

 // Device supplies a unix time, modulo 65535.
 // We're assuming that the packet arrived some time BEFORE refTime,
 // and got delayed by network lag. So we'll resolve the timestamp to
 // somewhere in the 18 hours before the reception time, rather than
 // symetrically in a +- 9 hour window.
 // Wind the reception time forward a bit, to tolerate clock errors.
 let refTime = approxUnixTime + 1800;

 // refTime
 // v
 // [ | | | ]
 // ^ ^ ^ ^
 // timestamp timestamp timestamp timestamp
 // refTime
 // v
 // [ | | | ]
 // ^ ^ ^ ^
 // timestamp timestamp timestamp timestamp
 // We want the timestamp option immediately to the left of refTime.
 let refTimeMultiple = Math.floor(refTime / 65535);
 let refTimeModulo = refTime % 65535;
 let closestUnixTime = 0;
 if (refTimeModulo > timestamp)
 closestUnixTime = refTimeMultiple * 65535 + timestamp;
 else
 closestUnixTime = (refTimeMultiple - 1) * 65535 + timestamp;

 return new Date(closestUnixTime * 1000);
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
