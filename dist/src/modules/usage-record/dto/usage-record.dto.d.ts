export declare class CreateUsageRecordDto {
    moldId: number;
    product: string;
    quantity: number;
    shift: string;
    recordDate: string;
    note?: string;
}
export declare class QueryUsageRecordDto {
    moldId?: number;
    operatorId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
}
