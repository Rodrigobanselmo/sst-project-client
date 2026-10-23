import { matchesPfro, PfroRisk } from './exam-risk-pfro.util';
import { createContext, useContext, useEffect } from 'react';
import { Checkbox } from '@mui/material';
import { useQuery } from 'react-query';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import {
  loadInlineRiskLinks,
  InlineRiskScope,
} from './exam-risk-inline-parameter.util';

export const eligibleBulkLinks = (
  links: IExamToRisk[],
  companyId: string,
  ids: number[],
) =>
  links.filter(
    (link) =>
      link.companyId === companyId &&
      !(link as IExamToRisk & { deletedAt?: string | Date | null }).deletedAt &&
      ids.includes(link.id),
  );

export const visibleBulkLinks = (
  loaded: Record<string, IExamToRisk[]>,
  risks: (PfroRisk & { riskId: string })[],
  pfro: string,
) =>
  Object.values(loaded)
    .flat()
    .filter((link) =>
      risks.some(
        (risk) =>
          risk.riskId === link.riskId && matchesPfro(risk, pfro),
      ),
    );

export const ExamRiskBulkContext = createContext<{
  selected: number[];
  eligibleIds: number[];
  toggle: (id: number) => void;
  register: (riskId: string, links: IExamToRisk[]) => void;
} | null>(null);

export function useBulkLoadedLinks(scope: InlineRiskScope, ids: number[]) {
  const bulk = useContext(ExamRiskBulkContext);
  const { data } = useQuery(
    ['exam-risk-inline-links', scope],
    () => loadInlineRiskLinks(scope),
    { enabled: !!bulk && !!scope.riskName && ids.length > 0 },
  );
  const key = ids.join(',');
  useEffect(() => {
    if (!bulk) return;
    bulk.register(
      scope.riskId,
      eligibleBulkLinks(data ?? [], scope.companyId, ids),
    );
    return () => bulk.register(scope.riskId, []);
  }, [bulk?.register, scope.riskId, scope.companyId, data, key]);
}

export function ExamRiskBulkCheckbox({
  linkId,
  examName,
}: {
  linkId: number;
  examName: string;
}) {
  const bulk = useContext(ExamRiskBulkContext);
  if (!bulk || !bulk.eligibleIds.includes(linkId)) return null;
  return (
    <Checkbox
      size="small"
      checked={bulk.selected.includes(linkId)}
      onChange={() => bulk.toggle(linkId)}
      inputProps={{
        'aria-label': `Selecionar vínculo ${linkId} — ${examName}`,
      }}
    />
  );
}
