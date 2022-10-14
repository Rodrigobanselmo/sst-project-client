export interface DailyCompanyReportDto {
  exam: {
    good?: number;
    expired?: number;
    schedule?: number;
    all?: number;
    expired30?: number;
    expired90?: number;
  };
}

export interface IDashboard {
  id?: number;
  companyId?: string;
  lastDailyReport?: Date;
  dailyReport?: DailyCompanyReportDto;
}
