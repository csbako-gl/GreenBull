export interface Device {
    id?: number;
    typeId?: number;
    label?: string;
    name?: string;
    manufacture?: string;
    description?: string;
    status?: string;
    otherData?: { [key: string]: any };
}