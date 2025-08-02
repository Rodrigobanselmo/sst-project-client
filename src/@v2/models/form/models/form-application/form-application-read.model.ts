import { dateUtils } from '@v2/utils/date-utils';
import { FormQuestionGroupReadModel } from '../shared/form-question-group-read.model';
import { FormApplicationStatusEnum } from '../../enums/form-status.enum';

export type IFormApplicationReadModel = {
  id: string;
  name: string;
  companyId: string;
  description: string | undefined;
  createdAt: Date;
  status: FormApplicationStatusEnum;
  updatedAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  form: { id: string; name: string };
  isShareableLink: boolean;
  isAnonymous: boolean;
  participants: {
    hierarchies: { id: string; name: string }[];
    workspaces: { id: string; name: string }[];
  };
  questionIdentifierGroup: FormQuestionGroupReadModel;
};

export class FormApplicationReadModel {
  id: string;
  companyId: string;
  name: string;
  description: string | undefined;
  createdAt: Date;
  status: FormApplicationStatusEnum;
  updatedAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  form: { id: string; name: string };
  isShareableLink: boolean;
  isAnonymous: boolean;
  participants: {
    hierarchies: { id: string; name: string }[];
    workspaces: { id: string; name: string }[];
  };
  questionIdentifierGroup: FormQuestionGroupReadModel;

  constructor(params: IFormApplicationReadModel) {
    this.id = params.id;
    this.companyId = params.companyId;
    this.name = params.name;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.status = params.status;
    this.updatedAt = params.updatedAt;
    this.startedAt = params.startedAt;
    this.endedAt = params.endedAt;
    this.form = params.form;
    this.participants = params.participants;
    this.isShareableLink = params.isShareableLink;
    this.isAnonymous = params.isAnonymous;
    this.questionIdentifierGroup = new FormQuestionGroupReadModel(
      params.questionIdentifierGroup,
    );
  }

  get formatCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatUpdatedAt() {
    return dateUtils(this.updatedAt).format('DD/MM/YYYY');
  }

  get formatStartedAt() {
    return this.startedAt
      ? dateUtils(this.startedAt).format('DD/MM/YYYY')
      : null;
  }

  get formatEndedAt() {
    return this.endedAt ? dateUtils(this.endedAt).format('DD/MM/YYYY') : null;
  }
}
