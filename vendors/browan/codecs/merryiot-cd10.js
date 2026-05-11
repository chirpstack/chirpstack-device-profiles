////////////* MerryIot CO2 sensor*////////////

//hex to binary function
function hex2bin(hex){
  return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

//MerryIot CO2 sensor
function decodeUplink(input) {
	let fPort = input.fPort;
	let payloadlens = input.bytes.length;
	if(fPort==127 && payloadlens==7){
		let intput_list = input.bytes;
		let battery_int = intput_list[1];
		let battery_volt = (21 + battery_int) / 10;

		let temperature_hex = intput_list[3].toString(16).padStart(2, '0') + intput_list[2].toString(16).padStart(2, '0');
		let temperature_val = parseInt(temperature_hex, 16);
		let temperature = temperature_val > 1250 ? (temperature_val - 65536) / 10 : temperature_val / 10;

		let humidity = intput_list[4];

		let co2_hex = intput_list[0].toString(16).padStart(2, '0');
		let co2_binary = hex2bin(co2_hex);
		let trigger_st = co2_binary.substring(7, 8); 
		let button_st = co2_binary.substring(6, 7); 
		let co2threshold_st = co2_binary.substring(3, 4); 
		let co2calibration_st = co2_binary.substring(2, 3);

		let trigger = parseInt(trigger_st);
		let button = parseInt(button_st);
		let co2threshold = parseInt(co2threshold_st);
		let co2calibration = parseInt(co2calibration_st);

		let co2ppm_hex = intput_list[6].toString(16).padStart(2, '0') + intput_list[5].toString(16).padStart(2, '0');
		let co2_ppm = parseInt(co2ppm_hex, 16);
		co2_ppm = co2_ppm < 0 ? 0 : co2_ppm > 40000 ? 40000 : co2_ppm;

		return {
			data: {
				battery_volt,
				temperature,
				humidity,
				trigger,
				button,
				co2threshold,
				co2calibration,
				co2_ppm
			},
		};
	}
	else if (fPort==127 && payloadlens==6){
		let intput_list = input.bytes;
		let battery_int = intput_list[1];
		let battery_volt = (21 + battery_int) / 10;

		let temperature_int = intput_list[2];
		let temperature = temperature_int > 125 ? temperature_int - 256 : temperature_int;

		let humidity = intput_list[3];

		let co2_hex = intput_list[0].toString(16).padStart(2, '0');
		let co2_binary = hex2bin(co2_hex);
		let trigger_st = co2_binary.substring(7, 8); 
		let button_st = co2_binary.substring(6, 7); 
		let co2threshold_st = co2_binary.substring(3, 4); 
		let co2calibration_st = co2_binary.substring(2, 3);

		let trigger = parseInt(trigger_st);
		let button = parseInt(button_st);
		let co2threshold = parseInt(co2threshold_st);
		let co2calibration = parseInt(co2calibration_st);

		let co2ppm_hex = intput_list[5].toString(16).padStart(2, '0') + intput_list[4].toString(16).padStart(2, '0');
		let co2_ppm = parseInt(co2ppm_hex, 16);
		co2_ppm = co2_ppm < 0 ? 0 : co2_ppm > 40000 ? 40000 : co2_ppm;

		return {
			data: {
				battery_volt,
				temperature,
				humidity,
				trigger,
				button,
				co2threshold,
				co2calibration,
				co2_ppm
			},
		};
	}
	else{
		return {
			data: {
				fPort: input.fPort,
				payloadlength: input.bytes.length,
				message: 'Invalid fPort or payload length'
			},
		};
	}
}

////////////* MerryIot CO2 sensor End !!*////////////

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
