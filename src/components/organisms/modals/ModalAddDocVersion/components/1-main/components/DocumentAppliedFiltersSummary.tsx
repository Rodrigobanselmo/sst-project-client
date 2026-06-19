import { Box, Icon } from '@mui/material';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SIconButton from 'components/atoms/SIconButton';
import SFlex from 'components/atoms/SFlex';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';
import { getSelectedHierarchy } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/components/RiskToolHeader/RiskToolGhoHorizontal';
import { viewsDataOptionsConstant } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import {
  DocumentFilterItem,
  DocumentFilterSelection,
} from '../../last-version/document-filter.types';

type DocumentAppliedFiltersSummaryProps = {
  selection: DocumentFilterSelection;
  onRemoveItem: (item: DocumentFilterItem) => void;
  onClear: () => void;
};

const resolveFilterLabel = (
  item: DocumentFilterItem,
  selection: DocumentFilterSelection,
) => {
  const { name, type } = getSelectedHierarchy({
    selected: item,
    viewDataType: selection.viewDataType,
  });

  const fallbackType =
    viewsDataOptionsConstant[selection.viewDataType]?.short ?? 'Filtro';

  return {
    name: name || '—',
    type: type || fallbackType,
  };
};

export const DocumentAppliedFiltersSummary = ({
  selection,
  onRemoveItem,
  onClear,
}: DocumentAppliedFiltersSummaryProps) => {
  if (selection.selecteds.length === 0) {
    return null;
  }

  return (
    <Box mt={4}>
      <SFlex align="center" justify="space-between" mb={4}>
        <SText color="text.secondary" fontSize={12} fontWeight={600}>
          Filtros aplicados ({selection.selecteds.length})
        </SText>
        <SButton
          variant="text"
          size="small"
          onClick={onClear}
          sx={{ minWidth: 'auto', px: 2, py: 0.5, fontSize: 12 }}
        >
          Limpar filtros
        </SButton>
      </SFlex>

      <SFlex
        sx={{
          gap: 8,
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(180px, 1fr))',
        }}
      >
        {selection.selecteds.map((item) => {
          const { name, type } = resolveFilterLabel(item, selection);

          return (
            <Box
              key={item.id}
              sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                padding: 6,
                py: 4,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  right: 4,
                  top: 0,
                  width: 20,
                  height: 20,
                }}
              >
                <SIconButton size="small" onClick={() => onRemoveItem(item)}>
                  <Icon component={SCloseIcon} sx={{ fontSize: '1.1rem' }} />
                </SIconButton>
              </Box>
              <SText fontSize={11} color="text.light" fontWeight={500}>
                {type}
              </SText>
              <SText fontSize={13} color="text.secondary" fontWeight={500}>
                {name}
              </SText>
            </Box>
          );
        })}
      </SFlex>
    </Box>
  );
};
