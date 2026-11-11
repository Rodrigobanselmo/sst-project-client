import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';

import type { IUseEditExam } from '../../hooks/useEditExams';

import {
  examRiskPurposes as purposes,
  purposeNeedsDescription,
} from 'core/utils/helpers/examRiskPurpose';

export function ExamPeriodicityPanel({
  examData,
  loading,
  setExamData,
  useStandardPeriodicity,
  biologicalPeriodicity,
  companyMonths,
}: Pick<
  IUseEditExam,
  | 'examData'
  | 'loading'
  | 'setExamData'
  | 'useStandardPeriodicity'
  | 'biologicalPeriodicity'
  | 'companyMonths'
>) {
  const standard = biologicalPeriodicity.data;
  const purpose =
    examData.recommendationPurpose ??
    (examData.biologicalMonitoring === true ? 'BIOLOGICAL_MONITORING' : '');
  const showDescription = purposeNeedsDescription(purpose);
  const showStandard =
    examData.biologicalMonitoring === true && standard?.standardMonths != null;
  const hasDifferentPeriod =
    showStandard &&
    examData.isPeriodic &&
    !!companyMonths &&
    Number(companyMonths) !== standard?.standardMonths;

  return (
    <Stack
      spacing={6}
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        maxWidth: 640,
        p: 8,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <TextField
        select
        size="small"
        label="Finalidade do vínculo"
        disabled={loading}
        value={purpose}
        onChange={(event) => {
          const value = event.target.value;
          setExamData((current) => ({
            ...current,
            recommendationPurpose: value || null,
            biologicalMonitoring: value
              ? value === 'BIOLOGICAL_MONITORING'
              : null,
            ...(value === 'BIOLOGICAL_MONITORING' && {
              publishAsSystemRule: false,
            }),
          }));
        }}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="">Não informada</MenuItem>
        {Object.entries(purposes).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
        {purpose && !(purpose in purposes) && (
          <MenuItem value={purpose}>{purpose}</MenuItem>
        )}
      </TextField>

      {showDescription && (
        <TextField
          label={
            purpose === 'OTHER'
              ? 'Descreva a finalidade'
              : 'Atividade específica'
          }
          size="small"
          required={purpose === 'OTHER'}
          disabled={loading}
          multiline
          inputProps={{ maxLength: 2000 }}
          value={examData.recommendationRationale ?? ''}
          onChange={(event) =>
            setExamData((current) => ({
              ...current,
              recommendationRationale: event.target.value,
            }))
          }
        />
      )}

      {examData.biologicalMonitoring === true && !showStandard && (
        <Typography variant="body2" color="text.secondary">
          {biologicalPeriodicity.isLoading
            ? 'Consultando enquadramento do vínculo…'
            : biologicalPeriodicity.isError
              ? 'Não foi possível consultar as referências do vínculo.'
              : 'Sem referência ativa e confirmada para este exame e fator de risco.'}
        </Typography>
      )}

      {showStandard && standard && (
        <>
          <Typography variant="body2" fontWeight={600}>
            Padrão do sistema · {standard.standardMonths} meses
          </Typography>
          {standard.references.map((reference, index) => (
            <Typography key={index} variant="body2">
              {reference.source === 'NR_07'
                ? `Indicador biológico ${reference.table === 'QUADRO_1' ? 'de exposição excessiva (IBE/EE)' : 'com significado clínico (IBE/SC)'} · NR-7 · Anexo I · ${reference.table?.replace('QUADRO_', 'Quadro ')}`
                : 'Indicador biológico de exposição · ACGIH/BEI · recomendação SimpleSST'}
              {' · '}
              {reference.agent}
              {reference.version && ` · ${reference.version}`}
            </Typography>
          ))}
          <Typography variant="body2">
            {examData.isPeriodic
              ? `Configuração da empresa · ${companyMonths ? `${companyMonths} meses` : 'intervalo não informado'}`
              : 'Configuração da empresa · periódico desmarcado'}
          </Typography>
          {!examData.id &&
            examData.isPeriodic &&
            Number(companyMonths) !== standard.standardMonths && (
              <Button
                type="button"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                onClick={useStandardPeriodicity}
              >
                Usar padrão semestral
              </Button>
            )}
        </>
      )}

      {(hasDifferentPeriod || examData.periodicityJustification) && (
        <TextField
          label="Justificativa da periodicidade adotada"
          required={hasDifferentPeriod && !examData.id}
          multiline
          minRows={2}
          size="small"
          disabled={loading}
          inputProps={{ maxLength: 2000 }}
          value={examData.periodicityJustification ?? ''}
          helperText="Registre a decisão da empresa e o fundamento aplicável."
          onChange={(event) =>
            setExamData((current) => ({
              ...current,
              periodicityJustification: event.target.value,
            }))
          }
        />
      )}
    </Stack>
  );
}
