import { RiskEnum } from 'project/enum/risk.enums';

import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { effectiveRiskOrderForGSEGrid } from 'core/utils/sorts/risk-gse-grid-order';
import { sortNumber } from 'core/utils/sorts/number.sort';

export type RiskToolGseJoinFilter = {
  key?: string;
  value?: string;
};

export type JoinRiskToolGseRowsInput = {
  isCatalogFetched: boolean;
  riskCatalog: IRiskFactors[] | undefined;
  riskDataQuery: IRiskData[] | undefined | null;
  homoId: string;
  selectedGhoFilter: RiskToolGseJoinFilter;
  riskGroupId: string;
};

export function joinRiskToolGseRows(
  input: JoinRiskToolGseRowsInput,
): [IRiskData, IRiskFactors][] {
  if (!input.isCatalogFetched || !Array.isArray(input.riskCatalog)) return [];
  if (!Array.isArray(input.riskDataQuery)) return [];

  const risk = input.riskCatalog;
  const representAllRiskData: [IRiskData, IRiskFactors][] = [];

  // Copy before sort — React Query may freeze cached arrays.
  const data = [...input.riskDataQuery]
    .sort((a, b) =>
      sortDate(
        b.endDate || new Date('3000-01-01T00:00:00.00Z'),
        a.endDate || new Date('3000-01-01T00:00:00.00Z'),
      ),
    )
    .sort((a, b) =>
      sortFilter(
        a,
        b,
        input.selectedGhoFilter.value,
        input.selectedGhoFilter.key,
      ),
    )
    .map((riskData) => {
      const riskFound = risk.find((r) => r.id === riskData.riskId);

      if (riskFound?.representAll && riskFound.type === RiskEnum.OUTROS) {
        representAllRiskData[0] = [riskData, riskFound];
      }
      return [riskData, riskFound] as [IRiskData, IRiskFactors];
    })
    .filter(([, r]) => {
      if (r && !r.representAll) return true;
      return false;
    });

  if (representAllRiskData.length === 0) {
    const riskFound = risk.find(
      (r) => r.type == RiskEnum.OUTROS && r.representAll,
    );
    if (riskFound) {
      representAllRiskData[0] = [
        {
          companyId: '',
          id: '',
          created_at: new Date(),
          riskId: riskFound?.id,
          updated_at: new Date(),
          riskFactorGroupDataId: input.riskGroupId,
        },
        riskFound,
      ];
    }
  }

  if (input.homoId) data.push(...representAllRiskData);

  const sortableData = data.filter(
    (pair): pair is [IRiskData, IRiskFactors] =>
      !!pair?.[0] && !!pair?.[1]?.id,
  );

  if (
    (!input.selectedGhoFilter.value && !input.selectedGhoFilter.key) ||
    input.selectedGhoFilter?.value == 'none'
  )
    return [...sortableData]
      .sort(([, a], [, b]) => sortNumber(a, b, 'name'))
      .sort(([, a], [, b]) =>
        sortNumber(a.representAll ? -1 : 1, b.representAll ? -1 : 1),
      )
      .sort(([, a], [, b]) =>
        sortNumber(
          effectiveRiskOrderForGSEGrid(a),
          effectiveRiskOrderForGSEGrid(b),
        ),
      );

  return [...sortableData].sort(([, a], [, b]) =>
    sortNumber(
      effectiveRiskOrderForGSEGrid(a),
      effectiveRiskOrderForGSEGrid(b),
    ),
  );
}
