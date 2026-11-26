import { SectorBulkRiskRemove } from './SectorBulkRiskRemove';
import { SectorBulkRiskAdd } from './SectorBulkRiskAdd';
import type { BulkRiskAddTask } from './bulk-risk-add.runner';
import { Box, Button, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ReactNode, useState } from 'react';
import { buildRiskAnalysisDisplayPartitions, RiskAnalysisDisplayGroup } from '../../helpers/buildRiskAnalysisDisplayPartitions';
import type { HierarchyGroupForRiskAnalysis } from '../../helpers/expandRiskAnalysisEntitiesForHierarchyGroups';

function Disclosure({ title, children, action, defaultOpen = false, protectedOnly = false }: { protectedOnly?: boolean; title: string; children: () => ReactNode; action?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <Box sx={{ border: 0, borderRadius: 0, mb: 8, minWidth: 0, backgroundColor: 'transparent' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', py: 6, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Button disableRipple onClick={() => setOpen(!open)} aria-expanded={open}
        title={protectedOnly ? 'Todos os fatores deste setor no filtro atual estão protegidos por quantidade insuficiente de participantes.' : undefined}
        startIcon={<ChevronRightIcon sx={{ transform: open ? 'rotate(90deg)' : undefined }} />}
        sx={{ color: theme => protectedOnly ? (theme.palette.mode === 'dark' ? '#69717E' : '#9CA3AF') : theme.palette.text.primary, textTransform: 'none', textAlign: 'left', justifyContent: 'flex-start', flex: '1 1 200px', fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere', borderRadius: 0, px: 0, backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}>{title}</Button>
      {action}
    </Box>
    {open && <Box sx={{ pl: { xs: 6, sm: 12 }, pt: 4, pb: 6, minWidth: 0 }}>{children()}</Box>}
  </Box>;
}

type Props = {
  riskIds: string[];
  getEntitiesWithRisk: (riskId: string) => string[];
  entityMap: Record<string, { id: string; name: string }>;
  hierarchyGroups: HierarchyGroupForRiskAnalysis[];
  establishmentMap: Map<string, string>;
  renderSectorRisk: (id: string, riskId: string) => ReactNode;
  renderGroupRisk: (entry: RiskAnalysisDisplayGroup, riskId: string, intercompany: boolean) => ReactNode;
  buildBulkRiskTasks: (ids: string[], riskIds: string[], includeAi: boolean) => BulkRiskAddTask[];
  isRiskProtected: (riskId: string, hierarchyId: string) => boolean;
  isRiskInInventory: (riskId: string, hierarchyId: string) => boolean;
  buildBulkRemoveTasks: (ids: string[], riskIds: string[]) => BulkRiskAddTask[];
  onBulkComplete: () => Promise<void>;
};

export function FrpsSectorView(props: Props) {
  const sections = new Map<string, Map<string, { name: string; ids: string[]; risks: string[]; group?: RiskAnalysisDisplayGroup; intercompany: boolean }>>();
  const establishment = (id: string) => props.establishmentMap.get(id) || 'Estabelecimento não identificado';
  for (const riskId of props.riskIds) {
    const partitions = buildRiskAnalysisDisplayPartitions({ entityIds: props.getEntitiesWithRisk(riskId), hierarchyGroups: props.hierarchyGroups, entityMap: props.entityMap });
    const add = (key: string, name: string, ids: string[], group?: RiskAnalysisDisplayGroup) => {
      const labels = [...new Set((group?.group.hierarchyIds ?? ids).map(establishment))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
      const intercompany = labels.length > 1;
      const sectionName = intercompany ? `AGRUPAMENTO DE ESTABELECIMENTOS — ${labels.join(' + ')}` : `ESTABELECIMENTO — ${labels[0]}`;
      const entries = sections.get(sectionName) ?? new Map();
      const entry = entries.get(key) ?? { name, ids: [], risks: [], group, intercompany };
      entry.ids = [...new Set([...entry.ids, ...ids])];
      entry.risks.push(riskId);
      entries.set(key, entry);
      sections.set(sectionName, entries);
    };
    partitions.groups.forEach(group => add(`group:${group.group.id}`, `AGRUPAMENTO DE SETORES — ${group.group.name}`, group.memberEntityIds, group));
    partitions.ungrouped.forEach(id => add(`sector:${id}`, `SETOR — ${props.entityMap[id]?.name ?? id}`, [id]));
  }
  return <Box>
    {[...sections].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')).map(([name, entries]) => <Disclosure key={name} title={name} defaultOpen>{() =>
      [...entries].sort(([, a], [, b]) => Number(Boolean(b.group)) - Number(Boolean(a.group)) || a.name.localeCompare(b.name, 'pt-BR')).map(([key, entry]) => <Disclosure key={key} title={entry.name}
        protectedOnly={entry.risks.length > 0 && entry.risks.every(riskId => {
          const ids = entry.ids.filter(id => props.getEntitiesWithRisk(riskId).includes(id));
          return ids.length > 0 && ids.every(id => props.isRiskProtected(riskId, id));
        })}
        action={<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}><SectorBulkRiskAdd title={entry.name} buildTasks={includeAi => props.buildBulkRiskTasks(entry.ids, entry.risks, includeAi)} onComplete={props.onBulkComplete} /><SectorBulkRiskRemove canRemove={entry.ids.some(id => entry.risks.some(riskId => props.isRiskInInventory(riskId, id)))} title={entry.name} buildTasks={() => props.buildBulkRemoveTasks(entry.ids, entry.risks)} onComplete={props.onBulkComplete} /></Box>}>
        {() => <><Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>{entry.risks.length} fatores no filtro atual</Typography>
          {entry.risks.map(riskId => entry.group ? props.renderGroupRisk({ ...entry.group, memberEntityIds: entry.ids.filter(id => props.getEntitiesWithRisk(riskId).includes(id)) }, riskId, entry.intercompany) : props.renderSectorRisk(entry.ids[0], riskId))}</>}
      </Disclosure>)
    }</Disclosure>)}
  </Box>;
}
