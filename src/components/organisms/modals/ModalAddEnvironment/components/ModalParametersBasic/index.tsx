/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

export const ModalParametersContentBasic = ({
  control,
  data,
}: {
  control: Control<FieldValues, object>;
  data: {
    noiseValue: string;
    temperature: string;
    luminosity: string;
    moisturePercentage: string;
  };
}) => {
  return (
    <>
      <SText color="text.label" fontSize={14}>
        Parâmetros ambientais
      </SText>
      <SFlex gap={8} flexWrap="wrap">
        <Box flex={5}>
          <InputForm
            defaultValue={data.temperature}
            label="Temperatura"
            sx={{ minWidth: [200] }}
            control={control}
            placeholder={'temperatura'}
            name="temperature"
            labelPosition="center"
            size="small"
            endAdornment="ºC"
            mask={floatMask.apply({ decimal: 2, negative: true })}
          />
        </Box>
        <Box flex={5}>
          <InputForm
            defaultValue={data.noiseValue}
            label="Ruído"
            sx={{ minWidth: [200] }}
            control={control}
            placeholder={'ruído'}
            name="noiseValue"
            labelPosition="center"
            size="small"
            endAdornment="db (A)"
            mask={floatMask.apply({ decimal: 2 })}
          />
        </Box>
        <Box flex={5}>
          <InputForm
            defaultValue={data.moisturePercentage}
            label="Humidade"
            sx={{ minWidth: [200] }}
            labelPosition="center"
            control={control}
            placeholder={'humidade do ar'}
            name="moisturePercentage"
            size="small"
            endAdornment="%"
            mask={floatMask.apply({ decimal: 2 })}
          />
        </Box>
        <Box flex={5}>
          <InputForm
            defaultValue={data.luminosity}
            label="Iluminância"
            sx={{ minWidth: [200] }}
            labelPosition="center"
            control={control}
            placeholder={'iluminância'}
            name="luminosity"
            size="small"
            endAdornment="LUX"
            mask={floatMask.apply()}
          />
        </Box>
      </SFlex>
    </>
  );
};
