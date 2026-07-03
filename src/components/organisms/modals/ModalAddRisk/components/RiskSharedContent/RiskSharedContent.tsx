/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo, useState } from 'react';

import { Box, Button } from '@mui/material';
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
import {
  formatRiskSubTypeButtonLabel,
} from 'core/utils/risk-subtype-display.util';
import type { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { IUseAddRisk } from '../../hooks/useAddRisk';
import { RiskActivityContent } from '../RiskActivityContent/RiskActivityContent';
import { useFetchBrowseRiskSubType } from '@v2/services/security/risk/sub-type/browse-sub-type/hooks/useFetchBrowseSubType';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { RiskFactorAiSuggestionButton } from '@v2/components/molecules/RiskFactorAiSuggestion/RiskFactorAiSuggestionButton';
import {
  getRiskFactorSeverityRadioOptions,
  isAiSuggestionSupportedRiskType,
} from '@v2/constants/risk-factor-severity-options.constant';
import type { RiskFactorAiSuggestionFormSource } from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/build-risk-factor-ai-suggestion-payload.util';
import { useAccess } from 'core/hooks/useAccess';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { ModalCreateRiskSubType } from '../ModalCreateRiskSubType/ModalCreateRiskSubType';

export const RiskSharedContent: FC<{ children?: any } & IUseAddRisk> = ({
  ...props
}) => {
  const { riskData, setRiskData, control, setValue, type, riskEditorLayout } =
    props;
  const {
    aiSuggestionSourceContext,
    aiSuggestionKnownDataExtras,
    isCatalogReadOnly,
  } = props;
  const longTextFieldSx =
    riskEditorLayout === 'inline'
      ? { width: '100%' }
      : { width: ['100%', 600] };
  const { companyId } = useGetCompanyId();
  const { isMaster } = useAccess();
  const [createSubTypeOpen, setCreateSubTypeOpen] = useState(false);

  const { subTypes, refetch: refetchSubTypes } = useFetchBrowseRiskSubType({
    companyId: companyId || riskData.companyId,
    filters: {
      types: type ? [type as RiskTypeEnum] : undefined,
    },
    pagination: {
      page: 1,
      limit: 200,
    },
  });

  const showSubTypeSection =
    Boolean(type) &&
    (Boolean(subTypes?.results.length) || isMaster);

  const severityOptions = useMemo(
    () =>
      isAiSuggestionSupportedRiskType(type)
        ? getRiskFactorSeverityRadioOptions(type)
        : enumToArray(SeverityEnum, 'value'),
    [type],
  );

  const subTypeRadioOptions = useMemo(() => {
    const browsed = subTypes?.results ?? [];
    const merged: { id: number; name: string }[] = browsed.map((item) => ({
      id: Number(item.id),
      name: item.name,
    }));

    const linked = (
      riskData as { subTypes?: IRiskFactors['subTypes'] }
    ).subTypes?.[0]?.sub_type;

    if (linked?.id != null && linked.name) {
      const linkedId = Number(linked.id);
      if (!merged.some((item) => item.id === linkedId)) {
        merged.push({ id: linkedId, name: linked.name });
      }
    }

    return [
      { id: null, name: '-', tooltip: 'Sem subtipo' },
      ...merged.map((item) => ({
        id: item.id,
        name: formatRiskSubTypeButtonLabel(item.name),
        tooltip: item.name,
      })),
    ];
  }, [riskData, subTypes?.results]);

  const selectedSubTypeValue =
    riskData.subType != null && riskData.subType !== ''
      ? String(riskData.subType)
      : '';

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
        <Box mt={5} mb={10}>
          <InputForm
            defaultValue={riskData.synonymous?.join('; ') || ''}
            label="Sinônimos"
            control={control}
            sx={{ width: ['100%', 600] }}
            placeholder={'sinônimos separados por ponto e vírgula (;)...'}
            setValue={setValue}
            name="synonymous"
            size="small"
          />
        </Box>
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
        {showSubTypeSection && (
          <Box mt={6}>
            <RadioFormText
              setValue={setValue}
              type="radio"
              label="Subtipo"
              defaultValue={selectedSubTypeValue}
              control={control}
              controlled
              syncDefaultValue={false}
              unmountOnChangeDefault={false}
              optionsFieldName={{
                contentField: 'name',
                valueField: 'id',
              }}
              options={subTypeRadioOptions}
              name="subType"
              columns={5}
              onChange={(event) => {
                const rawValue = event.target.value;
                const nextSubType =
                  rawValue === '' || rawValue === 'null'
                    ? undefined
                    : String(rawValue);
                setRiskData((current) => ({
                  ...current,
                  subType: nextSubType,
                }));
              }}
            />
            {isMaster && (
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setCreateSubTypeOpen(true)}
              >
                Criar subtipo
              </Button>
            )}
          </Box>
        )}
        <ModalCreateRiskSubType
          open={createSubTypeOpen}
          onClose={() => setCreateSubTypeOpen(false)}
          riskType={type as RiskTypeEnum}
            onCreated={(created) => {
            void refetchSubTypes();
            setValue('subType', String(created.id));
            setRiskData((current) => ({
              ...current,
              subType: String(created.id),
            }));
          }}
        />
        <RadioFormText
          type="radio"
          setValue={setValue}
          label="Severidade"
          control={control}
          syncDefaultValue={false}
          unmountOnChangeDefault={false}
          controlled
          options={severityOptions}
          name="severity"
          mt={5}
          mb={5}
          columns={5}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) return;

            setRiskData((current) => ({
              ...current,
              severity: parsed,
            }));
          }}
        />
        {isAiSuggestionSupportedRiskType(type) && !isCatalogReadOnly && (
          <RiskFactorAiSuggestionButton
            form={riskData}
            setRiskData={(updater) =>
              setRiskData((current) => updater(current as RiskFactorAiSuggestionFormSource) as typeof riskData)
            }
            setValue={setValue}
            getValues={props.getValues}
            watch={props.watch}
            sourceContext={
              aiSuggestionSourceContext ?? {
                origin: 'risk-factor-form',
              }
            }
            knownDataExtras={aiSuggestionKnownDataExtras}
          />
        )}
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
          sx={{ ...longTextFieldSx, mb: 8 }}
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
          sx={{ ...longTextFieldSx, mb: 8 }}
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
