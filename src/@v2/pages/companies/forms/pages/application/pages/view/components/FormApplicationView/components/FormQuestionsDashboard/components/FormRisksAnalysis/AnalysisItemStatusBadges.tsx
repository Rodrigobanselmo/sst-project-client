import { Box } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import type { AnalysisItemInventoryEntry } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';

type AnalysisItemBadgeVariant =
  | 'inventory-in'
  | 'inventory-pending'
  | 'catalog-in'
  | 'catalog-new';

const analysisItemBadgeSx = (variant: AnalysisItemBadgeVariant) => {
  const palette: Record<AnalysisItemBadgeVariant, { bgcolor: string; color: string }> =
    {
      'inventory-in': { bgcolor: 'success.dark', color: '#fff' },
      'inventory-pending': { bgcolor: 'warning.dark', color: '#fff' },
      'catalog-in': { bgcolor: 'info.dark', color: '#fff' },
      'catalog-new': { bgcolor: 'grey.800', color: '#fff' },
    };

  return {
    display: 'inline-block',
    px: 1,
    py: 0.25,
    borderRadius: 0.5,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.2,
    ...palette[variant],
  };
};

export const AnalysisItemStatusBadges = ({
  itemStatus,
}: {
  itemStatus?: AnalysisItemInventoryEntry;
}) => {
  if (!itemStatus) return null;

  return (
    <SFlex alignItems="center" gap={0.5} flexWrap="wrap">
      <Box
        component="span"
        sx={analysisItemBadgeSx(
          itemStatus.existsInInventory ? 'inventory-in' : 'inventory-pending',
        )}
      >
        {itemStatus.existsInInventory ? 'No inventário' : 'Pendente'}
      </Box>
      {typeof itemStatus.existsInCatalog === 'boolean' && (
        <Box
          component="span"
          sx={analysisItemBadgeSx(
            itemStatus.existsInCatalog ? 'catalog-in' : 'catalog-new',
          )}
        >
          {itemStatus.existsInCatalog ? 'Cadastrado' : 'Novo cadastro'}
        </Box>
      )}
    </SFlex>
  );
};
