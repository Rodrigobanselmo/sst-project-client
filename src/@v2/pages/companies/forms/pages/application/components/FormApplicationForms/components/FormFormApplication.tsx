import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SInputMarkdownForm } from '@v2/components/forms/controlled/SInputMarkdownForm/SInputMarkdownForm';
import { SInputNumberLimitedForm } from '@v2/components/forms/controlled/SInputNumberLimitedForm';
import { InputFormModelSelectForm } from '../inputs/InputFormModelSelect/InputFormModelSelectForm';
import { InputWorkspaceSelectMultipleForm } from '../inputs/InputWorkspaceSelect/InputWorkspaceSelectMultipleForm';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitchForm } from '@v2/components/forms/controlled/SSwitchForm/SSwitchForm';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SRadioForm } from '@v2/components/forms/controlled/SRadioForm/SRadioForm';
import { SText } from '@v2/components/atoms/SText/SText';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  FORM_APPLICATION_SCOPE_TYPE_OPTIONS,
  IFormApplicationFormFields,
  resolveFormApplicationScopeType,
} from '../../../schema/form-application.schema';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormApplicationScopeTypeEnum } from '@v2/models/form/enums/form-application-scope-type.enum';
import { InputCompanyGroupSelectForm } from '../inputs/InputCompanyGroupSelect/InputCompanyGroupSelectForm';
import { InputCompanyGroupCompaniesSelectMultipleForm } from '../inputs/InputCompanyGroupCompaniesSelect/InputCompanyGroupCompaniesSelectMultipleForm';

type Props = {
  companyId: string;
  disabled?: boolean;
};

export const FormFormApplication = ({ companyId, disabled }: Props) => {
  const form = useFormContext<IFormApplicationFormFields>();

  const formModel = useWatch({
    name: 'form',
    control: form.control,
  });

  const scopeType = useWatch({
    name: 'scopeType',
    control: form.control,
  });

  const resolvedScopeType = resolveFormApplicationScopeType(scopeType);

  const isBusinessGroupScope =
    resolvedScopeType ===
    FormApplicationScopeTypeEnum.BUSINESS_GROUP_COMPANIES;

  const isPsychosocial = formModel?.type === FormTypeEnum.PSYCHOSOCIAL;

  useEffect(() => {
    if (resolvedScopeType === FormApplicationScopeTypeEnum.COMPANY_WORKSPACES) {
      form.setValue('companyGroup', null);
      form.setValue('companyIds', []);
      return;
    }

    form.setValue('workspaceIds', []);
  }, [form, resolvedScopeType]);

  return (
    <>
      <SInputForm
        label="Nome para identificação"
        labelShrink="Nome"
        placeholder="nome para identificação"
        fullWidth
        name="name"
      />
      <InputFormModelSelectForm
        companyId={companyId}
        name="form"
        disabled={disabled}
        onSelectValue={(value) => {
          if (!value) return;

          form.setValue(
            'shareableLink',
            value.shareableLink
              ? { value: 'true', label: 'Link único compartilhável' }
              : { value: 'false', label: 'Link por funcionário' },
          );
          form.setValue('anonymous', value.anonymous);
        }}
      />
      <SPaper sx={{ p: 6, borderRadius: 1 }}>
        <SRadioForm
          disabled={disabled}
          label="Aplicação para"
          name="scopeType"
          options={[...FORM_APPLICATION_SCOPE_TYPE_OPTIONS]}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
        />
      </SPaper>
      {isBusinessGroupScope ? (
        <>
          <InputCompanyGroupSelectForm companyId={companyId} />
          <InputCompanyGroupCompaniesSelectMultipleForm companyId={companyId} />
        </>
      ) : (
        <InputWorkspaceSelectMultipleForm
          companyId={companyId}
          name="workspaceIds"
        />
      )}
      <SInputNumberLimitedForm
        label="Meta de Participação (%)"
        placeholder="Ex: 50"
        fullWidth
        name="participationGoal"
        min={0}
        max={100}
        helperText="Defina a meta de participação em porcentagem (1-100%)"
      />
      <SInputMultilineForm
        label="Descrição"
        placeholder="descrição"
        fullWidth
        name="description"
      />
      {Boolean(formModel?.id) && (
        <>
          <SPaper sx={{ p: 6, borderRadius: 1 }}>
            <SRadioForm
              disabled={disabled}
              label="Tipo de Link"
              name="shareableLink"
              options={[
                { value: 'true', label: 'Link único compartilhável' },
                { value: 'false', label: 'Link por funcionário' },
              ]}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </SPaper>
          <SFlex>
            <SSwitchForm label="Anônimo" name="anonymous" disabled />
          </SFlex>
        </>
      )}
      {isPsychosocial && (
        <SPaper sx={{ p: 6, borderRadius: 1, mt: 4 }}>
          <SText fontSize={14} fontWeight={600} mb={4}>
            Textos do Banner de Campanha
          </SText>
          <SFlex direction="column" gap={6}>
            <SInputMarkdownForm
              label="Texto introdutório"
              placeholder="Texto exibido abaixo de 'Participe da Pesquisa'. Deixe em branco para usar o padrão."
              fullWidth
              name="bannerIntroText"
            />
            <SInputMarkdownForm
              label="Por que participar?"
              placeholder="Texto do bloco 'Por que participar?'. Deixe em branco para usar o padrão."
              fullWidth
              name="bannerWhyText"
            />
            <SInputMarkdownForm
              label="Dúvidas / Contato"
              placeholder="Texto do bloco 'Dúvidas?'. Deixe em branco para usar o padrão."
              fullWidth
              name="bannerContactText"
            />
          </SFlex>
        </SPaper>
      )}
    </>
  );
};
