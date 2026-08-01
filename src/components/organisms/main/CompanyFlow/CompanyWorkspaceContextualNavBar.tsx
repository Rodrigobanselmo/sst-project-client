import { Box } from '@mui/material';
import { CompanyWorkspaceContextualNav } from 'components/organisms/main/CompanyFlow/CompanyWorkspaceContextualNav';

type Props = {
  companyId?: string;
  /** Espaçamento inferior padrão antes do conteúdo da página. */
  mb?: number;
};

/** Barra contextual para páginas fora do shell `/novo/[stage]` (sem toggle de cards). */
export function CompanyWorkspaceContextualNavBar({
  companyId,
  mb = 1.5,
}: Props) {
  return (
    <Box sx={{ width: '100%', mb }}>
      <CompanyWorkspaceContextualNav companyId={companyId} />
    </Box>
  );
}
