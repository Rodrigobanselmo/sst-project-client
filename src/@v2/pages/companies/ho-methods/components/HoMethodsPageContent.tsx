import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDropzone } from 'react-dropzone';
import { useFetchBrowseHoMethods } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchBrowseHoMethods';
import { useFetchReadHoMethod } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchReadHoMethod';
import { useMutateDeleteHoMethod } from '@v2/services/occupational-hygiene/ho-method/hooks/useMutateHoMethod';
import { resolveHoMethodDocumentUrl } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import type { HoMethodRecord } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import {
  HoMethodAvailabilityStatusEnum,
  HoMethodSourceEnum,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { getHoMethodApiErrorMessage } from '../utils/ho-method-error.util';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';

import {
  HO_METHOD_EVALUATION_TYPE_LABELS,
  HO_METHOD_EVALUATION_TYPE_OPTIONS,
  HO_METHOD_SOURCE_LABELS,
  HO_METHOD_SOURCE_OPTIONS,
  HO_METHOD_STATUS_LABELS,
  HO_METHOD_STATUS_OPTIONS,
  formatFlowRange,
  formatHoMethodLaboratorySummary,
  formatVolumeRange,
} from '../maps/ho-method.maps';
import { HoMethodFormModal } from './HoMethodFormModal';
import { HoMethodImportPdfModal } from './HoMethodImportPdfModal';

const ROWS_PER_PAGE = 10;
const AGENT_PREVIEW_LIMIT = 4;

export const HoMethodsPageContent: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [agentName, setAgentName] = useState('');
  const [cas, setCas] = useState('');
  const [institution, setInstitution] = useState<HoMethodSourceEnum | ''>('');
  const [methodCode, setMethodCode] = useState('');
  const [analyticalMethod, setAnalyticalMethod] = useState('');
  const [evaluationType, setEvaluationType] = useState('');
  const [status, setStatus] = useState<HoMethodAvailabilityStatusEnum | ''>('');
  const [expandedAgentLists, setExpandedAgentLists] = useState<
    Record<string, boolean>
  >({});

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<HoMethodRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<HoMethodRecord | null>(
    null,
  );

  const browseParams = useMemo(
    () => ({
      page,
      limit: ROWS_PER_PAGE,
      search: search.trim() || undefined,
      agentName: agentName.trim() || undefined,
      cas: cas.trim() || undefined,
      institution: institution || undefined,
      methodCode: methodCode.trim() || undefined,
      analyticalMethod: analyticalMethod.trim() || undefined,
      evaluationType: (evaluationType || undefined) as any,
      status: status || undefined,
    }),
    [
      page,
      search,
      agentName,
      cas,
      institution,
      methodCode,
      analyticalMethod,
      evaluationType,
      status,
    ],
  );

  const { data, isLoading, isError, error } = useFetchBrowseHoMethods(browseParams);
  const { data: editingMethod } = useFetchReadHoMethod(
    editingMethodId ?? '',
    formOpen && Boolean(editingMethodId),
  );
  const deleteMutation = useMutateDeleteHoMethod();
  const { showSnackBar } = useSystemSnackbar();

  const handleImportClose = () => {
    setImportOpen(false);
    setPendingImportFile(null);
  };

  const handlePagePdfDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showSnackBar('Selecione um arquivo PDF (.pdf).', { type: 'error' });
      return;
    }

    setPendingImportFile(file);
    setImportOpen(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handlePagePdfDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const methods = data?.results ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const listedCountLabel = isLoading
    ? ' (carregando…)'
    : isError
      ? ' (erro ao carregar)'
      : ` (${pagination?.total ?? methods.length})`;

  useEffect(() => {
    if (!isError || !error) return;
    console.error('[HoMethods] Falha ao carregar métodos de HO:', error);
  }, [error, isError]);

  const handleOpenCreate = () => {
    setSelectedMethod(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (method: HoMethodRecord) => {
    setEditingMethodId(method.id);
    setSelectedMethod(method);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingMethodId(null);
    setSelectedMethod(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleApplyFilters = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setAgentName('');
    setCas('');
    setInstitution('');
    setMethodCode('');
    setAnalyticalMethod('');
    setEvaluationType('');
    setStatus('');
    setPage(1);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Cadastro de Métodos de HO — Agentes Químicos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nesta fase, o cadastro contempla métodos de amostragem e análise para
          agentes químicos. Métodos de agentes físicos serão tratados em etapa
          própria.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Nesta fase, o Cadastro de Métodos de HO contempla métodos de
        amostragem e análise para agentes químicos. Métodos de agentes físicos
        serão tratados em etapa própria. A vazão e o volume efetivamente
        utilizados em campo serão definidos posteriormente na Estratégia de
        Amostragem.
      </Alert>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={240}>
          <UploadFileIcon color="primary" />
          <Box>
            <Typography variant="subtitle2">Importar método por PDF</Typography>
            <Typography variant="caption" color="text.secondary">
              Extração automática de métodos NIOSH/NMAM a partir de PDF
            </Typography>
          </Box>
        </Box>

        <Box
          {...getRootProps()}
          sx={{
            flex: 2,
            minWidth: 280,
            border: '1px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.400',
            borderRadius: 1,
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 2,
            textAlign: 'center',
            cursor: 'copy',
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="body2" color="text.secondary">
            Arraste aqui o PDF do método NIOSH/NMAM
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => setImportOpen(true)}>
          Importar método por PDF
        </Button>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={2}
        >
          <Typography variant="subtitle1">Filtros</Typography>
          <Button variant="contained" onClick={handleOpenCreate}>
            Novo Método
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Busca textual"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, agente, CAS, amostrador..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Agente"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CAS"
              value={cas}
              onChange={(e) => setCas(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Instituição / fonte"
              value={institution}
              onChange={(e) =>
                setInstitution(e.target.value as HoMethodSourceEnum | '')
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {HO_METHOD_SOURCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Código do método"
              value={methodCode}
              onChange={(e) => setMethodCode(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Método analítico"
              value={analyticalMethod}
              onChange={(e) => setAnalyticalMethod(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Tipo de avaliação"
              value={evaluationType}
              onChange={(e) => setEvaluationType(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {HO_METHOD_EVALUATION_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as HoMethodAvailabilityStatusEnum | '')
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {HO_METHOD_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6} display="flex" gap={1} alignItems="center">
            <Button variant="contained" onClick={handleApplyFilters}>
              Aplicar filtros
            </Button>
            <Button variant="text" onClick={handleClearFilters}>
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Métodos cadastrados{listedCountLabel}
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getHoMethodApiErrorMessage(
              error,
              'Não foi possível carregar os métodos de HO.',
            )}
          </Alert>
        )}

        {!isLoading && !isError && methods.length === 0 && (
          <Alert severity="warning">
            Nenhum método de HO encontrado. Clique em &quot;Novo Método&quot;
            para cadastrar o primeiro registro.
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          {methods.map((method) => (
            <Paper key={method.id} variant="outlined" sx={{ p: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                gap={2}
                flexWrap="wrap"
              >
                <Box flex={1} minWidth={280}>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                    <Chip
                      size="small"
                      label={HO_METHOD_STATUS_LABELS[method.status]}
                      color={
                        method.status === HoMethodAvailabilityStatusEnum.ACTIVE
                          ? 'success'
                          : 'default'
                      }
                    />
                    {(method.originalDocumentUrl ||
                      method.originalDocumentDownloadPath ||
                      method.originalDocumentName) && (
                      <Chip
                        size="small"
                        variant="outlined"
                        color="info"
                        label="PDF"
                        component={
                          resolveHoMethodDocumentUrl(method) ? Link : 'span'
                        }
                        clickable={Boolean(resolveHoMethodDocumentUrl(method))}
                        href={resolveHoMethodDocumentUrl(method) ?? undefined}
                        target={
                          resolveHoMethodDocumentUrl(method) ? '_blank' : undefined
                        }
                        rel={
                          resolveHoMethodDocumentUrl(method)
                            ? 'noopener'
                            : undefined
                        }
                      />
                    )}
                  </Box>
                  <Typography variant="subtitle1">{method.displayName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {HO_METHOD_SOURCE_LABELS[method.institution]} ·{' '}
                    {method.methodCode}
                    {method.methodVersion ? ` · v${method.methodVersion}` : ''}
                  </Typography>
                  {(() => {
                    const agents =
                      method.agents?.length > 0
                        ? method.agents
                        : [
                            {
                              id: method.id,
                              agentName: method.agentName,
                              cas: method.cas,
                              evaluationConditions:
                                method.evaluationConditions ?? [],
                            },
                          ];
                    const isExpanded = expandedAgentLists[method.id];
                    const visibleAgents = isExpanded
                      ? agents
                      : agents.slice(0, AGENT_PREVIEW_LIMIT);
                    const hiddenCount = agents.length - visibleAgents.length;

                    return (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          gutterBottom
                        >
                          Agentes
                        </Typography>
                        {visibleAgents.map((agent) => (
                          <Box
                            key={agent.id ?? agent.agentName ?? 'agent'}
                            display="flex"
                            flexWrap="wrap"
                            alignItems="center"
                            gap={0.5}
                            mb={0.75}
                          >
                            <Typography variant="body2" component="span">
                              {agent.agentName || '—'}
                              {agent.cas ? ` (CAS ${agent.cas})` : ''}:
                            </Typography>
                            {(agent.evaluationConditions?.length ?? 0) > 0 ? (
                              agent.evaluationConditions?.map((condition) => (
                                <Chip
                                  key={condition.id ?? condition.evaluationType}
                                  size="small"
                                  variant="outlined"
                                  label={
                                    HO_METHOD_EVALUATION_TYPE_LABELS[
                                      condition.evaluationType
                                    ]
                                  }
                                />
                              ))
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                sem condições cadastradas
                              </Typography>
                            )}
                          </Box>
                        ))}
                        {hiddenCount > 0 && (
                          <Button
                            size="small"
                            onClick={() =>
                              setExpandedAgentLists((current) => ({
                                ...current,
                                [method.id]: true,
                              }))
                            }
                          >
                            +{hiddenCount} agente{hiddenCount > 1 ? 's' : ''}
                          </Button>
                        )}
                        {isExpanded && agents.length > AGENT_PREVIEW_LIMIT && (
                          <Button
                            size="small"
                            onClick={() =>
                              setExpandedAgentLists((current) => ({
                                ...current,
                                [method.id]: false,
                              }))
                            }
                          >
                            Ver menos
                          </Button>
                        )}
                      </Box>
                    );
                  })()}
                  <Typography variant="body2">
                    Amostrador: {method.samplerName || '—'} · Analítico:{' '}
                    {method.analyticalMethod || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vazão permitida:{' '}
                    {formatFlowRange(
                      method.minimumFlowRate,
                      method.maximumFlowRate,
                      method.flowRateUnit,
                    )}{' '}
                    · Volume permitido:{' '}
                    {formatVolumeRange(
                      method.minimumVolume,
                      method.maximumVolume,
                      method.volumeUnit,
                    )}
                  </Typography>
                  {!!method.laboratories?.length && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Laboratórios:{' '}
                      {method.laboratories
                        .map((lab) => formatHoMethodLaboratorySummary(lab))
                        .join(' · ')}
                    </Typography>
                  )}
                  {(method.originalDocumentDownloadPath ||
                    method.originalDocumentUrl ||
                    method.originalDocumentName) && (
                    <Typography variant="caption" display="block">
                      {resolveHoMethodDocumentUrl(method) ? (
                        <Link
                          href={resolveHoMethodDocumentUrl(method) ?? undefined}
                          target="_blank"
                          rel="noopener"
                        >
                          Visualizar método original
                          {method.originalDocumentName
                            ? ` (${method.originalDocumentName})`
                            : ''}
                        </Link>
                      ) : (
                        method.originalDocumentName
                      )}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEdit(method)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => setDeleteTarget(method)}
                  >
                    Inativar
                  </Button>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" gap={2} mt={3}>
            <Button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <Typography variant="body2" alignSelf="center">
              Página {page} de {totalPages}
            </Typography>
            <Button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Próxima
            </Button>
          </Box>
        )}
      </Paper>

      <HoMethodFormModal
        open={formOpen}
        method={editingMethod ?? selectedMethod}
        onClose={handleCloseForm}
      />

      <HoMethodImportPdfModal
        open={importOpen}
        onClose={handleImportClose}
        initialFile={pendingImportFile}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Inativar método de HO</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja inativar o método &quot;{deleteTarget?.displayName}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            Inativar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
