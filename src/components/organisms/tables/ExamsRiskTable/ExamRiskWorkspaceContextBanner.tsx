import { FC } from 'react';

import BusinessIcon from '@mui/icons-material/Business';
import { Alert, Box, Typography } from '@mui/material';

type Props = {
  workspaceLabel: string | null;
  isAllEstablishments?: boolean;
  isLoading?: boolean;
};

/**
 * Makes the establishment (workspace) scope of Caracterização → Exames explicit.
 * Future company-wide toggle should sit beside this banner (see coverage.scope.ts).
 */
export const ExamRiskWorkspaceContextBanner: FC<Props> = ({
  workspaceLabel,
  isAllEstablishments = false,
  isLoading = false,
}) => {
  const title = isAllEstablishments
    ? 'Escopo analisado: todos os estabelecimentos'
    : 'Estabelecimento analisado';

  const body = isLoading
    ? 'Carregando estabelecimento…'
    : isAllEstablishments
      ? 'Os indicadores e a cobertura abaixo consideram o filtro atual de caracterização sem um estabelecimento único selecionado.'
      : workspaceLabel || 'Estabelecimento não identificado';

  return (
    <Alert
      severity="info"
      icon={<BusinessIcon fontSize="inherit" />}
      sx={{
        mt: 1.5,
        mb: 0.5,
        py: 0.75,
        alignItems: 'center',
        bgcolor: '#E8F4FD',
        border: '1px solid',
        borderColor: 'info.light',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {title}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {body}
        </Typography>
        {!isAllEstablishments && (
          <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
            Indicadores e cobertura referem-se somente a este estabelecimento — não à
            empresa inteira.
          </Typography>
        )}
      </Box>
    </Alert>
  );
};
