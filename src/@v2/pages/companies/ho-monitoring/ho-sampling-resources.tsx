import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';
export type SamplingResources = {
  supervision: 'audited' | 'semi_audited';
  professionals: number;
  pumps: number;
  calibrators: number;
  hasFlowSplitters: boolean;
  dualLowFlow: number;
  dualHighFlow: number;
  tripleLowFlow: number;
  quadrupleLowFlow: number;
};
export type SamplingResourcesDraft = Omit<SamplingResources, 'supervision'> & {
  supervision: SamplingResources['supervision'] | '';
};
export const defaultSamplingResources = (): SamplingResourcesDraft => ({
  supervision: '',
  professionals: 0,
  pumps: 0,
  calibrators: 0,
  hasFlowSplitters: false,
  dualLowFlow: 0,
  dualHighFlow: 0,
  tripleLowFlow: 0,
  quadrupleLowFlow: 0,
});
const countKeys = [
  'professionals',
  'pumps',
  'calibrators',
  'dualLowFlow',
  'dualHighFlow',
  'tripleLowFlow',
  'quadrupleLowFlow',
] as const;
export const resourcesValid = (
  v: SamplingResourcesDraft,
): v is SamplingResources =>
  ['audited', 'semi_audited'].includes(v.supervision) &&
  countKeys.every(
    (k) => Number.isInteger(v[k]) && v[k] >= 0 && v[k] <= 10000,
  ) &&
  v.professionals >= 1 &&
  (!v.hasFlowSplitters ||
    v.dualLowFlow + v.dualHighFlow + v.tripleLowFlow + v.quadrupleLowFlow > 0);
