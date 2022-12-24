/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';

import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';

export const QuiForm = (props: IUseModalQuantity) => {
  const { control, data, setData } = props;
  return (
    <SFlex width={['100%', 600, 800]} direction="column" mt={8}>
      <Box mb={4}>
        <SSwitch
          onChange={(e) => {
            setData({
              ...data,
              longDuration: e.target.checked,
            });
          }}
          checked={!!data.longDuration}
          label="Avaliação da jornada de Trabalhado"
          sx={{ mr: 4, ml: 5 }}
          color="text.light"
        />
      </Box>

      {data.longDuration && (
        <>
          {data.risk.nr15lt && (
            <>
              <SText mb={4} color="text.label" fontSize={14}>
                NR15 / CMPT{' '}
                <SText component="span" color="text.label" fontSize={10}>
                  (concentracao média ponderada no tempo)
                </SText>
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
                  placeholder={`valor do resultado obtido (${data.risk.unit})...`}
                  name="nr15ltValue"
                  size="small"
                  endAdornment={data.risk.unit}
                  mask={floatMask.apply({ negative: false, ltAccept: true })}
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
                  disabled
                />
              </SFlex>
            </>
          )}

          <SText
            mb={4}
            mt={data.risk.nr15lt ? 8 : 0}
            color="text.label"
            fontSize={14}
          >
            Valor TLV/TWA{' '}
            <SText component="span" color="text.label" fontSize={10}>
              (ACGH)
            </SText>
          </SText>
          <SFlex
            sx={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: '1fr 1fr',
              mb: 10,
            }}
          >
            <InputForm
              defaultValue={(data.twaValue || '').replace('.', ',')}
              labelPosition="center"
              disabled={!!data.risk.stel && !!data.risk.stel.includes('C')}
              label={
                data.risk.stel && data.risk.stel.includes('C')
                  ? 'Utilizar campo STEL de curta duração'
                  : 'Resultado'
              }
              control={control}
              placeholder={`valor do resultado obtido (${data.risk.unit})...`}
              name="twaValue"
              size="small"
              smallPlaceholder
              endAdornment={data.risk.unit}
              mask={floatMask.apply({ negative: false, ltAccept: true })}
            />
            <InputForm
              defaultValue={(data.risk.stel && data.risk.stel.includes('C')
                ? data.risk.stel
                : data.risk.twa || ''
              ).replace('.', ',')}
              label="LEO"
              labelPosition="center"
              disabled={!!data.risk.stel && !!data.risk.stel.includes('C')}
              control={control}
              placeholder={'valor do limite...'}
              name="twa"
              size="small"
              endAdornment={data.risk.unit}
              mask={floatMask.apply({ negative: false })}
            />
          </SFlex>
        </>
      )}

      <Box mb={4}>
        <SSwitch
          onChange={(e) => {
            setData({
              ...data,
              shortDuration: e.target.checked,
            });
          }}
          checked={!!data.shortDuration}
          label="Avaliação de curta duração (maior valor)"
          sx={{ mr: 4, ml: 5 }}
          color="text.light"
        />
      </Box>

      {data.shortDuration && (
        <>
          <SText mb={4} color="text.label" fontSize={14}>
            Valor STEL{' '}
            <SText component="span" color="text.label" fontSize={10}>
              (TETO - ACGH)
            </SText>
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
              placeholder={`valor do resultado obtido (${data.risk.unit})...`}
              name="stelValue"
              size="small"
              endAdornment={data.risk.unit}
              mask={floatMask.apply({ negative: false, ltAccept: true })}
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
            NR15 / VMP{' '}
            <SText component="span" color="text.label" fontSize={10}>
              (Valor Máximo Permissível)
            </SText>
          </SText>
          <SFlex
            sx={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: '1fr 1fr',
              mb: 10,
            }}
          >
            <InputForm
              defaultValue={data.vmpValue.replace('.', ',')}
              labelPosition="center"
              label="Resultado"
              control={control}
              placeholder={`valor do resultado obtido (${data.risk.unit})...`}
              name="vmpValue"
              size="small"
              endAdornment={data.risk.unit}
              mask={floatMask.apply({ negative: false, ltAccept: true })}
            />
            <InputForm
              defaultValue={(data.risk.nr15lt && data.risk.nr15lt.includes('T')
                ? data.risk.nr15lt
                : data.risk.vmp || ''
              ).replace('.', ',')}
              label="LEO"
              labelPosition="center"
              control={control}
              placeholder={'valor do limite...'}
              name="vmp"
              size="small"
              endAdornment={data.risk.unit}
              mask={floatMask.apply({ negative: false })}
            />
          </SFlex>
        </>
      )}
      {!data.risk.unit && (
        <>
          <SText mb={4} mt={8} color="text.label" fontSize={14}>
            Unidade de médida
          </SText>
          <InputForm
            label="Unidade"
            labelPosition="center"
            control={control}
            placeholder={'Ex.: ppm'}
            name="unit"
            size="small"
          />
        </>
      )}
    </SFlex>
  );
};
