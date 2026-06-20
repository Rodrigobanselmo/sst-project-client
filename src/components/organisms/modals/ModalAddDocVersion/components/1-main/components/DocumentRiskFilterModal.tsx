import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';

import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';
import { DocumentGenerationRiskFilter } from 'core/interfaces/api/document-generation-risk-filter.types';

import {
  applyRiskFilterToCheckedState,
  buildDocumentRiskFilterFromCheckedState,
  buildDocumentRiskFilterTree,
  DocumentRiskFilterCheckedState,
  getRiskFilterCategoryCheckState,
  getRiskFilterSubcategoryCheckState,
  toggleRiskFilterCategory,
  toggleRiskFilterRisk,
  toggleRiskFilterSubcategory,
} from '../helpers/document-risk-filter.helpers';
import { useDocumentRiskFilterRisks } from '../hooks/useDocumentRiskFilterRisks';

type DocumentRiskFilterModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (filter?: DocumentGenerationRiskFilter) => void;
  companyId: string;
  workspaceId: string;
  scopeIds?: string[];
  value?: DocumentGenerationRiskFilter;
};

export const DocumentRiskFilterModal = ({
  open,
  onClose,
  onConfirm,
  companyId,
  workspaceId,
  scopeIds = [],
  value,
}: DocumentRiskFilterModalProps) => {
  const { risks, isLoading } = useDocumentRiskFilterRisks({
    companyId,
    workspaceId,
    scopeIds,
    enabled: open,
  });
  const tree = useMemo(() => buildDocumentRiskFilterTree(risks), [risks]);
  const [checked, setChecked] = useState<DocumentRiskFilterCheckedState>(() =>
    applyRiskFilterToCheckedState(tree, value),
  );

  useEffect(() => {
    if (open) {
      setChecked(applyRiskFilterToCheckedState(tree, value));
    }
  }, [open, tree, value]);

  const handleConfirm = () => {
    onConfirm(buildDocumentRiskFilterFromCheckedState(tree, checked));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Filtrar riscos</DialogTitle>
      <DialogContent>
        <SText color="text.secondary" fontSize={13} mb={6}>
          Por padrão, todos os fatores de risco entram no documento. Desmarque
          categorias, subcategorias ou fatores que não devem aparecer.
        </SText>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress size={28} />
          </Box>
        ) : tree.length === 0 ? (
          <SText color="text.secondary" fontSize={13}>
            Nenhum fator de risco PGR encontrado
            {scopeIds.length ? ' no escopo selecionado' : ' neste estabelecimento'}.
          </SText>
        ) : (
          <Box display="flex" flexDirection="column" gap={4}>
            {tree.map((category) => {
              const categoryCheckState = getRiskFilterCategoryCheckState(
                category,
                checked,
              );

              return (
              <Box key={category.type}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={categoryCheckState.checked}
                      indeterminate={categoryCheckState.indeterminate}
                      onChange={(event) =>
                        setChecked((current) =>
                          toggleRiskFilterCategory(
                            tree,
                            current,
                            category.type,
                            event.target.checked,
                          ),
                        )
                      }
                    />
                  }
                  label={<SText fontWeight={600}>{category.label}</SText>}
                />

                <Box pl={8} display="flex" flexDirection="column" gap={2}>
                  {category.subcategories.map((subcategory) => {
                    const subcategoryCheckState = getRiskFilterSubcategoryCheckState(
                      subcategory,
                      checked,
                    );

                    return (
                    <Box key={subcategory.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={subcategoryCheckState.checked}
                            indeterminate={subcategoryCheckState.indeterminate}
                            onChange={(event) =>
                              setChecked((current) =>
                                toggleRiskFilterSubcategory(
                                  tree,
                                  current,
                                  subcategory.id,
                                  event.target.checked,
                                ),
                              )
                            }
                          />
                        }
                        label={subcategory.name}
                      />

                      <Box pl={8} display="flex" flexDirection="column">
                        {subcategory.risks.map((risk) => (
                          <FormControlLabel
                            key={risk.id}
                            control={
                              <Checkbox
                                checked={checked.risks[risk.id] !== false}
                                onChange={(event) =>
                                  setChecked((current) =>
                                    toggleRiskFilterRisk(
                                      tree,
                                      current,
                                      risk.id,
                                      event.target.checked,
                                    ),
                                  )
                                }
                              />
                            }
                            label={risk.name}
                          />
                        ))}
                      </Box>
                    </Box>
                    );
                  })}

                  {category.risksWithoutSubcategory.map((risk) => (
                    <FormControlLabel
                      key={risk.id}
                      control={
                        <Checkbox
                          checked={checked.risks[risk.id] !== false}
                          onChange={(event) =>
                            setChecked((current) =>
                              toggleRiskFilterRisk(
                                tree,
                                current,
                                risk.id,
                                event.target.checked,
                              ),
                            )
                          }
                        />
                      }
                      label={risk.name}
                    />
                  ))}
                </Box>
              </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 8, pb: 6, gap: 4 }}>
        <SButton variant="outlined" onClick={onClose}>
          Fechar
        </SButton>
        <SButton onClick={handleConfirm} disabled={isLoading || tree.length === 0}>
          Confirmar
        </SButton>
      </DialogActions>
    </Dialog>
  );
};
