/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { IUseEditEPC } from '../../hooks/useEditEPCs';

export const ModalEPCStep = ({
  epcData,
  onSelectCheck,
  control,
}: IUseEditEPC) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <Box flex={5}>
        <InputForm
          autoFocus
          defaultValue={epcData.medName}
          label="EPC / ENG "
          maxRows={2}
          multiline
          fullWidth
          sx={{ display: 'flex', flex: 1, width: '100%' }}
          labelPosition="center"
          control={control}
          name="medName"
          size="small"
          uneditable
        />
      </Box>
      <SFlex direction="column" ml={6}>
        <SFlex>
          <SText
            mb={6}
            ml={15}
            component="span"
            fontSize={12}
            color="text.light"
          >
            Os items abaixo serão enviados ao <b>eSocial</b>, ao selecioana-los
            você estará se <br />
            responsabilizando pela veracidade das informações
          </SText>
          <SSwitch
            onChange={(e) =>
              onSelectCheck(e.target.checked, 'efficientlyCheck')
            }
            checked={!!epcData.recMedToRiskFactorData?.efficientlyCheck}
            label="Eficaz?"
            sx={{ mr: 6 }}
            color="text.light"
          />
        </SFlex>
      </SFlex>
    </SFlex>
  );
};
