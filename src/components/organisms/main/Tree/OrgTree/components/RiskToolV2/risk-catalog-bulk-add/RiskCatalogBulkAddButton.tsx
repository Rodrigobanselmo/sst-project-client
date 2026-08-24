import React, { FC } from 'react';

import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { RecTypeEnum } from 'project/enum/recType.enum';

import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import {
  RISK_CATALOG_BULK_ADD_PLACEHOLDER,
  RISK_CATALOG_BULK_ADD_TITLE,
  RISK_CATALOG_BULK_ADD_TOOLTIP,
  RiskCatalogBulkAddKind,
} from './build-risk-catalog-bulk-add-payload.util';
import { useRiskCatalogBulkAdd } from './useRiskCatalogBulkAdd';

type RiskCatalogBulkAddButtonProps = {
  kind: RiskCatalogBulkAddKind;
  risk?: IRiskFactors | null;
  riskData?: Partial<IRiskData> | null;
  handleSelect: (values: Partial<IUpsertRiskData>) => void | Promise<void>;
};

export const RiskCatalogBulkAddButton: FC<RiskCatalogBulkAddButtonProps> = ({
  kind,
  risk,
  riskData,
  handleSelect,
}) => {
  const bulk = useRiskCatalogBulkAdd({
    kind,
    risk,
    riskData,
    handleSelect,
  });

  if (!risk?.id) return null;

  const confirmCount = bulk.preview.toAdd.length;
  const confirmLabel =
    confirmCount > 0
      ? `Cadastrar ${confirmCount} ${confirmCount === 1 ? 'item' : 'itens'}`
      : 'Cadastrar';

  return (
    <>
      <STooltip title={RISK_CATALOG_BULK_ADD_TOOLTIP[kind]}>
        <Box
          sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            bulk.openDialog();
          }}
        >
          <SIconButton
            size="small"
            sx={{
              maxWidth: 22,
              maxHeight: 22,
              color: 'text.secondary',
              opacity: 0.75,
              '&:hover': { opacity: 1 },
            }}
          >
            <PlaylistAddOutlinedIcon sx={{ fontSize: 16 }} />
          </SIconButton>
        </Box>
      </STooltip>

      <Dialog
        open={bulk.open}
        onClose={bulk.closeDialog}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            maxHeight: { xs: '92vh', md: '86vh' },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>{RISK_CATALOG_BULK_ADD_TITLE[kind]}</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            Cole ou digite um item por linha. O cadastro individual continua
            disponível no botão adicionar.
          </Alert>

          {kind === 'rec' && (
            <FormControl sx={{ mb: 2 }} size="small">
              <Typography variant="caption" color="text.secondary">
                Tipo das recomendações
              </Typography>
              <RadioGroup
                row
                value={bulk.recType}
                onChange={(e) =>
                  bulk.setRecType(e.target.value as RecTypeEnum)
                }
              >
                <FormControlLabel
                  value={RecTypeEnum.ADM}
                  control={<Radio size="small" />}
                  label="Administrativa"
                />
                <FormControlLabel
                  value={RecTypeEnum.ENG}
                  control={<Radio size="small" />}
                  label="Engenharia"
                />
                <FormControlLabel
                  value={RecTypeEnum.EPI}
                  control={<Radio size="small" />}
                  label="EPI"
                />
              </RadioGroup>
            </FormControl>
          )}

          <TextField
            label="Itens (um por linha)"
            fullWidth
            multiline
            minRows={12}
            maxRows={22}
            value={bulk.rawText}
            onChange={(e) => bulk.setRawText(e.target.value)}
            placeholder={RISK_CATALOG_BULK_ADD_PLACEHOLDER[kind]}
            disabled={bulk.submitting}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {confirmCount} {confirmCount === 1 ? 'item será cadastrado' : 'itens serão cadastrados'}
            {bulk.preview.alreadyLinkedCount
              ? ` · ${bulk.preview.alreadyLinkedCount} já vinculados neste risco`
              : ''}
            {bulk.preview.duplicateCount
              ? ` · ${bulk.preview.duplicateCount} repetidos na lista`
              : ''}
            {bulk.preview.emptyCount
              ? ` · linhas vazias ignoradas`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={bulk.closeDialog} disabled={bulk.submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => void bulk.submit()}
            disabled={bulk.submitting || confirmCount === 0}
          >
            {bulk.submitting ? 'Cadastrando...' : confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
