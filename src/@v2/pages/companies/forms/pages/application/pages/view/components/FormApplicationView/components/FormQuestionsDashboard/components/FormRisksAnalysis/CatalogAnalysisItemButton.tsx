import { selectCatalogAnalysisItem } from './catalog-analysis-item.helpers';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, LinearProgress, TextField, Tooltip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { browseGenerateSources } from '@v2/services/security/action-plan/generate-source/browse-generate-sources/service/browse-generate-sources.service';
import { queryRecMed } from 'core/services/hooks/queries/useQueryRecMed/useQueryRecMed';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { StatusEnum } from 'project/enum/status.enum';
import { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useMutateEditFormQuestionsAnswersAnalysis } from '@v2/services/forms/form-questions-answers-analysis/edit-form-questions-answers-analysis/hooks/useMutateEditFormQuestionsAnswersAnalysis';
import { useCanEditFrpsAnalysisContent } from './FrpsAnalysisItemReviewActions';

type ItemType = 'fontesGeradoras' | 'medidasEngenhariaRecomendadas' | 'medidasAdministrativasRecomendadas';
type Props = { analysis: IFormQuestionsAnswersAnalysisBrowseResultModel; itemType: ItemType; companyId: string; inherited?: boolean; itemIndex?: number };
export function CatalogAnalysisItemButton(props: Props) {
  const canManage = useCanEditFrpsAnalysisContent();
  const canEdit = props.itemIndex == null || canManage;
  const [open, setOpen] = useState(false);
  if (!canEdit || !props.analysis.analysis || props.analysis.metadata?.protectedData === true) return null;
  const replacing = props.itemIndex != null;
  const source = props.itemType === 'fontesGeradoras';
  const tooltip = `${replacing ? 'Troque este item por' : 'Adicione manualmente'} ${source ? 'outras fontes geradoras já catalogadas' : 'outras recomendações já catalogadas'} no sistema`;
  return <Box component="span" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <Tooltip describeChild title={tooltip}><IconButton size="small" aria-label={tooltip} onClick={event => { event.preventDefault(); setOpen(true); }} sx={{ color: 'text.primary' }}>{replacing ? <SwapHorizIcon fontSize="small" /> : <AddIcon fontSize="small" />}</IconButton></Tooltip>
    {open && <CatalogPicker {...props} onClose={() => setOpen(false)} />}
  </Box>;
}
function CatalogPicker({ analysis, itemType, companyId, inherited = false, itemIndex, onClose }: Props & { onClose: () => void }) {
  const canManage = useCanEditFrpsAnalysisContent();
  const canEdit = itemIndex == null || canManage;
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [ack, setAck] = useState(false);
  const [error, setError] = useState('');
  const mutation = useMutateEditFormQuestionsAnswersAnalysis();
  const source = itemType === 'fontesGeradoras';
  const replacing = itemIndex != null;
  useEffect(() => { const timer = setTimeout(() => { setDebounced(search); setPage(0); }, 300); return () => clearTimeout(timer); }, [search]);
  const catalog = useQuery({
    queryKey: ['frps-manual-catalog-direct', companyId, analysis.riskId, itemType, debounced, page], enabled: open && canEdit,
    queryFn: async () => {
      const pagination = { skip: page * 25, take: 25 };
      if (source) {
        const result = await browseGenerateSources({ companyId, pagination: { page: page + 1, limit: 25 }, filters: { riskIds: [analysis.riskId], search: debounced } });
        return { count: result.pagination.total, items: result.results.filter(item => item.risk.id === analysis.riskId).map(item => ({ id: item.id, name: item.name })) };
      }
      const result = await queryRecMed(pagination, { companyId, riskIds: [analysis.riskId], search: debounced, status: [StatusEnum.ACTIVE], onlyRec: true, recType: [itemType === 'medidasEngenhariaRecomendadas' ? RecTypeEnum.ENG : RecTypeEnum.ADM] });
      return { count: result.count, items: result.data.map(item => ({ id: item.id, name: item.recName || item.medName || '' })).filter(item => item.name) };
    },
  });
  if (!canEdit || !analysis.analysis || analysis.metadata?.protectedData === true) return null;
  const lists = [analysis.analysis.fontesGeradoras, analysis.analysis.medidasEngenhariaRecomendadas, analysis.analysis.medidasAdministrativasRecomendadas];
  const duplicate = (id: string, name: string) => lists.some(list => list.some(item => item.catalogId === id || item.nome.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase()));
  const save = async (item: { id: string; name: string }) => {
    if (mutation.isPending || (inherited && !ack) || duplicate(item.id, item.name)) return;
    setError('');
    try { const content = selectCatalogAnalysisItem(analysis.analysis!, itemType, item, itemIndex); await mutation.mutateAsync({ companyId, applicationId: analysis.formApplicationId, analysisId: analysis.id, hierarchyId: analysis.hierarchyId, riskId: analysis.riskId, analysis: content }); setOpen(false); onClose(); }
    catch { setError('Não foi possível salvar a seleção. Tente novamente.'); }
  };
  return <Box component="span" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <Dialog open={open} onClose={() => { if (!mutation.isPending) { setOpen(false); onClose(); } }} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: 'background.paper', color: 'text.primary' } }}>
      <DialogTitle sx={{ color: 'text.primary' }}>{replacing ? 'Trocar item pelo catálogo' : source ? 'Adicionar fonte geradora do catálogo' : 'Adicionar recomendação do catálogo'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '12px', '& .MuiTypography-root': { color: 'text.primary' } }}>
        <Typography variant="body2">A seleção adiciona uma linha no formulário. Use “Aceitar e adicionar” para enviá-la ao inventário. Itens já enviados permanecem no inventário ao editar esta lista.</Typography>
        {inherited && <><Alert severity="warning">Esta análise pertence ao agrupamento. A alteração será compartilhada com os setores que herdam esta análise.</Alert><FormControlLabel label="Confirmo a alteração na análise compartilhada do agrupamento." control={<Checkbox checked={ack} onChange={event => setAck(event.target.checked)} />} /></>}
        <TextField label="Pesquisar no catálogo" value={search} onChange={event => setSearch(event.target.value)} size="small" fullWidth />
        {(catalog.isFetching || mutation.isPending) && <LinearProgress />}
        {(error || catalog.isError) && <Alert severity="error">{error || 'Não foi possível consultar o catálogo.'}</Alert>}
        <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>{catalog.data?.items.map(item => <Button key={item.id} fullWidth disabled={mutation.isPending || (inherited && !ack) || duplicate(item.id, item.name)} onClick={() => void save(item)} sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none', color: 'text.primary', py: '10px', borderBottom: '1px solid', borderColor: 'divider' }}>{item.name}{duplicate(item.id, item.name) ? ' — já selecionado' : ''}</Button>)}</Box>
        {!catalog.isFetching && !catalog.isError && !catalog.data?.items.length && <Typography>Nenhum item encontrado para este fator.</Typography>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Button disabled={!page || catalog.isFetching} onClick={() => setPage(value => value - 1)}>Anterior</Button><Button disabled={catalog.isFetching || (page + 1) * 25 >= (catalog.data?.count ?? 0)} onClick={() => setPage(value => value + 1)}>Próxima</Button></Box>
      </DialogContent>
      <DialogActions><Button disabled={mutation.isPending} onClick={() => { setOpen(false); onClose(); }} sx={{ color: 'text.primary' }}>Cancelar</Button></DialogActions>
    </Dialog>
  </Box>;
}
