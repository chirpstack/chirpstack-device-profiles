/**
 * @typedef {Object} DecodedUplink
 * @property {VoltDropDirectData} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} The decoded object
 */
function decodeUplink(input) {
  const packetList = {
    VD_DIRECT_CONSOLIDATED_VOLTAGE_AMPERAGE: 38,
    VD_DIRECT_VOLTAGE_ANGLE: 39,
    VD_DIRECT_VOLTAGE_PF: 40,
    VD_DIRECT_AMPERAGE: 41,
    VD_DIRECT_ACT_ENERGY_CONF: 42,
    VD_DIRECT_ACT_ENERGY_UNCONF: 43,
    VD_DIRECT_APP_ENERGY_CONF: 44,
    VD_DIRECT_APP_ENERGY_UNCONF: 45,
    VD_DIRECT_STARTUP_DIAG: 46,
    VD_DIRECT_OPERATIONAL_DIAG: 47,
  };

  // Constant factors for formulas
  const phaseAngleFactor = 360.0 / 255.0;
  const capacitorVoltageFactor = 5.0 / 255.0;
  const temperatureCelsiusFactor = 120.0 / 255.0;

  let result = {
    data: {},
    errors: [],
    warnings: [],
  };

  const raw = Buffer.from(input.bytes);
  let expectedLength = 0;

  // Packet must minimally contain an ID byte
  if (raw.byteLength != 0) {
    const packetId = raw[0];
    switch (packetId) {
      // The consolidated packet is larger than typical
      case packetList.VD_DIRECT_CONSOLIDATED_VOLTAGE_AMPERAGE:
        expectedLength = 21;
        break;
      default: // All other packets are currently 11 bytes long
        expectedLength = 11;
      break;
    }

    if (raw.byteLength != expectedLength) {
      result.errors.push("Invalid payload length for data type");
      delete result.data;
      return result;
    }
 } else {
    result.errors.push("Empty payload");
    delete result.data;
    return result;
 }

  // Packet ID - 1 byte
  const packetId = raw[0];
  switch (packetId) {
    case packetList.VD_DIRECT_CONSOLIDATED_VOLTAGE_AMPERAGE: {
      let currentL1 = raw.readUInt16BE(11) / 16.0;
      let currentL2 = raw.readUInt16BE(13) / 16.0;
      let currentL3 = raw.readUInt16BE(15) / 16.0;
      result.data = {
        // Average Phase Voltages - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 10 integer and 6 fractional bits
        voltageL1: raw.readUInt16BE(1) / 64.0,
        voltageL2: raw.readUInt16BE(3) / 64.0,
        voltageL3: raw.readUInt16BE(5) / 64.0,
        // Phase Angle Scalars - 1 byte each
        // 8-bit unsigned integer representing the phase angle between voltage and current.
        // (as if the integer range from 0-255 is scaled to between 0° and 358.59375°)
        phaseAngleL1: raw[7] * phaseAngleFactor,
        phaseAngleL2: raw[8] * phaseAngleFactor,
        phaseAngleL3: raw[9] * phaseAngleFactor,
        // Capacitor Voltage Scalar - 1 byte
        // 8-bit unsigned integer representing the capacitor voltage.
        // (as if the integer range from 0-255 is scaled to between 0.0V and 5.0V)
        capacitorVoltage: raw[10] * capacitorVoltageFactor,
        // Average Phase Current - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 12 integer and 4 fractional bits
        currentL1: currentL1,
        currentL2: currentL2,
        currentL3: currentL3,
        // Maximum Phase Current - 1 byte each
        // 8-bit unsigned integer with 3 integer and 5 fractional bits (expressed as percentage in addition to 100%)
        maxCurrentL1: (raw[17] / 32.0 + 1.0) * currentL1,
        maxCurrentL2: (raw[18] / 32.0 + 1.0) * currentL2,
        maxCurrentL3: (raw[19] / 32.0 + 1.0) * currentL3,
        // Temperature Scalar
        // 8-bit unsigned integer representing the temperature.
        // (as if the integer range from 0-255 is scaled to between -40C and 80C)
        temperatureCelsius: raw[20] * temperatureCelsiusFactor - 40.0,
      };
      break;
    }
    case packetList.VD_DIRECT_VOLTAGE_ANGLE:
      result.data = {
        // Average Phase Voltages - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 10 integer and 6 fractional bits
        voltageL1: raw.readUInt16BE(1) / 64.0,
        voltageL2: raw.readUInt16BE(3) / 64.0,
        voltageL3: raw.readUInt16BE(5) / 64.0,
        // Phase Angle Scalars - 1 byte each
        // 8-bit unsigned integer representing the phase angle between voltage and current.
        // (as if the integer range from 0-255 is scaled to between 0° and 358.59375°)
        phaseAngleL1: raw[7] * phaseAngleFactor,
        phaseAngleL2: raw[8] * phaseAngleFactor,
        phaseAngleL3: raw[9] * phaseAngleFactor,
        // Capacitor Voltage Scalar - 1 byte
        // 8-bit unsigned integer representing the capacitor voltage.
        // (as if the integer range from 0-255 is scaled to between 0.0V and 5.0V)
        capacitorVoltage: raw[10] * capacitorVoltageFactor,
      };
      break;
    case packetList.VD_DIRECT_VOLTAGE_PF:
      result.data = {
        // Average Phase Voltages - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 10 integer and 6 fractional bits
        voltageL1: raw.readUInt16BE(1) / 64.0,
        voltageL2: raw.readUInt16BE(3) / 64.0,
        voltageL3: raw.readUInt16BE(5) / 64.0,
        // Phase Power Factors - 1 byte each, 8-bit signed integers as percentage
        powerFactorL1: raw.readInt8(7),
        powerFactorL2: raw.readInt8(8),
        powerFactorL3: raw.readInt8(9),
        // Capacitor Voltage Scalar - 1 byte
        // 8-bit unsigned integer representing the capacitor voltage.
        // (as if the integer range from 0-255 is scaled to between 0.0V and 5.0V)
        capacitorVoltage: raw[10] * capacitorVoltageFactor,
      };
      break;
    case packetList.VD_DIRECT_AMPERAGE: {
      let currentL1 = raw.readUInt16BE(1) / 16.0;
      let currentL2 = raw.readUInt16BE(3) / 16.0;
      let currentL3 = raw.readUInt16BE(5) / 16.0;
      result.data = {
        // Average Phase Current - 2 bytes each
        // 16-bit unsigned integers in network byte order (MSB/BE) with 12 integer and 4 fractional bits
        currentL1: currentL1,
        currentL2: currentL2,
        currentL3: currentL3,
        // Maximum Phase Current - 1 byte each
        // 8-bit unsigned integer with 3 integer and 5 fractional bits (expressed as percentage in addition to 100%)
        maxCurrentL1: (raw[7] / 32.0 + 1.0) * currentL1,
        maxCurrentL2: (raw[8] / 32.0 + 1.0) * currentL2,
        maxCurrentL3: (raw[9] / 32.0 + 1.0) * currentL3,
        // Temperature Scalar
        // 8-bit unsigned integer representing the temperature.
        // (as if the integer range from 0-255 is scaled to between -40C and 80C)
        temperatureCelsius: raw[10] * temperatureCelsiusFactor - 40.0,
      };
      break;
    }
    case packetList.VD_DIRECT_ACT_ENERGY_CONF: // Intentional fall-through
    case packetList.VD_DIRECT_ACT_ENERGY_UNCONF:
      result.data = {
        // Total Forward Active Energy - 8 bytes
        // Sum of all phases active energy accumulated in Watt-Hours since last factory reset downlink.
        // 64-bit signed integer in network byte order (MSB/BE)
        //
        // NOTE: Due to the limitations of Javascript and JSON this codec only uses 53 bits
        // (max of standard number type) This still gives an effective range of 102,821 years
        // at 10 Mega-Watts which is more than the Voltdrop is reasonably capable of measuring.
        // Test and truncate the BigInt type into a normal number for JSON compatibility to the
        // ES5 version of the codec.
        activeEnergyAccumulation: Number(
          BigInt.asIntN(53, raw.readBigInt64BE(1))
        ),
        // Average Power Factor over all Phases - 2 bytes
        // 16-bit signed integer in network byte order (MSB/BE) expressed as percentage with 8 integer and 7 fractional bits
        averagePowerFactor: raw.readInt16BE(9) / 128.0,
      };
      break;
    case packetList.VD_DIRECT_APP_ENERGY_CONF: // Intentional fall-through
    case packetList.VD_DIRECT_APP_ENERGY_UNCONF:
      result.data = {
        // Total Forward Active Energy - 8 bytes
        // Sum of all phases active energy accumulated in Watt-Hours since last factory reset downlink.
        // 64-bit unsigned integer in network byte order (MSB/BE)
        //
        // NOTE: See info about activeEnergyAccumulation and 53 bit numeric limitation
        apparentEnergyAccumulation: Number(
          BigInt.asUintN(53, raw.readBigUInt64BE(1))
        ),
        // Average Power Factor over all Phases - 2 bytes
        // 16-bit signed integer in network byte order (MSB/BE) expressed as percentage with 8 integer and 7 fractional bits
        averagePowerFactor: raw.readInt16BE(9) / 128.0,
      };
      break;
    case packetList.VD_DIRECT_STARTUP_DIAG:
      let resetReason = "Invalid";
      switch (raw.readUInt8(1)) {
        case 0:
          resetReason = "Power Loss";
          break;
        case 1:
          resetReason = "Hardware Reset";
          break;
        case 2:
          resetReason = "Watchdog Timer";
          break;
        case 3:
          resetReason = "Unknown Software Request";
          break;
        case 4:
          resetReason = "CPU Lock-Up";
          break;
        case 5:
          resetReason = "Hard-Fault";
          break;
        case 6:
          resetReason = "Application Request";
          break;
        case 7:
          resetReason = "Factory Reset";
          break;
        case 8:
          resetReason = "Reader Non-Responsive";
          break;
        case 9:
          resetReason = "Failed Link-Check";
          break;
        case 10:
          resetReason = "Assertion Failure";
          break;
      }
      // Format hashes to hexadecimal and pad to correct length if leading zeroes are needed
      let coreFirmwareHash = raw.readUInt32BE(2).toString(16).toUpperCase();
      coreFirmwareHash =
        "0".repeat(Math.max(0, 8 - coreFirmwareHash.length)) + coreFirmwareHash;
      let readerFirmwareHash = raw.readUInt16BE(6).toString(16).toUpperCase();
      readerFirmwareHash =
        "0".repeat(Math.max(0, 4 - readerFirmwareHash.length)) +
        readerFirmwareHash;
      result.data = {
        resetReason: resetReason,
        coreFirmwareHash: "0x" + coreFirmwareHash,
        readerFirmwareHash: "0x" + readerFirmwareHash,
      };
      break;
    case packetList.VD_DIRECT_OPERATIONAL_DIAG:
      const systemErrorConditionsList = [
        "Invalid Downlink",
        "Core Voltage Drop",
        "EEPROM Fail",
        "Reader Timeout",
        "Reader NACK",
        "Reader Overvoltage",
        "Reader Not Calibrated",
        "Phase Sequence Error",
        "Transmit Duty-Cycle Restricted",
      ];
      let rawErrorConditions = raw.readUInt16BE(1);
      let systemErrorConditions = [];
      for (let idx = 0; idx < systemErrorConditionsList.length; idx++) {
        if (rawErrorConditions & (1 << idx)) {
          systemErrorConditions.push(systemErrorConditionsList[idx]);
        }
      }
      result.data = {
        systemErrorConditions: systemErrorConditions,
        registerID: "0x" + raw.readUInt16BE(3).toString(16).toUpperCase(),
      };
      break;
    default:
      result.errors.push("Unsupported packet ID");
      delete result.data;
      return result;
  }
  return result;
}

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of bytes represented as numbers as it will be sent to the device
 * @property {number} fPort - The Port Field on which the downlink must be sent
 * @property {string[]} errors - A list of error messages while encoding the downlink object
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from encoding the downlink object
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.data - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */
function encodeDownlink(input) {
  let result = {
    bytes: [],
    errors: [],
    warnings: [],
  };

  let definedDownlinkVars = 0;
  if (typeof input.data.transmitIntervalSeconds !== "undefined") {
    definedDownlinkVars += 1;
  }
  if (typeof input.data.packetTransmitSchedule !== "undefined") {
    definedDownlinkVars += 1;
  }
  if (typeof input.data.factoryReset !== "undefined") {
    definedDownlinkVars += 1;
  }
  if (typeof input.data.softReset !== "undefined") {
    definedDownlinkVars += 1;
  }

  if (definedDownlinkVars > 1) {
    result.errors.push("Invalid downlink: More than one downlink type defined");
    delete result.bytes;
    return result;
  }

  if (typeof input.data.transmitIntervalSeconds !== "undefined") {
    if (input.data.transmitIntervalSeconds < 60) {
      result.errors.push(
        "Invalid downlink: transmit interval cannot be less than 1 min"
      );
      delete result.bytes;
      return result;
    }
    if (input.data.transmitIntervalSeconds > 1800) {
      result.errors.push(
        "Invalid downlink: transmit interval cannot be greater than 30 min"
      );
      delete result.bytes;
      return result;
    }
    let downlink = Buffer.alloc(6);
    downlink.writeUInt16BE(0x0031, 0);
    downlink.writeUInt32BE(input.data.transmitIntervalSeconds, 2);
    result.bytes = Array.from(new Uint8Array(downlink.buffer));
    result.fPort = 3;
    return result;
  }

  if (typeof input.data.packetTransmitSchedule !== "undefined") {
    if (input.data.packetTransmitSchedule.length < 1) {
      result.errors.push(
        "Invalid downlink: Packet transmit schedule must contain at least one element"
      );
      delete result.bytes;
      return result;
    }
    if (input.data.packetTransmitSchedule.length > 60) {
      result.errors.push(
        "Invalid downlink: Packet transmit schedule cannot be longer than 60 elements"
      );
      delete result.bytes;
      return result;
    }

    const validIDList = [0, 40, 41, 42, 43, 44, 45];
    let scheduleValid = false;
    let downlink = Buffer.alloc(input.data.packetTransmitSchedule.length + 3);
    downlink.writeUInt16BE(0x0030, 0);
    downlink.writeUInt8(input.data.packetTransmitSchedule.length, 2);
    for (
      let index = 0;
      index < input.data.packetTransmitSchedule.length;
      index++
    ) {
      let id = input.data.packetTransmitSchedule[index];
      if (!validIDList.includes(id)) {
        result.warnings.push(
          "Invalid packet ID " + id + " replaced by gap in transmit schedule"
        );
        downlink.writeUInt8(0, index + 3);
      } else {
        downlink.writeUInt8(id, index + 3);
        if (id != 0) {
          // Enforce that there is at least one non-gap packet in schedule
          scheduleValid = true;
        }
      }
    }

    if (scheduleValid) {
      result.bytes = Array.from(new Uint8Array(downlink.buffer));
      result.fPort = 3;
    } else {
      result.errors.push(
        "Invalid downlink: Packet transmit schedule must contain at least one transmitting element"
      );
      delete result.bytes;
    }
    return result;
  }

  if (typeof input.data.factoryReset !== "undefined") {
    if (input.data.factoryReset === true) {
      result.bytes = [0x00, 0x46];
      result.fPort = 3;
      return result;
    } else {
      result.errors.push("Invalid downlink: valid factoryReset value is true");
      delete result.bytes;
      return result;
    }
  }

  if (typeof input.data.softReset !== "undefined") {
    if (input.data.softReset === true) {
      result.bytes = [0x00, 0x5a];
      result.fPort = 3;
      return result;
    } else {
      result.errors.push("Invalid downlink: valid softReset value is true");
      delete result.bytes;
      return result;
    }
  }

  result.errors.push("Invalid downlink: invalid downlink parameter name");
  delete result.bytes;
  return result;
}

