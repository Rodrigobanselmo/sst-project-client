/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';

import { isAbsTraffic } from 'core/interfaces/api/IAbsenteeism';

import { IUseMotiveData } from '../../hooks/useMotiveData';

export const MotiveContent = (props: IUseMotiveData) => {
  const {
    control,
    setValue,
    esocial18Table,
    absenteeismMotives,
    setAbsenteeismData,
    absenteeismData,
  } = props;

  return (
    <SFlex mt={10} flexDirection="column" flexWrap="wrap" gap={5}>
      <Box maxWidth={800} flex={5}>
        <AutocompleteForm
          name="motiveId"
          unmountOnChangeDefault
          control={control}
          getOptionLabel={(option) =>
            (typeof option != 'string' && option?.desc) || ''
          }
          isOptionEqualToValue={(a, b) =>
            String(typeof a === 'object' && a != null ? a.id : a) ===
            String(typeof b === 'object' && b != null ? b.id : b)
          }
          inputProps={{
            autoFocus: true,
            labelPosition: 'top',
            placeholder: 'pesquisar motivo',
            name: 'motiveId',
          }}
          autoComplete={false}
          onChange={(option) => {
            setValue('motiveId', option?.id ?? undefined);
            setAbsenteeismData((d) => ({
              ...d,
              motiveId: option?.id ?? undefined,
              motive: option ?? undefined,
            }));
          }}
          onGetValue={(option) => (option ?? null) as any}
          defaultValue={absenteeismData?.motive || null}
          label="Tipo de Motivo*"
          options={absenteeismMotives}
        />
      </Box>
      <Box maxWidth={800} mt={5} flex={5}>
        <AutocompleteForm
          name="esocial18Motive"
          control={control}
          getOptionLabel={(option) =>
            (typeof option != 'string' && option?.description) || ''
          }
          isOptionEqualToValue={(a, b) =>
            String(typeof a === 'object' && a != null ? a.id : a) ===
            String(typeof b === 'object' && b != null ? b.id : b)
          }
          inputProps={{
            autoFocus: true,
            labelPosition: 'top',
            placeholder: 'pesquisar tabela 18 do eSocial...',
            name: 'esocial18Motive',
          }}
          autoComplete={false}
          onChange={(option) => {
            setValue('esocial18Motive', option?.id ?? undefined);
            setAbsenteeismData((d) => ({
              ...d,
              esocial18Motive: option?.id ?? undefined,
              esocial18Code: option?.code ?? undefined,
              esocial18: option ?? undefined,
            }));
          }}
          onGetValue={(option) => (option ?? null) as any}
          defaultValue={absenteeismData?.esocial18 || null}
          label="Motivo (eSocial)"
          options={esocial18Table}
          unmountOnChangeDefault
        />
      </Box>
      {isAbsTraffic(absenteeismData.esocial18Code) && (
        <Box maxWidth={400} mt={5} flex={5}>
          <SelectForm
            setValue={setValue}
            unmountOnChangeDefault
            defaultValue={absenteeismData?.traffic || ''}
            control={control}
            sx={{ maxWidth: ['100%', 350] }}
            placeholder="selecione se acidente de trânsito..."
            name="traffic"
            label="Acidente de Trânsito"
            labelPosition="top"
            onChange={(e) => {
              if (e.target.value) {
                setAbsenteeismData({
                  ...absenteeismData,
                  traffic: e.target.value as number,
                });
              }
            }}
            size="small"
            options={[
              { value: 1, content: 'Atropelamento' },
              { value: 2, content: 'Colisão' },
              { value: 3, content: 'Outros' },
            ]}
          />
        </Box>
      )}
      <InputForm
        defaultValue={absenteeismData?.observation}
        label="Observações"
        setValue={setValue}
        control={control}
        sx={{ width: ['100%', 800] }}
        placeholder={'observações...'}
        name="observation"
        size="small"
        minRows={2}
        maxRows={4}
        multiline
      />
    </SFlex>
  );
};
