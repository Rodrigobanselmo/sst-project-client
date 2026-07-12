import { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import { IEpi } from 'core/interfaces/api/IEpi';

export function epiCaSituationLabel(epi: IEpi) {
  if (epi.rawSituation?.trim()) return epi.rawSituation.trim();
  if (epi.isValid === false) return 'Vencido (planilha)';
  if (epi.expiredDate && dayjs(epi.expiredDate).isBefore(dayjs())) {
    return 'Vencido';
  }
  return 'Válido';
}

function DetailSection({
  title,
  children,
  first = false,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <Box
      sx={{
        pt: first ? 0 : 2.5,
        mt: first ? 0 : 0.5,
        borderTop: first ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          mb: 2,
          fontWeight: 700,
          fontSize: '1rem',
          color: 'text.primary',
          letterSpacing: 0.01,
        }}
      >
        {title}
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
        gap={2}
      >
        {children}
      </Box>
    </Box>
  );
}

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  const display = value?.trim() ? value.trim() : '—';
  return (
    <Typography
      variant="body2"
      component="div"
      sx={{ wordBreak: 'break-word', lineHeight: 1.5 }}
    >
      <Box
        component="span"
        sx={{ fontWeight: 600, color: 'text.secondary' }}
      >
        {label}:
      </Box>{' '}
      <Box component="span" sx={{ fontWeight: 400, color: 'text.primary' }}>
        {display}
      </Box>
    </Typography>
  );
}

export type EpiCaDetailContentProps = {
  epi: IEpi;
};

/** Conteúdo homologado do detalhe CAEPI — reutilizado em EPIs e CA e no RiskTool. */
export function EpiCaDetailContent({ epi }: EpiCaDetailContentProps) {
  return (
    <Box display="flex" flexDirection="column" gap={0}>
      <DetailSection title="Certificado" first>
        <DetailLine label="CA" value={epi.ca} />
        <DetailLine label="Situação oficial" value={epiCaSituationLabel(epi)} />
        <DetailLine
          label="Validade"
          value={
            epi.expiredDate ? dayjs(epi.expiredDate).format('DD/MM/YYYY') : '—'
          }
        />
        <DetailLine label="Nº do processo" value={epi.processNumber} />
        <DetailLine
          label="Natureza"
          value={epi.national ? 'Nacional' : 'Importado'}
        />
        <DetailLine
          label="Status interno"
          value={epi.status || StatusEnum.ACTIVE}
        />
      </DetailSection>

      <DetailSection title="Fabricante">
        <DetailLine label="CNPJ" value={epi.manufacturerCnpj} />
        <DetailLine label="Razão social" value={epi.manufacturerName} />
      </DetailSection>

      <DetailSection title="Equipamento">
        <DetailLine label="Equipamento" value={epi.equipment} />
        <DetailLine label="Descrição" value={epi.description} />
        <DetailLine label="Marca" value={epi.brand} />
        <DetailLine label="Referência" value={epi.reference} />
        <DetailLine label="Cor" value={epi.color} />
      </DetailSection>

      <DetailSection title="Laudo / norma">
        <DetailLine label="Aprovado para laudo" value={epi.report} />
        <DetailLine label="Restrição" value={epi.restriction} />
        <DetailLine label="Observação" value={epi.observation} />
        <DetailLine label="CNPJ laboratório" value={epi.laboratoryCnpj} />
        <DetailLine
          label="Razão social laboratório"
          value={epi.laboratoryName}
        />
        <DetailLine label="Nº laudo" value={epi.reportNumber} />
        <DetailLine label="Norma" value={epi.standard} />
      </DetailSection>
    </Box>
  );
}
