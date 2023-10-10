export interface Device {
    id?: number;
    type_id?: number;
    label?: string;
    name?: string;
    manufacture?: string;
    description?: string;
    bms_id?: string;
    status?: string;
    other_data?: { [key: string]: any };
}

export interface DeviceType {
    id?: number;
    name?: string;
    manufacture?: string;
    description?: string;
    other_data?: { [key: string]: any };
}