export interface BatteryData {
    id?: number;
    deviceId?: number;
    date?: Date;
    cell?: number[];
    temperature?: number[];
    pakfeszultseg?: number;
    toltesmerites?: number;
    toltesszint?: number;
    ciklusszam?: number;
    other?: { [key: string]: any };
}