export function SamplingResourcesFields({
  value: v,
  onChange,
}: {
  value: SamplingResourcesDraft;
  onChange: (v: SamplingResourcesDraft) => void;
}) {
  const quantity = (key: (typeof countKeys)[number], label: string) => (
    <TextField
      key={key}
      fullWidth
      type="number"
      label={label}
      value={Number.isNaN(v[key]) ? '' : v[key]}
      inputProps={{ min: key === 'professionals' ? 1 : 0, max: 10000, step: 1 }}
      onChange={(e) =>
        onChange({
          ...v,
          [key]: e.target.value === '' ? NaN : Number(e.target.value),
        })
      }
      error={
        !Number.isInteger(v[key]) ||
        v[key] < (key === 'professionals' ? 1 : 0) ||
        v[key] > 10000
      }
    />
  );
  return (
    <Stack spacing={8}>
      <TextField
        select
        fullWidth
        label="Acompanhamento da amostragem"
        value={v.supervision}
        onChange={(e) =>
          onChange({
            ...v,
            supervision: e.target
              .value as SamplingResourcesDraft['supervision'],
          })
        }
      >
        <MenuItem value="">Selecione a modalidade</MenuItem>
        <MenuItem value="audited">
          Auditada — acompanhamento individual pelo profissional
        </MenuItem>
        <MenuItem value="semi_audited">
          Semi-auditada — atividades autodeclaradas pelo trabalhador
        </MenuItem>
      </TextField>
      <Typography variant="body2">
        <strong>Auditada:</strong> o técnico de segurança do trabalho ou outro
        profissional da área acompanha um único trabalhador avaliado, observa
        suas atividades e registra os acontecimentos na folha de campo.
      </Typography>
      <Typography variant="body2">
        <strong>Semi-auditada:</strong> o profissional instala os equipamentos
        em vários trabalhadores e cada trabalhador registra suas próprias
        atividades na folha de campo, por autodeclaração. A modalidade descreve
        o acompanhamento, sem substituir as exigências do método.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
        {quantity('professionals', 'Profissionais disponíveis simultaneamente')}
        {quantity('pumps', 'Bombas de amostragem disponíveis')}
        {quantity('calibrators', 'Calibradores de vazão disponíveis')}
      </Stack>
      <Typography variant="body2">
        Informe os recursos disponíveis ao mesmo tempo para esta campanha. Na
        modalidade auditada, cada profissional acompanha um trabalhador por vez.
        Calibradores compartilhados exigem organizar os horários de preparação e
        verificação das vazões.
      </Typography>
      {v.pumps > 0 && v.calibrators === 0 && (
        <Alert severity="warning">
          Há bombas previstas, mas nenhum calibrador disponível. Revise os
          recursos para preparar e verificar as vazões.
        </Alert>
      )}
      {v.calibrators > 0 && v.professionals > v.calibrators && (
        <Alert severity="info">
          Há mais profissionais que calibradores. Planeje a sequência de uso
          para evitar filas no início e no encerramento das coletas.
        </Alert>
      )}
      <TextField
        select
        fullWidth
        label="Há divisores de fluxo (difusores) disponíveis?"
        value={v.hasFlowSplitters ? 'yes' : 'no'}
        onChange={(e) =>
          onChange({
            ...v,
            hasFlowSplitters: e.target.value === 'yes',
            ...(e.target.value === 'no'
              ? {
                  dualLowFlow: 0,
                  dualHighFlow: 0,
                  tripleLowFlow: 0,
                  quadrupleLowFlow: 0,
                }
              : {}),
          })
        }
      >
        <MenuItem value="no">Não</MenuItem>
        <MenuItem value="yes">Sim</MenuItem>
      </TextField>
      {v.hasFlowSplitters && (
        <>
          <Typography fontWeight={600}>
            Quantidade de divisores por configuração
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
            {quantity('dualLowFlow', 'Duplos — baixa vazão (2 saídas)')}
            {quantity('dualHighFlow', 'Duplos — alta vazão (2 saídas)')}
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
            {quantity('tripleLowFlow', 'Triplos — baixa vazão (3 saídas)')}
            {quantity(
              'quadrupleLowFlow',
              'Quádruplos — baixa vazão (4 saídas)',
            )}
          </Stack>
          <Typography variant="body2">
            Para o planejamento: baixa vazão até 500 mL/min (0,5 L/min) por
            saída; acima disso, somente divisores duplos declarados compatíveis
            com alta vazão. Informe quantidades de divisores, não de saídas.
          </Typography>
          <Alert severity="info">
            Um tubo com vários agentes é uma única coleta. Vários amostradores
            na mesma bomba usam saídas independentes do divisor. Este cadastro
            não autoriza combinar automaticamente: confirme o modelo, a faixa de
            cada saída, a soma das vazões, a capacidade da bomba e a calibração
            de cada ramal conforme o fabricante. Um divisor triplo de baixa
            vazão não atende um ramal acima de 0,5 L/min.
          </Alert>
          <Typography variant="body2">
            <a
              href="https://www.skcltd.com/images/pdfs/38041.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Referência de configuração e calibração de divisores — SKC
            </a>
          </Typography>
        </>
      )}
      {!resourcesValid(v) && (
        <Typography variant="body2" color="text.secondary">
          Selecione a modalidade, informe pelo menos um profissional e revise as
          quantidades inteiras de recursos. Se houver divisores, informe ao
          menos uma unidade.
        </Typography>
      )}
    </Stack>
  );
}
export function SamplingResourcesSummary({
  value: v,
}: {
  value: SamplingResources;
}) {
  return (
    <Stack spacing={4}>
      <Typography fontWeight={700}>
        Acompanhamento e recursos salvos na etapa 3.3
      </Typography>
      <Typography>
        {v.supervision === 'audited'
          ? 'Auditada — acompanhamento individual pelo profissional'
          : 'Semi-auditada — atividades autodeclaradas pelo trabalhador'}
      </Typography>
      <Typography variant="body2">
        Profissionais: {v.professionals} · Bombas: {v.pumps} · Calibradores:{' '}
        {v.calibrators}
      </Typography>
      <Typography variant="body2">
        {v.hasFlowSplitters
          ? `Divisores: ${v.dualLowFlow} duplos de baixa vazão; ${v.dualHighFlow} duplos de alta vazão; ${v.tripleLowFlow} triplos de baixa vazão; ${v.quadrupleLowFlow} quádruplos de baixa vazão.`
          : 'Sem divisores de fluxo previstos.'}
      </Typography>
      <Typography variant="body2">
        Recursos para organizar as coletas; a compatibilidade de ramais e a
        capacidade simultânea dependem do conjunto bomba/divisor/amostradores.
      </Typography>
    </Stack>
  );
}
