import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import {
  convertWorkspaceToCompany,
  listConvertWorkspaceCompanyGroups,
  previewConvertWorkspaceToCompany,
  WorkspaceConvertPreviewApi,
  WorkspaceConvertResultApi,
} from '@v2/services/enterprise/workspace/convert-workspace-to-company/convert-workspace-to-company.service';

type CompanyGroupOption = { id: number; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onConverted?: () => void;
  workspaceId: string;
  workspaceName: string;
};

export const ConvertWorkspaceToCompanyModal = ({
  open,
  onClose,
  onConverted,
  workspaceId,
  workspaceName,
}: Props) => {
  const { isMaster } = useAccess();
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  const [groups, setGroups] = useState<CompanyGroupOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CompanyGroupOption | null>(
    null,
  );
  const [preview, setPreview] = useState<WorkspaceConvertPreviewApi | null>(
    null,
  );
  const [convertResult, setConvertResult] =
    useState<WorkspaceConvertResultApi | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingConvert, setLoadingConvert] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedGroup(null);
      setPreview(null);
      setConvertResult(null);
      setConfirmationText('');
      setGroups([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !companyId || !workspaceId) return;

    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const data = await listConvertWorkspaceCompanyGroups({
          companyId,
          workspaceId,
        });
        setGroups(data);
      } catch (error: any) {
        setGroups([]);
        enqueueSnackbar(
          error?.response?.data?.message ??
            'Erro ao carregar grupos empresariais',
          { variant: 'error' },
        );
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [open, companyId, workspaceId, enqueueSnackbar]);

  useEffect(() => {
    if (!open || !selectedGroup?.id || !companyId || !workspaceId) {
      setPreview(null);
      return;
    }

    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const data = await previewConvertWorkspaceToCompany({
          companyId,
          workspaceId,
          companyGroupId: selectedGroup.id,
        });
        setPreview(data);
      } catch (error: any) {
        setPreview(null);
        enqueueSnackbar(
          error?.response?.data?.message ?? 'Erro ao carregar preview',
          { variant: 'error' },
        );
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();
  }, [open, selectedGroup?.id, companyId, workspaceId, enqueueSnackbar]);

  const handleCloseAfterConvert = () => {
    onClose();
    onConverted?.();
  };

  if (!isMaster) return null;

  const hasBlocks = (preview?.blocks?.length ?? 0) > 0;

  const handleConvert = async () => {
    if (!companyId || !selectedGroup?.id) return;

    setLoadingConvert(true);
    try {
      const result = await convertWorkspaceToCompany({
        companyId,
        workspaceId,
        companyGroupId: selectedGroup.id,
        confirmationText,
      });

      setConvertResult(result);
      enqueueSnackbar('Estabelecimento convertido em empresa com sucesso', {
        variant: 'success',
      });
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message ?? 'Erro ao converter estabelecimento',
        { variant: 'error' },
      );
    } finally {
      setLoadingConvert(false);
    }
  };

  const renderOperationalCounts = () => {
    if (!preview) return null;

    return (
      <Box>
        <strong>Dados operacionais que serão copiados:</strong>
        <ul>
          <li>{preview.counts.characterizations} caracterização(ões)</li>
          <li>{preview.counts.environments} ambiente(s)</li>
          <li>{preview.counts.homogeneousGroups} GHO/GSE</li>
          <li>{preview.counts.riskFactorData} dado(s) de risco</li>
          <li>
            {preview.counts.riskFactorDataRec} medida(s)/recomendação(ões) de
            plano de ação
          </li>
          <li>{preview.counts.derivedMeasures} medida(s) derivada(s)</li>
          <li>{preview.counts.actionPlanRules} regra(s) de plano de ação</li>
          <li>{preview.counts.documentData} documento(s) de inventário/PGR</li>
          <li>{preview.counts.riskFactorDocuments} documento(s) de risco</li>
          <li>{preview.counts.documents} documento(s) vinculado(s)</li>
        </ul>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Converter estabelecimento em empresa</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          {!convertResult && (
            <Alert severity="warning">
              Operação delicada e sem reversão automática. Todos os dados
              operacionais do estabelecimento serão copiados para a nova
              empresa.
            </Alert>
          )}

          {!convertResult && (
            <SSearchSelect
              label="Grupo empresarial"
              options={groups}
              loading={loadingGroups}
              value={selectedGroup}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => String(option.id)}
              onChange={(option) =>
                setSelectedGroup(option as CompanyGroupOption | null)
              }
            />
          )}

          {loadingPreview && !convertResult && (
            <Alert severity="info">Carregando preview...</Alert>
          )}

          {preview && !convertResult && (
            <>
              {preview.blocks.map((block) => (
                <Alert key={block} severity="error">
                  {block}
                </Alert>
              ))}

              {preview.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}

              <Box>
                <strong>Nova empresa:</strong> {preview.proposedCompany.name}
                {preview.proposedCompany.cnpj
                  ? ` — CNPJ ${preview.proposedCompany.cnpj}`
                  : ''}
              </Box>

              {!hasBlocks && (
                <Box>
                  <strong>Impacto da conversão:</strong>
                  <ul>
                    <li>{preview.counts.employees} empregado(s) migrado(s)</li>
                    <li>
                      {preview.counts.hierarchies} hierarquia(s):{' '}
                      {preview.counts.hierarchiesMoved} movida(s) (mesmo ID) e{' '}
                      {preview.counts.hierarchiesCloned} clonada(s)
                    </li>
                    <li>
                      {preview.counts.formApplications} formulário(s) aplicado(s)
                      convertido(s)
                    </li>
                  </ul>
                </Box>
              )}

              {!hasBlocks && renderOperationalCounts()}

              {preview.affectedFormApplications.length > 0 && (
                <Box>
                  <strong>Formulários afetados:</strong>
                  <ul>
                    {preview.affectedFormApplications.map((app) => (
                      <li key={app.id}>
                        {app.name} ({app.scopeType})
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {!hasBlocks && (
                <TextField
                  fullWidth
                  label={`Digite CONVERTER ou "${workspaceName}" para confirmar`}
                  value={confirmationText}
                  onChange={(event) => setConfirmationText(event.target.value)}
                />
              )}
            </>
          )}

          {convertResult && (
            <>
              <Alert severity="success">
                Conversão concluída. Nova empresa criada com dados operacionais
                copiados.
              </Alert>

              <Box>
                <strong>Resumo:</strong>
                <ul>
                  <li>{convertResult.migratedEmployeesCount} empregado(s)</li>
                  <li>{convertResult.migratedHierarchiesCount} hierarquia(s)</li>
                  <li>{convertResult.copiedRiskDataCount} dado(s) de risco</li>
                  <li>
                    {convertResult.operational.riskFactorDataRec} medida(s) de
                    plano de ação
                  </li>
                  <li>
                    {convertResult.operational.documentData} documento(s) PGR
                  </li>
                  <li>
                    {convertResult.convertedFormApplicationsCount} formulário(s)
                  </li>
                </ul>
              </Box>

              {convertResult.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <SButton variant="outlined" onClick={handleCloseAfterConvert}>
          {convertResult ? 'Fechar' : 'Cancelar'}
        </SButton>
        {!convertResult && (
          <SButton
            variant="contained"
            color="error"
            disabled={
              !preview ||
              hasBlocks ||
              loadingConvert ||
              loadingPreview ||
              !confirmationText.trim()
            }
            onClick={handleConvert}
          >
            {loadingConvert ? 'Convertendo...' : 'Converter'}
          </SButton>
        )}
        {convertResult && (
          <SButton
            variant="contained"
            onClick={() => {
              handleCloseAfterConvert();
              window.open(
                `/dashboard/empresas/${convertResult.newCompanyId}/formularios/aplicados`,
                '_blank',
              );
            }}
          >
            Abrir nova empresa
          </SButton>
        )}
      </DialogActions>
    </Dialog>
  );
};
