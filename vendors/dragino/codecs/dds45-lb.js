// Based on Dragino's ChirpStack v4 decoder:
// https://github.com/dragino/dragino-end-node-decoder/tree/main/DDS45-LB
function decodeUplink(input) {
  var data = decode(input.fPort, input.bytes);
  if (data === undefined) {
    return { errors: ["Unsupported fPort: " + input.fPort] };
  }
  return { data: data };
}

function datalog(i, bytes) {
  var aa = (bytes[0 + i] << 8 | bytes[1 + i]);
  var bb = bytes[2 + i] << 8 | bytes[3 + i];
  var cc = (bytes[4 + i] << 8 | bytes[5 + i]) / 10;
  var dd = (bytes[6 + i] & 0x01) ? "YES" : "NO";
  var ee = ((bytes[6 + i] >> 1) & 0x01) ? "TRUE" : "FALSE";
  var ff = (bytes[6 + i] & 0x40) ? "1" : "0";
  var gg = getMyDate(((bytes[7 + i] << 24 | bytes[8 + i] << 16 | bytes[9 + i] << 8 | bytes[10 + i]) >>> 0).toString(10));
  return '[' + aa + ',' + bb + ',' + cc + ',' + dd + ',' + ee + ',' + ff + ',' + gg + ']' + ',';
}

function getzf(c_num) {
  if (parseInt(c_num) < 10)
    c_num = '0' + c_num;
  return c_num;
}

function getMyDate(str) {
  var c_Date;
  if (str > 9999999999)
    c_Date = new Date(parseInt(str));
  else
    c_Date = new Date(parseInt(str) * 1000);

  var c_Year = c_Date.getFullYear(),
    c_Month = c_Date.getMonth() + 1,
    c_Day = c_Date.getDate(),
    c_Hour = c_Date.getHours(),
    c_Min = c_Date.getMinutes(),
    c_Sen = c_Date.getSeconds();
  return c_Year + '-' + getzf(c_Month) + '-' + getzf(c_Day) + ' ' + getzf(c_Hour) + ':' + getzf(c_Min) + ':' + getzf(c_Sen);
}

function decode(fPort, bytes) {
  if (fPort == 0x02) {
    var value = (bytes[0] << 8 | bytes[1]) & 0x3FFF;
    var batV = value / 1000; // Battery, units: V

    value = bytes[2] << 8 | bytes[3];
    var distance = value; // Distance, units: mm

    var i_flag = bytes[4];

    value = bytes[5] << 8 | bytes[6];
    if (bytes[5] & 0x80) {
      value |= 0xFFFF0000;
    }
    var temp_DS18B20 = (value / 10).toFixed(2); // DS18B20 temperature
    var s_flag = bytes[7];
    return {
      Node_type: "DDS45-LB",
      Bat: batV,
      Distance: distance,
      Interrupt_flag: i_flag,
      TempC_DS18B20: temp_DS18B20,
      Sensor_flag: s_flag,
    };
  }

  if (fPort == 0x03) {
    var pnack = ((bytes[0] >> 7) & 0x01) ? "True" : "False";
    var data_sum = "";
    for (var i = 0; i < bytes.length; i = i + 11) {
      data_sum += datalog(i, bytes);
    }
    return {
      Node_type: "DDS45-LB",
      DATALOG: data_sum,
      PNACKMD: pnack,
    };
  }

  if (fPort == 0x05) {
    var freq_bands = [
      "EU868", "US915", "IN865", "AU915", "KZ865", "RU864", "AS923",
      "AS923_1", "AS923_2", "AS923_3", "CN470", "EU433", "KR920", "MA869",
    ];
    var sensor;
    if (bytes[0] == 0x28)
      sensor = "DDS45-LB";

    var sub_band;
    if (bytes[4] == 0xff)
      sub_band = "NULL";
    else
      sub_band = bytes[4];

    var freq_band = freq_bands[bytes[3] - 1];
    var firm_ver = (bytes[1] & 0x0f) + '.' + (bytes[2] >> 4 & 0x0f) + '.' + (bytes[2] & 0x0f);
    var bat = (bytes[5] << 8 | bytes[6]) / 1000;

    return {
      SENSOR_MODEL: sensor,
      FIRMWARE_VERSION: firm_ver,
      FREQUENCY_BAND: freq_band,
      SUB_BAND: sub_band,
      BAT: bat,
    };
  }

  return undefined;
}
