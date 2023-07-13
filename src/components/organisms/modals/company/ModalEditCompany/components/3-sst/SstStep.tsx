import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SHelp } from 'components/atoms/SHelp';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { SRadio } from 'components/molecules/form/radio';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { ProfessionalResponsibleTable } from 'components/organisms/tables/ProfessionalResponsibleTable/ProfessionalResponsibleTable';
import dayjs from 'dayjs';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { dateToDate } from 'core/utils/date/date-format';

import { IUseAddCompany } from '../../hooks/useEditCompany';
import { useCompanyEdit } from './hooks/useCompanySecondEdit';

export const SSTModalCompanyStep = (props: IUseAddCompany) => {
  const {
    control,
    onSubmit,
    onCloseUnsaved,
    previousStep,
    onChangeCep,
    setValue,
  } = useCompanyEdit(props);
  const { companyData, setCompanyData, loading, isEdit } = props;

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
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <>
      <AnimatedStep>
        <SFlex gap={0} direction="column" mt={8}>
          <SFlex align="center" mb={10} flexWrap="wrap" gap={5}>
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

          {/* <SFlex mt={8} flexWrap="wrap" gap={5}>
            <Box flex={6}>
              <ProfessionalInputSelect
                onChange={(prof) => {
                  setCompanyData({
                    ...companyData,
                    tecResponsible: prof,
                  });
                }}
                query={{ byCouncil: true }}
                type={[
                  ProfessionalTypeEnum.ENGINEER,
                  ProfessionalTypeEnum.TECHNICIAN,
                ]}
                inputProps={{
                  labelPosition: 'top',
                  placeholder: 'Técnico ou Engenheiro responsavel',
                }}
                defaultValue={companyData.tecResponsible}
                name="tecResponsible"
                label="Téc. / Eng."
                control={control}
              />
            </Box>
          </SFlex> */}
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
        </SFlex>
        {companyData.id && (
          <Box mt={20}>
            <ProfessionalResponsibleTable
              companyId={companyData.id}
              hideTitle
            />
          </Box>
        )}
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
