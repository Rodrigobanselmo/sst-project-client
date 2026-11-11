import { MouseEvent, useState } from 'react';
import { Box, Chip, Popover, Stack, Typography } from '@mui/material';

import { IExam } from 'core/interfaces/api/IExam';

const labels = {
  NR_07: 'NR-7',
  ACGIH_BEI: 'ACGIH/BEI',
  ESOCIAL_T27: 'eSocial',
};
const statusLabels = {
  APPLICABLE: 'Aplicável',
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisão',
  INACTIVE: 'Inativa',
};

type Source = keyof typeof labels;

export function ExamReferenceChips({ exam }: { exam: IExam }) {
  const [selection, setSelection] = useState<{
    source: Source;
    anchor: HTMLElement;
  } | null>(null);
  const references = exam.references ?? [];
  const open = (source: Source, event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setSelection({ source, anchor: event.currentTarget });
  };

  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}
    >
      {(['NR_07', 'ACGIH_BEI', 'ESOCIAL_T27'] as const).map((source) => {
        const rows = references.filter(
          (reference) => reference.source === source,
        );
        if (
          source === 'ESOCIAL_T27' ? !exam.esocial27Code?.trim() : !rows.length
        )
          return null;
        const applicable = rows.some((row) => row.status === 'APPLICABLE');
        const pending = rows.some((row) => row.status !== 'APPLICABLE');
        const suffix =
          applicable && pending
            ? ' · ver pendências'
            : pending
              ? ` · ${rows.every((row) => row.status === rows[0].status) ? statusLabels[rows[0].status].toLowerCase() : 'ver estados'}`
              : '';
        return (
          <Chip
            key={source}
            size="small"
            variant="outlined"
            color={applicable ? 'primary' : 'default'}
            label={labels[source] + suffix}
            onClick={(event) => open(source, event)}
          />
        );
      })}
      <Popover
        open={!!selection}
        anchorEl={selection?.anchor}
        onClose={() => setSelection(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {selection && (
          <Stack
            spacing={6}
            sx={{
              p: 8,
              boxSizing: 'border-box',
              width: 'min(440px, calc(100vw - 32px))',
              maxHeight: '60vh',
            }}
          >
            <Typography variant="subtitle2">
              {labels[selection.source]}
            </Typography>
            {selection.source === 'ESOCIAL_T27' ? (
              <Typography variant="body2">
                Código de procedimento {exam.esocial27Code} · Tabela 27
              </Typography>
            ) : (
              references
                .filter((row) => row.source === selection.source)
                .map((row, index) => (
                  <Box key={index}>
                    <Typography variant="body2" fontWeight={600}>
                      {[statusLabels[row.status], row.agent, row.label]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                    <Typography variant="body2">
                      {[
                        row.determinant,
                        row.matrix,
                        row.annex === 'ANNEX_I' ? 'Anexo I' : row.annex,
                        row.table?.replace('QUADRO_', 'Quadro '),
                        row.version,
                        row.year && `Referência de ${row.year}`,
                        row.edition && `Fonte de ${row.edition}`,
                        row.page && `p. ${row.page}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.states.join(' · ')}
                    </Typography>
                  </Box>
                ))
            )}
          </Stack>
        )}
      </Popover>
    </Box>
  );
}
