export declare class CreateMaintenanceRecordDto {
    moldId: number;
    type: string;
    content: string;
    recordDate: string;
}
export declare class QueryMaintenanceRecordDto {
    moldId?: number;
    operatorId?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
