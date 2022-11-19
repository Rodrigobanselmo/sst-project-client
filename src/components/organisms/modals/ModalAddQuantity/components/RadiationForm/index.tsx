/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';
import { DuoGridFLex } from '../../styles';

export const RadiationForm = (props: IUseModalQuantity) => {
  const { control, data } = props;
  return (
    <SFlex width={['100%', 600, 800]} direction="column" mt={8}>
      <SText mb={4} color="text.label" fontSize={14}>
        Dose Efetiva (Corpo inteiro)
      </SText>
      <DuoGridFLex>
        <InputForm
          defaultValue={data.doseFB.replace('.', ',')}
          label="Indivíduo Ocupacionalmente Exposto"
          control={control}
          placeholder={'Valor da dose efetiva do corpo inteiro'}
          name="doseFB"
          size="small"
          endAdornment={'mSv'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
        <InputForm
          defaultValue={data.doseFBPublic.replace('.', ',')}
          label="Indivíduo do Público"
          control={control}
          placeholder={'Valor da dose efetiva do corpo inteiro'}
          name="doseFBPublic"
          size="small"
          endAdornment={'mSv'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
      </DuoGridFLex>

      <SText mt={4} mb={4} color="text.label" fontSize={14}>
        Dose Equivalente (Cristalino)
      </SText>
      <DuoGridFLex>
        <InputForm
          defaultValue={data.doseEye.replace('.', ',')}
          label="Indivíduo Ocupacionalmente Exposto"
          control={control}
          placeholder={'Valor da dose equivalente do cristalino'}
          name="doseEye"
          size="small"
          endAdornment={'mSv'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
        <InputForm
          defaultValue={data.doseEyePublic.replace('.', ',')}
          label="Indivíduo do Público"
          control={control}
          placeholder={'Valor da dose equivalente do cristalino'}
          name="doseEyePublic"
          size="small"
          endAdornment={'mSv'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
      </DuoGridFLex>

      <SText mb={4} mt={4} color="text.label" fontSize={14}>
        Dose Equivalente (Pele)
      </SText>
      <DuoGridFLex>
        <InputForm
          defaultValue={data.doseSkin.replace('.', ',')}
          label="Indivíduo Ocupacionalmente Exposto"
          control={control}
          placeholder={'Valor da dose equivalente da pele'}
          name="doseSkin"
          size="small"
          endAdornment={'mSv'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
        <InputForm
          defaultValue={data.doseSkinPublic.replace('.', ',')}
          label="Indivíduo do Público"
          control={control}
          placeholder={'Valor da dose equivalente da pele'}
          name="doseSkinPublic"
          size="small"
          endAdornment={'mSv'}
          mask={floatMask.apply({
            negative: false,
            decimal: 2,
            ltAccept: true,
          })}
        />
      </DuoGridFLex>

      <SText mb={4} mt={4} color="text.label" fontSize={14}>
        Dose Equivalente (Mãos e pés)
      </SText>
      <InputForm
        defaultValue={data.doseHand.replace('.', ',')}
        label="Indivíduo Ocupacionalmente Exposto"
        control={control}
        placeholder={'Valor da dose equivalente das mãos e pés'}
        name="doseHand"
        size="small"
        endAdornment={'mSv'}
        mask={floatMask.apply({ negative: false, decimal: 2, ltAccept: true })}
      />
    </SFlex>
  );
};
