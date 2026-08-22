import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import { RemoveDoubleClickButton } from 'components/organisms/documentModel/DocumentModelContent/TypeSectionItem/RemoveDoubleClickButton';
import { DocumentEditorV2HeaderControls } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2HeaderControls';
import { useDocumentEditorV2Session } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';

import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SSaveIcon } from 'assets/icons/SSaveIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { IUseViewDocumentModel } from '../../hooks/useViewDocumentModel';

export const TopButtons = ({
  onSubmit,
  onSubmitAndExit,
  downlandLoading,
  onDownloadPreview,
  saveLoading,
  saveAndExitLoading,
  saveBusy,
  isDirty,
  handleDeleteActualItems,
}: IUseViewDocumentModel & { handleDeleteActualItems?: () => void }) => {
  const selectItem = useAppSelector(selectDocumentSelectItem);
  const v2Session = useDocumentEditorV2Session();
  const officialSaveBlocked = v2Session.shouldBlockOfficialSave;
  const saveActionColor = isDirty ? 'error.main' : 'primary.main';
  const v2ChromeVisible =
    v2Session.flagEnabled && v2Session.visibleSurface === 'v2';
  return (
    <Box
      zIndex={100}
      position="sticky"
      top={0}
      p={8}
      px={20}
      mb={v2ChromeVisible ? 0 : -20}
      sx={{ backgroundColor: 'grey.50' }}
    >
      <SFlex
        justifyContent={'space-between'}
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <DocumentEditorV2HeaderControls />
        <SFlex justifyContent={'end'} alignItems="center">
        <SFlex justifyContent={'end'} alignItems="center" mr={20}>
          <RemoveDoubleClickButton
            onHandleDeletion={() => handleDeleteActualItems?.()}
            disabled={!selectItem || saveBusy}
          />
        </SFlex>
        <STableButton
          text="Baixar"
          icon={SDownloadIcon}
          variant="outlined"
          loading={downlandLoading}
          color="white"
          iconColor="primary.main"
          disabled={!selectItem || saveBusy}
          onClick={() => onDownloadPreview()}
          sm
        />
        <STableButton
          text="Salvar"
          icon={SSaveIcon}
          disabled={!selectItem || saveBusy || officialSaveBlocked}
          color={saveActionColor}
          onClick={() => {
            if (officialSaveBlocked) {
              v2Session.reportBlockedSave();
              return;
            }
            onSubmit();
          }}
          loading={saveLoading}
          sm
        />
        <STableButton
          text="Salvar e sair"
          icon={SSaveIcon}
          disabled={!selectItem || saveBusy || officialSaveBlocked}
          color={saveActionColor}
          onClick={() => {
            if (officialSaveBlocked) {
              v2Session.reportBlockedSave();
              return;
            }
            onSubmitAndExit();
          }}
          loading={saveAndExitLoading}
          sm
        />
        </SFlex>
      </SFlex>
    </Box>
  );
};
