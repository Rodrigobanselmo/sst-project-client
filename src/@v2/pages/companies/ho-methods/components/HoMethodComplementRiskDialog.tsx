import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk/useQueryRisk';
import { updateRisk } from 'core/services/hooks/mutations/checklist/risk/useMutUpdateRisk';
import {
  canUserEditCatalogRiskFactor,
  GLOBAL_CATALOG_RISK_READ_ONLY_MESSAGE,
  isGlobalCatalogRiskFactor,
} from 'core/utils/risk-factor-catalog-scope.util';
import type {
  HoMethodImportAgentSuggestion,
  HoMethodRiskFactorSnapshot,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  buildRiskComplementSuggestions,
  type RiskComplementFieldKey,
  type RiskComplementSuggestion,
} from '../utils/ho-method-risk-complement.util';
import { mapRiskFactorsToHoMethodSnapshot } from '../utils/ho-method-evaluation.util';

type Props = {
  open: boolean;
  agent: HoMethodImportAgentSuggestion | null;
  methodCode?: string;
  methodInstitution?: string;
  onClose: () => void;
  onApplied?: (updatedRisk: HoMethodRiskFactorSnapshot) => void;
};

export const HoMethodComplementRiskDialog: FC<Props> = ({
  open,
  agent,
  methodCode,
  methodInstitution,
  onClose,
  onApplied,
}) => {
  const { companyId, userCompanyId } = useGetCompanyId();
  const { isMaster } = useAccess();
  const { showSnackBar } = useSystemSnackbar();
  const [selectedKeys, setSelectedKeys] = useState<RiskComplementFieldKey[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const riskId = agent?.matchedRiskFactor?.id ?? '';
  const { data: risk, isLoading } = useQueryRisk({
    id: riskId,
    companyId: companyId || userCompanyId || '',
  });

  const effectiveAgent = useMemo(() => {
    if (!agent) return null;
    if (!risk) return agent;

    return {
      ...agent,
      matchedRiskFactor: mapRiskFactorsToHoMethodSnapshot(risk),
    };
  }, [agent, risk]);

  const suggestions = useMemo(
    () =>
      effectiveAgent
        ? buildRiskComplementSuggestions({
            agent: effectiveAgent,
            methodCode,
            methodInstitution,
          })
        : [],
    [effectiveAgent, methodCode, methodInstitution],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedKeys(
      suggestions
        .filter((item) => item.selectedByDefault)
        .map((item) => item.key),
    );
  }, [open, suggestions]);

  const readOnly = Boolean(
    risk &&
      isGlobalCatalogRiskFactor(risk) &&
      !canUserEditCatalogRiskFactor({
        risk,
        isMaster,
        userCompanyId,
      }),
  );

  const toggleKey = (key: RiskComplementFieldKey) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const handleApply = async () => {
    if (!agent?.matchedRiskFactor || !risk || !companyId) return;

    const selected = suggestions.filter((item) =>
      selectedKeys.includes(item.key),
    );

    if (!selected.length) {
      showSnackBar('Selecione ao menos um campo para complementar.', {
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const patch: Record<string, unknown> = {
        id: risk.id,
        companyId: risk.companyId || companyId,
        recMed: risk.recMed ?? [],
      };

      selected.forEach((item) => {
        if (item.key === 'synonymous') {
          patch.synonymous = item.suggestedValue
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
          return;
        }

        if (item.key === 'propagation') {
          patch.propagation = item.suggestedValue
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);
          return;
        }

        patch[item.key] = item.suggestedValue;
      });

      const updatedRisk = await updateRisk(patch as any, companyId);
      showSnackBar('Fator de risco complementado com sucesso.', {
        type: 'success',
      });
      if (updatedRisk) {
        onApplied?.(mapRiskFactorsToHoMethodSnapshot(updatedRisk));
      }
      onClose();
    } catch {
      showSnackBar('Não foi possível complementar o fator de risco.', {
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = (item: RiskComplementSuggestion) => {
    if (item.status === 'conflict') return 'Conflito — revisar antes de aplicar';
    if (item.status === 'fill') return 'Campo vazio no cadastro';
    return 'Igual ao cadastro';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Complementar cadastro do fator de risco</DialogTitle>
      <DialogContent dividers>
        {agent && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {agent.substanceName}
            {agent.cas ? ` · CAS ${agent.cas}` : ''}
          </Typography>
        )}

        {readOnly && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {GLOBAL_CATALOG_RISK_READ_ONLY_MESSAGE}
          </Alert>
        )}

        {!isLoading && !suggestions.length && (
          <Alert severity="info">
            Não há informações novas para complementar neste fator.
          </Alert>
        )}

        {suggestions.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Campo</TableCell>
                <TableCell>Atual</TableCell>
                <TableCell>Sugerido</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suggestions.map((item) => (
                <TableRow key={item.key}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedKeys.includes(item.key)}
                      onChange={() => toggleKey(item.key)}
                      disabled={readOnly || submitting}
                    />
                  </TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.currentValue || '—'}</TableCell>
                  <TableCell>{item.suggestedValue}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        {renderStatus(item)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fonte: {item.source}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleApply()}
          disabled={readOnly || submitting || !suggestions.length || isLoading}
        >
          Aplicar selecionados
        </Button>
      </DialogActions>
    </Dialog>
  );
};
