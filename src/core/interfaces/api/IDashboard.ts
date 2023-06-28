export interface IESocialPropsDto {
  processing?: number;
  pending?: number;
  done?: number;
  transmitted?: number;
  rejected?: number;
}

export interface IDailyCompanyReport {
  exam: {
    good?: number;
    expired?: number;
    schedule?: number;
    all?: number;
    expiredClose1?: number;
    expiredClose2?: number;
  };
  esocial: {
    pending?: number;
    processing?: number;
    done?: number;
    transmitted?: number;
    rejected?: number;
    ['S2240']?: IESocialPropsDto;
    ['S2220']?: IESocialPropsDto;
    ['S2210']?: IESocialPropsDto;
  };
}

export interface IDashboard {
  id?: number;
  companyId?: string;
  lastDailyReport?: Date;
  dailyReport?: IDailyCompanyReport;
}
