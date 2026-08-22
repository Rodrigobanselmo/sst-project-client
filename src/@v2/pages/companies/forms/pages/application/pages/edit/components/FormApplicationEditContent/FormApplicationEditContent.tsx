import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { FormQuestionsButtons } from '@v2/pages/companies/forms/components/FormQuestionsButtons/FormQuestionsButtons';
import { SFormQuestionSection } from '@v2/pages/companies/forms/components/SFormSection/SFormSection';
import { useMutateEditFormApplication } from '@v2/services/forms/form-application/edit-form-application/hooks/useMutateEditFormApplication';
import {
  FormPreliminaryLibraryBlockDetailApi,
  FormPreliminaryLibraryQuestionListItemApi,
} from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { AddLibraryBlockDialog } from '../../../../components/AddLibraryBlockDialog/AddLibraryBlockDialog';
import { AddLibraryQuestionDialog } from '../../../../components/AddLibraryQuestionDialog/AddLibraryQuestionDialog';
import { getInsertIndexForLibraryQuestion } from '../../../../helpers/get-insert-index-for-library-question';
import { mapLibraryBlockToFormIdentifierItems } from '../../../../helpers/map-library-block-to-form-identifier-items';
import { mapLibraryQuestionToFormIdentifierItem } from '../../../../helpers/map-library-question-to-form-identifier-item';
import { getFormModelInitialValues } from '../../../../../model/schemas/form-model.schema';
import {
  buildEditFormApplicationMutationPayload,
  isFormApplicationStructureLocked,
} from '../../../../helpers/transform-form-application-data';
import {
  buildFormApplicationScopeFormDefaults,
  formApplicationFormInitialValues,
  IFormApplicationFormFields,
  schemaFormApplicationForm,
} from '../../../../schema/form-application.schema';
import {
  getFormApplicationEditorSnapshot,
  isFormApplicationEditorDirty,
} from '../../../../schema/form-application-editor-dirty';
import {
  FormIdentifierTypeList,
  getDisbleCreateFormIdentifierQuestion,
  getFormIdentifierTypeList,
} from '../../../../components/FormApplicationForms/constants/form-Identifier-type.map';
import { FormFormApplication } from '../../../../components/FormApplicationForms/components/FormFormApplication';

type FormApplicationEditorBaseline = ReturnType<
  typeof getFormApplicationEditorSnapshot
>;

function FormApplicationEditFooter({
  baselineRef,
  onSubmit,
  onSubmitAndExit,
  onCancel,
  loading,
}: {
  baselineRef: MutableRefObject<FormApplicationEditorBaseline>;
  onSubmit: () => Promise<void> | void;
  onSubmitAndExit: () => Promise<void> | void;
  onCancel: () => void;
  loading: boolean;
}) {
  const form = useFormContext<IFormApplicationFormFields>();
  const watchedValues = useWatch({ control: form.control });
  const isDirty = isFormApplicationEditorDirty(
    watchedValues,
    baselineRef.current,
  );

  return (
    <FormQuestionsButtons
      onSubmit={onSubmit}
      onSubmitAndExit={onSubmitAndExit}
      showSaveAndExit={true}
      isDirty={isDirty}
      onCancel={onCancel}
      errors={form.formState.errors}
      loading={loading}
    />
  );
}

