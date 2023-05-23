/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { IUseEditEng } from '../../hooks/useEditEngsRisk';

export const ModalEngRiskStep = ({
  engData,
  onSelectCheck,
  control,
  setValue,
}: IUseEditEng) => {
  return (
    <SFlex gap={8} direction="column" mt={8}>
      <SText color="text.label" fontSize={14}>
        Dados
      </SText>
      <Box flex={5}>
        <InputForm
          setValue={setValue}
          autoFocus
          defaultValue={engData.medName}
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
      <SFlex direction="column">
        <SText mb={6} component="span" fontSize={12} color="text.light">
          Os item abaixo será enviado ao <b>eSocial</b>, ao selecioana-lo você
          estará se <br />
          responsabilizando pela veracidade da informação
        </SText>
        <SSwitch
          onChange={(e) => onSelectCheck(e.target.checked, 'efficientlyCheck')}
          checked={!!engData.engsRiskData?.efficientlyCheck}
          label="Eficaz?"
          sx={{ ml: 6 }}
          color="text.light"
        />
      </SFlex>
    </SFlex>
  );
};
