/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';

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
        <SModalButtons
          loading={loading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};