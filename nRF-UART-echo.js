var util = require('util');
var bleno = require('bleno');

const UART_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"; // SERVICE
const TX_UUID   = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"; // CHARACTERISTIC
const RX_UUID   = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"; // CHARACTERISTIC
const CCCD      = "00002902-0000-1000-8000-00805f9b34fb"; // DESCRIPTOR


console.log("Starting Bleno nRF-UART Echo");

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('nRFUART', [UART_UUID], function(err) {
        console.log(err);
    });
  } else {
    console.log("will stopAdvertising");
    bleno.stopAdvertising();
  }
});


var rx = null;
var tx = null;

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    rx = new NrfUartRxCharacteristic();
    tx = new NrfUartTxCharacteristic();
    result = bleno.setServices([
      new bleno.PrimaryService({
        uuid: UART_UUID,
        characteristics: [ tx, rx ]
      })
    ]);
  }
});

/***************************************/
var NrfUartTxCharacteristic = function() {
    console.log("Tx constructor");
    NrfUartTxCharacteristic.super_.call(this, {
        uuid: TX_UUID, 
        properties: [ 'write' ],
    });
};
util.inherits(NrfUartTxCharacteristic, bleno.Characteristic);
NrfUartTxCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log('NrfUartTxCharacteristic - onWriteRequest: value = ' + data.toString('hex') + ' - ' + data);
  if (rx && rx._updateValueCallback) {
    rx._updateValueCallback(data);
  }
  callback(this.RESULT_SUCCESS);
};

module.exports = NrfUartTxCharacteristic;


/***************************************/
var NrfUartRxCharacteristic = function() {
    console.log("Rx constructor");
    NrfUartRxCharacteristic.super_.call(this, {
        uuid: RX_UUID, 
        properties: [ 'notify' ],
        descriptors: [
          new bleno.Descriptor({
            uuid: CCCD,
            value: 1
          })
        ] 

    });
    this._updateValueCallback = null;
};
util.inherits(NrfUartRxCharacteristic, bleno.Characteristic);
NrfUartRxCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    this._updateValueCallback = updateValueCallback;
};

NrfUartRxCharacteristic.prototype.onUnsubscribe = function() {
    this._updateValueCallback = null;
};
module.exports = NrfUartRxCharacteristic;
