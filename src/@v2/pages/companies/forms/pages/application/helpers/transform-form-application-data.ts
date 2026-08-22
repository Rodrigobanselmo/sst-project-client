import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { EditFormApplicationParams } from '@v2/services/forms/form-application/edit-form-application/service/edit-form-application.service';
import { IFormApplicationFormFields } from '../schema/form-application.schema';

function mapIdentifierTypeToQuestionType(
  identifierType: FormIdentifierTypeEnum,
): FormQuestionTypeEnum {
  return FormQuestionTypeEnum.RADIO;
}

export function transformFormApplicationDataToApiFormat(
  data: IFormApplicationFormFields,
) {
  if (data.sections.length === 0) {
    throw new Error('Não há seções para aplicar o questionário');
  }

  const identifierSection = data.sections[0];

  const identifier = {
    name: data.name,
    description: identifierSection.description,
    questions: identifierSection.items.map((item) => ({
      id: item.id,
      required: item.required,
      details: {
        text: item.content,
        type:
          item.detailsQuestionType ??
          mapIdentifierTypeToQuestionType(item.type.value),
        identifierType: item.type.value,
        acceptOther: item.acceptOther ?? false,
      },
      options:
        item.options?.map((option) => ({
          id: option.apiId,
          text: option.label,
          ...(option.responseValue !== undefined
            ? { value: option.responseValue }
            : {}),
        })) || [],
    })),
  };

  return identifier;
}

/** Espelha `FormApplicationEntity.hasStarted` na API. */
export function isFormApplicationStructureLocked(params: {
  status?: FormApplicationStatusEnum | string | null;
  startedAt?: Date | string | null;
}) {
  if (params.status === FormApplicationStatusEnum.INACTIVE) return false;
  return !!params.startedAt;
}

export function buildEditFormApplicationMutationPayload(params: {
  companyId: string;
  applicationId: string;
  data: IFormApplicationFormFields;
  status?: FormApplicationStatusEnum | string | null;
  startedAt?: Date | string | null;
}): EditFormApplicationParams {
  const payload: EditFormApplicationParams = {
    companyId: params.companyId,
    applicationId: params.applicationId,
    name: params.data.name,
    description: params.data.description,
    shareableLink: params.data.shareableLink.value === 'true',
    anonymous: params.data.anonymous,
    participationGoal: params.data.participationGoal,
    bannerIntroText: params.data.bannerIntroText?.trim() || '',
    bannerWhyText: params.data.bannerWhyText?.trim() || '',
    bannerContactText: params.data.bannerContactText?.trim() || '',
  };

  if (isFormApplicationStructureLocked(params)) {
    return payload;
  }

  return {
    ...payload,
    formId: params.data.form.id,
    hierarchyIds: [],
    workspaceIds: params.data.workspaceIds.map((workspace) => workspace.id),
    identifier: transformFormApplicationDataToApiFormat(params.data),
  };
}
