import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormQuestionsButtons } from '@v2/pages/companies/forms/components/FormQuestionsButtons/FormQuestionsButtons';
import { SFormQuestionSection } from '@v2/pages/companies/forms/components/SFormSection/SFormSection';
import { useMutateAddFormApplication } from '@v2/services/forms/form-application/add-form-application/hooks/useMutateAddFormApplication';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormFormApplication } from '../../../../components/FormApplicationForms/components/FormFormApplication';
import { getFormIdentifierTypeList } from '../../../../components/FormApplicationForms/constants/form-Identifier-type.map';
import { transformFormApplicationDataToApiFormat } from '../../../../helpers/transform-form-application-data';
import {
  formApplicationFormInitialValues,
  getFormApplicationInitialValues,
  getFormApplicationInitialValuesRisk,
  IFormApplicationFormFields,
  schemaFormApplicationForm,
} from '../../../../schema/form-application.schema';

export const FormApplicationAddContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  const router = useAppRouter();
  const form = useForm<IFormApplicationFormFields>({
    resolver: yupResolver(schemaFormApplicationForm),
    defaultValues: formApplicationFormInitialValues,
  });

  const formModel = useWatch({ name: 'form', control: form.control });

  const addFormMutation = useMutateAddFormApplication();

  const onSubmit = async (data: IFormApplicationFormFields) => {
    form.clearErrors();

    if (data.sections.length === 0) {
      form.setError('sections', {
        message: 'Não há seções para aplicar o questionário',
      });
      return;
    }

    const identifier = transformFormApplicationDataToApiFormat(data);

    await addFormMutation.mutateAsync({
      companyId,
      name: data.name,
      description: data.description,
      participationGoal: data.participationGoal,
      formId: data.form.id,
      hierarchyIds: [],
      shareableLink: data.shareableLink.value === 'true',
      anonymous: data.anonymous,
      workspaceIds: data.workspaceIds.map((workspace) => workspace.id),
      identifier,
    });

    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
    });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const onCancel = () => {
    router.push(PageRoutes.FORMS.FORMS_APPLICATION.LIST, {
      pathParams: { companyId, formTab: FORM_TAB_ENUM.APPLIED },
    });
  };

  useEffect(() => {
    if (formModel?.type === FormTypeEnum.PSYCHOSOCIAL) {
      form.setValue('sections', [
        getFormApplicationInitialValuesRisk({
          disabledEdition: true,
          disableDuplication: true,
          required: true,
          type: FormIdentifierTypeEnum.SECTOR,
          content: 'Qual setor da empresa você faz parte?',
          description: `<p>
        Formulário de caracterização de riscos psicossociais no ambiente de
        trabalho.
      </p>
      <p>
        <strong>Instruções:</strong>
      </p>
      <ul>
        <li>
          <p>
            Sua participação é <strong>anônima</strong> e seus dados não serão
            compartilhados individualmente.
          </p>
        </li>
        <li>
          <p>
            As informações coletadas serão utilizadas exclusivamente para
            identificar e compreender riscos psicossociais.
          </p>
        </li>
        <li>
          <p>
            Os resultados apoiarão ações de melhoria voltadas à saúde, segurança
            e bem-estar no ambiente de trabalho.
          </p>
        </li>
        <li>
          <p>
            Responda com sinceridade para podermos promover um ambiente mais
            seguro e saudável.
          </p>
        </li>
      </ul>
      <p>
        Para esta seção de perguntas gerais, informamos que somente o campo
        “Setor” é requerido — e já foi configurado para agrupar equipes com
        número mínimo de pessoas, preservando o anonimato. As demais questões
        são opcionais: se você entender que alguma resposta (por exemplo, uma
        faixa etária rara no seu setor) pode, direta ou indiretamente, indicar a
        sua identidade, fique à vontade para não responder. As informações serão
        analisadas coletivamente, visando orientar melhor as ações de prevenção
        e controle.
      </p>`,
        }),
      ]);
    }

    if (formModel?.type === FormTypeEnum.NORMAL) {
      form.setValue('sections', [
        getFormApplicationInitialValuesRisk({
          type: FormIdentifierTypeEnum.CUSTOM,
        }),
      ]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formModel]);

  const questionsTypeOptions = getFormIdentifierTypeList(formModel?.type);

  return (
    <SForm form={form}>
      <SFormSection mb={8}>
        <FormFormApplication companyId={companyId} />
      </SFormSection>

      {!!formModel?.id && (
        <SFormQuestionSection
          questionTypeOptions={questionsTypeOptions}
          sectionIndex={0}
          sectionNumber={1}
          isMinimized={false}
          hideInputTitle={true}
          companyId={companyId}
          title={() => 'Dados Gerais'}
          descriptionPlaceholder="Instruções do questionário (opcional)"
          initialValues={getFormApplicationInitialValues({})}
        />
      )}

      <FormQuestionsButtons
        onSubmit={handleSubmit}
        onCancel={onCancel}
        errors={form.formState.errors}
        loading={addFormMutation.isPending}
      />
    </SForm>
  );
};
