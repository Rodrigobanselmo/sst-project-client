/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';

import {
  occupationalCriterionHint,
  resolveRouteWorkspaceId,
  resolveWorkspacePreferredNoiseCriterion,
} from 'core/constants/maps/preferred-noise-criterion';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { floatMask } from 'core/utils/masks/float.mask';

import { IUseModalQuantity } from '../../hooks/useModalAddQuantity';

const impactCircuitOptions = [
  { value: 'FAST_C', content: 'FAST C' },
  { value: 'LINEAR', content: 'LINEAR' },
];

const impactMethodOptions = [
  { value: 'NR15', content: 'NR-15 — Anexo 2' },
  { value: 'NHO01', content: 'NHO 01 — Ruído de impacto' },
];

/** Np/NA só para apresentação; motor usa precisão matemática no API. */
const computeNho01Display = (countRaw: string | undefined) => {
  const normalized = String(countRaw || '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > 10000) return { overLimit: true as const };
  const effectiveNp = Math.min(160 - 10 * Math.log10(n), 140);
  return {
    overLimit: false as const,
    effectiveNp,
    actionLevel: effectiveNp - 3,
  };
};

export const NoiseForm = (props: IUseModalQuantity) => {
  const { control, data, setValue, setData } = props;
  const { router } = useGetCompanyId();
  const { data: company } = useQueryCompany();

  /**
   * Preferência só com workspace inequívoco da rota (workspaceId path OU
   * tabWorkspaceId na Caracterização) + match em company.workspace.
   * Não usa o primeiro workspace do GHO/empresa.
   */
  const preferredNoiseCriterion = useMemo(() => {
    const workspaceId = resolveRouteWorkspaceId(router.query);
    return resolveWorkspacePreferredNoiseCriterion({
      workspaceId,
      workspaces: company?.workspace,
    });
  }, [company?.workspace, router.query]);

  const criterionHint = occupationalCriterionHint(preferredNoiseCriterion);

  const isImpactAppendix = String(data.risk?.appendix || '') === '2';
  const impactMethod =
    data.impactMethod === 'NHO01' || data.impactMethod === 'NR15'
      ? data.impactMethod
      : data.impactPeak || data.impactCircuit
        ? 'NR15'
        : '';

  const peakUnit =
    impactMethod === 'NHO01'
      ? 'dB(Lin)'
      : data.impactCircuit === 'LINEAR'
        ? 'dB (linear)'
        : data.impactCircuit === 'FAST_C'
          ? 'dB(C)'
          : data.risk?.unit || 'dB';

  const nhoDisplay = useMemo(
    () =>
      impactMethod === 'NHO01' ? computeNho01Display(data.impactCount) : null,
    [impactMethod, data.impactCount],
  );

  const onImpactMethodChange = (value: string) => {
    if (value !== 'NR15' && value !== 'NHO01') return;

    setValue('impactMethod', value);
    setData((prev) => {
      if (value === 'NHO01') {
        setValue('impactCircuit', '');
        setValue('impactCount', prev.impactCount || '');
        return {
          ...prev,
          impactMethod: 'NHO01',
          impactCircuit: '' as const,
        };
      }

      setValue('impactCount', '');
      return {
        ...prev,
        impactMethod: 'NR15',
        impactCount: '',
      };
    });
  };

  return (
    <SFlex width={['100%', 600]} direction="column" gap={10} mt={8}>
      {criterionHint && (
        <SText color="text.secondary" fontSize={13}>
          {criterionHint}
        </SText>
      )}

      {isImpactAppendix && (
        <>
          <SText color="text.label" fontSize={14}>
            Ruído de impacto
          </SText>
          <Box>
            <SelectForm
              setValue={setValue}
              label="Critério"
              control={control}
              sx={{ minWidth: ['100%', 600] }}
              placeholder="Selecione NR-15 ou NHO 01"
              name="impactMethod"
              size="small"
              options={impactMethodOptions}
              defaultValue={impactMethod || ''}
              onChange={(e: any) => onImpactMethodChange(e?.target?.value)}
            />
          </Box>

          {impactMethod === 'NR15' && (
            <>
              <SText color="text.label" fontSize={14}>
                NR-15 — Anexo 2 — medição de pico
              </SText>
              <Box>
                <SelectForm
                  setValue={setValue}
                  label="Circuito da medição de pico"
                  control={control}
                  sx={{ minWidth: ['100%', 600] }}
                  placeholder="Selecione FAST C ou LINEAR"
                  name="impactCircuit"
                  size="small"
                  options={impactCircuitOptions}
                  defaultValue={data.impactCircuit || ''}
                  onChange={(e: any) =>
                    setData((prev) => ({
                      ...prev,
                      impactCircuit: e?.target?.value || '',
                    }))
                  }
                />
              </Box>
              <InputForm
                setValue={setValue}
                defaultValue={(data.impactPeak || '').replace('.', ',')}
                label="Pico de impacto"
                control={control}
                placeholder="valor do pico medido"
                name="impactPeak"
                size="small"
                endAdornment={peakUnit}
                mask={floatMask.apply({ negative: false, ltAccept: true })}
              />
            </>
          )}

          {impactMethod === 'NHO01' && (
            <>
              <SText color="text.label" fontSize={14}>
                NHO 01 — medição em Linear (nível de pico)
              </SText>
              <InputForm
                setValue={setValue}
                defaultValue={(data.impactPeak || '').replace('.', ',')}
                label="Pico de impacto"
                control={control}
                placeholder="valor do pico medido"
                name="impactPeak"
                size="small"
                endAdornment={peakUnit}
                mask={floatMask.apply({ negative: false, ltAccept: true })}
              />
              <InputForm
                setValue={setValue}
                defaultValue={(data.impactCount || '').replace('.', ',')}
                label="Número de impactos/impulsos na jornada"
                control={control}
                placeholder="n"
                name="impactCount"
                size="small"
                mask={floatMask.apply({ negative: false, ltAccept: true })}
                onChange={(e: any) =>
                  setData((prev) => ({
                    ...prev,
                    impactCount: e?.target?.value || '',
                  }))
                }
              />
              {nhoDisplay?.overLimit && (
                <SText color="error.main" fontSize={13}>
                  Acima de 10.000 impactos ou impulsos por jornada, o ruído deve
                  ser tratado como contínuo ou intermitente.
                </SText>
              )}
              {nhoDisplay && !nhoDisplay.overLimit && (
                <SText color="text.label" fontSize={13}>
                  Np = {nhoDisplay.effectiveNp.toFixed(1)} dB(Lin) · Nível de
                  ação = {nhoDisplay.actionLevel.toFixed(1)} dB(Lin)
                </SText>
              )}
            </>
          )}

          <SText color="text.label" fontSize={14} mt={2}>
            Ruído contínuo/intermitente entre os picos (opcional)
          </SText>
        </>
      )}

      <InputForm
        setValue={setValue}
        defaultValue={data.nr15q5.replace('.', ',')}
        label="Q5 (NR-15 — Anexo 1)"
        control={control}
        placeholder={`valor do resultado obtido em ${data.risk.unit}`}
        name="nr15q5"
        size="small"
        endAdornment={data.risk.unit}
        mask={floatMask.apply({ negative: false, ltAccept: true })}
      />
      <InputForm
        setValue={setValue}
        defaultValue={data.ltcatq3.replace('.', ',')}
        label="Q3 (NHO 01)"
        control={control}
        placeholder={`valor do resultado obtido em ${data.risk.unit}`}
        name="ltcatq3"
        size="small"
        endAdornment={data.risk.unit}
        mask={floatMask.apply({ negative: false, ltAccept: true })}
      />
      <Box>
        <InputForm
          setValue={setValue}
          defaultValue={data.ltcatq5.replace('.', ',')}
          label="LTCAT (q5)"
          control={control}
          placeholder={`valor do resultado obtido em ${data.risk.unit}`}
          name="ltcatq5"
          size="small"
          endAdornment={data.risk.unit}
          mask={floatMask.apply({ negative: false, ltAccept: true })}
        />
        <SText color="text.secondary" fontSize={12} mt={2}>
          Uso previdenciário (LTCAT / PPP / eSocial). Não define o risco
          ocupacional do PGR.
        </SText>
      </Box>
    </SFlex>
  );
};
