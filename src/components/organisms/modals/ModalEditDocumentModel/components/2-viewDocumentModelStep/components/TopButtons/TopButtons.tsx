import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import { RemoveDoubleClickButton } from 'components/organisms/documentModel/DocumentModelContent/TypeSectionItem/RemoveDoubleClickButton';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';

import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SSaveIcon } from 'assets/icons/SSaveIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { IUseViewDocumentModel } from '../../hooks/useViewDocumentModel';

export const TopButtons = ({
  onSubmit,
  downlandLoading,
  onDownloadPreview,
  saveLoading,
  handleDeleteActualItems,
}: IUseViewDocumentModel & { handleDeleteActualItems?: () => void }) => {
  const selectItem = useAppSelector(selectDocumentSelectItem);
  return (
    <Box
      zIndex={100}
      position="sticky"
      top={0}
      p={8}
      px={20}
      mb={-20}
      sx={{ backgroundColor: 'grey.50' }}
    >
      <SFlex justifyContent={'end'} alignItems="center">
        <SFlex justifyContent={'end'} alignItems="center" mr={20}>
          <RemoveDoubleClickButton
            onHandleDeletion={() => handleDeleteActualItems?.()}
            disabled={!selectItem}
          />
        </SFlex>
        <STableButton
          text="Baixar"
          icon={SDownloadIcon}
          variant="outlined"
          loading={downlandLoading}
          color="white"
          iconColor="primary.main"
          disabled={!selectItem}
          onClick={() => onDownloadPreview()}
          sm
        />
        <STableButton
          text="Salvar"
          icon={SSaveIcon}
          disabled={!selectItem}
          color="primary.main"
          onClick={onSubmit}
          loading={saveLoading}
          sm
        />
      </SFlex>
    </Box>
  );
};
