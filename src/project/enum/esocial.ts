import { ITableRowStatus } from 'components/atoms/STable';

export enum ESocialSendEnum {
  MODIFIED = 'MODIFIED',
  SEND = 'SEND',
  EXCLUDE = 'EXCLUDE',
}

export const esocialSendMap: Record<
  ESocialSendEnum,
  {
    value: ESocialSendEnum;
    content: string;
    color?: string;
    rowStatus?: ITableRowStatus;
  }
> = {
  [ESocialSendEnum.MODIFIED]: {
    value: ESocialSendEnum.MODIFIED,
    content: 'Retificação',
    color: 'info.main',
    rowStatus: 'info',
  },
  [ESocialSendEnum.SEND]: {
    value: ESocialSendEnum.SEND,
    content: 'Envio',
    rowStatus: 'none',
  },
  [ESocialSendEnum.EXCLUDE]: {
    value: ESocialSendEnum.EXCLUDE,
    content: 'Excluir',
    color: 'error.main',
    rowStatus: 'inactive',
  },
};

export const employeeExamEvaluationTypeList = [
  esocialSendMap[ESocialSendEnum.SEND],
  esocialSendMap[ESocialSendEnum.MODIFIED],
  esocialSendMap[ESocialSendEnum.EXCLUDE],
];
