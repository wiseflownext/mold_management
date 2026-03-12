declare class ProductDto {
    customer?: string;
    model?: string;
    name: string;
    partNumber?: string;
}
export declare class CreateMoldDto {
    moldNumber: string;
    type: string;
    workshopId?: number;
    firstUseDate?: string;
    designLife: number;
    maintenanceCycle: number;
    products?: ProductDto[];
}
export declare class UpdateMoldDto {
    type?: string;
    workshopId?: number;
    designLife?: number;
    maintenanceCycle?: number;
    status?: string;
}
export declare class UpdateDesignLifeDto {
    newDesignLife: number;
    reportUrl: string;
}
export declare class QueryMoldDto {
    keyword?: string;
    status?: string;
    type?: string;
    workshopId?: number;
    page?: number;
    pageSize?: number;
}
export {};
