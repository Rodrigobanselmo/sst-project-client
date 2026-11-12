import React, { useRef } from 'react';

import { Box, Button } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SHelp } from 'components/atoms/SHelp';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { SRadio } from 'components/molecules/form/radio';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ProfessionalResponsibleTable } from 'components/organisms/tables/ProfessionalResponsibleTable/ProfessionalResponsibleTable';
import { PcmsoExaminingPhysiciansTable } from 'components/organisms/tables/PcmsoExaminingPhysiciansTable/PcmsoExaminingPhysiciansTable';

import { dateToDate } from 'core/utils/date/date-format';

import { FRPS_PRIVACY_METADATA_KEY } from 'core/utils/company/strip-frps-privacy-from-metadata';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanySecondEdit';
import { FrpsPrivacySettingsBlock, type SaveFrpsPrivacy } from './FrpsPrivacySettingsBlock';

function SstSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      component="section"
      sx={{
        mt: 6,
        p: { xs: 4, sm: 6 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <SText
        component="h3"
        mb={4}
        color="text.primary"
        fontSize={16}
        fontWeight={600}
      >
        {title}
      </SText>
      {children}
    </Box>
  );
}

export const SSTModalCompanyStep = (props: IUseAddCompany) => {
  const {
    control,
    onSubmit,
    onCloseUnsaved,
    previousStep,
    setValue,
    handleApplyHsePolicyPreset,
  } = useCompanyEdit(props);
  const { companyData, setCompanyData, loading, isEdit } = props;

  const savePrivacyRef = useRef<SaveFrpsPrivacy>(null);

  const buttons = [
    {
      variant: 'outlined',
      text: 'Voltar',
      arrowBack: true,
      onClick: () => previousStep(),
    },
    {
      text: isEdit ? 'Salvar' : 'Proximo',
      arrowNext: !isEdit,
      variant: 'contained',
      onClick: () => {
        const savePrivacy = savePrivacyRef.current;
        if (isEdit && savePrivacy) {
          savePrivacy(() => void onSubmit());
        } else {
          void onSubmit();
        }
      },
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SstSection title="eSocial">
          <SFlex align="center" flexWrap="wrap" gap={5}>
            <Box>
              <SText mb={5} color="text.label" fontSize={14}>
                Início eSocial
              </SText>
              <DatePickerForm
                setValue={setValue}
                placeholderText={'Início eSocial'}
                control={control}
                defaultValue={dateToDate(companyData.esocialStart)}
                name="esocialStart"
                labelPosition="center"
                sx={{ maxWidth: 240 }}
                onChange={(date) => {
                  setCompanyData({
                    ...companyData,
                    esocialStart: date instanceof Date ? date : undefined,
                  });
                }}
              />
            </Box>
            <Box mt={12} ml={10}>
              <SRadio
                value={
                  companyData.esocialSend == undefined
                    ? undefined
                    : companyData.esocialSend
                      ? 1
                      : 2
                }
                valueField="value"
                row
                formControlProps={{
                  sx: {
                    ml: '-4px',
                    '& .MuiSvgIcon-root': {
                      fontSize: 15,
                    },
                    '& .MuiTypography-root': {
                      color: 'text.main',
                    },
                  },
                }}
                labelField="label"
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    esocialSend: (e.target as any).value == 1 ? true : false,
                  })
                }
                options={[
                  { value: 1, label: 'Enviar eventos' },
                  { value: 2, label: 'Gerar XML' },
                ]}
              />
            </Box>
          </SFlex>
        </SstSection>
        <SstSection title="Medicina do Trabalho">
          <SFlex flexWrap="wrap" gap={5}>
            <Box flex={6}>
              <ProfessionalInputSelect
                onChange={(prof) => {
                  setCompanyData({
                    ...companyData,
                    doctorResponsible: prof,
                  });
                }}
                query={{ byCouncil: true }}
                inputProps={{
                  labelPosition: 'top',
                  placeholder: 'Médico responsavel',
                }}
                defaultValue={companyData.doctorResponsible}
                name="doctorResponsible"
                label="Médico Coordenador"
                control={control}
              />
            </Box>
            <Box flex={2}>
              <SelectForm
                defaultValue={String(companyData.numAsos || '') || ''}
                label="Nº vias Aso (Impressão)"
                setValue={setValue}
                control={control}
                placeholder="número de vias..."
                name="numAsos"
                labelPosition="top"
                size="small"
                options={Array.from({ length: 10 }).map((_, i) => ({
                  value: i + 1,
                  content: i + 1,
                }))}
              />
            </Box>
          </SFlex>

          <SFlex gap={2} ml={7} mt={5}>
            <SSwitch
              onChange={() => {
                setCompanyData({
                  ...companyData,
                  blockResignationExam: !companyData.blockResignationExam,
                } as any);
              }}
              checked={companyData.blockResignationExam}
              label="Bloqueio demissional"
              sx={{ mr: 4 }}
              color="text.light"
            />
            <SHelp
              mb={-1}
              ml={-5}
              tooltip={
                'Bloquar exame demissional antes de 135 dias (Grau de risco 1 e 2) ou 90 dias (Grau de risco 3 e 4)'
              }
            />
          </SFlex>
          {companyData.id && (
            <Box mt={8}>
              <PcmsoExaminingPhysiciansTable
                companyId={companyData.id}
                hideTitle
              />
            </Box>
          )}
          {companyData.id && (
            <Box mt={8}>
              <ProfessionalResponsibleTable
                companyId={companyData.id}
                hideTitle
              />
            </Box>
          )}
        </SstSection>
        {companyData.id && (
          <SstSection title="Privacidade psicossocial">
            <FrpsPrivacySettingsBlock
              saveRef={savePrivacyRef}
              companyId={companyData.id}
              onPrivacySaved={(riskAnalysisAiMinParticipants) => {
                setCompanyData((oldData) => ({
                  ...oldData,
                  metadata: {
                    ...(oldData.metadata || {}),
                    [FRPS_PRIVACY_METADATA_KEY]: {
                      ...((oldData.metadata as Record<string, any>)?.[
                        FRPS_PRIVACY_METADATA_KEY
                      ] || {}),
                      riskAnalysisAiMinParticipants,
                    },
                  },
                }));
              }}
            />
          </SstSection>
        )}

        <SstSection title="Política de Saúde, Segurança e Meio Ambiente">
          <SFlex
            align="center"
            justify="flex-end"
            flexWrap="wrap"
            gap={2}
            mb={1}
          >
            <Button
              type="button"
              size="small"
              variant="text"
              onClick={handleApplyHsePolicyPreset}
              sx={{ textTransform: 'none', px: 1, minWidth: 0 }}
            >
              Usar sugestão do SimpleSST
            </Button>
          </SFlex>
          <InputForm
            setValue={setValue}
            multiline
            defaultValue={companyData.healthSafetyEnvironmentPolicy || ''}
            minRows={4}
            maxRows={12}
            labelPosition="center"
            label="Política de Saúde, Segurança e Meio Ambiente"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={
              'política de saúde, segurança e meio ambiente da empresa...'
            }
            name="healthSafetyEnvironmentPolicy"
            size="small"
          />
        </SstSection>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
