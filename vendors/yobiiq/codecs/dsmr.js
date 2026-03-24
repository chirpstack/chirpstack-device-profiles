/**
 *__   _____  ____ ___ ___ ___  
 *\ \ / / _ \| __ )_ _|_ _/ _ \ 
 * \ V / | | |  _ \| | | | | | |
 * | || |_| | |_) | | | | |_| |
 * |_| \___/|____/___|___\__\_\
 *                              
 *
 * @brief This YOBIIQ JS payload decoder/encoder follows the LoRa Alliance Payload Codec API specs (TS013-1.0.0). 
 * 
 * @compatibility TTN, TTI, LORIOT, ThingPark, ChirpStack v3/v4 and any LNS that follows LoRa Alliance API specs.
 * 
 * @author      Fostin Kpodar <f.kpodar@yobiiq.com>
 * @version     1.0.0
 * @copyright   YOBIIQ B.V. | https://www.yobiiq.com
 * 
 * @release     2025-08-20
 * @update      2025-02-04
 * 
 * @product     P1002001 iQ DSMR (iQ DSMR Basic)
 * 
 * @firmware    DSMR firmware version >= 1.0
 * 
 */

// Version Control
var VERSION_CONTROL = {
    CODEC : {VERSION: "1.0.0", NAME: "codecVersion"},
    DEVICE: {MODEL : "DSMR", NAME: "genericModel"},
    PRODUCT: {CODE : "P1002005", NAME: "productCode"},
    MANUFACTURER: {COMPANY : "YOBIIQ B.V.", NAME: "manufacturer"},
};

