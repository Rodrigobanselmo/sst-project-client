import React, { useState } from 'react';
import { GseAlternativesMatrix } from './GseAlternativesMatrix';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Typography } from '@mui/material';
import type { AiGseAnalysis, AiGseProposal } from './gse-ai-consultative';
import { aiRolePath, professionalGseText } from './gse-ai-consultative';
import { structuringLabels, type StructuringAlternative } from './gse-structuring-alternatives';

type Context = { analysis: AiGseAnalysis };
export const consultativeGroupSx = { my: 2.5, border: '2px solid', borderColor: 'grey.400', borderRadius: 2, bgcolor: 'background.paper', overflow: 'clip', minWidth: 0, overflowWrap: 'anywhere' } as const;
/** Immutable comparison state only: never a professional decision or persistence command. */
export function toggleAlternativeComparison(selected: string[], id: string, checked: boolean): string[] {
  return checked ? Array.from(new Set([...selected, id])) : selected.filter((value) => value !== id);
}
export function alternativeStrategy(option: StructuringAlternative): string {
  return option.kind === 'SPLIT' && option.groups.some((g) => g.existingGroupId === null)
    ? 'Desmembramento com criação de novo GSE' : structuringLabels[option.kind];
}
/** Set equality is presentation-only and never changes the returned scenario. */
export function isPreservedComposition(option: StructuringAlternative): boolean {
  if (option.groups.length !== 1 || option.groups[0].existingGroupId !== option.sourceGroupId) return false;
  const current = option.currentHierarchyIds;
  const same = (ids: string[]) => current.length > 0 && ids.length === current.length && new Set(ids).size === ids.length && ids.every((id) => current.includes(id));
  return same(option.groups[0].hierarchyIds) && same(option.groups[0].resultingHierarchyIds);
}
function groupIdentity(analysis: AiGseAnalysis, id: string) {
  return (analysis.sources.existingGroups as { id: string; name: string }[] | undefined)?.find((g) => g.id === id)?.name;
}
function Label({ children }: { children: React.ReactNode }) {
  return <Typography variant="body2" fontWeight={700} sx={{ mt: 1 }}>{children}</Typography>;
}
function RoleList({ ids, analysis }: Context & { ids: string[] }) {
  return ids.length ? <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>{ids.map((id) => <Typography component="li" variant="body2" key={id}>{professionalGseText(aiRolePath(analysis, id), analysis)}</Typography>)}</Box>
    : <Typography variant="body2">Composição não informada; requer esclarecimento.</Typography>;
}
function TextList({ title, values }: { title: string; values: string[] }) {
  return values.length ? <><Label>{title}</Label><Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>{values.map((value, i) => <Typography component="li" variant="body2" key={i} sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>)}</Box></> : null;
}