export const FormApplicationEditContent = ({
  companyId,
  formApplication,
}: {
  companyId: string;
  formApplication: FormApplicationReadModel;
}) => {
  const router = useAppRouter();

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [libraryBlockDialogOpen, setLibraryBlockDialogOpen] = useState(false);

  const hasAnswers = formApplication.totalAnswers > 0;

  const form = useForm<IFormApplicationFormFields>({
    resolver: yupResolver(schemaFormApplicationForm),
    defaultValues: {
      ...formApplicationFormInitialValues,
      name: formApplication.name,
      description: formApplication.description || '',
      bannerIntroText: formApplication.bannerIntroText || '',
      bannerWhyText: formApplication.bannerWhyText || '',
      bannerContactText: formApplication.bannerContactText || '',
      form: {
        id: formApplication.form.id,
        name: formApplication.form.name,
        type: formApplication.form.type,
      },
      shareableLink: formApplication.isShareableLink
        ? { value: 'true', label: 'Link único compartilhável' }
        : { value: 'false', label: 'Link por funcionário' },
      anonymous: formApplication.isAnonymous,
      participationGoal: formApplication.participationGoal,
      ...buildFormApplicationScopeFormDefaults({
        scopeType: formApplication.scopeType,
        companyGroupId: formApplication.companyGroupId,
        companies: formApplication.participants.companies,
        workspaces: formApplication.participants.workspaces,
      }),
      // Transform questionIdentifierGroup data to sections format
      sections: formApplication.questionIdentifierGroup
        ? [
            {
              id: formApplication.questionIdentifierGroup.id,
              title: formApplication.questionIdentifierGroup.name,
              description:
                formApplication.questionIdentifierGroup.description || '',
              items: formApplication.questionIdentifierGroup.questions.map(
                (question) => ({
                  id: question.id,
                  content: question.details.text || '',
                  required: question.required,
                  disabledEdition: false,
                  disableDuplication: false,
                  detailsQuestionType: question.details.type,
                  acceptOther: question.details.acceptOther,
                  type: {
                    value: question.details.identifierType,
                    label:
                      FormIdentifierTypeTranslate[
                        question.details.identifierType
                      ],
                  },
                  options: (question.options ?? []).map((option) => ({
                    apiId: option.id,
                    label: option.text,
                    value:
                      option.value !== undefined && option.value !== null
                        ? String(option.value)
                        : '',
                    ...(typeof option.value === 'number'
                      ? { responseValue: option.value }
                      : {}),
                  })),
                  risks: question.details.risks,
                }),
              ),
            },
          ]
        : [],
    },
  });

  const formType = useWatch({ name: 'form.type', control: form.control });
  const baselineRef = useRef(
    getFormApplicationEditorSnapshot(form.getValues()),
  );

  const editFormMutation = useMutateEditFormApplication();

  const handlePickLibraryQuestion = useCallback(
    (libraryQuestion: FormPreliminaryLibraryQuestionListItemApi) => {
      const mapped = mapLibraryQuestionToFormIdentifierItem(libraryQuestion);
      const items = form.getValues('sections.0.items') ?? [];
      const insertAt = getInsertIndexForLibraryQuestion(items, formType);
      const next = [...items];
      next.splice(insertAt, 0, mapped);
      form.setValue('sections.0.items', next);
      setLibraryDialogOpen(false);
    },
    [form, formType],
  );

  const handlePickLibraryBlock = useCallback(
    (block: FormPreliminaryLibraryBlockDetailApi) => {
      const mappedItems = mapLibraryBlockToFormIdentifierItems(block);
      const items = form.getValues('sections.0.items') ?? [];
      const insertAt = getInsertIndexForLibraryQuestion(items, formType);
      const next = [...items];
      next.splice(insertAt, 0, ...mappedItems);
      form.setValue('sections.0.items', next);
      setLibraryBlockDialogOpen(false);
    },
    [form, formType],
  );

  const persist = async (data: IFormApplicationFormFields) => {
    form.clearErrors();

    if (
      !isFormApplicationStructureLocked({
        status: formApplication.status,
        startedAt: formApplication.startedAt,
      }) &&
      data.sections.length === 0
    ) {
      form.setError('sections', {
        message: 'Não há seções para aplicar o questionário',
      });
      return false;
    }

    try {
      await editFormMutation.mutateAsync(
        buildEditFormApplicationMutationPayload({
          companyId,
          applicationId: formApplication.id,
          data,
          status: formApplication.status,
          startedAt: formApplication.startedAt,
        }),
      );
      baselineRef.current = getFormApplicationEditorSnapshot(form.getValues());
      return true;
    } catch {
      return false;
    }
  };

  const onSubmitStay = form.handleSubmit(async (data) => {
    await persist(data);
  });

  const onSubmitExit = form.handleSubmit(async (data) => {
    const saved = await persist(data);
    if (!saved) return;
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.VIEW, {
      pathParams: { companyId, id: formApplication.id },
    });
  });

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
    });
  };

  const disableCreateFormIdentifierQuestion =
    getDisbleCreateFormIdentifierQuestion(formApplication.form.type);

  const questionsTypeOptions = getFormIdentifierTypeList(
    formApplication.form.type,
  );

  return (
    <SForm form={form}>
      <SFormSection mb={8}>
        <FormFormApplication companyId={companyId} disabled={true} />
      </SFormSection>

      <SFormQuestionSection
        companyId={companyId}
        questionTypeOptions={questionsTypeOptions}
        sectionIndex={0}
        sectionNumber={1}
        isMinimized={false}
        hideInputTitle={true}
        title={() => 'Dados Gerais'}
        descriptionPlaceholder="Instruções do questionário (opcional)"
        initialValues={getFormModelInitialValues()}
        disableQuestionDuplication={disableCreateFormIdentifierQuestion}
        disableQuestionCreation={disableCreateFormIdentifierQuestion}
        disableRequiredSwitch={disableCreateFormIdentifierQuestion}
        onAddFromLibrary={
          hasAnswers ? undefined : () => setLibraryDialogOpen(true)
        }
        onAddBlockFromLibrary={
          hasAnswers ? undefined : () => setLibraryBlockDialogOpen(true)
        }
        structureFrozen={hasAnswers}
      />

      <AddLibraryQuestionDialog
        open={libraryDialogOpen && !hasAnswers}
        onClose={() => setLibraryDialogOpen(false)}
        companyId={companyId}
        onPick={handlePickLibraryQuestion}
      />

      <AddLibraryBlockDialog
        open={libraryBlockDialogOpen && !hasAnswers}
        onClose={() => setLibraryBlockDialogOpen(false)}
        companyId={companyId}
        onPick={handlePickLibraryBlock}
      />

      <FormApplicationEditFooter
        baselineRef={baselineRef}
        onSubmit={onSubmitStay}
        onSubmitAndExit={onSubmitExit}
        onCancel={onCancel}
        loading={editFormMutation.isPending}
      />
    </SForm>
  );
};
