/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SHelp } from 'components/atoms/SHelp';
import { SSwitch } from 'components/atoms/SSwitch';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalInputSelect } from 'components/organisms/inputSelect/ProfessionalSelect/ProfessionalSelect';

import { ModalEnum } from 'core/enums/modal.enums';
import { dateToDate } from 'core/utils/date/date-format';

import { CompanyTag } from '../ModalAddUsers/components/CompanyTag';
import { useAddCompanyGroup } from './hooks/useAddCompanyGroup';

export const ModalAddCompanyGroup = () => {
  const {
    registerModal,
    onCloseUnsaved,
    onSubmit,
    loading,
    companyGroupData,
    setCompanyGroupData,
    control,
    handleSubmit,
    isEdit,
    handleOpenCompanySelect,
    handleRemoveCompany,
    moreCompanies,
  } = useAddCompanyGroup();

  const buttons = [
    {},
    {
      text: isEdit ? 'Salvar' : 'Criar',
      variant: 'contained',
      type: 'submit',
      onClick: () => setCompanyGroupData({ ...companyGroupData }),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.COMPANY_GROUP_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper
        center
        p={8}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <SModalHeader
          tag={isEdit ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={'Grupo Empresarial'}
        />
        <SFlex gap={8} direction="column" mt={8}>
          <InputForm
            autoFocus
            defaultValue={companyGroupData.name}
            label="Nome"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'nome do grupo empresarial...'}
            name="name"
            size="small"
          />
          <InputForm
            defaultValue={companyGroupData.description}
            label="Descrição"
            control={control}
            sx={{ minWidth: ['100%', 600] }}
            placeholder={'descrição do grupo empresarial...'}
            name="description"
            minRows={3}
            multiline
            maxRows={6}
            size="small"
          />
          {!!companyGroupData.companies.length && (
            <SFlex flexWrap="wrap" gap={5}>
              {companyGroupData.companies.map((company) => {
                return (
                  <CompanyTag
                    key={company.id}
                    company={company}
                    handleRemoveCompany={handleRemoveCompany}
                  />
                );
              })}
              {moreCompanies && (
                <SText fontSize="10px" alignSelf="flex-end">
                  ...mais
                </SText>
              )}
            </SFlex>
          )}
        </SFlex>

        <STagButton
          mt={8}
          maxWidth="200px"
          text={'Adicionar Empresas'}
          onClick={handleOpenCompanySelect}
          active
          bg="success.dark"
        />

        <SFlex gap={2} ml={7} mt={10}>
          <SSwitch
            onChange={() => {
              setCompanyGroupData({
                ...companyGroupData,
                blockResignationExam: !companyGroupData.blockResignationExam,
              } as any);
            }}
            checked={companyGroupData.blockResignationExam}
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

        <SFlex mt={10} flexWrap="wrap" gap={5}>
          <Box flex={6}>
            <ProfessionalInputSelect
              onChange={(prof) => {
                setCompanyGroupData({
                  ...companyGroupData,
                  doctorResponsible: prof,
                });
              }}
              defaultValue={companyGroupData.doctorResponsible}
              name="doctorResponsible"
              label="Médico Coordenador"
              control={control}
            />
          </Box>
          <Box flex={2}>
            <SelectForm
              defaultValue={String(companyGroupData.numAsos)}
              label="Nº vias Aso"
              control={control}
              name="numAsos"
              labelPosition="center"
              size="small"
              options={Array.from({ length: 10 }).map((_, i) => ({
                value: i + 1,
                content: i + 1,
              }))}
            />
          </Box>
        </SFlex>

        <Box mt={10}>
          <DatePickerForm
            label="Início eSocial"
            control={control}
            defaultValue={dateToDate(companyGroupData.esocialStart)}
            name="esocialStart"
            sx={{ maxWidth: 240 }}
            onChange={(date) => {
              setCompanyGroupData({
                ...companyGroupData,
                esocialStart: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>

        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