/**
 * @typedef {Object} DecodedDownlink
 * @property {Object} data - The open JavaScript object representing the decoded downlink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the downlink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the downlink payload
 */

/**
 * Downlink decode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it will be sent to the device
 * @param {number} input.fPort - The Port Field on which the downlink must be sent
 * @param {Date} input.recvTime - The uplink message time computed by the IoT Flow framework
 * @returns {DecodedDownlink} The decoded object
 */
function decodeDownlink(input) {
  let result = {
    data: {},
    errors: [],
    warnings: [],
  };

  let raw = Buffer.from(input.bytes);

  if (raw.length < 2) {
    result.errors.push("Invalid downlink: downlink must be 2 bytes or greater");
    delete result.data;
    return result;
  }

  let type = raw.readUInt16BE(0);
  switch (type) {
    case 0x31: // transmit interval
      if (raw.length < 6) {
        result.errors.push(
          "Invalid downlink: transmit interval downlink must be 6 bytes or greater"
        );
        delete result.data;
        return result;
      }
      let transmitIntervalSeconds = raw.readUInt32BE(2);
      if (transmitIntervalSeconds < 60) {
        result.errors.push(
          "Invalid downlink: transmit interval cannot be less than 1 min"
        );
        delete result.data;
        return result;
      }
      if (transmitIntervalSeconds > 1800) {
        result.errors.push(
          "Invalid downlink: transmit interval cannot be greater than 30 min"
        );
        delete result.data;
        return result;
      }
      result.data.transmitIntervalSeconds = transmitIntervalSeconds;
      break;
    case 0x30: // packet transmit schedule
      if (raw.length < 4) {
        result.errors.push(
          "Invalid downlink: transmit packet schedule downlink must be 4 bytes or greater"
        );
        delete result.data;
        return result;
      }
      let dataLength = raw.readUInt8(2);
      if (dataLength > raw.length - 3) {
        result.errors.push(
          "Invalid downlink: transmit packet schedule length field larger than input data"
        );
        delete result.data;
        return result;
      } else if (dataLength == 0) {
        result.errors.push(
          "Invalid downlink: Packet transmit schedule length field cannot be zero"
        );
        delete result.data;
        return result;
      } else if (dataLength > 60) {
        result.errors.push(
          "Invalid downlink: Packet transmit schedule cannot be longer than 60 elements"
        );
        delete result.data;
        return result;
      }
      const validIDList = [0, 40, 41, 42, 43, 44, 45];
      let scheduleValid = false;
      result.data.packetTransmitSchedule = [];
      for (let index = 0; index < dataLength; index++) {
        let id = raw.readUint8(index + 3);
        if (!validIDList.includes(id)) {
          result.warnings.push(
            "Invalid packet ID " +
              id +
              " in transmit schedule will be replaced by gap on device"
          );
        } else if (id != 0) {
          // Enforce that there is at least one non-gap packet in schedule
          scheduleValid = true;
        }
        result.data.packetTransmitSchedule.push(id);
      }
      if (!scheduleValid) {
        result.errors.push(
          "Invalid downlink: Packet transmit schedule must contain at least one transmitting element"
        );
      }
      break;
    case 0x46: // factory reset
      result.data.factoryReset = true;
      break;
    case 0x5a: // soft reset
      result.data.softReset = true;
      break;
    default:
      result.errors.push("Invalid downlink: unknown downlink type");
      delete result.data;
      break;
  }
  return result;
}