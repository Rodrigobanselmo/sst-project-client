import { Box } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import type { AnalysisItemInventoryEntry } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';

const analysisItemBadgeSx = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 3,
  py: 0.5,
  borderRadius: '999px',
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'transparent',
  color: 'text.secondary',
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.4,
};

export const AnalysisItemStatusBadges = ({
  itemStatus,
}: {
  itemStatus?: AnalysisItemInventoryEntry;
}) => {
  if (!itemStatus) return null;

  return (
    <SFlex alignItems="center" gap={2} flexWrap="wrap">
      <Box
        component="span"
        sx={analysisItemBadgeSx}
      >
        {itemStatus.existsInInventory ? 'Incluído no inventário' : 'Não incluído no inventário'}
      </Box>
      {typeof itemStatus.existsInCatalog === 'boolean' && (
        <Box
          component="span"
          sx={analysisItemBadgeSx}
        >
          {itemStatus.existsInCatalog ? 'Existe no catálogo' : 'Não cadastrado no catálogo'}
        </Box>
      )}
    </SFlex>
  );
};