/** Current and proposed compositions are projections of the returned scenario, never edits. */
export function GseAlternativeStructure({ option, analysis }: Context & { option: StructuringAlternative }) {
  const text = (v: string) => professionalGseText(v, analysis);
  const sourceName = groupIdentity(analysis, option.sourceGroupId);
  if (!sourceName || !Array.isArray(option.currentHierarchyIds) || !option.currentHierarchyIds.length || !Array.isArray(option.groups) || !option.groups.length || option.groups.some((g) => !Array.isArray(g.resultingHierarchyIds) || !g.resultingHierarchyIds.length)) {
    return <Alert severity="warning">Informações insuficientes para representar o antes/depois. Confirme a origem e as composições propostas; nenhum destino foi presumido.</Alert>;
  }
  if (isPreservedComposition(option)) return <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
    <Typography variant="body2" fontWeight={700}>COMPOSIÇÃO PRESERVADA — SEM ALTERAÇÃO ESTRUTURAL</Typography>
    <Typography variant="body2">A composição cadastrada permanece integralmente nesta hipótese. Isso não comprova homogeneidade de exposição.</Typography>
    <Typography variant="caption">A justificativa, as condições e as pendências estão apresentadas abaixo. Nenhuma decisão foi aplicada.</Typography>
    <Box component="details" sx={{ mt: 1 }}><Box component="summary" sx={{ fontWeight: 600, cursor: 'pointer' }}>Consultar composição e descrição completas</Box>
      <Typography variant="body2"><strong>GSE de origem: </strong>{text(sourceName)}</Typography>
      <RoleList ids={option.currentHierarchyIds} analysis={analysis}/>
      <Typography variant="body2"><strong>Nome sugerido: </strong>{text(option.groups[0].name)}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Descrição preliminar: </strong>{text(option.groups[0].description)}</Typography>
      <Typography variant="body2"><strong>Justificativa da composição: </strong>{text(option.groups[0].justification)}</Typography>
    </Box>
  </Box>;
  return <Stack gap={1.5} sx={{ minWidth: 0 }}>
    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }} aria-label="Composição atualmente cadastrada">
      <Typography variant="body2" fontWeight={700}>ANTES — SITUAÇÃO ATUAL</Typography>
      <Typography variant="body2"><strong>GSE de origem: </strong>{text(sourceName)}</Typography>
      <Label>Cargos vinculados:</Label><RoleList ids={option.currentHierarchyIds} analysis={analysis}/>
    </Box>
    <Box aria-label="Composição proposta, não aplicada">
      <Typography variant="body2" fontWeight={700}>DEPOIS — HIPÓTESE CONSULTIVA</Typography>
      <Typography variant="caption">Estrutura proposta — nenhuma alteração cadastral aplicada.</Typography>
      <Stack gap={1} sx={{ mt: 1 }}>
        {option.groups.map((group, index) => {
          const existingName = group.existingGroupId ? groupIdentity(analysis, group.existingGroupId) : undefined;
          const retained = group.existingGroupId === option.sourceGroupId;
          return <Box key={group.existingGroupId || `new-${index}`} component="section" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, minWidth: 0 }} aria-label={`GSE resultante ${index + 1}`}>
            <Typography variant="body2" fontWeight={700}>GSE {index + 1} — {text(group.name)}</Typography>
            <Typography variant="body2"><strong>Tipo: </strong>{group.existingGroupId ? retained ? 'GSE de origem, com composição proposta.' : 'Aproveitamento de GSE existente.' : 'Novo GSE proposto — ainda não cadastrado.'}</Typography>
            {group.existingGroupId && <Typography variant="body2"><strong>{retained ? 'Identidade atual: ' : 'GSE de destino existente: '}</strong>{existingName ? text(existingName) : 'Identidade não informada; requer validação.'}</Typography>}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}><strong>Descrição preliminar: </strong>{text(group.description)}</Typography>
            <Label>{retained ? 'Cargos que permaneceriam na origem:' : 'Cargos da origem destinados a este GSE:'}</Label>
            <RoleList ids={group.hierarchyIds} analysis={analysis}/>
            {!retained && group.existingGroupId && <><Label>Composição resultante no escopo analisado:</Label><RoleList ids={group.resultingHierarchyIds} analysis={analysis}/></>}
            <Typography variant="body2"><strong>Justificativa da composição: </strong>{text(group.justification)}</Typography>
          </Box>;
        })}
      </Stack>
    </Box>
  </Stack>;
}
function AlternativeDetails({ option, analysis }: Context & { option: StructuringAlternative }) {
  const text = (v: string) => professionalGseText(v, analysis);
  return <>
    {option.otherStrategiesNotProposedReason && <Box sx={{ mb: 1 }}><Label>Por que não foram propostas outras estruturas:</Label><Typography variant="body2">{text(option.otherStrategiesNotProposedReason)}</Typography></Box>}
    {option.occupationalBasis && <Box sx={{ my: 1 }}>
      <TextList title="Compatibilidades ocupacionais identificadas:" values={option.occupationalBasis.compatibleConditions.map(text)}/>
      <TextList title="Diferenças ocupacionais identificadas:" values={option.occupationalBasis.differences.map(text)}/>
      {!!option.occupationalBasis.unconfirmedEssentialInformation.length && <Alert severity="warning"><TextList title="Informações essenciais ainda não confirmadas — hipótese não preferencial:" values={option.occupationalBasis.unconfirmedEssentialInformation.map(text)}/></Alert>}
    </Box>}
    <Label>{isPreservedComposition(option) ? 'Justificativa da manutenção:' : 'Fundamentação técnica:'}</Label><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text(option.justification)}</Typography>
    {option.preferred && <Typography variant="body2" sx={{ mt: 1 }}><strong>Preferência indicada pela IA — não aprovada: </strong>{text(option.preferenceReason || '')}</Typography>}
    <Box sx={{ mt: 1, px: 1.5, pb: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
      <TextList title="Pendências de validação:" values={option.pendingValidations.map(text)}/>
      {!option.pendingValidations.length && <Typography variant="body2"><strong>Pendências de validação: </strong>Nenhuma adicional informada nesta alternativa; a revisão profissional continua necessária.</Typography>}
    </Box>
    <Box component="details" sx={{ mt: 1 }}><Box component="summary" sx={{ fontWeight: 600, cursor: 'pointer' }}>Detalhes técnicos, evidências e hipóteses</Box>
      <TextList title="Evidências disponíveis:" values={option.evidence.map(text)}/>
      {option.occupationalBasis && <TextList title="Pendências documentais ou administrativas sem impacto ocupacional declarado:" values={option.occupationalBasis.nonMaterialPendingInformation.map(text)}/>}
      <TextList title="Hipóteses — não são fatos comprovados:" values={option.hypotheses.map(text)}/>
      {option.groups.map((group, i) => !!group.comparisons.length && <Box key={i} sx={{ mt: 1 }}>
        <Label>Comparações de {text(group.name)} com GSEs existentes:</Label>
        {group.comparisons.map((c) => <Box key={c.groupId} sx={{ my: 1 }}>
          <Typography variant="body2"><strong>{text(groupIdentity(analysis, c.groupId) || 'GSE existente')}:</strong> {({ POTENTIALLY_COMPATIBLE: 'Potencialmente compatível', NOT_PREFERRED: 'Não priorizado nesta hipótese', INSUFFICIENT: 'Compatibilidade ainda não demonstrada' })[c.assessment]}</Typography>
          <Typography variant="body2"><strong>Fundamentação: </strong>{text(c.reason)}</Typography>
          <TextList title="Evidências da comparação:" values={c.evidence.map(text)}/>
        </Box>)}
      </Box>)}
    </Box>
  </>;
}
/** Shared with the modal and SSR tests; intentionally no callbacks for application or approval. */
export function GseAlternativesComparison({ options, allOptions, analysis }: Context & { options: StructuringAlternative[]; allOptions?: StructuringAlternative[] }) {
  return <GseAlternativesMatrix options={options} allOptions={allOptions} analysis={analysis} strategy={alternativeStrategy} preserved={isPreservedComposition} details={(option)=><AlternativeDetails option={option} analysis={analysis}/>}/>;
}

/** Comparison is ephemeral UI state, never a recommendation approval or a save command. */
export function GseStructuringAlternatives({ proposal, analysis, disabled }: { proposal: AiGseProposal; analysis: AiGseAnalysis; disabled: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const titleId = React.useId();
  const options = proposal.structuringAlternatives;
  const compared = options?.filter((option) => selected.includes(option.id)) || [];
  const toggle = (id: string, checked: boolean) => {
    const next = toggleAlternativeComparison(selected, id, checked);
    setSelected(next);
    if (next.length < 2) setComparisonOpen(false);
  };
  return <Box component="section" sx={{ my: 2, minWidth: 0 }} aria-label="Alternativas de estruturação propostas pela IA">
    <Box sx={{ p: 1.5, mb: 1.5, bgcolor: 'action.hover', borderLeft: '4px solid', borderColor: 'warning.main' }}>
      <Typography variant="body2" fontWeight={700}>PROPOSTAS DE REORGANIZAÇÃO DOS GSEs</Typography>
      <Typography variant="body2">{options?.length || 0} {options?.length === 1 ? 'alternativa identificada' : 'alternativas identificadas'} pela IA.</Typography>
    </Box>
    <Typography variant="caption" component="p" sx={{ mb: 1 }}>Proposta consultiva — nenhuma alteração cadastral aplicada. Comparar não significa aprovar e não altera manifestações profissionais.</Typography>
    {options === undefined ? <Typography variant="body2">Esta avaliação anterior não contém alternativas estruturais. Uma nova análise pode apresentá-las, quando houver fundamento.</Typography> : !options.length ? <Box>
      <Typography variant="body2">{proposal.existingGroupId ? 'Nenhuma reorganização concreta foi proposta nesta avaliação. A composição atual permanece como referência, sem alteração aplicada.' : 'A composição preliminar deste novo GSE está apresentada no próprio cartão, ainda sem criação no cadastro.'}</Typography>
      {proposal.existingGroupId && <Typography variant="body2"><strong>Conclusão diagnóstica: </strong>{professionalGseText(proposal.groupAssessment?.exposureAssessment || proposal.justification || 'Consulte a avaliação técnica e as pendências do grupo.', analysis)}</Typography>}
    </Box> : <>
      {options.length > 1 && <Box role="region" aria-label="Ações de comparação consultiva" sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper', py: 1, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2">Selecione duas ou mais alternativas para comparar suas composições.</Typography>
        <Typography variant="body2" aria-live="polite">{compared.length} {compared.length === 1 ? 'alternativa selecionada' : 'alternativas selecionadas'} — somente para comparação.</Typography>
        <Button variant="outlined" size="small" disabled={disabled || compared.length < 2} onClick={() => setComparisonOpen(true)}>Abrir comparação ampliada</Button>
      </Box>}
      <Stack gap={2}>
        {options.map((option, index) => <Box component="article" key={option.id} sx={{ p: { xs: 1, sm: 1.5 }, minWidth: 0, border: '1px solid', borderColor: selected.includes(option.id) ? 'primary.main' : 'divider', borderRadius: 1, overflowWrap: 'anywhere' }}>
          <Typography variant="body2" fontWeight={700}>ALTERNATIVA {index + 1} — {alternativeStrategy(option)}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>{professionalGseText(option.title, analysis)}</Typography>
          <Typography variant="caption">Proposta consultiva, não aplicada. Requer validação profissional.</Typography>
          <FormControlLabel sx={{ m: 0, my: 0.5, display: 'flex', alignItems: 'flex-start' }} control={<Checkbox size="small" checked={selected.includes(option.id)} disabled={disabled} inputProps={{ 'aria-label': `Comparar alternativa ${index + 1}: ${professionalGseText(option.title, analysis)}` }} onChange={(_, checked) => toggle(option.id, checked)}/>} label="Comparar esta alternativa"/>
          {selected.includes(option.id) && <Typography variant="caption" component="p">Selecionada somente para comparação — não aprovada.</Typography>}
          <GseAlternativeStructure option={option} analysis={analysis}/>
          <AlternativeDetails option={option} analysis={analysis}/>
        </Box>)}
      </Stack>
      <Dialog open={comparisonOpen && compared.length >= 2 && !disabled} onClose={() => setComparisonOpen(false)} maxWidth="lg" fullWidth scroll="paper" aria-labelledby={titleId}>
        <DialogTitle id={titleId}>Comparando {compared.length} alternativas</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>Comparação consultiva — nenhuma alteração cadastral aplicada. Não representa aprovação ou decisão formal.</Alert>
          <Stack direction="row" flexWrap="wrap" sx={{ mb: 2 }}>{compared.map((option) => <FormControlLabel key={option.id} control={<Checkbox checked onChange={() => toggle(option.id, false)}/>} label={`Comparar: ${professionalGseText(option.title, analysis)}`}/>)}</Stack>
          <GseAlternativesComparison options={compared} allOptions={options} analysis={analysis}/>
        </DialogContent>
        <DialogActions><Button onClick={() => setComparisonOpen(false)}>Fechar comparação</Button></DialogActions>
      </Dialog>
    </>}
  </Box>;
}
