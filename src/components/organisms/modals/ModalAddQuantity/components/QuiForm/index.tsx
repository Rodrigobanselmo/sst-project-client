/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';

export const QuiForm = (props: IUseModalQuantity) => {
  const { control, data } = props;
  return (
    <SFlex width={['100%', 600, 800, 1000]} direction="column" mt={8}>
      <SText mb={4} color="text.label" fontSize={14}>
        Valor STEL (TETO - ACGH)
      </SText>
      <SFlex
        sx={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <InputForm
          defaultValue={data.stelValue.replace('.', ',')}
          labelPosition="center"
          label="Resultado"
          control={control}
          placeholder={'valor do resultado obtido...'}
          name="stelValue"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false })}
        />
        <InputForm
          defaultValue={(data.risk.stel || '').replace('.', ',')}
          label="LEO"
          labelPosition="center"
          control={control}
          placeholder={'valor do limite...'}
          name="stel"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false })}
        />
      </SFlex>

      <SText mb={4} mt={8} color="text.label" fontSize={14}>
        Valor TLV/TWA (ACGH)
      </SText>
      <SFlex
        sx={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <InputForm
          defaultValue={data.twaValue.replace('.', ',')}
          labelPosition="center"
          label="Resultado"
          control={control}
          placeholder={'valor do resultado obtido...'}
          name="twaValue"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false })}
        />
        <InputForm
          defaultValue={(data.risk.twa || '').replace('.', ',')}
          label="LEO"
          labelPosition="center"
          control={control}
          placeholder={'valor do limite...'}
          name="twa"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false })}
        />
      </SFlex>

      <SText mb={4} mt={8} color="text.label" fontSize={14}>
        NR15 / CMPT (concentracao média ponderada no tempo)
      </SText>
      <SFlex
        sx={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <InputForm
          defaultValue={data.nr15ltValue.replace('.', ',')}
          labelPosition="center"
          label="Resultado"
          control={control}
          placeholder={'valor do resultado obtido...'}
          name="nr15ltValue"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false })}
        />
        <InputForm
          defaultValue={(data.risk.nr15lt || '').replace('.', ',')}
          label="LEO"
          labelPosition="center"
          control={control}
          placeholder={'valor do limite...'}
          name="nr15lt"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false })}
        />
      </SFlex>
    </SFlex>
  );
};
