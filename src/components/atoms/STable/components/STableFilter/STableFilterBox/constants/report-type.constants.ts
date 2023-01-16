export enum ReportDownloadtypeEnum {
  XML = 'XML',
  HTML = 'HTML',
  PDF = 'PDF',
}

type IMap = Record<
  ReportDownloadtypeEnum,
  {
    value: ReportDownloadtypeEnum;
    name: string;
  }
>;

export const reportDownloadtypeMap: IMap = {
  [ReportDownloadtypeEnum.XML]: {
    value: ReportDownloadtypeEnum.XML,
    name: 'Excel',
  },
  [ReportDownloadtypeEnum.HTML]: {
    value: ReportDownloadtypeEnum.HTML,
    name: 'PDF',
  },
  [ReportDownloadtypeEnum.PDF]: {
    value: ReportDownloadtypeEnum.PDF,
    name: 'HTML',
  },
};

export const reportDownloadtypeList = [
  reportDownloadtypeMap[ReportDownloadtypeEnum.XML],
  reportDownloadtypeMap[ReportDownloadtypeEnum.PDF],
  reportDownloadtypeMap[ReportDownloadtypeEnum.HTML],
];
