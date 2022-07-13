/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { clothesList } from 'project/enum/ibtu-clothes.enum';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';

export const HeatForm = (props: IUseModalQuantity) => {
  const { control, data, setData } = props;
  return (
    <SFlex width={['100%', 600, 800]} direction="column" mt={8}>
      <SText mb={4} color="text.label" fontSize={14}>
        Dados de Calor
      </SText>
      <SFlex
        sx={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr 1fr',
          mb: 5,
        }}
      >
        <InputForm
          defaultValue={data.mw.replace('.', ',')}
          labelPosition="center"
          label="Taxa metabólica M[W]"
          control={control}
          placeholder={'Valor da taxa metabólica'}
          name="mw"
          size="small"
          endAdornment={'M[W]'}
          mask={floatMask.apply({ negative: false, decimal: 0 })}
        />
        <InputForm
          defaultValue={data.ibtug.replace('.', ',')}
          label="IBUTG [°C]"
          labelPosition="center"
          control={control}
          placeholder={'valor médio do IBUTG'}
          name="ibtug"
          size="small"
          endAdornment={'°C'}
          mask={floatMask.apply({ negative: false, decimal: 2 })}
        />
        <InputForm control={control} name="empty" sx={{ display: 'none' }} />
      </SFlex>
      <Box mb={10}>
        <SSwitch
          onChange={(e) => {
            setData({
              ...data,
              isAcclimatized: e.target.checked,
            });
          }}
          checked={!!data.isAcclimatized}
          label="Trabalhador aclimatizado"
          sx={{ mr: 4, ml: 5 }}
          color="text.light"
        />
      </Box>
      <Box mb={10}>
        <SelectForm
          label="Tipo Vestimento"
          control={control}
          sx={{ minWidth: ['100%', 600] }}
          placeholder={'Vestimento'}
          name="clothesType"
          size="small"
          options={clothesList}
          defaultValue={String(data.clothesType)}
        />
      </Box>
    </SFlex>
  );
};
