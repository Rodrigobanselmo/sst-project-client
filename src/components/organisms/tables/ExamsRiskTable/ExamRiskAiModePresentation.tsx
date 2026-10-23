import { Alert, Typography } from '@mui/material';

export const examRiskAiModeCopy = (isReviewMode: boolean) =>
  isReviewMode
    ? {
        title: 'Revisão de exames com IA',
        notice: 'REVISÃO — Exames já vinculados',
        description:
          'Considera os exames já adotados e as recomendações da Biblioteca para avaliar a cobertura e identificar possíveis exames adicionais ou ajustes. Nenhuma alteração será aplicada automaticamente.',
      }
    : {
        title: 'Análise inicial com IA',
        notice: 'ANÁLISE INICIAL — Sem exames vinculados',
        description:
          'Avalia este fator de risco e sugere exames ocupacionais para possível adoção pela empresa. Nenhum exame será adicionado sem sua confirmação.',
      };

export const ExamRiskAiModeNotice = ({
  isReviewMode,
}: {
  isReviewMode: boolean;
}) => {
  const copy = examRiskAiModeCopy(isReviewMode);
  return (
    <Alert severity={isReviewMode ? 'warning' : 'info'}>
      <Typography component="div" fontWeight={700} color="inherit">
        {copy.notice}
      </Typography>
      <Typography component="div" variant="body2" color="inherit">
        {copy.description}
      </Typography>
      {isReviewMode && (
        <Typography component="div" variant="body2" color="inherit">
          Os pareceres sobre os vínculos existentes são informativos e não
          executam alterações.
        </Typography>
      )}
    </Alert>
  );
};
