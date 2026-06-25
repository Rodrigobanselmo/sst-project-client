import { FC, useRef, useState } from 'react';

import {
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material';
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  useApplyBiologicalIndicatorImport,
  useDownloadBiologicalIndicatorTemplate,
  useExportBiologicalIndicators,
  useImportBiologicalIndicatorPreview,
} from '@v2/services/medicine/biological-indicator/hooks/useBiologicalIndicatorMaintenance';
import type { ImportPreviewResult } from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { ImportPreviewModal } from './ImportPreviewModal';

export const NormativeUpdateMenu: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(
    null,
  );
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportMutation = useExportBiologicalIndicators();
  const templateMutation = useDownloadBiologicalIndicatorTemplate();
  const previewMutation = useImportBiologicalIndicatorPreview();
  const applyMutation = useApplyBiologicalIndicatorImport();

  const open = Boolean(anchorEl);
  const closeMenu = () => setAnchorEl(null);

  const handleExport = () => {
    closeMenu();
    exportMutation.mutate();
  };

  const handleTemplate = () => {
    closeMenu();
    templateMutation.mutate();
  };

  const handleImportClick = () => {
    closeMenu();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPreviewResult(null);
    setImportedFile(file);
    setPreviewOpen(true);
    previewMutation.mutate(file, {
      onSuccess: (result) => setPreviewResult(result),
      onError: () => setPreviewOpen(false),
    });
  };

  const handleApply = () => {
    if (!importedFile) return;
    applyMutation.mutate(importedFile, {
      onSuccess: () => {
        setPreviewOpen(false);
        setPreviewResult(null);
        setImportedFile(null);
      },
    });
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setImportedFile(null);
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Atualização normativa
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
        <MenuItem onClick={handleExport} disabled={exportMutation.isPending}>
          <ListItemIcon>
            <SaveAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar base atual</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleTemplate} disabled={templateMutation.isPending}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Baixar modelo</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleImportClick}>
          <ListItemIcon>
            <FileUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Importar para prévia</ListItemText>
        </MenuItem>
      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={handleFileChange}
      />

      <ImportPreviewModal
        open={previewOpen}
        isLoading={previewMutation.isPending}
        result={previewResult}
        onClose={handleClosePreview}
        onApply={handleApply}
        isApplying={applyMutation.isPending}
      />
    </SAuthShow>
  );
};
