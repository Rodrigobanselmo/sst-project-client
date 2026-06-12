import { dateUtils } from '@v2/utils/date-utils';
import { FormApplicationStatusEnum } from '../../enums/form-status.enum';
import { FormTypeEnum } from '../../enums/form-type.enum';

type IFormResultModel = {
  id: number;
  name: string;
  type: FormTypeEnum;
  system: boolean;
};

export type IFormApplicationBrowseResultModel = {
  id: string;
  name: string;
  description: string | undefined;
  status: FormApplicationStatusEnum;
  endDate: Date | undefined;
  startDate: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  companyName?: string | null;
  companyFantasy?: string | null;
  companyInitials?: string | null;
  totalAnswers: number;
  totalParticipants: number;
  averageTimeSpent?: number | null;
  isBusinessGroupApplication?: boolean;
  currentCompanyParticipants?: number | null;
  currentCompanyAnswers?: number | null;
  form: IFormResultModel;
};

export class FormApplicationBrowseResultModel {
  id: string;
  name: string;
  description: string | undefined;
  status: FormApplicationStatusEnum;
  endDate: Date | undefined;
  startDate: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  companyName: string | null;
  companyFantasy: string | null;
  companyInitials: string | null;
  totalAnswers: number;
  totalParticipants: number;
  averageTimeSpent: number | null;
  isBusinessGroupApplication: boolean;
  currentCompanyParticipants: number | null;
  currentCompanyAnswers: number | null;
  form: IFormResultModel;

  constructor(params: IFormApplicationBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.status = params.status;
    this.endDate = params.endDate;
    this.startDate = params.startDate;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.companyId = params.companyId;
    this.companyName = params.companyName ?? null;
    this.companyFantasy = params.companyFantasy ?? null;
    this.companyInitials = params.companyInitials ?? null;

    this.totalParticipants = params.totalParticipants;
    this.totalAnswers = params.totalAnswers;
    this.averageTimeSpent = params.averageTimeSpent ?? null;
    this.isBusinessGroupApplication = params.isBusinessGroupApplication ?? false;
    this.currentCompanyParticipants = params.currentCompanyParticipants ?? null;
    this.currentCompanyAnswers = params.currentCompanyAnswers ?? null;
    this.form = params.form;
  }

  get formattedStartDate() {
    return this.startDate ? dateUtils(this.startDate).format('MM/YYYY') : null;
  }

  get formattedEndDate() {
    return this.endDate ? dateUtils(this.endDate).format('MM/YYYY') : null;
  }

  get formattedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formattedUpdatedAt() {
    return dateUtils(this.updatedAt).format('DD/MM/YYYY');
  }

  get formattedTotal() {
    if (!this.totalParticipants) return this.totalAnswers;

    return `${this.totalAnswers} / ${this.totalParticipants}`;
  }
}