var UPLINK = {
    // generic data
    GENERIC_DATA : {
        CHANNEL    : 255, // 0xFF
        FPORT_MIN  : 50,
        FPORT_MAX  : 99,
    },
    // device data
    DEVICE_DATA : {
        CHANNEL   : 1,   // 0x01
        FPORT_MIN : 1,
        FPORT_MAX : 10,
    },
    // alarm data
    ALARM_DATA : {
        CHANNEL_BASE  : 160, // 0xA0
        CHANNEL  : 170, // 0xAA
        FPORT    : 11,
    },
    // threshold historic data
    HISTORIC_DATA : {
        CHANNEL  : 1, // 0x01
        FPORT    : 20,
    },
    // parameter data
    PARAMETER_DATA : {
        CHANNEL  : 255, // 0xFF
        FPORT    : 100,
    },
    // general
    MAC : {
        FPORT : 0,
        MSG: "MAC COMMAND RECEIVED",
    },
    OPTIONAL_KEYS : { // in DEVICE_GENERIC_REGISTERS or in DEVICE_SPECIFIC_REGISTERS
        RESOLUTION: "RESOLUTION",
        VALUES: "VALUES",
        SIGNED: "SIGNED",
        DIGIT: "DIGIT",
        UNIT: "UNIT",
        HEX: "HEX",
    },
    COMMON_REGISTERS: {
        "0xFE" : {SIZE: 4, NAME : "timestamp"},
        "0x01" : {SIZE: 4, NAME : "dataloggerTimestamp"},
    },
    DOWNLINK : {
        SUCCESS : "DOWNLINK COMMAND SUCCEEDED",
        FAILURE : "DOWNLINK COMMAND FAILED"
    },
    ERRORS : {
        CHANNEL: "Unknown channel ",
        TYPE: "Unknown type ",
        FPORT_INCORRECT: "Incorrect fPort",
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info",
};

var DEVICE_GENERIC_REGISTERS = {
    "0x64" : {SIZE : 1, NAME : "deviceStatus",
        VALUES : { "0x00" : "FACTORY MODE", "0x01" : "NORMAL MODE",},
    },
    "0x65" : {SIZE : 0, NAME : "manufacturer"}, // size to be determinated
    "0x66" : {SIZE : 0, NAME : "originalEquipmentManufacturer"},  // size to be determinated
    "0x67" : {SIZE : 0, NAME : "deviceModel"},  // size to be determinated
    "0x68" : {SIZE : 4, NAME : "deviceSerialNumber"},
    "0x69" : {SIZE : 2, NAME : "firmwareVersion", DIGIT: false},
    "0x6A" : {SIZE : 2, NAME : "hardwareVersion", DIGIT: false},
    "0x6B" : {SIZE : 1, NAME : "externalPowerStatus",
        VALUES : { "0x00" : "AC POWER OFF", "0x01" : "AC POWER ON",},
    },
    "0x6C" : {SIZE : 1, NAME : "batteryPercentage"},
    "0x6D" : {SIZE : 2, NAME : "batteryVoltage", RESOLUTION: 0.001},
    "0x78" : {SIZE: 1, NAME : "internalCircuitTemperatureAlarm", 
        VALUES: {"0x00" : "NORMAL", "0x01" : "ALARM",}
    },
    "0x79" : {SIZE: 4, NAME : "internalCircuitTemperatureNumberOfAlarms",},
    "0x7A" : {SIZE: 2, NAME : "internalCircuitTemperature", RESOLUTION: 0.01, SIGNED: true},
    "0x7B" : {SIZE: 1, NAME : "internalCircuitHumidity",},
    "0x82" : {SIZE: 2, NAME : "ambientTemperature", RESOLUTION: 0.01, SIGNED: true},
    "0x83" : {SIZE: 1, NAME : "ambientHumidity",},
    "0x96" : {SIZE : 1, NAME : "joinStatus",
        VALUES : { "0x00" : "OFFLINE", "0x01" : "ONLINE",},
    },
    "0x9D" : {SIZE: 1, NAME : "applicationPort",},
    "0x9E" : {SIZE: 1, NAME : "joinType",
        VALUES : { "0x01" : "OTAA",},
    },
    "0x9F" : {SIZE : 1, NAME : "deviceClass",
        VALUES : { "0x00" : "CLASS A", "0x01" : "CLASS B", "0x02" : "CLASS C",},
    },
    "0xA0" : {SIZE: 1, NAME: "adr", 
        VALUES: {"0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0xA1" : {SIZE: 1, NAME: "sf", 
        VALUES: { "0x00" : "SF12BW125", "0x01" : "SF11BW125", "0x02" : "SF10BW125",
            "0x03" : "SF9BW125", "0x04" : "SF8BW125", "0x05" : "SF7BW125", "0x06" : "SF7BW250",}
    },
    "0xA3" : {SIZE: 1, NAME: "radioMode", SIZE: 1, 
        VALUES: { "0x00" : "LoRaWAN", "0x01" : "iQ D2D", "0x02" : "LoRaWAN & iQ D2D",}
    },
    "0xA4" : {SIZE: 1, NAME: "numberOfJoinAttempts"},
    "0xA5" : {SIZE: 2, NAME: "linkCheckTimeframe",},
    "0xA6" : {SIZE: 1, NAME: "dataRetransmission", 
        VALUES: { "0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0xA7" : {SIZE: 1, NAME: "lorawanWatchdogAlarm", 
        VALUES: { "0x00" : "NORMAL", "0x01" : "ALARM",}
    },
};

var DEVICE_SPECIFIC_REGISTERS = {
    "0xB5" : {SIZE: 1, NAME: "serialWatchdogFunction", 
        VALUES: { "0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    "0xB6" : {SIZE: 2, NAME: "serialWatchdogTimeout",},
    "0xB7" : {SIZE: 1, NAME: "serialWatchdogAlarm", 
        VALUES: { "0x00" : "NORMAL", "0x01" : "ALARM",}
    },
    "0xB0" : {SIZE: 1, NAME: "serialStopBits", 
        VALUES: { "0x00" : "STOP_BITS_1", "0x01" : "STOP_BITS_1_5",
            "0x02": "STOP_BITS_2", "0x03": "STOP_BITS_2_5",
            "0x04": "STOP_BITS_3", "0x05": "STOP_BITS_3_5",
            "0x06": "STOP_BITS_4"
        }
    },
    "0xB1" : {SIZE: 1, NAME: "serialDataWidth",},
    "0xB2" : {SIZE: 1, NAME: "serialParity",
        VALUES: { "0x00" : "NONE", "0x01" : "ODD", "0x02" : "EVEN",}
    },
    "0xB3" : {SIZE: 4, NAME: "serialBaudRate"},
    "0xB4" : {SIZE: 1, NAME: "dsmrProfile",
        VALUES: { "0x00" : "NL", "0x01" : "LUX",}
    },
    "0xD1" : {SIZE : 4, NAME : "pulseCounterDryInput1",},
    "0xD2" : {SIZE : 4, NAME : "pulseCounterDryInput2",},
    "0xDD" : {SIZE : 16, NAME : "decryptionKey", HEX:true},
    "0xDE" : {SIZE : 1, NAME : "decryptionFunction",
        VALUES: { "0x00" : "DISABLED", "0x01" : "ENABLED",}
    },
    
    "0x10" : {SIZE : 2, NAME : "p1Version", DIGIT: false},
    "0x11" : {SIZE : 4, NAME : "telegramTimestamp",},
    "0x12" : {SIZE : 0, NAME : "equipmentIdentifier",},
    "0x13" : {SIZE : 4, NAME : "electricityDeliveredToClient", UNIT : "Wh", ALIAS: "totalImportedActiveEnergy"},
    "0x14" : {SIZE : 4, NAME : "electricityDeliveredToClientT1", UNIT : "Wh",},
    "0x15" : {SIZE : 4, NAME : "electricityDeliveredToClientT2", UNIT : "Wh",},
    "0x16" : {SIZE : 4, NAME : "electricityDeliveredByClient", UNIT : "Wh", ALIAS: "totalExportedActiveEnergy"},
    "0x17" : {SIZE : 4, NAME : "electricityDeliveredByClientT1", UNIT : "Wh",},
    "0x18" : {SIZE : 4, NAME : "electricityDeliveredByClientT2", UNIT : "Wh",},
    "0x19" : {SIZE : 2, NAME : "tariffIndicator",},
    "0x1A" : {SIZE : 4, NAME : "electricityPowerDelivered", UNIT : "W", SIGNED : true, ALIAS: "totalImportedActivePower"},
    "0x1B" : {SIZE : 4, NAME : "electricityPowerReceived", UNIT : "W", SIGNED : true, ALIAS: "totalExportedActivePower"},
    "0x1C" : {SIZE : 4, NAME : "numberOfPowerFailures",},
    "0x1D" : {SIZE : 4, NAME : "numberOfLongPowerFailures",},
    "0x1E" : {SIZE : 0, NAME : "powerFailureEventLog", SINGLE_LOG_SIZE:8, LOG:true},
    "0x1F" : {SIZE : 4, NAME : "numberOfVoltageSagsL1",},
    "0x20" : {SIZE : 4, NAME : "numberOfVoltageSagsL2",},
    "0x21" : {SIZE : 4, NAME : "numberOfVoltageSagsL3",},
    "0x22" : {SIZE : 4, NAME : "numberOfVoltageSwellsL1",},
    "0x23" : {SIZE : 4, NAME : "numberOfVoltageSwellsL2",},
    "0x24" : {SIZE : 4, NAME : "numberOfVoltageSwellsL3",},
    "0x25" : {SIZE : 4, NAME : "voltageL1", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
    "0x26" : {SIZE : 4, NAME : "voltageL2", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
    "0x27" : {SIZE : 4, NAME : "voltageL3", UNIT : "V", RESOLUTION : 0.1, SIGNED : true,},
    "0x28" : {SIZE : 4, NAME : "currentL1", UNIT : "A", SIGNED : true,},
    "0x29" : {SIZE : 4, NAME : "currentL2", UNIT : "A", SIGNED : true,},
    "0x2A" : {SIZE : 4, NAME : "currentL3", UNIT : "A", SIGNED : true,},
    "0x2B" : {SIZE : 4, NAME : "activePowerDeliveredL1", UNIT : "W", SIGNED : true, ALIAS: "importedActivePowerL1"},
    "0x2C" : {SIZE : 4, NAME : "activePowerDeliveredL2", UNIT : "W", SIGNED : true, ALIAS: "importedActivePowerL2"},
    "0x2D" : {SIZE : 4, NAME : "activePowerDeliveredL3", UNIT : "W", SIGNED : true, ALIAS: "importedActivePowerL3"},
    "0x2E" : {SIZE : 4, NAME : "activePowerReceivedL1", UNIT : "W", SIGNED : true, ALIAS: "exportedActivePowerL1"},
    "0x2F" : {SIZE : 4, NAME : "activePowerReceivedL2", UNIT : "W", SIGNED : true, ALIAS: "exportedActivePowerL2"},
    "0x30" : {SIZE : 4, NAME : "activePowerReceivedL3", UNIT : "W", SIGNED : true, ALIAS: "exportedActivePowerL3"},
    "0x31" : {SIZE : 2, NAME : "deviceTypeOnChannel1",},
    "0x32" : {SIZE : 0, NAME : "equipmentIdentifierChannel1",},
    "0x33" : {SIZE : 8, NAME : "lastReadingOnChannel1",},
    "0x34" : {SIZE : 2, NAME : "deviceTypeOnChannel2",},
    "0x35" : {SIZE : 0, NAME : "equipmentIdentifierChannel2",},
    "0x36" : {SIZE : 8, NAME : "lastReadingOnChannel2",},
    "0x37" : {SIZE : 2, NAME : "deviceTypeOnChannel3",},
    "0x38" : {SIZE : 0, NAME : "equipmentIdentifierChannel3",},
    "0x39" : {SIZE : 8, NAME : "lastReadingOnChannel3",},
    "0x3A" : {SIZE : 2, NAME : "deviceTypeOnChannel4",},
    "0x3B" : {SIZE : 0, NAME : "equipmentIdentifierChannel4",},
    "0x3C" : {SIZE : 8, NAME : "lastReadingOnChannel4",},
    "0x3D" : {SIZE : 4, NAME : "totalImportedReactiveEnergy", UNIT : "Wh",},
    "0x3E" : {SIZE : 4, NAME : "totalExportedReactiveEnergy", UNIT : "Wh",},
    "0x3F" : {SIZE : 4, NAME : "totalImportedReactivePower", UNIT : "VAR",},
    "0x40" : {SIZE : 4, NAME : "totalExportedReactivePower", UNIT : "VAR",},
    "0x41" : {SIZE : 4, NAME : "activeThreshold", UNIT: "kVA", RESOLUTION : 0.1},
    "0x42" : {SIZE : 4, NAME : "maxImportedExportedCurrent", UNIT : "A", SIGNED : true,},
    "0x43" : {SIZE : 4, NAME : "totalImportedApparentPower", UNIT : "VA",},
    "0x44" : {SIZE : 4, NAME : "totalExportedApparentPower", UNIT : "VA",},
    "0x45" : {SIZE : 1, NAME : "breakerControlState",},
    "0x46" : {SIZE : 1, NAME : "relay1ControlState",},
    "0x47" : {SIZE : 1, NAME : "relay2ControlState",},
    "0x48": {SIZE : 4, NAME : "importedReactivePowerL1", UNIT : "VAR"},
    "0x49": {SIZE : 4, NAME : "importedReactivePowerL2", UNIT : "VAR"},
    "0x4A": {SIZE : 4, NAME : "importedReactivePowerL3", UNIT : "VAR"},
    "0x4B": {SIZE : 4, NAME : "exportedReactivePowerL1", UNIT : "VAR"},
    "0x4C": {SIZE : 4, NAME : "exportedReactivePowerL2", UNIT : "VAR"},
    "0x4D": {SIZE : 4, NAME : "exportedReactivePowerL3", UNIT : "VAR"},
    "0x4E": {SIZE : 1, NAME : "valvePositionGasChannel1",},
    "0x4F": {SIZE : 1, NAME : "valvePositionGasChannel2",},
    "0x50": {SIZE : 1, NAME : "valvePositionGasChannel3",},
    "0x51": {SIZE : 1, NAME : "valvePositionGasChannel4",},
};


function decodeGenericData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    while(index < bytes.length)
    {
        var reg = {};
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.GENERIC_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of generic register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_GENERIC_REGISTERS)){
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
            return decoded;
        }
        reg = DEVICE_GENERIC_REGISTERS[type];
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        if(reg.ALIAS){
            decoded[reg.ALIAS] = reg.DATA;
        }
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

function decodeDeviceData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var reg = {};
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.DEVICE_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                if(!(type in UPLINK.COMMON_REGISTERS)){
                    index = " at index " + (index - 1);
                    decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                    return decoded;
                }
                reg = UPLINK.COMMON_REGISTERS[type];
            }else{
                reg = DEVICE_GENERIC_REGISTERS[type];
            }
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        if(reg.ALIAS){
            decoded[reg.ALIAS] = reg.DATA;
        }
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

function decodeAlarmData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var reg = {};
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if((channel & UPLINK.ALARM_DATA.CHANNEL_BASE) != UPLINK.ALARM_DATA.CHANNEL_BASE){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                if(!(type in UPLINK.COMMON_REGISTERS)){
                    index = " at index " + (index - 1);
                    decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                    return decoded;
                }
                reg = UPLINK.COMMON_REGISTERS[type];
            }else{
                reg = DEVICE_GENERIC_REGISTERS[type];
            }
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        if(reg.ALIAS){
            decoded[reg.ALIAS] = reg.DATA;
        }
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

function decodeHistoricData(bytes)
{
    var decoded = {};
    var channel = 0;
    var type = "";
    var reg = {};
    // package timestamp
    var index = 2; // skip first channel and type
    var packageTimestamp = getValueFromBytesBigEndianFormat(bytes, index, 4);
    var listOfMeasurements = [];
    index = index + 4;
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if((channel & UPLINK.ALARM_DATA.CHANNEL_BASE) != UPLINK.ALARM_DATA.CHANNEL_BASE){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                if(!(type in UPLINK.COMMON_REGISTERS)){
                    index = " at index " + (index - 1);
                    decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                    return decoded;
                }
                reg = UPLINK.COMMON_REGISTERS[type];
            }else{
                reg = DEVICE_GENERIC_REGISTERS[type];
            }
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        var logItem = {};
        var timestampDelta = getValueFromBytesBigEndianFormat(bytes, index, 2);
        index = index + 2;
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        logItem.name = reg.NAME;
        logItem.data = reg.DATA;
        if(reg.ALIAS){
            logItem.alias = reg.ALIAS;
        }
        logItem.ts = packageTimestamp - timestampDelta;
        index = index + reg.DATA_SIZE;
        listOfMeasurements.push(logItem);
    }
    decoded.packageTimestamp = packageTimestamp;
    decoded.listOfMeasurements = listOfMeasurements;
    return decoded;
}

function decodeParameterData(bytes)
{
    var decoded = {};
    var index = 0;
    var channel = 0;
    var type = "";
    var reg = {};
    while(index < bytes.length)
    {
        channel = bytes[index];
        index = index + 1;
        // Channel checking
        if(channel != UPLINK.PARAMETER_DATA.CHANNEL){
            channel = "0x" + byteToEvenHEX(channel);
            index = " at index " + (index - 1);
            decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.CHANNEL + channel + index;
            return decoded;
        }
        // Type of register
        type = "0x" + byteToEvenHEX(bytes[index]);
        index = index + 1;
        if(!(type in DEVICE_SPECIFIC_REGISTERS)){
            if(!(type in DEVICE_GENERIC_REGISTERS)){
                index = " at index " + (index - 1);
                decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.TYPE + type + index;
                return decoded;
            }
            reg = DEVICE_GENERIC_REGISTERS[type];
        }else{
            reg = DEVICE_SPECIFIC_REGISTERS[type];
        }
        // Decoding
        reg.CHANNEL = channel;
        reg.TYPE = type;
        reg.INDEX = index;
        reg = decodeRegister(bytes, reg);
        decoded[reg.NAME] = reg.DATA;
        if(reg.ALIAS){
            decoded[reg.ALIAS] = reg.DATA;
        }
        index = index + reg.DATA_SIZE;
    }
    return decoded;
}

/**  Helper functions  **/

function decodeRegister(bytes, reg)
{
    var data = 0;
    reg.DATA_SIZE = reg.SIZE;
    if(UPLINK.OPTIONAL_KEYS.DIGIT in reg)
    {
        if(reg.DIGIT == false){
            // Decode into "V" + DIGIT STRING + "." DIGIT STRING format
            data = getDigitStringArrayNoFormat(bytes, reg.INDEX, reg.DATA_SIZE);
            data = "V" + data[0] + "." + data[1];
        }else{
            // Decode into DIGIT STRING format
            data = getDigitStringArrayEvenFormat(bytes, reg.INDEX, reg.DATA_SIZE);
            data = data.toString().toUpperCase();
        }
        reg.DATA = data;
        return reg;
    }
    if(UPLINK.OPTIONAL_KEYS.HEX in reg)
    {
        data = getDigitStringArrayEvenFormat(bytes, reg.INDEX, reg.DATA_SIZE);
        data = data.join('').toUpperCase();
        reg.DATA = data;
        return reg;
    }
    if(reg.VALUES){
        // Decode into HEX byte (VALUES specified in reg.VALUES)
        data = "0x" + byteToEvenHEX(bytes[reg.INDEX]);
        data = reg.VALUES[data];
        reg.DATA = data;
        return reg;
    }
    if(reg.LOG){
        // power event logs (byte order little-endian)
        var index = reg.INDEX;
        var decoded = [];
        var len = getValueFromBytesLittleEndianFormat(bytes, index, 4);
        index = index + 4;
        reg.DATA_SIZE = reg.DATA_SIZE + 4;
        for(var i=0; i<len; i=i+1)
        {
            if(index + 8 > bytes.length)
            {
                reg.DATA = decoded;
                return reg;
            }
            var log = {};
            log.timestamp = getValueFromBytesLittleEndianFormat(bytes, index, 4);
            log.duration = getValueFromBytesLittleEndianFormat(bytes, index+4, 4);
            decoded.push(log);
            reg.DATA_SIZE = reg.DATA_SIZE + 8;
            index = index + 8;
        }
        reg.DATA = decoded;
        return reg;
    }
    if(reg.DATA_SIZE == 8)
    {
        // Slave last reading decoding
        var decoded = {};
        decoded.timestamp = getValueFromBytesBigEndianFormat(bytes, reg.INDEX, 4);
        decoded.value = getValueFromBytesBigEndianFormat(bytes, reg.INDEX+4, 4);
        reg.DATA = decoded;
        return reg;
    }
    if(reg.DATA_SIZE == 0)
    {
        reg.DATA_SIZE = getSizeBasedOnChannel(bytes, reg.INDEX, reg.CHANNEL);
        // Decode into STRING format
        data = getStringFromBytesBigEndianFormat(bytes, reg.INDEX, reg.DATA_SIZE);
        reg.DATA = data;
        return reg;
    }
    
    if(reg.NAME == "maxImportedExportedCurrent")
    {
        // Decode into 2xINT16 format
        var decoded = {};
        var val = getValueFromBytesBigEndianFormat(bytes, reg.INDEX, 2);
        val = getSignedIntegerFromInteger(val, 2);
        decoded.maxImportedCurrent = val;
        val = getValueFromBytesBigEndianFormat(bytes, reg.INDEX+2, 2);
        val = getSignedIntegerFromInteger(val, 2);
        decoded.maxExportedCurrent = val;
        reg.DATA = decoded;
        return reg;
    }
    // Decode into DECIMAL format
    data = getValueFromBytesBigEndianFormat(bytes, reg.INDEX, reg.DATA_SIZE);
    if(reg.SIGNED){
        data = getSignedIntegerFromInteger(data, reg.DATA_SIZE);
    }
    if(reg.RESOLUTION){
        data = data * reg.RESOLUTION;
        data = parseFloat(data.toFixed(2));
    }
    reg.DATA = data;
    return reg;
}

function getStringFromBytesBigEndianFormat(bytes, index, size)
{
    var value = "";
    for(var i=0; i<size; i=i+1)
    {
        value = value + String.fromCharCode(bytes[index+i]);
    }
    return value;
}

function getStringFromBytesLittleEndianFormat(bytes, index, size)
{
    var value = "";
    for(var i=(size - 1); i>=0; i=i-1)
    {
        value = value + String.fromCharCode(bytes[index+i]);
    }
    return value;
}

function getValueFromBytesBigEndianFormat(bytes, index, size)
{
    var value = 0;
    for(var i=0; i<(size-1); i=i+1)
    {
        value = (value | bytes[index+i]) << 8; 
    }
    value = value | bytes[index+size-1];
    return (value >>> 0); // to unsigned
}

function getValueFromBytesLittleEndianFormat(bytes, index, size)
{
    var value = 0;
    for(var i=(size-1); i>0; i=i-1)
    {
        value = (value | bytes[index+i]) << 8; 
    }
    value = value | bytes[index];
    return (value >>> 0); // to unsigned
}

function getDigitStringArrayNoFormat(bytes, index, size)
{
  var hexString = []
  for(var i=0; i<size; i=i+1)
  {
    hexString.push(bytes[index+i].toString(16));
  }
  return hexString;
}

function getDigitStringArrayEvenFormat(bytes, index, size)
{
  var hexString = []
  for(var i=0; i<size; i=i+1)
  {
    hexString.push(bytes[index+i].toString(16));
  }
  return hexString.map(toEvenHEX);
}

function toEvenHEX(hex)
{
  if(hex.length == 1)
  {
    return "0"+hex;
  }
  return hex;
}

function byteToEvenHEX(byte)
{
    return toEvenHEX(byte.toString(16).toUpperCase());
}

function getSizeBasedOnChannel(bytes, index, channel)
{
    var size = 0;
    while(index + size < bytes.length && bytes[index + size] != channel)
    {
        size = size + 1;
    }
    return size;
}

function getSignedIntegerFromInteger(integer, size) 
{
    var signMask = 1 << (size * 8 - 1);
    var dataMask = (1 << (size * 8 - 1)) - 1;
    if(integer & signMask) 
    {
        return -(~integer & dataMask) - 1;
    }else 
    {
        return integer & dataMask;
    }
}

/************************************************************************************************************/

// Decode decodes an array of bytes into an object. (ChirpStack v3)
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes, variables) 
{
    var decoded = {};
    if(fPort == 0){
        decoded = {mac: UPLINK.MAC.MSG, fPort: fPort};
    }else if(bytes.length == 1){
        if(bytes[0] == 0){
            decoded[UPLINK.INFO_NAME] = UPLINK.DOWNLINK.SUCCESS;
        }else if(bytes[0] == 1){
            decoded[UPLINK.WARNING_NAME] = UPLINK.DOWNLINK.FAILURE;
        } 
    }else if(fPort >= UPLINK.GENERIC_DATA.FPORT_MIN && fPort <= UPLINK.GENERIC_DATA.FPORT_MAX){
        decoded = decodeGenericData(bytes);
    }else if(fPort >= UPLINK.DEVICE_DATA.FPORT_MIN && fPort <= UPLINK.DEVICE_DATA.FPORT_MAX){
        decoded = decodeDeviceData(bytes);
    }else if(fPort == UPLINK.ALARM_DATA.FPORT){
        decoded = decodeAlarmData(bytes);
    }else if(fPort == UPLINK.HISTORIC_DATA.FPORT){
        decoded = decodeHistoricData(bytes);
    }else if(fPort == UPLINK.PARAMETER_DATA.FPORT){
        decoded = decodeParameterData(bytes);
    }else{
        decoded.fPort = fPort;
        decoded[UPLINK.ERROR_NAME] = UPLINK.ERRORS.FPORT_INCORRECT;
    }
    decoded[VERSION_CONTROL.CODEC.NAME] = VERSION_CONTROL.CODEC.VERSION;
    decoded[VERSION_CONTROL.DEVICE.NAME] = VERSION_CONTROL.DEVICE.MODEL;
    decoded[VERSION_CONTROL.PRODUCT.NAME] = VERSION_CONTROL.PRODUCT.CODE;
    decoded[VERSION_CONTROL.MANUFACTURER.NAME] = VERSION_CONTROL.MANUFACTURER.COMPANY;
    return decoded;
}

// Decode uplink function. (ChirpStack v4, TTN, TTI, LORIOT, ThingPark)
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
function decodeUplink(input) {
    var errors = [];
    var warnings = [];
    var decoded = Decode(input.fPort, input.bytes, input.variables);
    if(UPLINK.ERROR_NAME in decoded){
        errors.push(decoded[UPLINK.ERROR_NAME]);
    }
    if(UPLINK.WARNING_NAME in decoded){
        warnings.push(decoded[UPLINK.WARNING_NAME]);
    }
    return {
        data: decoded,
        errors: errors,
        warnings: warnings
    };
}

/*************************************************************************************************************/
// Constants for device downlink 
var DEVICE = {

    DOWNLINK : {
        TYPE    : "Type",
        CONFIG  : "Config",
        PERIODIC: "Periodic",
        THRESHOLD: "Threshold",
        READING : "Reading"
    },
    CONFIG : {
        FPORT: 50,
        CHANNEL : 255, // 0xFF
        REG_MIN_NUMBER : 1,  // downlink min number of registers
        REG_MAX_NUMBER : 10, // downlink max number of registers
    },
    PERIODIC : {
        FPORT_MIN: 1,
        FPORT_MAX: 5,
        CHANNEL : 255, // 0xFF
        INTERVAL_TYPE : 20, // 0x14
        MODE_TYPE : 21, // 0x15
        STATUS_TYPE : 22, // 0x16
        REGISTERS_TYPE : 23, // 0x17
        REG_MIN_NUMBER : 1,  // downlink min number of registers
        REG_MAX_NUMBER : 10, // downlink max number of registers
    },
    THRESHOLD : {
        FPORT: 11,
        CHANNEL : 255, // 0xFF
        REGISTER_TYPE : 64, // 0x40
        OPERATION_TYPE : 65, // 0x41
        MIN_TYPE : 66, // 0x42
        MAX_TYPE : 67, // 0x43
        DELTA_TYPE : 68, // 0x44
        LOG_INTERVAL_TYPE : 69, // 0x45
        UPLINK_INTERVAL_TYPE : 70, // 0x46
        UPLINK_MODE_TYPE : 71, // 0x47

        OPERATION_VALUES : {
            "DISABLED": 0, // 0b0000
            "MIN": 1,      // 0b0001
            "MAX": 2,      // 0b0010
            "DELTA": 4,    // 0b0100
        },
    },
    READING: {
        FPORT: 100,
        CHANNEL : 255, // 0xFF
        TYPE : 204, // 0xCC
        REG_MIN_NUMBER : 1,  // downlink min number of registers
        REG_MAX_NUMBER : 10, // downlink max number of registers
    },

    REGISTERS : {
        /* device registers */
        // SIZE, MIN and MAX are required if the register is writable (RW permission is "W" or "RW")
        // "registerName": {TYPE: <address>, RW: <"R"/"W"/"RW">, SIZE: <size>, MIN: <min>, MAX: <max> }
        // TH indicates that the register is a threshold register (used in threshold downlinks)

        /* generic registers */
        "deviceStatus": {TYPE: 100, /* 0x64 */ RW:"R",},
        "manufacturer": {TYPE: 101, /* 0x65 */ RW:"R",},
        "originalEquipmentManufacturer": {TYPE: 102, /* 0x66 */ RW:"R",},
        "deviceModel": {TYPE: 103, /* 0x67 */ RW:"R",},
        "deviceSerialNumber": {TYPE: 104, /* 0x68 */ RW:"R",},
        "firmwareVersion": {TYPE: 105, /* 0x69 */ RW:"R",},
        "hardwareVersion": {TYPE: 106, /* 0x6A */ RW:"R",},
        "externalPowerStatus": {TYPE: 107, /* 0x6B */ RW:"R",},
        "batteryPercentage": {TYPE: 108, /* 0x6C */ RW:"R",},
        "batteryVoltage": {TYPE: 109, /* 0x6D */ RW:"R",},
        "rebootDevice": {TYPE: 111, /* 0x6F */ SIZE: 1, MIN: 1, MAX: 1, RW:"W",},
        "internalCircuitTemperatureAlarm": {TYPE: 120, /* 0x78 */ RW:"R",},
        "internalCircuitTemperatureNumberOfAlarms": {TYPE: 121, /* 0x79 */ RW:"R",},
        "internalCircuitTemperature": {TYPE: 122, /* 0x7A */ RW:"R",},
        "internalCircuitHumidity": {TYPE: 123, /* 0x7B */ RW:"R",},
        "ambientTemperature": {TYPE: 130, /* 0x82 */ RW:"R",},
        "ambientHumidity": {TYPE: 131, /* 0x83 */ RW:"R",},
        "joinStatus": {TYPE: 150, /* 0x96 */ RW:"R",},
        "applicationPort": {TYPE: 157, /* 0x9D */ SIZE: 1, MIN: 50, MAX: 99, RW:"RW",},
        "joinType": {TYPE: 158, /* 0x9E */ RW:"RW",},
        "deviceClass": {TYPE: 159, /* 0x9F */ RW:"RW",},
        "adr": {TYPE: 160, /* 0xA0 */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "sf": {TYPE: 161, /* 0xA1 */ SIZE: 1, MIN: 0, MAX: 6, RW:"RW",},
        "restartLoRaWAN": {TYPE: 162, /* 0xA2 */ SIZE: 1, MIN: 1, MAX: 1, RW:"W",},
        "radioMode": {TYPE: 163, /* 0xA3 */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "numberOfJoinAttempts": {TYPE: 164, /* 0xA4 */ SIZE: 1, MIN: 0, MAX: 255, RW:"RW",},
        "linkCheckTimeframe": {TYPE: 165, /* 0xA5 */ SIZE: 2, MIN: 1, MAX: 65535, RW:"RW",},
        "dataRetransmission": {TYPE: 166, /* 0xA6 */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "lorawanWatchdogAlarm": {TYPE: 167, /* 0xA7 */ SIZE: 1, MIN: 0, MAX: 1, RW:"R",},
        "serialWatchdogFunction": {TYPE: 181, /* 0xB5 */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "serialWatchdogTimeout": {TYPE: 182, /* 0xB6 */ SIZE: 2, MIN: 1, MAX: 65535, RW:"RW",},
        "serialWatchdogAlarm": {TYPE: 183, /* 0xB7 */ SIZE: 1, MIN: 0, MAX: 1, RW:"R",},
        "serialStopBits": {TYPE: 176, /* 0xB0 */ SIZE: 1, MIN: 0, MAX: 6, RW:"RW",},
        "serialDataWidth": {TYPE: 177, /* 0xB1 */ SIZE: 1, MIN: 5, MAX: 9, RW:"RW",},
        "serialParity": {TYPE: 178, /* 0xB2 */ SIZE: 1, MIN: 0, MAX: 2, RW:"RW",},
        "serialBaudRate": {TYPE: 179, /* 0xB3 */ SIZE: 4, MIN: 1200, MAX: 115200, RW:"RW",},
        "dsmrProfile": {TYPE: 180, /* 0xB4 */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},
        "decryptionKey": {TYPE: 221, /* 0xDD */ SIZE: 16, RW:"RW", HEX:true,},
        "decryptionFunction": {TYPE: 222, /* 0xDE */ SIZE: 1, MIN: 0, MAX: 1, RW:"RW",},


        /* specific registers */
        "p1Version": {TYPE: 16, /* 0x10 */ RW:"R",},
        "telegramTimestamp": {TYPE: 17, /* 0x11 */ RW:"R",},
        "equipmentIdentifier": {TYPE: 18, /* 0x12 */ RW:"R",},
        "electricityDeliveredToClient": {TYPE: 19, /* 0x13 */ RW:"R", TH:true,},
        "totalImportedActiveEnergy": {TYPE: 19, /* 0x13 */ RW:"R", TH:true, ALIAS:true,},
        "electricityDeliveredToClientT1": {TYPE: 20, /* 0x14 */ RW:"R", TH:true,},
        "electricityDeliveredToClientT2": {TYPE: 21, /* 0x15 */ RW:"R", TH:true,},
        "electricityDeliveredByClient": {TYPE: 22, /* 0x16 */ RW:"R", TH:true,},
        "totalExportedActiveEnergy": {TYPE: 22, /* 0x16 */ RW:"R", TH:true, ALIAS:true,},
        "electricityDeliveredByClientT1": {TYPE: 23, /* 0x17 */ RW:"R", TH:true,},
        "electricityDeliveredByClientT2": {TYPE: 24, /* 0x18 */ RW:"R", TH:true,},
        "tariffIndicator": {TYPE: 25, /* 0x19 */ RW:"R",},
        "electricityPowerDelivered": {TYPE: 26, /* 0x1A */ RW:"R", TH:true,},
        "totalImportedActivePower": {TYPE: 26, /* 0x1A */ RW:"R", TH:true, ALIAS:true,},
        "electricityPowerReceived": {TYPE: 27, /* 0x1B */ RW:"R", TH:true,},
        "totalExportedActivePower": {TYPE: 27, /* 0x1B */ RW:"R", TH:true, ALIAS:true,},
        "numberOfPowerFailures": {TYPE: 28, /* 0x1C */ RW:"R",},
        "numberOfLongPowerFailures": {TYPE: 29, /* 0x1D */ RW:"R",},
        "powerFailureEventLog": {TYPE: 30, /* 0x1E */ RW:"R",},
        "numberOfVoltageSagsL1": {TYPE: 31, /* 0x1F */ RW:"R",},
        "numberOfVoltageSagsL2": {TYPE: 32, /* 0x20 */ RW:"R",},
        "numberOfVoltageSagsL3": {TYPE: 33, /* 0x21 */ RW:"R",},
        "numberOfVoltageSwellsL1": {TYPE: 34, /* 0x22 */ RW:"R",},
        "numberOfVoltageSwellsL2": {TYPE: 35, /* 0x23 */ RW:"R",},
        "numberOfVoltageSwellsL3": {TYPE: 36, /* 0x24 */ RW:"R",},
        "voltageL1": {TYPE: 37, /* 0x25 */ RW:"R", TH:true,},
        "voltageL2": {TYPE: 38, /* 0x26 */ RW:"R", TH:true,},
        "voltageL3": {TYPE: 39, /* 0x27 */ RW:"R", TH:true,},
        "currentL1": {TYPE: 40, /* 0x28 */ RW:"R", TH:true,},
        "currentL2": {TYPE: 41, /* 0x29 */ RW:"R", TH:true,},
        "currentL3": {TYPE: 42, /* 0x2A */ RW:"R", TH:true,},
        "activePowerDeliveredL1": {TYPE: 43, /* 0x2B */ RW:"R", TH:true,},
        "importedActivePowerL1": {TYPE: 43, /* 0x2B */ RW:"R", TH:true, ALIAS:true,},
        "activePowerDeliveredL2": {TYPE: 44, /* 0x2C */ RW:"R", TH:true,},
        "importedActivePowerL2": {TYPE: 44, /* 0x2C */ RW:"R", TH:true, ALIAS:true,},
        "activePowerDeliveredL3": {TYPE: 45, /* 0x2D */ RW:"R", TH:true,},
        "importedActivePowerL3": {TYPE: 45, /* 0x2D */ RW:"R", TH:true, ALIAS:true,},
        "activePowerReceivedL1": {TYPE: 46, /* 0x2E */ RW:"R", TH:true,},
        "exportedActivePowerL1": {TYPE: 46, /* 0x2E */ RW:"R", TH:true, ALIAS:true,},
        "activePowerReceivedL2": {TYPE: 47, /* 0x2F */ RW:"R", TH:true,},
        "exportedActivePowerL2": {TYPE: 47, /* 0x2F */ RW:"R", TH:true, ALIAS:true,},
        "activePowerReceivedL3": {TYPE: 48, /* 0x30 */ RW:"R", TH:true,},
        "exportedActivePowerL3": {TYPE: 48, /* 0x30 */ RW:"R", TH:true, ALIAS:true,},
        "deviceTypeOnChannel1": {TYPE: 49, /* 0x31 */ RW:"R",},
        "equipmentIdentifierChannel1": {TYPE: 50, /* 0x32 */ RW:"R",},
        "lastReadingOnChannel1": {TYPE: 51, /* 0x33 */ RW:"R",},
        "deviceTypeOnChannel2": {TYPE: 52, /* 0x34 */ RW:"R",},
        "equipmentIdentifierChannel2": {TYPE: 53, /* 0x35 */ RW:"R",},
        "lastReadingOnChannel2": {TYPE: 54, /* 0x36 */ RW:"R",},
        "deviceTypeOnChannel3": {TYPE: 55, /* 0x37 */ RW:"R",},
        "equipmentIdentifierChannel3": {TYPE: 56, /* 0x38 */ RW:"R",},
        "lastReadingOnChannel3": {TYPE: 57, /* 0x39 */ RW:"R",},
        "deviceTypeOnChannel4": {TYPE: 58, /* 0x3A */ RW:"R",},
        "equipmentIdentifierChannel4": {TYPE: 59, /* 0x3B */ RW:"R",},
        "lastReadingOnChannel4": {TYPE: 60, /* 0x3C */ RW:"R",},
        "totalImportedReactiveEnergy": {TYPE: 61, /* 0x3D */ RW:"R",},
        "totalExportedReactiveEnergy": {TYPE: 62, /* 0x3E */ RW:"R",},
        "totalImportedReactivePower": {TYPE: 63, /* 0x3F */ RW:"R",},
        "totalExportedReactivePower": {TYPE: 64, /* 0x40 */ RW:"R",},
        "activeThreshold": {TYPE: 65, /* 0x41 */ RW:"R",},
        "maxImportedExportedCurrent": {TYPE: 66, /* 0x42 */ RW:"R",},
        "totalImportedApparentPower": {TYPE: 67, /* 0x43 */ RW:"R",},
        "totalExportedApparentPower": {TYPE: 68, /* 0x44 */ RW:"R",},
        "breakerControlState": {TYPE: 69, /* 0x45 */ RW:"R",},
        "relay1ControlState": {TYPE: 70, /* 0x46 */ RW:"R",},
        "relay2ControlState": {TYPE: 71, /* 0x47 */ RW:"R",},
        "importedReactivePowerL1": {TYPE: 72, /* 0x48 */ RW:"R",},
        "importedReactivePowerL2": {TYPE: 73, /* 0x49 */ RW:"R",},
        "importedReactivePowerL3": {TYPE: 74, /* 0x4A */ RW:"R",},
        "exportedReactivePowerL1": {TYPE: 75, /* 0x4B */ RW:"R",},
        "exportedReactivePowerL2": {TYPE: 76, /* 0x4C */ RW:"R",},
        "exportedReactivePowerL3": {TYPE: 77, /* 0x4D */ RW:"R",},
        "valvePositionGasChannel1": {TYPE: 78, /* 0x4E */ RW:"R",},
        "valvePositionGasChannel2": {TYPE: 79, /* 0x4F */ RW:"R",},
        "valvePositionGasChannel3": {TYPE: 80, /* 0x50 */ RW:"R",},
        "valvePositionGasChannel4": {TYPE: 81, /* 0x51 */ RW:"R",},
    },
    ERRORS : {
        CMD_INVALID: "Invalid command",
        CMD_REGISTER_NOT_FOUND: "Register not found in the device registers",
        CMD_REGISTER_NOT_THRESHOLD: "Register is not a threshold register",
        CMD_REGISTER_NOT_WRITABLE: "Register not writable",
        CMD_REGISTER_NOT_READABLE: "Register not readable",
        CMD_REGISTER_NUMBER_INVALID: "Invalid number of registers",
        CMD_DATA_INVALID: "Invalid data in the command",
        CMD_FPORT_INVALID: "Invalid fPort in the command",
    },
    WARNING_NAME   : "warning",
    ERROR_NAME     : "error",
    INFO_NAME      : "info",
};

/************************************************************************************************************/

// Encode encodes the given object into an array of bytes. (ChirpStack v3)
//  - fPort contains the LoRaWAN fPort number
//  - obj is an object, e.g. {"temperature": 22.5}
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an array of bytes, e.g. [225, 230, 255, 0]
function Encode(fPort, obj, variables) {
    if(!(DEVICE.DOWNLINK.TYPE in obj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.TYPE + " to the command";
        return []; // error
    }
    if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.CONFIG){
        if(fPort != DEVICE.CONFIG.FPORT){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeDeviceConfiguration(obj[DEVICE.DOWNLINK.CONFIG]);
    }else if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.PERIODIC){
        if(fPort < DEVICE.PERIODIC.FPORT_MIN || fPort > DEVICE.PERIODIC.FPORT_MAX){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeUplinkConfiguration(obj[DEVICE.DOWNLINK.PERIODIC]);
    }else if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.THRESHOLD){
        if(fPort != DEVICE.THRESHOLD.FPORT){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeThresholdConfiguration(obj[DEVICE.DOWNLINK.THRESHOLD]);
    }else if(obj[DEVICE.DOWNLINK.TYPE] == DEVICE.DOWNLINK.READING){
        if(fPort != DEVICE.READING.FPORT){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_FPORT_INVALID;
            return []; // error
        }
        return encodeParameterReading(obj[DEVICE.DOWNLINK.READING]);
    }
    DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
        ": please check " + obj[DEVICE.DOWNLINK.TYPE] + " in the command";
    return []; // error
}

// Encode downlink function. (ChirpStack v4 , TTN, TTI, LORIOT, ThingPark)
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {
    var fPort = DEVICE.CONFIG.FPORT; // by default use config fPort (50)
    if(input.data.fPort)
    {
        fPort = input.data.fPort;
    }
    var errors = [];
    var warnings = [];
    var encoded = Encode(fPort, input.data, input.variables);
    if(DEVICE.ERROR_NAME in DEVICE)
    {
        errors.push(DEVICE[DEVICE.ERROR_NAME]);
    }
    if(DEVICE.WARNING_NAME in DEVICE)
    {
        warnings.push(DEVICE[DEVICE.WARNING_NAME]);
    }
    return {
        bytes: encoded,
        fPort: fPort,
        errors: errors,
        warnings : warnings
    };
}


/************************************************************************************************************/


function encodeDeviceConfiguration(cmdArray)
{
    var encoded = [];
    var reg = {};
    var regName = "";

    if(!(cmdArray)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.CONFIG + " array to the command";
        return []; // error
    }
    if(cmdArray.length < DEVICE.CONFIG.REG_MIN_NUMBER ||
        cmdArray.length > DEVICE.CONFIG.REG_MAX_NUMBER){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NUMBER_INVALID + 
            ": please check " + DEVICE.DOWNLINK.CONFIG + " in the command";
        return [];
    }
    
    for(var i=0; i<cmdArray.length; i=i+1)
    {
        var cmdObj = cmdArray[i];
        if(!("Param" in cmdObj) || !("Value" in cmdObj)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add Param and Value to each object in the " + 
            DEVICE.DOWNLINK.CONFIG + " array of the command";
            return []; // error
        }
        regName = cmdObj.Param;
        if(!(regName in DEVICE.REGISTERS)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND + 
                ": please check " + regName + " in the command";
            return []; // error
        }
        reg = DEVICE.REGISTERS[regName];
        if(reg.RW == "R"){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_WRITABLE +
                ": please check " + regName + " in the command";
            return [];  // error
        }
        if(reg.HEX)
        {
            if(typeof cmdObj.Value != "string")
            {
                DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
                    ": please check " + regName + " (its value should be HEX string)";
                return [];  // error
            }
            if(cmdObj.Value.length != 2*reg.SIZE || /^[0-9A-Fa-f]+$/.test(cmdObj.Value) == false)
            {
                DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
                    ": please check " + regName + " (the HEX string is incorrect)";
                return [];  // error
            }
            
            encoded.push(DEVICE.CONFIG.CHANNEL);
            encoded.push(reg.TYPE);
            for (var i = 0; i < cmdObj.Value.length; i = i+2)
            {
                var byteHex = cmdObj.Value.substr(i, 2);
                encoded.push(parseInt(byteHex, 16));
            }
            continue; // encode next config
        }
        if(typeof cmdObj.Value != "number")
        {
            continue; // skip
        }
        if(cmdObj.Value < reg.MIN || cmdObj.Value > reg.MAX){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
                ": please check " + regName + " in the command";
            return []; // error
        }
        encoded.push(DEVICE.CONFIG.CHANNEL);
        encoded.push(reg.TYPE);
        if(reg.SIZE == 4)
        {
            encoded.push((cmdObj.Value >> 24) & 255);
            encoded.push((cmdObj.Value >> 16) & 255);
            encoded.push((cmdObj.Value >> 8) & 255);
            encoded.push(cmdObj.Value & 255);
        }else if(reg.SIZE == 2){
            encoded.push((cmdObj.Value >> 8) & 255);
            encoded.push(cmdObj.Value & 255);
        }else if(reg.SIZE == 1){
            encoded.push(cmdObj.Value);
        }
    }
    return encoded;
}

function encodeUplinkConfiguration(cmdObj)
{
    var encoded = [];
    var reg = {};
    var regName = "";

    if(!(cmdObj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.PERIODIC + " object to the command";
        return []; // error
    }
    if(!("UplinkInterval" in cmdObj) ||  !("Mode" in cmdObj) ||
        !("Status" in cmdObj) || !("Registers" in cmdObj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID;
        return []; // error
    }
    // Encode UplinkInterval, Mode, Status
    if(cmdObj.UplinkInterval < 0 || cmdObj.UplinkInterval > 65535){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
        ": please check UplinkInterval in the command";
        return []; // error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.INTERVAL_TYPE);
    encoded.push((cmdObj.UplinkInterval >> 8) & 255);
    encoded.push(cmdObj.UplinkInterval & 255);

    if(cmdObj.Mode < 0 || cmdObj.Mode > 1){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check Mode in the command";
        return []; // error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.MODE_TYPE);
    encoded.push(cmdObj.Mode);
    
    if(cmdObj.Status < 0 || cmdObj.Status > 1){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check Status in the command";
        return []; // error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.STATUS_TYPE);
    encoded.push(cmdObj.Status);
    // Encode registers
    if(cmdObj.Registers.length < DEVICE.PERIODIC.REG_MIN_NUMBER || 
        cmdObj.Registers.length > DEVICE.PERIODIC.REG_MAX_NUMBER){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NUMBER_INVALID +
            ": please check Registers in the command";
        return [];  // Error
    }
    encoded.push(DEVICE.PERIODIC.CHANNEL);
    encoded.push(DEVICE.PERIODIC.REGISTERS_TYPE);
    for(var i=0; i<cmdObj.Registers.length; i=i+1)
    {
        regName = cmdObj.Registers[i];
        if(!(regName in DEVICE.REGISTERS)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND + 
                ": please check " + regName + " in the command";
            return []; // error (registers not supported)
        }
        reg = DEVICE.REGISTERS[regName];
        if(reg.RW == "W"){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_READABLE +
                ": please check " + regName + " in the command";
            return [];  // error
        }
        encoded.push(reg.TYPE);
    }
    return encoded;
}

function encodeThresholdConfiguration(cmdObj)
{
    var encoded = [];
    var reg = {};
    var regName = "";

    if(!(cmdObj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.THRESHOLD + " object to the command";
        return []; // error
    }
    
    // Encode Register first
    if(!("Register" in cmdObj)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID;
        return []; // error
    }
    regName = cmdObj.Register;
    if(!(regName in DEVICE.REGISTERS)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND +
            ": please check " + regName + " in the command";
        return []; // error
    }
    reg = DEVICE.REGISTERS[regName];
    if(reg.TH != true){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_THRESHOLD +
            ": please check " + regName + " in the command";
        return []; // error
    }
    encoded.push(DEVICE.THRESHOLD.CHANNEL);
    encoded.push(DEVICE.THRESHOLD.REGISTER_TYPE);
    encoded.push(reg.TYPE);

    // Encode LogInterval if available
    if("LogInterval" in cmdObj){
        if(cmdObj.LogInterval <= 0 || cmdObj.LogInterval > 65535){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check LogInterval in the command";
            return []; // error
        }
        encoded.push(DEVICE.THRESHOLD.CHANNEL);
        encoded.push(DEVICE.THRESHOLD.LOG_INTERVAL_TYPE);
        encoded.push((cmdObj.LogInterval >> 8) & 255);
        encoded.push(cmdObj.LogInterval & 255);
    }

    // Encode Operation, MinThreshold, MaxThreshold, DeltaThreshold
    var op = DEVICE.THRESHOLD.OPERATION_VALUES.DISABLED;
    var thresholds = [
        { name: "MinThreshold",   type: DEVICE.THRESHOLD.MIN_TYPE, 
            flag: DEVICE.THRESHOLD.OPERATION_VALUES.MIN,   opKey: "MIN" },
        { name: "MaxThreshold",   type: DEVICE.THRESHOLD.MAX_TYPE,
            flag: DEVICE.THRESHOLD.OPERATION_VALUES.MAX,   opKey: "MAX" },
        { name: "DeltaThreshold", type: DEVICE.THRESHOLD.DELTA_TYPE,
            flag: DEVICE.THRESHOLD.OPERATION_VALUES.DELTA, opKey: "DELTA" }
    ];
    if("Operation" in cmdObj){
        if(!Array.isArray(cmdObj.Operation)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check Operation in the command (it must be an array)";
            return []; // error
        }
        for(var i=0; i<cmdObj.Operation.length; i=i+1){
            var opKey = cmdObj.Operation[i];
            if(!(opKey in DEVICE.THRESHOLD.OPERATION_VALUES)){
                DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
                ": please check Operation in the command (it must be an array with any of the following values: " +
                Object.keys(DEVICE.THRESHOLD.OPERATION_VALUES).toString() + " )";
                return []; // error
            }
            op = op | DEVICE.THRESHOLD.OPERATION_VALUES[opKey];
        }
        encoded.push(DEVICE.THRESHOLD.CHANNEL);
        encoded.push(DEVICE.THRESHOLD.OPERATION_TYPE);
        encoded.push(op);
    }

    var warnings = "";
    for (var i = 0; i < thresholds.length; i++) {
        var th = thresholds[i];
        if (th.name in cmdObj) {
            var value = cmdObj[th.name];
            encoded.push(DEVICE.THRESHOLD.CHANNEL);
            encoded.push(th.type);
            encoded.push((value >> 24) & 255);
            encoded.push((value >> 16) & 255);
            encoded.push((value >> 8) & 255);
            encoded.push(value & 255);
        }
        if ((op & th.flag) === th.flag) {
            if (!(th.name in cmdObj)) {
                warnings += "Threshold operation includes " + th.opKey +
                            ", but " + th.name + " is not present in this command. ";
            }
        }
    }
    if(warnings != ""){
        DEVICE[DEVICE.WARNING_NAME] = warnings;
    }

    // Encode UplinkInterval if available
    if("UplinkInterval" in cmdObj){
        if(cmdObj.UplinkInterval < 0 || cmdObj.UplinkInterval > 65535){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check UplinkInterval in the command";
            return []; // error
        }
        encoded.push(DEVICE.THRESHOLD.CHANNEL);
        encoded.push(DEVICE.THRESHOLD.UPLINK_INTERVAL_TYPE);
        encoded.push((cmdObj.UplinkInterval >> 8) & 255);
        encoded.push(cmdObj.UplinkInterval & 255);
    }

    // Encode UplinkMode if available
    if("UplinkMode" in cmdObj){
        if(cmdObj.UplinkMode < 0 || cmdObj.UplinkMode > 1){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_DATA_INVALID +
            ": please check UplinkMode in the command";
            return []; // error
        }
        encoded.push(DEVICE.THRESHOLD.CHANNEL);
        encoded.push(DEVICE.THRESHOLD.UPLINK_MODE_TYPE);
        encoded.push(cmdObj.UplinkMode);
    }
    return encoded;
}

function encodeParameterReading(cmdArray)
{
    var encoded = [];
    var reg = {};
    var regName = "";
    if(!(cmdArray)){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_INVALID + 
            ": please add " + DEVICE.DOWNLINK.READING + " array to the command";
        return []; // error
    }
    if(cmdArray.length < DEVICE.READING.REG_MIN_NUMBER ||
        cmdArray.length > DEVICE.READING.REG_MAX_NUMBER){
        DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NUMBER_INVALID +
            ": please check " + DEVICE.DOWNLINK.READING + " in the command";
        return []; // error
    }
    encoded.push(DEVICE.READING.CHANNEL);
    encoded.push(DEVICE.READING.TYPE);
    for(var i=0; i<cmdArray.length; i=i+1)
    {
        regName = cmdArray[i];
        if(!(regName in DEVICE.REGISTERS)){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_FOUND +
                ": please check " + regName + " in the command";
            return []; // error
        }
        reg = DEVICE.REGISTERS[regName];
        if(reg.RW == "W"){
            DEVICE[DEVICE.ERROR_NAME] = DEVICE.ERRORS.CMD_REGISTER_NOT_READABLE +
                ": please check " + regName + " in the command";
            return [];  // error
        }
        encoded.push(reg.TYPE);
    }
    return encoded;
}