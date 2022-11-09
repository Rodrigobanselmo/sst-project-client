/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';

export const NoiseForm = (props: IUseModalQuantity) => {
  const { control, data } = props;
  return (
    <SFlex width={['100%', 600]} direction="column" gap={10} mt={8}>
      <InputForm
        defaultValue={data.nr15q5.replace('.', ',')}
        label="NR 15 (q5 - laudo de insalubridade)"
        control={control}
        placeholder={`valor do resultado obtido em ${data.risk.unit}`}
        name="nr15q5"
        size="small"
        endAdornment={data.risk.unit}
        mask={floatMask.apply({ negative: false, ltAccept: true })}
      />
      <InputForm
        defaultValue={data.ltcatq3.replace('.', ',')}
        label="LTCAT (q3) / NHO01 (q3) (recomendado para gestão de risco)"
        control={control}
        placeholder={`valor do resultado obtido em ${data.risk.unit}`}
        name="ltcatq3"
        size="small"
        endAdornment={data.risk.unit}
        mask={floatMask.apply({ negative: false, ltAccept: true })}
      />
      <InputForm
        defaultValue={data.ltcatq5.replace('.', ',')}
        label="LTCAT (q5)"
        control={control}
        placeholder={`valor do resultado obtido em ${data.risk.unit}`}
        name="ltcatq5"
        size="small"
        endAdornment={data.risk.unit}
        mask={floatMask.apply({ negative: false, ltAccept: true })}
      />
    </SFlex>
  );
};
