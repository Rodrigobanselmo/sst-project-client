import { MessageEnum } from 'project/enum/message.enum';

import { IUser } from './IUser';

export interface IMessage {
  message?: string;
  title?: string;
  subtitle?: string;
  type?: MessageEnum;
}

export interface INotification {
  id: number;
  created_at: Date;
  json: IMessage;
  repeatId: string;
  isClinic: boolean;
  isConsulting: boolean;
  isCompany: boolean;
  isAll: boolean;
  system: boolean;
  companyId: string;
  confirmations?: IUser[];
}
