export interface Device {
    id?: number;
    typeId?: number;
    label?: string;
    name?: string;
    manufacture?: string;
    description?: string;
    bms_id?: string;
    status?: string;
    otherData?: { [key: string]: any };
}