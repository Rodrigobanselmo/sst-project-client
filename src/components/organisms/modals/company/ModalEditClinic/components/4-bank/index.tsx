import React from 'react';

import { Box, styled } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import dynamic from 'next/dynamic';

import { companyPaymentOptionsList } from 'core/constants/maps/company-payment-type.map';
import { CompanyPaymentTypeEnum } from 'core/enums/company-payment-type.enum';
import { dateDayMask } from 'core/utils/masks/date.mask';
import { floatMask } from 'core/utils/masks/float.mask';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseAddCompany } from '../../hooks/useEditClinic';
import { useBankClinic } from './hooks/useBankClinic';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

export const BankModalCompanyStep = (props: IUseAddCompany) => {
  const { onSubmit, loading, onCloseUnsaved, previousStep, control, setValue } =
    useBankClinic(props);
  const { companyData, isEdit, setCompanyData } = props;

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
        <SFlex gap={8} direction="column" mt={8}>
          {/* <SText color="text.label" fontSize={14} mb={-2}>
            Cobrança
          </SText> */}

          <SelectForm
            defaultValue={companyData.paymentType || ''}
            control={control}
            sx={{ maxWidth: ['100%', 350] }}
            placeholder="selecionar tipo de conbrança..."
            name="paymentType"
            label="Cobrança"
            setValue={setValue}
            labelPosition="top"
            onChange={(e) => {
              if (e.target.value) {
                setCompanyData({
                  ...companyData,
                  paymentType: e.target.value as CompanyPaymentTypeEnum,
                });
              }
            }}
            optionsFieldName={{ contentField: 'name' }}
            size="small"
            options={companyPaymentOptionsList}
          />
          {companyData.paymentType === CompanyPaymentTypeEnum.DEBIT && (
            <InputForm
              defaultValue={String(companyData.paymentDay || '') || ''}
              mask={dateDayMask.apply}
              setValue={setValue}
              label="Dia de Faturamento"
              labelPosition="top"
              sx={{ maxWidth: [100] }}
              control={control}
              placeholder={'1 á 31'}
              name="paymentDay"
              size="small"
            />
          )}

          <DraftEditor
            size="xs"
            label="Dados bancários"
            placeholder="informe os dados bancários..."
            defaultValue={companyData.observationBank}
            onChange={(value) => {
              setCompanyData({
                ...companyData,
                observationBank: value,
              });
            }}
          />
        </SFlex>
        <Box ml={7} mt={5}>
          <SSwitch
            onChange={() => {
              setCompanyData({
                ...companyData,
                isTaxNote: !companyData.isTaxNote,
              });
            }}
            checked={companyData.isTaxNote}
            label="Emite Nota Fiscal"
            sx={{ mr: 4 }}
            color="text.light"
          />
        </Box>
      </AnimatedStep>
      <SModalButtons
        loading={loading}
        onClose={onCloseUnsaved}
        buttons={buttons}
      />
    </>
  );
};
