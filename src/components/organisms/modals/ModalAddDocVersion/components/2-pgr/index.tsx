/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { InputForm } from 'components/molecules/form/input';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';

import { dateToString } from 'core/utils/date/date-format';
import { dateMask } from 'core/utils/masks/date.mask';

import { IUsePGRHandleModal } from '../../hooks/usePGRHandleActions';
import { useStep } from './hooks/useStep';
import SText from 'components/atoms/SText';
import { intMask } from 'core/utils/masks/int.mask';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export const ComplementaryModalStep = (props: IUsePGRHandleModal) => {
  const {
    onSubmit,
    setData,
    control,
    onPrevStep,
    loading,
    onDeleteArray,
    onAddArray,
    setValue,
  } = useStep(props);

  const { data } = props;
  const buttons = [
    {
      text: 'Voltar',
    },
    {
      text: 'Salvar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  const allValue = 'all';

  const optionsAPR = [
    allValue,
    HierarchyTypeEnum.DIRECTORY,
    HierarchyTypeEnum.MANAGEMENT,
    HierarchyTypeEnum.SECTOR,
  ].map((type) => {
    if (type === allValue)
      return {
        label: 'Gerar uma única APR para todos os cargos',
        value: type,
      };

    return {
      label: `Gerar uma APR por ${hierarchyTypeTranslation[type]}`,
      value: type,
    };
  });

  return (
    <div>
      <AnimatedStep>
        <Box>
          <Box
            mt={5}
            sx={{
              gap: 10,
              display: 'grid',
              gridTemplateColumns: 'minmax(20rem, 7fr) minmax(10rem, 2fr)',
            }}
          >
            <InputForm
              setValue={setValue}
              defaultValue={data.json?.source}
              label="Fonte de levantamento do inventário (opcional)"
              control={control}
              placeholder={'local onde os dados foram obtidos...'}
              name="source"
              size="small"
              smallPlaceholder
              firstLetterCapitalize
            />
            <InputForm
              setValue={setValue}
              defaultValue={dateToString(data.json?.visitDate)}
              label="Data da visita (opcional)"
              control={control}
              placeholder={'__/__/____'}
              name="visitDate"
              size="small"
              smallPlaceholder
              mask={dateMask.apply}
            />
          </Box>
          <SFlex width={['100%']} gap={8} direction="column" mt={8}>
            <SDisplaySimpleArray
              values={data.json?.complementaryDocs || []}
              onAdd={(value) =>
                onAddArray(value as string, 'complementaryDocs')
              }
              onDelete={(value) => onDeleteArray(value, 'complementaryDocs')}
              label={'Documentos complementares'}
              buttonLabel={'Adicionar Documento'}
              placeholder="ex.: PPRA – Programa de Prevenção de Riscos Ambientais (2021);"
              modalLabel={'Adicionar Documento'}
            />
            <SDisplaySimpleArray
              values={data.json?.complementarySystems || []}
              onAdd={(value) =>
                onAddArray(value as string, 'complementarySystems')
              }
              onDelete={(value) => onDeleteArray(value, 'complementarySystems')}
              label={
                'Sistemas de Gestão de SST, HO, MA e Qualidades existentes:'
              }
              buttonLabel={'Adicionar Sistemas de Gestão'}
              placeholder="deve siguir as exigências previstas da NR-01 Item 1.5.3.1.2."
              modalLabel={'Adicionar Sistemas de Gestão'}
            />
          </SFlex>

          <SFlex width={['100%']} gap={8} direction="column" mt={16}>
            <SText fontSize={16} fontWeight="500">
              Prazo das recomendações do Plano de Ação por Risco Ocupacional
            </SText>
            <Box
              sx={{
                gap: 10,
                display: 'grid',
                flexWrap: 'wrap',
                gridTemplateColumns: [
                  'minmax(200px, 1fr)',
                  'minmax(200px, 1fr) minmax(200px, 1fr)',
                  'minmax(200px, 1fr) minmax(200px, 1fr) minmax(200px, 1fr) minmax(200px, 1fr)',
                ],
              }}
            >
              <InputForm
                defaultValue={
                  String(data.json?.months_period_level_2 || '') || ''
                }
                startAdornment="Prazo de"
                setValue={setValue}
                name="months_period_level_2"
                label="Risco Baixo"
                labelPosition="top"
                control={control}
                endAdornment="meses"
                placeholder="em meses"
                size="small"
                mask={intMask.apply}
              />
              <InputForm
                defaultValue={
                  String(data.json?.months_period_level_3 || '') || ''
                }
                setValue={setValue}
                startAdornment="Prazo de"
                name="months_period_level_3"
                label="Risco Moderado"
                labelPosition="top"
                control={control}
                endAdornment="meses"
                placeholder="em meses"
                size="small"
                mask={intMask.apply}
              />
              <InputForm
                defaultValue={
                  String(data.json?.months_period_level_4 || '') || ''
                }
                setValue={setValue}
                name="months_period_level_4"
                label="Risco Alto"
                labelPosition="top"
                startAdornment="Prazo de"
                control={control}
                endAdornment="meses"
                placeholder="em meses"
                size="small"
                mask={intMask.apply}
              />
              <InputForm
                defaultValue={
                  String(data.json?.months_period_level_5 || '') || ''
                }
                setValue={setValue}
                name="months_period_level_5"
                startAdornment="Prazo de"
                label="Risco Muito Alto"
                labelPosition="top"
                control={control}
                endAdornment="meses"
                placeholder="em meses"
                size="small"
                mask={intMask.apply}
              />
            </Box>
          </SFlex>

          <SFlex direction="column" mt={12}>
            <SText fontSize={16} fontWeight="500" mb={8}>
              Gerar APR&apos;s com base em:
            </SText>
            <SSearchSelect
              getOptionValue={(option) => option.value}
              label=""
              value={optionsAPR.find(
                (option) =>
                  option.value === (data.json?.aprTypeSeparation || allValue),
              )}
              getOptionLabel={(option) => option.label}
              renderItem={({ option }) => (
                <Box>
                  <SText>{option.label}</SText>
                </Box>
              )}
              onChange={(option) => {
                const isAll = option?.value === allValue;
                setData({
                  ...data,
                  json: {
                    ...data.json,
                    aprTypeSeparation: !isAll ? option?.value : null,
                  },
                } as any);
              }}
              placeholder="Selecione..."
              options={optionsAPR}
            />
          </SFlex>
          <SFlex direction="column" mt={12} ml={6}>
            <SSwitch
              onChange={() => {
                setData({
                  ...data,
                  json: {
                    ...data.json,
                    isHideCA: !data.json?.isHideCA,
                  },
                } as any);
              }}
              checked={data.json?.isHideCA}
              label="Não mostrar coluna de origem nas APR's"
              sx={{ mr: 4 }}
              color="text.light"
            />
            <SSwitch
              onChange={() => {
                setData({
                  ...data,
                  json: {
                    ...data.json,
                    isHideOriginColumn: !data.json?.isHideOriginColumn,
                  },
                } as any);
              }}
              checked={data.json?.isHideOriginColumn}
              label="Não mostrar CA's de EPI's"
              sx={{ mr: 4 }}
              color="text.light"
            />
            <SSwitch
              onChange={() => {
                setData({
                  ...data,
                  json: {
                    ...data.json,
                    isQ5: !data.json?.isQ5,
                  },
                } as any);
              }}
              checked={data.json?.isQ5}
              label="Utilizar dodos quantitativos q5 do Ruído"
              sx={{ mr: 4 }}
              color="text.light"
            />
            <SSwitch
              onChange={() => {
                setData({
                  ...data,
                  json: {
                    ...data.json,
                    hasEmergencyPlan: !data.json?.hasEmergencyPlan,
                  },
                });
              }}
              checked={data.json?.hasEmergencyPlan}
              label="Possui plano de atendimento de emergência"
              sx={{ mr: 4 }}
              color="text.light"
            />
          </SFlex>
        </Box>
      </AnimatedStep>
      <SModalButtons loading={loading} onClose={onPrevStep} buttons={buttons} />
    </div>
  );
};
