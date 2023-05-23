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
          inputProps={{
            autoFocus: true,
            labelPosition: 'top',
            placeholder: 'pesquisar motivo',
            name: 'motiveId',
            value: absenteeismData?.motive?.desc || '',
          }}
          autoComplete={false}
          onGetValue={(option) => {
            setValue('motiveId', option?.id);
            setAbsenteeismData((d) => ({
              ...d,
              motiveId: option?.id,
              motive: option,
            }));
            return option?.id;
          }}
          setValue={(v: any) => setValue('motiveId', v?.id || '')}
          defaultValue={absenteeismData?.motive || ''}
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
          inputProps={{
            autoFocus: true,
            labelPosition: 'top',
            placeholder: 'pesquisar tabela 18 do eSocial...',
            name: 'esocial18Motive',
            value: absenteeismData?.esocial18?.description || '',
          }}
          autoComplete={false}
          onGetValue={(option) => {
            setValue('esocial18Motive', option?.id);
            setAbsenteeismData((d) => ({
              ...d,
              esocial18Motive: option?.id,
              esocial18Code: option?.code,
              esocial18: option,
            }));
            return option?.id;
          }}
          setValue={(v: any) => {
            if (typeof v === 'string' || v?.description === 'string')
              setValue(
                'esocial18Motive',
                typeof v === 'string' ? v : v?.description,
              );
          }}
          defaultValue={absenteeismData?.esocial18 || ''}
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
