////////////* MerryIot Open/Close sensor*////////////

//hex to binary function
function hex2bin(hex){
  return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

//MerryIot Open/Close sensor
function decodeUplink(input) {
	let fPort = input.fPort;
	let payloadlens = input.bytes.length;
	if(fPort==120 && payloadlens==10){
		let intput_list = input.bytes;
		let battery_int = intput_list[1];
		let battery_volt = (21 + battery_int) / 10;

		let temperature_hex = intput_list[3].toString(16).padStart(2, '0') + intput_list[2].toString(16).padStart(2, '0');
		let temperature_val = parseInt(temperature_hex, 16);
		let temperature = temperature_val > 1250 ? (temperature_val - 65536) / 10 : temperature_val / 10;

		let humi = intput_list[4];

		let door_hex = intput_list[0].toString(16).padStart(2, '0');
		let door_binary = hex2bin(door_hex);
		let open_st = door_binary.substring(7, 8);
		let button_st = door_binary.substring(6, 7);
		let tamper_st = door_binary.substring(5, 6);
		let tilt_st = door_binary.substring(4, 5);

		let open = parseInt(open_st);
		let button = parseInt(button_st);
		let tamper = parseInt(tamper_st);
		let tilt = parseInt(tilt_st);

		let time_hex = intput_list[6].toString(16).padStart(2, '0') + intput_list[5].toString(16).padStart(2, '0');
		let time = parseInt(time_hex, 16);

		let count_hex = intput_list[9].toString(16).padStart(2, '0') + intput_list[8].toString(16) + intput_list[7].toString(16).padStart(2, '0');
		let count = parseInt(count_hex, 16);

		return {
			data: {
				battery_volt,
				temperature,
				humi,
				open,
				button,
				tamper,
				tilt,
				time,
				count
			},
		};
  }
  else if (fPort==120 && payloadlens==9){
		let intput_list = input.bytes;
		let battery_int = intput_list[1];
		let battery_volt = (21 + battery_int) / 10;

		let temperature_int = intput_list[2];
		let temperature;
		if(temperature_int > 125){
			temperature = temperature_int - 256;
		} else {
			temperature = temperature_int;
		}

		let humi = intput_list[3];

		let door_hex = intput_list[0].toString(16).padStart(2, '0');
		let door_binary = hex2bin(door_hex);
		let open_st = door_binary.substring(7, 8);
		let button_st = door_binary.substring(6, 7);
		let tamper_st = door_binary.substring(5, 6);
		let tilt_st = door_binary.substring(4, 5);

		let open = parseInt(open_st);
		let button = parseInt(button_st);
		let tamper = parseInt(tamper_st);
		let tilt = parseInt(tilt_st);

		let time_hex = intput_list[5].toString(16).padStart(2, '0') + intput_list[4].toString(16).padStart(2, '0');
		let time = parseInt(time_hex, 16);

		let count_hex = intput_list[8].toString(16).padStart(2, '0') + intput_list[7].toString(16).padStart(2, '0') + intput_list[6].toString(16).padStart(2, '0');
		let count = parseInt(count_hex, 16);

		return {
			data: {
				battery_volt,
				temperature,
				humi,
				open,
				button,
				tamper,
				tilt,
				time,
				count
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

////////////* MerryIot Open/Close sensor End !!*////////////

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
