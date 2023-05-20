/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import { SSwitch } from 'components/atoms/SSwitch';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { Esocial24RiskSelect } from 'components/organisms/inputSelect/Esocial24RiskSelect/Esocial24RiskSelect';
import { RiskEnum, UnMedList } from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';

import { enumToArray } from 'core/utils/helpers/convertEnum';
import { getTimeList } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';

import { IUseAddRisk } from '../../hooks/useAddRisk';

export const RiskSharedContent: FC<{ children?: any } & IUseAddRisk> = ({
  riskData,
  setRiskData,
  control,
  setValue,
  type,
}) => {
  return (
    <>
      <Box mt={8}>
        <InputForm
          defaultValue={riskData.name}
          autoFocus
          multiline
          minRows={2}
          maxRows={5}
          label="Descrição do risco"
          control={control}
          sx={{ width: ['100%', 600] }}
          placeholder={'descrição do fator de risco...'}
          setValue={setValue}
          name="name"
          size="small"
          firstLetterCapitalize
        />
        <RadioFormText
          type="radio"
          control={control}
          defaultValue={riskData.type}
          options={Object.keys(RiskEnum)}
          name="type"
          mt={3}
          columns={5}
        />
        <RadioFormText
          type="radio"
          label="Severidade"
          control={control}
          defaultValue={String(riskData.severity)}
          options={enumToArray(SeverityEnum, 'value')}
          name="severity"
          mt={5}
          mb={15}
          columns={5}
        />
        <InputForm
          defaultValue={riskData.risk}
          multiline
          minRows={2}
          maxRows={5}
          label={
            <>
              Risco{' '}
              <span style={{ fontSize: 11 }}>
                (Órgãos Alvo ou Maior Parte do Corpo Prejudicada - Resumo de
                Sintomas)
              </span>
            </>
          }
          control={control}
          sx={{ width: ['100%', 600], mb: 8 }}
          placeholder={'descrião do risco...'}
          name="risk"
          size="small"
          setValue={setValue}
          firstLetterCapitalize
        />
        <InputForm
          defaultValue={riskData.symptoms}
          multiline
          minRows={2}
          maxRows={5}
          label="Sintomas, Danos ou Qualquer consequência negativa"
          control={control}
          sx={{ width: ['100%', 600] }}
          placeholder={'descrião dos sintomas...'}
          setValue={setValue}
          name="symptoms"
          size="small"
          firstLetterCapitalize
        />
        <Box mt={8}>
          <AutocompleteForm
            name="unit"
            control={control}
            filterOptions={(x) => x}
            unmountOnChangeDefault
            freeSolo
            fullWidth
            getOptionLabel={(option) => String(option)}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'exemplo: quantitativo, qualitativo...',
              name: 'unit',
            }}
            setValue={(v) => setValue('unit', v)}
            defaultValue={riskData.unit || ''}
            label="Unidade de Medida"
            options={UnMedList}
          />
        </Box>
        <Box mt={8}>
          <AutocompleteForm
            name="method"
            control={control}
            filterOptions={(x) => x}
            unmountOnChangeDefault
            freeSolo
            fullWidth
            getOptionLabel={(option) => String(option)}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'exemplo: quantitativo, qualitativo...',
              name: 'method',
            }}
            setValue={(v) => setValue('method', v)}
            defaultValue={riskData.method || ''}
            label="Método"
            options={['Quantitativo', 'Qualitativo']}
          />
        </Box>
        <Box mt={8}>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.propagation}
            label="Meio de Propagação"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'exemplo: ar, água, contato...'}
            name="propagation"
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ ml: 7, mt: 5 }}>
        <SSwitch
          onChange={() => {
            setRiskData({
              ...riskData,
              isEmergency: !riskData.isEmergency,
            });
          }}
          checked={riskData.isEmergency}
          label="Vincular ao plano de emergencia"
          sx={{ mr: 4 }}
          color="text.light"
        />
      </Box>
      <Box flex={1} mt={12}>
        <Esocial24RiskSelect
          type={type}
          disabled={!type}
          onChange={(data) => {
            setRiskData((d) => ({
              ...d,
              esocial: data,
            }));
          }}
          inputProps={{
            labelPosition: 'top',
            placeholder: 'selecione código eSocial...',
          }}
          unmountOnChangeDefault
          defaultValue={riskData?.esocial}
          name="esocial"
          label="Código eSocial"
          control={control}
        />
      </Box>
    </>
  );
};
