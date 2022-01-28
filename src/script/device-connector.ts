const UNIT_SERVICE_UUID = 'be75903a-14b3-11ec-a7df-e069953c4ba2';
const PITCH_ROLL_CHARACTERISTIC_UUID = 'd6c77054-14b3-11ec-b16c-e069953c4ba2';
const WINCH_CONTROL_CHARACTERISTIC_UUID = '4eae0d40-699f-11ec-b55b-e069953c4ba2';

export class DeviceConnector {
  private static device: BluetoothDevice;

  public static isWebBluetoothSupported: boolean =  navigator.bluetooth ? true : false;

  public static async connect(disconnectCallback: () => Promise<void>): Promise<BluetoothRemoteGATTCharacteristic[]> {
    const options = {
      acceptAllDevices: false,
      filters: [{ services: [UNIT_SERVICE_UUID] }],
      optionalServices: [UNIT_SERVICE_UUID],
    };

    DeviceConnector.device = await navigator.bluetooth.requestDevice(options);

    DeviceConnector.device.addEventListener('gattserverdisconnected', async event => {
      await disconnectCallback();
    });

    const server = await DeviceConnector.device.gatt.connect();
    const service = await server.getPrimaryService(UNIT_SERVICE_UUID);
    const pitchRollCharacteristic = await service.getCharacteristic(PITCH_ROLL_CHARACTERISTIC_UUID);
    const winchControlCharacteristic = await service.getCharacteristic(WINCH_CONTROL_CHARACTERISTIC_UUID);
    return [pitchRollCharacteristic, winchControlCharacteristic];
  }

  public static disconnect(): boolean {
    if (DeviceConnector.device) {
      DeviceConnector.device.gatt.disconnect();
      return true;
    }
    return false;
  }
}
