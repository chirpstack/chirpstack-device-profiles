function decodeUplink(input) {
  const fPort = input.fPort;
  const bytes = input.bytes;

  if (![2, 3, 4, 5, 6, 7].includes(fPort)) {
    return { errors: ["Unsupported fPort: " + fPort] };
  }

  if (
    ([2, 4].includes(fPort) && bytes.length !== 11) ||
    (fPort === 3 && (bytes.length === 0 || bytes.length % 11 !== 0)) ||
    (fPort === 5 && bytes.length !== 7) ||
    (fPort === 6 && bytes.length !== 10 && bytes.length !== 11) ||
    (fPort === 7 && bytes.length === 0)
  ) {
    return { errors: ["Invalid payload length for fPort " + fPort + ": " + bytes.length] };
  }

  if (
    (fPort === 2 && (bytes[0] & 0x08) !== 0) ||
    (fPort === 6 && (bytes[0] & 0x08) === 0)
  ) {
    return { errors: ["Unexpected work mode for fPort " + fPort] };
  }

  if (fPort === 5) {
    if (bytes[0] !== 0x20) {
      return { errors: ["Unexpected sensor model: " + bytes[0]] };
    }
    if (bytes[3] < 0x01 || bytes[3] > 0x0e) {
      return { errors: ["Unknown frequency band: " + bytes[3]] };
    }
  }

  return { data: decodePayload(fPort, bytes) };
}

function uint24(bytes, offset) {
  return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
}

function timestamp(bytes, offset) {
  const seconds = (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
  return new Date(seconds * 1000).toISOString().slice(0, 19).replace("T", " ");
}

function historyRecord(bytes, offset) {
  const flags = bytes[offset];
  const workMode = (flags & 0x08) ? "CPL03" : "CPL01";
  const values = [
    workMode,
    (flags & 0x20) ? "PART" : "SUM",
    (flags & 0x10) ? "YES" : "NO"
  ];

  if (workMode === "CPL01") {
    values.push(
      (flags & 0x02) ? "TRUE" : "FALSE",
      (flags & 0x01) ? "OPEN" : "CLOSE",
      (flags & 0x04) >> 2
    );
  } else {
    values.push(flags & 0x07);
  }

  values.push(
    uint24(bytes, offset + 1),
    uint24(bytes, offset + 4),
    timestamp(bytes, offset + 7)
  );
  return "[" + values.join(",") + "],";
}

function decodePayload(fPort, bytes) {
  switch (fPort) {
    case 2:
      return {
        Node_type: "CPL03-LB",
        WORKMOD: "CPL01",
        CMOD: (bytes[0] & 0x20) ? "PART" : "SUM",
        TDC: (bytes[0] & 0x10) ? "YES" : "NO",
        ALARM: (bytes[0] & 0x02) ? "TRUE" : "FALSE",
        PIN_STATUS: (bytes[0] & 0x01) ? "OPEN" : "CLOSE",
        TTRIG_MOD: (bytes[0] & 0x04) >> 2,
        TOTAL_PULSE: uint24(bytes, 1),
        LAST_DURATION: uint24(bytes, 4),
        TIME: timestamp(bytes, 7)
      };
    case 3: {
      const records = [];
      // An all-zero record is the device's no-history response.
      if (!(bytes.length === 11 && bytes.every((value) => value === 0))) {
        for (let offset = 0; offset < bytes.length; offset += 11) {
          records.push(historyRecord(bytes, offset));
        }
      }
      return {
        DATALOG: records.join(""),
        PNACKMD: (bytes[0] & 0x80) ? "True" : "False"
      };
    }
    case 4:
      return {
        Node_type: "CPL03-LB",
        TDC: uint24(bytes, 0),
        DISALARM: bytes[3] & 0x01,
        KEEP_STATUS: bytes[4] & 0x01,
        KEEP_TIME: (bytes[5] << 8) | bytes[6],
        TTRIG_MOD1: bytes[7],
        TTRIG_MOD2: bytes[8],
        TTRIG_MOD3: bytes[9],
        ALARM_TDC: bytes[10]
      };
    case 5: {
      const frequencyBands = [
        "EU868", "US915", "IN865", "AU915", "KZ865", "RU864", "AS923",
        "AS923_1", "AS923_2", "AS923_3", "CN470", "EU433", "KR920", "MA869"
      ];
      return {
        SENSOR_MODEL: "CPL03-LB",
        FIRMWARE_VERSION: (bytes[1] & 0x0f) + "." +
          ((bytes[2] >> 4) & 0x0f) + "." + (bytes[2] & 0x0f),
        FREQUENCY_BAND: frequencyBands[bytes[3] - 1],
        SUB_BAND: bytes[4] === 0xff ? "NULL" : bytes[4],
        BAT: ((bytes[5] << 8) | bytes[6]) / 1000
      };
    }
    case 6: {
      const data = {
        Node_type: "CPL03-LB",
        WORKMOD: "CPL03",
        CMOD: (bytes[0] & 0x20) ? "PART" : "SUM",
        TDC: (bytes[0] & 0x10) ? "YES" : "NO",
        CALCULATE_FLAG: bytes[0] & 0x07,
        PA8_TOTAL_PULSE: uint24(bytes, 1),
        PA4_TOTAL_PULSE: uint24(bytes, 4),
        PB15_TOTAL_PULSE: uint24(bytes, 7)
      };
      if (bytes.length === 11) {
        data.PA8_ROC = (bytes[10] & 0x01) ? "TRUE" : "FALSE";
        data.PA4_ROC = (bytes[10] & 0x02) ? "TRUE" : "FALSE";
        data.PB15_ROC = (bytes[10] & 0x04) ? "TRUE" : "FALSE";
      }
      return data;
    }
    case 7:
      return {
        EXTI_PA8_Trigger: (bytes[0] & 0x02) ? "TRUE" : "FALSE",
        EXTI_PA8_Status: (bytes[0] & 0x01) ? "CLOSE" : "OPEN",
        EXTI_PA4_Trigger: (bytes[0] & 0x08) ? "TRUE" : "FALSE",
        EXTI_PA4_Status: (bytes[0] & 0x04) ? "CLOSE" : "OPEN",
        EXTI_PB15_Trigger: (bytes[0] & 0x20) ? "TRUE" : "FALSE",
        EXTI_PB15_Status: (bytes[0] & 0x10) ? "CLOSE" : "OPEN",
        Node_type: "CPL03-LB"
      };
  }
}
