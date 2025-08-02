import { FormTypeEnum } from '../../enums/form-type.enum';
import { FormQuestionGroupReadModel } from '../shared/form-question-group-read.model';
import { FormQuestionReadModel } from '../shared/form-question-read.model';

export type IFormApplicationReadPublicModel = {
  id: string;
  name: string;
  description: string | undefined;
  form: {
    name: string;
    type: FormTypeEnum;
    questionGroups: FormQuestionGroupReadModel[];
  };
  questionIdentifierGroup: FormQuestionGroupReadModel;
};

export class FormApplicationReadPublicModel {
  id: string;
  name: string;
  description: string | undefined;
  form: {
    name: string;
    type: FormTypeEnum;
    questionGroups: FormQuestionGroupReadModel[];
  };
  questionIdentifierGroup: FormQuestionGroupReadModel;

  constructor(params: IFormApplicationReadPublicModel) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.form = {
      name: params.form.name,
      type: params.form.type,
      questionGroups: params.form.questionGroups.map(
        (questionGroup) => new FormQuestionGroupReadModel(questionGroup),
      ),
    };
    this.questionIdentifierGroup = new FormQuestionGroupReadModel(
      params.questionIdentifierGroup,
    );
  }

  get groups() {
    return [this.questionIdentifierGroup, ...this.form.questionGroups];
  }
}
