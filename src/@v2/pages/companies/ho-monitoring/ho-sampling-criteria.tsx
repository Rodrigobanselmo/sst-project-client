import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  SstDateField,
  useSstDateValidity,
} from '@v2/features/sst-operational/SstDateField';
import { CompanyShift } from 'core/services/hooks/queries/useQueryCompanyShifts';
export const canadaUrl =
  'https://www.canada.ca/en/employment-social-development/services/health-safety/reports/hazardous-substances-sampling-guideline.html';
export const fundacentroUrl =
  'https://www.unicesumar.edu.br/biblioteca/wp-content/uploads/sites/50/2019/06/Guia-tecnico-sobre-estrategia-de-amostragem-e-interpretacao.pdf';
export const nioshUrl =
  'https://stacks.cdc.gov/view/cdc/11158';
export const aihaUrl =
  'https://aiha-assets.sfo2.digitaloceanspaces.com/AIHA/resources/Get-Involved/AIHA-Princ%C3%ADpios-de-Boas-Pr%C3%A1ticas-Final.pdf';
export type ShortSamplingPolicy = {
  reference: 'canada' | 'fundacentro' | 'custom';
  resultCount: number;
  justification: string;
};
export type SamplingDistribution = {
  startDate: string;
  endDate: string;
  plannedDays: number;
  minimumWorkersPerGroup: number;
  shiftMode: 'single' | 'multiple';
  shifts: {
    companyShiftId: number | null;
    name: string;
    startTime: string;
    endTime: string;
  }[];
  workerSelection: 'random' | 'most_exposed' | 'representative' | 'custom';
  expectedVariability: 'low' | 'moderate' | 'high' | 'unknown';
  shortScheduling: 'prefer_same_day' | 'independent';
  notes: string;
};
export const defaultShortPolicy = (): ShortSamplingPolicy => ({
  reference: 'canada',
  resultCount: 3,
  justification: '',
});
export const defaultDistribution = (): SamplingDistribution => ({
  startDate: '',
  endDate: '',
  plannedDays: 1,
  minimumWorkersPerGroup: 1,
  shiftMode: 'single',
  shifts: [
    {
      companyShiftId: null,
      name: 'Turno de referência',
      startTime: '',
      endTime: '',
    },
  ],
  workerSelection: 'random',
  expectedVariability: 'unknown',
  shortScheduling: 'prefer_same_day',
  notes: '',
});
export const policyNeedsJustification = (p: ShortSamplingPolicy) =>
  p.reference === 'custom' ||
  p.resultCount < (p.reference === 'fundacentro' ? 6 : 3);
export const policyValid = (p: ShortSamplingPolicy) =>
  Number.isInteger(p.resultCount) &&
  p.resultCount >= 1 &&
  p.resultCount <= 10000 &&
  (!policyNeedsJustification(p) || !!p.justification.trim());
