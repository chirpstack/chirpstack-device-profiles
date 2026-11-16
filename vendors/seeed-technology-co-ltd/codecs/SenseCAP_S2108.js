function decodeUplink(input) {
  const bytes = input.bytes || [];
  if (bytes.length < 9 || (bytes.length - 2) % 7 !== 0) {
    return { errors: ["Invalid S2108 frame length"] };
  }

  let crc = 0;
  for (let index = 0; index < bytes.length - 2; index++) {
    crc ^= bytes[index];
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0x8408 : 0);
    }
  }
  const receivedCrc = bytes[bytes.length - 2] |
    (bytes[bytes.length - 1] << 8);
  if ((crc & 0xffff) !== receivedCrc) {
    return { errors: ["Invalid S2108 CRC"] };
  }

  const data = {};
  for (let offset = 0; offset < bytes.length - 2; offset += 7) {
    const channel = bytes[offset];
    const id = bytes[offset + 1] | (bytes[offset + 2] << 8);
    if (channel !== 1) continue;
    if (![4102, 4103, 4108, 4204, 4205].includes(id)) continue;

    const raw = (bytes[offset + 3]) |
      (bytes[offset + 4] << 8) |
      (bytes[offset + 5] << 16) |
      (bytes[offset + 6] << 24);
    const value = raw >= 2000000 ? null : raw / 1000;
    if (id === 4102) data.soil_temperature = value;
    if (id === 4103) data.soil_moisture = value;
    if (id === 4108) data.bulk_ec = value;
    if (id === 4204) data.pore_ec = value;
    if (id === 4205) data.epsilon = value;
  }
  return { data };
}

function encodeDownlink(_input) {
  return { errors: ["S2108 downlink is not supported"] };
}
