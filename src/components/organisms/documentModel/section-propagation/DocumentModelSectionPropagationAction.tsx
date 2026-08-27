import { FC, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { useDocumentEditorV2Session } from 'components/organisms/documentModel/editor-v2/integration/DocumentEditorV2Session';
import { selectDocumentSelectItem } from 'store/reducers/document/documentSlice';
import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';

import { SCopyIcon } from 'assets/icons/SCopyIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { DocumentModelSectionPropagationDialog } from './DocumentModelSectionPropagationDialog';
import {
  canOpenSectionPropagation,
  isDocumentHeadingTreeNode,
} from './section-propagation-gate';

type Props = {
  companyId?: string;
  modelId?: number;
  isDirty: boolean;
  saveBusy: boolean;
};

export const DocumentModelSectionPropagationAction: FC<Props> = ({
  companyId,
  modelId,
  isDirty,
  saveBusy,
}) => {
  const { isAuthSuccess } = useAuthShow();
  const { enqueueSnackbar } = useSnackbar();
  const v2Session = useDocumentEditorV2Session();
  const selectedItem = useAppSelector(selectDocumentSelectItem);
  const [open, setOpen] = useState(false);

  const canEdit = isAuthSuccess({
    permissions: [PermissionEnum.DOCUMENT_MODEL],
    cruds: 'u',
  });
  const isHeadingSelected = isDocumentHeadingTreeNode(selectedItem);
  const headingLabel = selectedItem
    ? `${selectedItem.headingNumber ? `${selectedItem.headingNumber} ` : ''}${
        selectedItem.text || ''
      }`.trim()
    : '';

  const gate = useMemo(
    () =>
      canOpenSectionPropagation({
        hasModelId: Boolean(modelId),
        isHeadingSelected,
        canEdit,
        isDirty,
        v2LocalDirty: v2Session.v2LocalDirty,
        saveBusy,
        contentSavePending: v2Session.contentSavePending,
      }),
    [
      modelId,
      isHeadingSelected,
      canEdit,
      isDirty,
      v2Session.v2LocalDirty,
      v2Session.contentSavePending,
      saveBusy,
    ],
  );

  if (!canEdit || !modelId) return null;

  return (
    <>
      <Box pt={4}>
        <STableButton
          text="Aplicar em outros modelos"
          icon={SCopyIcon}
          variant="outlined"
          color="white"
          iconColor="primary.main"
          disabled={!isHeadingSelected || saveBusy}
          sm
          onClick={() => {
            if (!gate.ok) {
              enqueueSnackbar(gate.reason || '', { variant: 'warning' });
              return;
            }
            setOpen(true);
          }}
        />
      </Box>
      <DocumentModelSectionPropagationDialog
        open={open}
        companyId={companyId}
        modelId={modelId}
        headingId={
          isHeadingSelected && selectedItem ? String(selectedItem.id) : null
        }
        headingLabel={headingLabel}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