export function distributionValid(d: SamplingDistribution) {
  const time = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  return (
    !!d.startDate &&
    !!d.endDate &&
    d.endDate >= d.startDate &&
    Number.isInteger(d.plannedDays) &&
    d.plannedDays > 0 &&
    Number.isInteger(d.minimumWorkersPerGroup) &&
    d.minimumWorkersPerGroup > 0 &&
    d.minimumWorkersPerGroup <= 10000 &&
    d.plannedDays <=
      Math.round((Date.parse(d.endDate) - Date.parse(d.startDate)) / 86400000) +
        1 &&
    d.shifts.length >= (d.shiftMode === 'multiple' ? 2 : 1) &&
    (d.workerSelection !== 'custom' || !!d.notes.trim()) &&
    d.shifts.every(
      (s) =>
        s.name.trim() &&
        time(s.startTime) &&
        time(s.endTime) &&
        s.startTime !== s.endTime,
    )
  );
}
export function ShortSamplingCriteria({
  type,
  value,
  onChange,
}: {
  type: 'STEL' | 'Teto';
  value: ShortSamplingPolicy;
  onChange: (p: ShortSamplingPolicy) => void;
}) {
  const minimum = value.reference === 'fundacentro' ? 6 : 3;
  return (
    <Stack spacing={6}>
      <Typography component="h4" fontSize="17px" fontWeight={700}>
        {type} — quantidade de avaliações
      </Typography>
      <TextField
        select
        fullWidth
        label={`Referência de quantidade — ${type}`}
        value={value.reference}
        onChange={(e) =>
          onChange({
            ...value,
            reference: e.target.value as ShortSamplingPolicy['reference'],
            resultCount: e.target.value === 'fundacentro' ? 6 : 3,
          })
        }
      >
        <MenuItem value="canada" sx={{ fontWeight: 700, whiteSpace: 'normal' }}>
          {type === 'STEL'
            ? 'Guia canadense §7.3 — três avaliações (recomendado pelo SimpleSST)'
            : 'SimpleSST — três avaliações, comparação pelo guia canadense §7.4 (recomendado)'}
        </MenuItem>
        <MenuItem value="fundacentro" sx={{ whiteSpace: 'normal' }}>
          Fundacentro — seis resultados e análise estatística (padrão ouro)
        </MenuItem>
        <MenuItem value="custom">
          Quantidade personalizada pelo profissional
        </MenuItem>
      </TextField>
      {value.reference === 'canada' && (
        <Typography variant="body2">
          {type === 'STEL'
            ? 'A seção 7.3 orienta no mínimo três amostras STEL de 15 minutos nos períodos de maior exposição.'
            : 'A seção 7.4 orienta a comparação individual com o teto, mas não fixa quantidade mínima. Três avaliações são uma recomendação própria do SimpleSST.'}{' '}
          <a
            href={`${canadaUrl}#h3.${type === 'STEL' ? '3' : '4'}`}
            target="_blank"
            rel="noreferrer"
          >
            Consultar guia canadense
          </a>
        </Typography>
      )}
      {type === 'Teto' && (
        <Typography variant="body2">
          Referência complementar para seleção do maior resultado e avaliação de
          confiança:{' '}
          <a href={nioshUrl} target="_blank" rel="noreferrer">
            NIOSH (1977), seção 4.3 e apêndice K — acessar manual
          </a>
          . O procedimento estatístico completo não é executado nesta tela.
        </Typography>
      )}
      {value.reference === 'fundacentro' && (
        <Alert severity="info">
          Maior resultado de cada jornada, com conjunto de seis ou mais
          resultados e análise estatística do perfil. A referência também prevê
          seis resultados por operação ou atividade crítica repetitiva; confirme
          a distribuição para atendimento integral ao guia. A análise não
          compensa ultrapassagens individuais. Planejar seis resultados não
          significa que o tratamento estatístico já foi realizado.{' '}
          <a
            href={fundacentroUrl + '#page=59'}
            target="_blank"
            rel="noreferrer"
          >
            Fundacentro, itens 8.3.9 e 10.4.3
          </a>
        </Alert>
      )}
      <TextField
        fullWidth
        type="number"
        label={`Quantidade inicial de avaliações ${type}`}
        value={value.resultCount || ''}
        inputProps={{ min: 1, max: 10000, step: 1 }}
        onChange={(e) =>
          onChange({ ...value, resultCount: Number(e.target.value) })
        }
        helperText={`Quantidade da campanha por exposição, distribuída nas condições críticas pertinentes. ${value.reference === 'custom' ? 'Definição profissional independente.' : `Recomendação de referência: ${minimum}.`}`}
      />
      {policyNeedsJustification(value) && (
        <Alert severity="warning">
          Decisão profissional independente: a quantidade adotada é
          personalizada ou inferior à recomendação. A escolha e a justificativa
          ficarão registradas.
        </Alert>
      )}
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={
          policyNeedsJustification(value)
            ? 'Justificativa obrigatória da decisão profissional'
            : 'Observações sobre a quantidade (opcional)'
        }
        required={policyNeedsJustification(value)}
        value={value.justification}
        onChange={(e) => onChange({ ...value, justification: e.target.value })}
        inputProps={{ maxLength: 4000 }}
      />
      <Typography variant="body2">
        Comparar cada resultado com seu limite e destacar o maior. Não usar
        média entre avaliações para compensar uma ultrapassagem. A média dentro
        do próprio período de integração STEL é um conceito distinto.
      </Typography>
    </Stack>
  );
}
export function SamplingDistributionFields({
  value: d,
  onChange,
  shifts,
  onDatesValid,
}: {
  value: SamplingDistribution;
  onChange: (d: SamplingDistribution) => void;
  shifts: CompanyShift[];
  onDatesValid: (v: boolean) => void;
}) {
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  useEffect(() => onDatesValid(datesValid), [datesValid, onDatesValid]);
  // Date fields also publish empty ISO for partial/invalid drafts, so validation cannot reuse an earlier value.
  const patch = (p: Partial<SamplingDistribution>) => onChange({ ...d, ...p });
  const setShift = (
    i: number,
    p: Partial<SamplingDistribution['shifts'][number]>,
  ) =>
    patch({ shifts: d.shifts.map((s, n) => (n === i ? { ...s, ...p } : s)) });
  return (
    <Stack spacing={8}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
        <SstDateField
          label="Início previsto da campanha"
          value={d.startDate}
          onChange={(v) => patch({ startDate: v })}
          onValidityChange={dateFieldValidity('start')}
          required
        />
        <SstDateField
          label="Término previsto da campanha"
          value={d.endDate}
          onChange={(v) => patch({ endDate: v })}
          onValidityChange={dateFieldValidity('end')}
          required
        />
        <TextField
          fullWidth
          type="number"
          label="Dias previstos de coleta"
          value={d.plannedDays || ''}
          onChange={(e) => patch({ plannedDays: Number(e.target.value) })}
          inputProps={{ min: 1, step: 1 }}
          helperText="Dias distintos dentro do período; um dia pode conter várias avaliações."
        />
      </Stack>
      <TextField
        select
        fullWidth
        label="Distribuição entre turnos"
        value={d.shiftMode}
        onChange={(e) =>
          patch({
            shiftMode: e.target.value as SamplingDistribution['shiftMode'],
            shifts:
              e.target.value === 'single'
                ? d.shifts.slice(0, 1)
                : d.shifts.length > 1
                  ? d.shifts
                  : [
                      ...d.shifts,
                      {
                        companyShiftId: null,
                        name: 'Outro turno',
                        startTime: '',
                        endTime: '',
                      },
                    ],
          })
        }
      >
        <MenuItem value="single">Um turno de referência</MenuItem>
        <MenuItem value="multiple">
          Vários turnos — distribuir as avaliações entre eles
        </MenuItem>
      </TextField>
      <Typography variant="body2">
        O cadastro atual de jornadas informa duração, mas não horários
        estruturados. Confirme os turnos desta campanha. Os horários não
        substituem a duração efetiva da jornada; podem atravessar a meia-noite.
      </Typography>
      {d.shifts.map((s, i) => (
        <Stack
          key={i}
          spacing={6}
          sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 6 }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
            <TextField
              select
              fullWidth
              label={`Jornada vinculada ao turno ${i + 1}`}
              value={s.companyShiftId ?? ''}
              onChange={(e) => {
                const selected = shifts.find(
                  (v) => v.id === Number(e.target.value),
                );
                setShift(i, {
                  companyShiftId: selected?.id ?? null,
                  name: selected?.name ?? s.name,
                });
              }}
            >
              <MenuItem value="">Específico da campanha</MenuItem>
              {shifts.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Identificação do turno"
              value={s.name}
              disabled={s.companyShiftId != null}
              onChange={(e) => setShift(i, { name: e.target.value })}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              fullWidth
              label="Início do turno"
              placeholder="HH:MM"
              inputProps={{ maxLength: 5, inputMode: 'numeric' }}
              helperText="Horário de 24 horas (HH:MM)"
              value={s.startTime}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setShift(i, { startTime: e.target.value })}
            />
            <TextField
              fullWidth
              label="Fim do turno"
              placeholder="HH:MM"
              inputProps={{ maxLength: 5, inputMode: 'numeric' }}
              helperText="Horário de 24 horas (HH:MM)"
              value={s.endTime}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setShift(i, { endTime: e.target.value })}
            />
          </Stack>
          {d.shiftMode === 'multiple' && d.shifts.length > 2 && (
            <Box>
              <Button
                onClick={() =>
                  patch({ shifts: d.shifts.filter((_, n) => n !== i) })
                }
              >
                Remover turno
              </Button>
            </Box>
          )}
        </Stack>
      ))}
      {d.shiftMode === 'multiple' && d.shifts.length < 50 && (
        <Box>
          <Button
            variant="outlined"
            onClick={() =>
              patch({
                shifts: [
                  ...d.shifts,
                  {
                    companyShiftId: null,
                    name: `Turno ${d.shifts.length + 1}`,
                    startTime: '',
                    endTime: '',
                  },
                ],
              })
            }
          >
            Adicionar turno
          </Button>
        </Box>
      )}
      <TextField
        fullWidth
        type="number"
        label="Mínimo de trabalhadores distintos por GSE"
        value={d.minimumWorkersPerGroup || ''}
        inputProps={{ min: 1, max: 10000, step: 1 }}
        onChange={(e) =>
          patch({ minimumWorkersPerGroup: Number(e.target.value) })
        }
        helperText="Critério de distribuição, não quantidade de amostras. A seleção nominal será definida na organização das coletas."
      />
      <TextField
        select
        fullWidth
        label="Critério de seleção dos trabalhadores"
        value={d.workerSelection}
        onChange={(e) =>
          patch({
            workerSelection: e.target
              .value as SamplingDistribution['workerSelection'],
          })
        }
      >
        <MenuItem value="random">Seleção aleatória dentro do GSE</MenuItem>
        <MenuItem value="most_exposed">
          Trabalhador com maior exposição prevista
        </MenuItem>
        <MenuItem value="representative">
          Seleção representativa das condições e tarefas
        </MenuItem>
        <MenuItem value="custom">
          Critério profissional específico — descrever nas observações
        </MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        label="Variabilidade esperada entre dias e condições"
        value={d.expectedVariability}
        onChange={(e) =>
          patch({
            expectedVariability: e.target
              .value as SamplingDistribution['expectedVariability'],
          })
        }
      >
        <MenuItem value="unknown">Ainda desconhecida</MenuItem>
        <MenuItem value="low">Baixa — ciclos e condições semelhantes</MenuItem>
        <MenuItem value="moderate">Moderada</MenuItem>
        <MenuItem value="high">Alta — condições e cargas variáveis</MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        label="Organização das coletas STEL e de pico"
        value={d.shortScheduling}
        onChange={(e) =>
          patch({
            shortScheduling: e.target
              .value as SamplingDistribution['shortScheduling'],
          })
        }
      >
        <MenuItem value="prefer_same_day">
          Preferencialmente nos mesmos dias das avaliações TWA
        </MenuItem>
        <MenuItem value="independent">
          Dias independentes, conforme ocorrência das atividades críticas
        </MenuItem>
      </TextField>
      <Typography variant="body2">
        A coincidência com o dia de TWA é uma preferência logística, não uma
        obrigação. As avaliações de curta duração devem acompanhar as condições
        críticas pertinentes.
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Observações sobre a distribuição e condições representativas"
        value={d.notes}
        onChange={(e) => patch({ notes: e.target.value })}
        inputProps={{ maxLength: 4000 }}
        helperText="Complemente com sazonalidade, carga de produção, ciclos e restrições. Datas, turnos e critérios acima são salvos em campos próprios."
      />
    </Stack>
  );
}
