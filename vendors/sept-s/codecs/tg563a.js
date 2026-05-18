const TRANSMISSION_PERIODS = [1, 2, 4, 6, 8, 12, 24, 48]
const MESSAGE_TYPES = ["Periodic uplink message", "Smoke Alarm Event", "Low Battery Event", "Smoke Chamber Failure Event",
    "Fouling Smoke Chamber Event", "Ultrasonic Sensor Failure Event", "Infrared Sensor Failure Event", "Buzzer Failure",
    "Obstacle Detected Event", "Air Inlet Covered Event", "RFU", "RFU", "RFU", "RFU", "RFU", "Message with additional data"];

const DOWNLINK_CMD = {
    "SET_TX_PERIOD": { id: 0, param_values: [0, 1, 2, 3, 4, 5, 6, 7] },
    "ENABLE_ADDITIONAL_DATA": { id: 1, param_values: [0, 1] },
    "SET_EVENTS": { id: 2, param_values: [0, 1, 2, 3, 5, 6, 7] },
    "SET_HARDWARE_FAILURE_EVENT": { id: 3, param_values: [0, 1] },
    "SET_OBSTRUCTION_EVENT": { id: 4, param_values: [0, 1] },
    "SET_SMOKE_DETECTED_EVENT": { id: 5, param_values: [0, 1] },
    "SET_CONFIG_LSB": { id: 6, param_values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15] },
    "SET_CONFIG_MSB": { id: 7, param_values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15] },
    "SEND_ADDITIONAL_DATA_IN_NEXT_UPLINK": { id: 8, param_values: [0, 1] },
    "REQUEST_A_JOIN": { id: 9, param_values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15] },
};

function decodeDate(byteArray) {
    var date = byteArray[0] | (byteArray[1] << 8);
    var day = ('0' + (date & 0x1F).toString(10)).slice(-2);
    var month = ('0' + ((date >> 5) & 0xF).toString(10)).slice(-2);
    var year = (((date >> 9) & 0x7F) + 2000).toString(10);
    return day + '/' + month + '/' + year;
}

function timeCounterToSeconds(byteArray) {
    var value = byteArray[0] | (byteArray[1] << 8);
    var unit = value & 0x3;
    var number = (value >> 2) & 0x3FFF;
    switch (unit) {
        case 1: //minutes
            return 60 * number;
        case 2: //hours
            return 3600 * number;
        case 3: //days
            return 86400 * number;
        case 0: //seconds
        default:
            return number;
    }
}

function decodeTemperature(value) {
    if (value > 128)
        return value - 256;
    return value;
}

function decodeSerialNumber(byteArray) {
    var serial_number = "";
    byteArray.reverse().forEach(function (byte) {
        serial_number += ('0' + (byte & 0xFF).toString(16)).slice(-2);
    });
    return serial_number;
}

