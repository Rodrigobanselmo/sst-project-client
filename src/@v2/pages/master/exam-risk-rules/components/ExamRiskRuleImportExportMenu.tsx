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
  useApplyExamRiskRuleImport,
  useDownloadExamRiskRuleTemplate,
  useExportExamRiskRules,
  useImportExamRiskRulePreview,
} from '@v2/services/medicine/exam-risk-rule/hooks/useExamRiskRuleMaintenance';
import type { IExamRiskRuleImportPreviewResult } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { ExamRiskRuleImportPreviewModal } from './ExamRiskRuleImportPreviewModal';

export const ExamRiskRuleImportExportMenu: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResult, setPreviewResult] =
    useState<IExamRiskRuleImportPreviewResult | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportMutation = useExportExamRiskRules();
  const templateMutation = useDownloadExamRiskRuleTemplate();
  const previewMutation = useImportExamRiskRulePreview();
  const applyMutation = useApplyExamRiskRuleImport();

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
    if (!importedFile || applyMutation.isPending) return;
    applyMutation.mutate(importedFile, {
      onSuccess: () => {
        setPreviewOpen(false);
        setPreviewResult(null);
        setImportedFile(null);
      },
    });
  };

  const handleClosePreview = () => {
    if (applyMutation.isPending) return;
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
        Excel (curadoria)
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
        <MenuItem onClick={handleExport} disabled={exportMutation.isPending}>
          <ListItemIcon>
            <SaveAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar Excel</ListItemText>
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
          <ListItemText>Importar Excel</ListItemText>
        </MenuItem>
      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={handleFileChange}
      />

      <ExamRiskRuleImportPreviewModal
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
