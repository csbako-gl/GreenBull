export interface BatteryData {
    id?: number;
    deviceId?: number;
    date?: Date;
    cell?: number[];
    temperature?: number[];
    packTotal?: number;
    packCurrent?: number;
    packRemain?: number;
    cycleTimes?: number;
    other?: { [key: string]: any };
}