function decodeUplink(input) {
    var data = {};
    var errors = [];

    if (input.fPort != 1) {
        errors.push("invalid fPort");
    } else if (input.bytes.length != 5 && (input.bytes.length != 35 || input.bytes[0] != 0xF)) {
        errors.push("invalid size");
    } else {
        data.messageType = MESSAGE_TYPES[input.bytes[0] & 0xF];

        data.configuration = {}
        data.configuration.rawValue = input.bytes[1].toString(16).toUpperCase();
        data.configuration.transmissionPeriod = TRANSMISSION_PERIODS[input.bytes[1] & 0x7];
        data.configuration.additionalDataEnabled = (input.bytes[1] >> 3) & 1;
        data.configuration.obstructionEventEnabled = (input.bytes[1] >> 4) & 1;
        data.configuration.hardwareFailureEventEnabled = (input.bytes[1] >> 5) & 1;
        data.configuration.smokeEventEnabled = (input.bytes[1] >> 6) & 1;

        data.temperature = decodeTemperature(input.bytes[2]);

        var status = {};
        status.mounted = input.bytes[3] & 0x1;
        status.brightness = (input.bytes[3] >> 1) & 0x1;
        status.temperatureOutOfRange = (input.bytes[3] >> 2) & 0x1;
        status.obstacleDetected = (input.bytes[3] >> 4) & 0x1;
        status.airInletCovered = (input.bytes[3] >> 5) & 0x1;
        status.tooLongInactivity = (input.bytes[3] >> 6) & 0x1;
        status.tooLongUnmounted = (input.bytes[3] >> 7) & 0x1;
        status.smokeAlarm = input.bytes[4] & 0x1;
        status.batteryLow = (input.bytes[4] >> 1) & 0x1;
        status.smokeChamberFailure = (input.bytes[4] >> 2) & 0x1;
        status.fouledSmokeChamber = (input.bytes[4] >> 3) & 0x1;
        status.ultrasonicSensorFailure = (input.bytes[4] >> 4) & 0x1;
        status.infraredSensorFailure = (input.bytes[4] >> 5) & 0x1;
        status.buzzerFailure = (input.bytes[4] >> 6) & 0x1;
        data.status = status;

        if (data.messageType == "Message with additional data") {
            data.batteryLevel = input.bytes[5] / 100 + 1;
            data.serialNumber = decodeSerialNumber(input.bytes.slice(6, 10));

            data.productionDate = decodeDate(input.bytes.slice(10, 12));
            data.installationDate = decodeDate(input.bytes.slice(12, 14));

            data.runningTimeCounter = timeCounterToSeconds(input.bytes.slice(14, 16));
            data.smokeAlarmTimeCounter = timeCounterToSeconds(input.bytes.slice(16, 18));
            data.testAlarmTimeCounter = timeCounterToSeconds(input.bytes.slice(18, 20));
            data.faultTimeCounter = timeCounterToSeconds(input.bytes.slice(20, 22));

            data.smokeAlarmCounter = input.bytes[22];
            data.testAlarmCounter = input.bytes[23];
            data.smokeErrorCounter = input.bytes[24];
            data.lowBatteryCounter = input.bytes[25];
            data.smokeAlarmDeactivationCounter = input.bytes[26];
            data.faultDeactivationCounter = input.bytes[27];
            data.mountingCounter = input.bytes[28];
            data.energyUsage = input.bytes[29];
            data.lightGuideDirtiness = input.bytes[30];
            data.foulingSmokeChamber = input.bytes[31];
            data.minimumTemperature = decodeTemperature(input.bytes[32]);
            data.maximumTemperature = decodeTemperature(input.bytes[33]);
            data.distanceThreshold = input.bytes[34] * 10;
        }
    }

    var output = null;
    if (errors.length == 0) {
        output = { data: data };
    }
    else {
        output = { errors: errors }
    }
    return output;
}

function encodeDownlink(input) {
    var bytes = [];
    var errors = [];

    if (Object.prototype.toString.call(input.data) === '[object Array]') {

        for (var index = 0; index < input.data.length; index++) {

            if ("command" in input.data[index] && "parameter" in input.data[index] === true) {

                var command = input.data[index].command;
                var parameter = input.data[index].parameter;

                //check the command
                if (command in DOWNLINK_CMD) {
                    //check the parameter
                    if (parameter in DOWNLINK_CMD[command].param_values) {
                        bytes.push((DOWNLINK_CMD[command].id << 4) | parameter);
                    }
                    else {
                        errors.push("Invalid parameter: the value shall be in [" + DOWNLINK_CMD[command].param_values.toString() + ']')
                    }
                }
                else {
                    errors.push("Invalid command")
                }
            }
            else {
                errors.push("Invalid data at position " + index + ": the data shall be an array of object command");
            }
        }
    }
    else {
        errors.push("The data shall be an array");
    }
    var output = null;

    if (errors.length == 0) {
        output = { fPort: 1, bytes: bytes };
    }
    else {
        output = { errors: errors };
    }
    return output;
}
