/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';

export const VibrationForm = (props: IUseModalQuantity & { vl?: boolean }) => {
  const { control, data, setValue } = props;
  return (
    <SFlex width={['100%', 600, 800]} direction="column" mt={8}>
      <SText mb={4} color="text.label" fontSize={14}>
        Resultados Quantitativos de Vibracão
      </SText>
      <SFlex
        sx={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr',
          mb: 10,
        }}
      >
        <InputForm
          defaultValue={data.aren.replace('.', ',')}
          setValue={setValue}
          label="aren (Aceleração resultante de exposição normalizada)"
          control={control}
          placeholder={'Valor de aren'}
          name="aren"
          size="small"
          endAdornment={'m/s²'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
        {!props.vl && (
          <InputForm
            defaultValue={data.vdvr.replace('.', ',')}
            label="VDVR (Valor da dose de vibração resultante)"
            control={control}
            placeholder={'valor de VDVR'}
            name="vdvr"
            setValue={setValue}
            size="small"
            endAdornment={
              <span>
                m/s<sup style={{ fontSize: 8 }}>1.75</sup>
              </span>
            }
            mask={floatMask.apply({
              negative: false,
              decimal: 2,
              ltAccept: true,
            })}
          />
        )}
      </SFlex>
    </SFlex>
  );
};
