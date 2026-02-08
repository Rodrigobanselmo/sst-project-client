/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box } from '@mui/material';
import { SSwitch } from 'components/atoms/SSwitch';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { RadioFormText } from 'components/molecules/form/radio-text';
import { Esocial24RiskSelect } from 'components/organisms/inputSelect/Esocial24RiskSelect/Esocial24RiskSelect';
import {
  GrauInsalubridadeOptions,
  RiskEnum,
  UnMedList,
} from 'project/enum/risk.enums';
import { SeverityEnum } from 'project/enum/severity.enums';

import { enumToArray } from 'core/utils/helpers/convertEnum';

import { IUseAddRisk } from '../../hooks/useAddRisk';
import { RiskActivityContent } from '../RiskActivityContent/RiskActivityContent';
import { useFetchBrowseRiskSubType } from '@v2/services/security/risk/sub-type/browse-sub-type/hooks/useFetchBrowseSubType';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

export const RiskSharedContent: FC<{ children?: any } & IUseAddRisk> = ({
  ...props
}) => {
  const { riskData, setRiskData, control, setValue, type } = props;
  const { companyId } = useGetCompanyId();

  const { subTypes } = useFetchBrowseRiskSubType({
    companyId: companyId || riskData.companyId,
    filters: {
      types: [type],
    },
    pagination: {
      page: 1,
    },
  });

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
        {!!riskData.synonymous?.length && (
          <Box mt={5} mb={10}>
            <InputForm
              disabled
              defaultValue={riskData.synonymous?.join(', ')}
              autoFocus
              label="Sinônimos"
              control={control}
              sx={{ width: ['100%', 600] }}
              setValue={setValue}
              name="synonymous"
              size="small"
            />
          </Box>
        )}
        <RadioFormText
          setValue={setValue}
          type="radio"
          control={control}
          defaultValue={riskData.type}
          options={Object.keys(RiskEnum)}
          name="type"
          mt={3}
          columns={5}
        />
        {!!subTypes?.results.length && (
          <RadioFormText
            setValue={setValue}
            type="radio"
            label="Subtipo"
            defaultValue={riskData.subType}
            control={control}
            optionsFieldName={{
              contentField: 'name',
              valueField: 'id',
            }}
            options={[{ id: null, name: '-' }, ...subTypes.results]}
            name="subType"
            mt={6}
            columns={5}
          />
        )}
        <RadioFormText
          type="radio"
          setValue={setValue}
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
            setValue={(v) => setValue('unit', String(v))}
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
            setValue={(v) => setValue('method', String(v))}
            defaultValue={riskData.method || ''}
            label="Método"
            options={['Quantitativo', 'Qualitativo']}
          />
        </Box>
        <Box mt={8}>
          <InputForm
            setValue={setValue}
            defaultValue={riskData.appendix}
            label="Anexo"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'exemplo: 1'}
            name="appendix"
            size="small"
          />
        </Box>
        <Box mt={8}>
          <AutocompleteForm
            name="grauInsalubridade"
            control={control}
            freeSolo={false}
            fullWidth
            getOptionLabel={(option) =>
              GrauInsalubridadeOptions.find((o) => o.value === option)?.label ||
              ''
            }
            inputProps={{
              labelPosition: 'top',
              placeholder: 'selecione o grau de insalubridade...',
            }}
            setValue={(v) => setValue('grauInsalubridade', v)}
            defaultValue={riskData.grauInsalubridade || null}
            label="Grau de Insalubridade"
            options={[null, ...GrauInsalubridadeOptions.map((o) => o.value)]}
          />
        </Box>
        <Box mt={8}>
          <AutocompleteForm
            name="otherAppendix"
            control={control}
            filterOptions={(x) => x}
            unmountOnChangeDefault
            freeSolo
            fullWidth
            getOptionLabel={(option) => String(option)}
            inputProps={{
              labelPosition: 'top',
              placeholder: 'exemplo: ACGH, NR 16 Anexo 1...',
              name: 'otherAppendix',
            }}
            setValue={(v) => setValue('otherAppendix', String(v))}
            defaultValue={riskData.otherAppendix || ''}
            label="Outras Normas"
            options={[
              'ACGH',
              'NR 16 Anexo 1',
              'NR 16 Anexo 2',
              'NR 16 Anexo 3',
              'NR 16 Anexo 4',
              'NR 16 Anexo 5',
            ]}
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
      <Box flex={1} mt={12}>
        <RiskActivityContent {...props} />
      </Box>
    </>
  );
};
