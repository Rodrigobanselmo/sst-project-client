import { Box } from '@mui/material';
import type {
  NarrativeItem,
  NarrativeSection,
  ReportRun,
} from './campaign-reports.api';

export function CampaignReportNarrative({
  run,
  section,
  items: suppliedItems,
}: {
  run: ReportRun | null;
  section: NarrativeSection;
  items?: NarrativeItem[];
}) {
  if (!run?.result) return null;
  const items = suppliedItems ?? run.result.narrative[section];
  if (!items.length)
    return (
      <p>
        Não foram formuladas conclusões nesta seção por falta de sustentação
        suficiente.
      </p>
    );
  return (
    <Box>
      {items.map((item, index) => (
        <Box key={index} sx={{ mb: '24px' }}>
          <p data-slide-paragraph>{item.text}</p>
          {!!item.evidenceRefs.length && (
            <Box
              component="details"
              data-report-evidence
              sx={{ fontSize: '0.8em', lineHeight: 1.6 }}
            >
              <summary style={{ cursor: 'pointer' }}>
                Evidências utilizadas
              </summary>
              <ul>
                {item.evidenceRefs.map((ref) => {
                  const evidence = run.result!.evidence.find(
                    (value) => value.id === ref,
                  );
                  if (!evidence) return null;
                  const d = evidence.details;
                  return (
                    <li key={ref}>
                      {evidence.label} —{' '}
                      {d.score !== undefined
                        ? `indicador ${d.score.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
                        : `${d.count} respostas (${d.percentage?.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)`}
                      ; base: {d.denominator}{' '}
                      {d.score !== undefined
                        ? 'seleções pontuáveis'
                        : 'respostas incluídas'}
                      .
                    </li>
                  );
                })}
              </ul>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
