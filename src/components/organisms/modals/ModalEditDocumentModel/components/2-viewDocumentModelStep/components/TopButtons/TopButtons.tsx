import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import { RemoveDoubleClickButton } from 'components/organisms/documentModel/DocumentModelContent/TypeSectionItem/RemoveDoubleClickButton';
import { DocumentEditorV2HeaderControls } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2HeaderControls';
import { useDocumentEditorV2Session } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import { resolveOfficialSaveButtonsDisabled } from 'components/organisms/documentModel/editor-v2/integration/document-editor-v2-session';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';

import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SSaveIcon } from 'assets/icons/SSaveIcon';
import {
  documentModelDestructiveButtonSx,
  documentModelIdentityActionButtonSx,
  getDocumentModelSaveActionButtonSx,
} from 'components/organisms/tables/DocumentModelTable/document-model-presentation-theme';

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
  const officialSaveDisabled = resolveOfficialSaveButtonsDisabled({
    hasSelection: Boolean(selectItem),
    saveBusy,
    surface: v2Session.visibleSurface,
    v2LocalDirty: v2Session.v2LocalDirty,
    saveEnabled: v2Session.canPersistV2,
  });
  const saveActionColor =
    isDirty || (v2Session.canPersistV2 && v2Session.v2LocalDirty)
      ? 'error.main'
      : 'primary.main';
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
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
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
            outline
            active={false}
            borderActive="error"
            iconProps={{ sx: { color: 'inherit' } }}
            textProps={{ sx: { color: 'inherit' } }}
            sx={documentModelDestructiveButtonSx}
          />
        </SFlex>
        <STableButton
          text="Baixar"
          icon={SDownloadIcon}
          loading={downlandLoading}
          color="primary.identityBackground"
          iconColor="primary.identityOn"
          sx={documentModelIdentityActionButtonSx}
          disabled={!selectItem || saveBusy}
          onClick={() => onDownloadPreview()}
          sm
        />
        <STableButton
          text="Salvar"
          icon={SSaveIcon}
          disabled={officialSaveDisabled}
          color={saveActionColor}
          iconColor="inherit"
          sx={getDocumentModelSaveActionButtonSx(saveActionColor)}
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
          disabled={officialSaveDisabled}
          color={saveActionColor}
          iconColor="inherit"
          sx={getDocumentModelSaveActionButtonSx(saveActionColor)}
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
