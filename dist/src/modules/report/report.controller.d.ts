import { Response } from 'express';
import { ReportService } from './report.service';
export declare class ReportController {
    private service;
    constructor(service: ReportService);
    exportUsage(res: Response, moldId?: string, startDate?: string, endDate?: string): Promise<void>;
    exportMaintenance(res: Response, moldId?: string, startDate?: string, endDate?: string): Promise<void>;
}
