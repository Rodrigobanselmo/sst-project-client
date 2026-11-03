import React from 'react';
import { Alert, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { AiGseAnalysis } from './gse-ai-consultative';
import { aiRolePath, professionalGseText } from './gse-ai-consultative';
import type { StructuringAlternative } from './gse-structuring-alternatives';

type Props = {
  options: StructuringAlternative[]; analysis: AiGseAnalysis;
  allOptions?: StructuringAlternative[];
  strategy: (option: StructuringAlternative) => string;
  preserved: (option: StructuringAlternative) => boolean;
  details: (option: StructuringAlternative) => React.ReactNode;
};
const unavailable = 'Informação não disponível.';
const notApplicable = '—';
export const matrixScrollSx = { maxHeight: '65vh', overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } } as const;
const parameterSx = { position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper', width: 180, minWidth: 180, fontWeight: 700 } as const;
const cellSx = { minWidth: 260, maxWidth: 340, verticalAlign: 'top', overflowWrap: 'anywhere', fontSize: '0.875rem', whiteSpace: 'normal' } as const;

/** Presentation of returned data only. No new occupational assessment, approval or persistence. */
export function GseAlternativesMatrix({ options, allOptions = options, analysis, strategy, preserved, details }: Props) {
  const text = (value: string) => professionalGseText(value, analysis);
  const known = (analysis.sources.existingGroups as { id: string; name: string; hierarchyIds?: string[] }[] | undefined) || [];
  const source = known.find((g) => g.id === options[0]?.sourceGroupId);
  const roleIds = new Set(analysis.sources.roles.map((role)=>role.id));
  const current = source && Array.isArray(source.hierarchyIds) ? source.hierarchyIds.filter((id)=>roleIds.has(id)) : options[0]?.currentHierarchyIds || [];
  if (!source || !options.length || options.some((option) => option.sourceGroupId !== source.id || option.currentHierarchyIds.length !== current.length || option.currentHierarchyIds.some((id) => !current.includes(id)))) {
    return <Alert severity="warning">Não há referência atual comum suficiente para comparar estas alternativas. Nenhuma composição foi presumida.</Alert>;
  }
  const list = (values: string[], empty = unavailable) => values.length ? <Box component="ul" sx={{ pl: 2, my: 0 }}>{values.map((value, i) => <Typography component="li" variant="body2" key={i}>{text(value)}</Typography>)}</Box> : empty;
  const roles = (ids: string[], empty = unavailable) => list(ids.map((id) => aiRolePath(analysis, id)), empty);
  const currentComposition = <Box component="section" aria-label="Composição cadastrada do GSE de origem" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
    <Typography variant="body2" fontWeight={700}>{text(source.name)}</Typography>
    <Typography variant="body2">GSE existente — composição cadastrada no escopo recebido.</Typography>
    {roles(current)}
  </Box>;
  const resulting = (option: StructuringAlternative) => <>
    {preserved(option) && <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>COMPOSIÇÃO PRESERVADA — SEM ALTERAÇÃO ESTRUTURAL</Typography>}
    <Box sx={{ display: 'grid', gap: 1 }}>{option.groups.map((g, i) => {
      const destination = g.existingGroupId ? known.find((entry)=>entry.id===g.existingGroupId) : undefined;
      const retained = g.existingGroupId === source.id;
      const prior = destination && Array.isArray(destination.hierarchyIds) ? destination.hierarchyIds.filter((id)=>roleIds.has(id)) : undefined;
      const returned = Array.isArray(g.resultingHierarchyIds) ? g.resultingHierarchyIds : undefined;
      const incoming = g.hierarchyIds;
      const alreadyThere = prior ? incoming.filter((id)=>prior.includes(id)) : [];
      const additional = returned?.filter((id)=>!incoming.includes(id)&&!prior?.includes(id)) || [];
      const consistent = prior !== undefined && returned !== undefined && [...prior,...incoming].every((id)=>returned.includes(id)) && !additional.length;
      return <Box component="section" key={g.existingGroupId || `new-${i}`} aria-label={`GSE resultante ${i + 1}`} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" fontWeight={700}>GSE {i + 1} — {text(g.existingGroupId ? destination?.name || 'Identidade existente não disponível' : g.name)}</Typography>
        <Typography variant="body2"><strong>Tipo: </strong>{g.existingGroupId ? 'GSE existente' : 'Novo GSE proposto'}</Typography>
        {retained ? <><Typography variant="body2"><strong>Cargos que permaneceriam na origem:</strong></Typography>{roles(incoming)}</>
          : g.existingGroupId ? <>
            <Typography variant="body2"><strong>Cargos já vinculados ao destino:</strong></Typography>
            {prior === undefined ? <Typography variant="body2">Composição atual do destino não disponível.</Typography> : roles(prior,'Nenhum cargo preexistente informado no escopo recebido.')}
            <Typography variant="body2"><strong>Cargos da origem destinados a este GSE — transferência proposta:</strong></Typography>
            {roles(incoming.filter((id)=>!alreadyThere.includes(id)),'Nenhum novo vínculo no destino indicado nesta hipótese.')}
            {!!alreadyThere.length && <><Typography variant="body2"><strong>Cargos que deixariam a origem e já possuem vínculo no destino:</strong></Typography>{roles(alreadyThere)}</>}
            {!!additional.length && <><Typography variant="body2"><strong>Demais integrantes informados na composição resultante:</strong></Typography>{roles(additional)}</>}
            {!consistent && <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Limitação:</strong> Composição integral do destino não disponível ou não conciliável no escopo recebido. Os cargos destinados pela proposta não representam necessariamente todo o grupo.</Typography>}
            {consistent && <Typography variant="caption">As listas mostram a composição resultante no escopo disponível, separando vínculos atuais e destinações propostas.</Typography>}
          </> : <><Typography variant="body2"><strong>Cargos destinados ao novo GSE:</strong></Typography>{roles(incoming)}</>}
        <Typography variant="caption">{retained ? 'Permanência proposta — não aplicada.' : g.existingGroupId ? 'Transferência proposta — não aplicada.' : 'Novo grupo ainda não cadastrado.'}</Typography>
      </Box>;
    })}</Box>
  </>;
  const changes = (option: StructuringAlternative) => {
    if(preserved(option))return 'Nenhuma alteração estrutural proposta. Sem transferências ou criação de GSEs.';
    const summary:string[]=[];
    if(option.kind==='SPLIT')summary.push('Desmembramento proposto.');
    if(option.groups.some((g)=>g.existingGroupId!==null&&g.existingGroupId!==source.id))summary.push('Transferência proposta para GSE existente.');
    if(option.groups.some((g)=>g.existingGroupId===null))summary.push('Criação proposta de GSE e destinação de cargos.');
    if(!option.groups.some((g)=>g.existingGroupId===source.id))summary.push('Nenhum cargo permaneceria no GSE de origem nesta hipótese.');
    return list(summary,'Reorganização consultiva conforme a distribuição explicitada.');
  };
  const basis = (option: StructuringAlternative, field: 'compatibleConditions'|'differences'|'unconfirmedEssentialInformation') => option.occupationalBasis
    ? list(option.occupationalBasis[field], field === 'unconfirmedEssentialInformation' ? 'Nenhuma lacuna essencial declarada; não comprova homogeneidade.' : 'Nenhuma informação declarada nesta categoria.') : unavailable;
  type Row = { section: string; label: string; current: React.ReactNode; value: (option: StructuringAlternative) => React.ReactNode; emphasis?: boolean };
  const rows: Row[] = [
    { section: 'Identificação', label: 'Estratégia', current: 'Composição cadastrada', value: strategy },
    { section: 'Identificação', label: 'Situação consultiva', current: 'Situação atual cadastrada', value: () => 'Hipótese consultiva — não aprovada nem aplicada' },
    { section: 'Identificação', label: 'Quantidade de GSEs na composição', current: 1, value: (o) => o.groups.length },
    { section: 'Identificação', label: 'Quantidade de novos GSEs propostos', current: notApplicable, value: (o) => o.groups.filter((g) => g.existingGroupId === null).length },
    { section: 'COMPOSIÇÃO DOS GSEs', label: 'Grupos e cargos', current: currentComposition, value: resulting, emphasis: true },
    { section: 'ALTERAÇÕES PROPOSTAS', label: 'Alteração estrutural', current: 'Referência cadastrada — sem proposta de alteração.', value: changes },
    { section: 'Fundamentação ocupacional', label: 'Compatibilidades identificadas', current: 'Consultar as evidências da análise; cadastro não comprova similaridade.', value: (o) => basis(o, 'compatibleConditions') },
    { section: 'Fundamentação ocupacional', label: 'Diferenças ocupacionais relevantes', current: unavailable, value: (o) => basis(o, 'differences') },
    { section: 'Fundamentação ocupacional', label: 'Similaridade de exposição', current: 'Não determinada por esta comparação.', value: (o) => !o.occupationalBasis ? unavailable : o.occupationalBasis.unconfirmedEssentialInformation.length ? 'Pendente de confirmação — há lacunas essenciais declaradas.' : 'Sem lacunas essenciais declaradas; não equivale a comprovação de homogeneidade.' },
    { section: 'Fundamentação ocupacional', label: 'Lacunas ocupacionais essenciais', current: unavailable, value: (o) => basis(o, 'unconfirmedEssentialInformation'), emphasis: true },
    { section: 'Fundamentação ocupacional', label: 'Pendências de validação', current: notApplicable, value: (o) => list(o.pendingValidations, 'Nenhuma pendência adicional informada.') },
    { section: 'Conclusão consultiva', label: 'Síntese da hipótese', current: notApplicable, value: (o) => <Summary text={text(o.justification)}/> },
    { section: 'Conclusão consultiva', label: 'Condições para validação', current: notApplicable, value: (o) => <>{list(o.hypotheses, 'Nenhuma hipótese adicional declarada.')}</> },
    { section: 'Conclusão consultiva', label: 'Preferência declarada pela IA', current: notApplicable, value: (o) => o.preferred ? <><strong>Preferencial na análise — não aprovada.</strong><Summary text={text(o.preferenceReason || unavailable)}/></> : 'Não indicada como preferencial.' },
    { section: 'Conclusão consultiva', label: 'Outras estratégias não propostas', current: notApplicable, value: (o) => o.otherStrategiesNotProposedReason ? <Summary text={text(o.otherStrategiesNotProposedReason)}/> : 'Sem justificativa específica declarada nesta alternativa.' },
    { section: 'Detalhes', label: 'Fundamentação técnica completa', current: 'Descrição e evidências ocupacionais conforme o contexto da análise.', value: (o) => <Box component="details"><summary>Consultar fundamentação completa</summary>{details(o)}{o.groups.map((g,i) => <Box key={i} sx={{ my: 1 }}><Typography variant="body2"><strong>Nome sugerido: </strong>{text(g.name)}</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Descrição preliminar: </strong>{text(g.description)}</Typography><Typography variant="body2"><strong>Justificativa da composição: </strong>{text(g.justification)}</Typography></Box>)}</Box> },
  ];
  return <>
    <Typography variant="body2" sx={{ mb: 1 }}>Comparação estrutural consultiva. A referência atual pertence ao contexto recebido na análise. Nenhuma hipótese comprova automaticamente similaridade de exposição.</Typography>
    <TableContainer component={Box} role="region" aria-label="Área rolável da matriz comparativa" tabIndex={0} sx={matrixScrollSx}>
      <Table stickyHeader aria-label="Matriz comparativa de alternativas de GSE" sx={{ minWidth: 180 + (options.length + 1) * 260, borderCollapse: 'separate' }}>
        <caption style={{ captionSide: 'top', textAlign: 'left', padding: 8 }}>Parâmetros comuns, situação atual e {options.length} alternativas selecionadas. Rolagem horizontal disponível.</caption>
        <TableHead><TableRow>
          <TableCell sx={{ ...parameterSx, zIndex: 3, top: 0 }} scope="col">Parâmetro</TableCell>
          <TableCell scope="col" sx={{ ...cellSx, bgcolor: 'background.paper', fontWeight: 700 }}>Situação atual</TableCell>
          {options.map((o,i) => <TableCell scope="col" key={o.id} sx={{ ...cellSx, bgcolor: 'background.paper' }}><Typography variant="body2" fontWeight={700}>Alternativa {allOptions.findIndex((candidate)=>candidate.id===o.id) >= 0 ? allOptions.findIndex((candidate)=>candidate.id===o.id)+1 : i+1} — {text(o.title)}</Typography><Typography variant="caption">{strategy(o)}</Typography></TableCell>)}
        </TableRow></TableHead>
        <TableBody>{rows.map((row,i) => <React.Fragment key={row.label}>
          {(i === 0 || rows[i-1].section !== row.section) && <TableRow><TableCell colSpan={options.length + 2} sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>{row.section}</TableCell></TableRow>}
          <TableRow><TableCell component="th" scope="row" sx={parameterSx}>{row.label}</TableCell><TableCell sx={cellSx}>{row.current}</TableCell>
            {options.map((o) => <TableCell key={o.id} sx={{ ...cellSx, ...(row.emphasis && !preserved(o) ? { bgcolor: 'action.hover' } : {}) }}>{row.value(o)}</TableCell>)}
          </TableRow>
        </React.Fragment>)}</TableBody>
      </Table>
    </TableContainer>
    <Typography variant="caption">— indica parâmetro exclusivo de uma hipótese consultiva. Informação não disponível não significa ausência comprovada.</Typography>
  </>;
}
/** Condense long text visually only; the complete returned wording remains accessible. */
function Summary({ text }: { text: string }) {
  if (text.length <= 180) return <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>;
  return <><Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</Typography><Box component="details"><summary>Ler texto completo</summary><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography></Box></>;
}
