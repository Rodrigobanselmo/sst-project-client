import React, { FC, useMemo } from 'react';

import { Box, LinearProgress } from '@mui/material';
import SText from 'components/atoms/SText';
import { RiskEnum } from 'project/enum/risk.enums';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryClient } from 'core/services/queryClient';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { effectiveRiskOrderForGSEGrid } from 'core/utils/sorts/risk-gse-grid-order';
import { sortNumber } from 'core/utils/sorts/number.sort';

import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<{ children?: any } & RiskToolGSEViewProps> = ({
  riskGroupId,
}) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);

  const { companyId: userCompanyId } = useGetCompanyId(true);

  const homoId = useMemo(
    () => String(selectedGho?.id || '').split('//')[0],
    [selectedGho?.id],
  );

  //! performance optimization here
  const { data: riskDataQuery, isLoading: isRiskGhoLoading } =
    useQueryRiskDataByGho(riskGroupId as string, homoId);

  // const representAllRiskData: [IRiskData, IRiskFactors][] = [
  //   [{ riskId: '78fad211-7395-4a98-bc72-2954ce487006' }],
  // ];

  const riskOrderedData = useMemo(() => {
    if (!riskDataQuery) return [];

    //! if other company adds a risk it does not appear for me
    const risk = queryClient.getQueryData([
      QueryEnum.RISK,
      userCompanyId,
    ]) as IRiskFactors[];

    if (!risk) return [];

    const representAllRiskData: [IRiskData, IRiskFactors][] = [];

    //! here we are finding the risk and if not found does not apear, error if this risk is from company different than user will fail
    const data = riskDataQuery
      .sort((a, b) =>
        sortDate(
          b.endDate || new Date('3000-01-01T00:00:00.00Z'),
          a.endDate || new Date('3000-01-01T00:00:00.00Z'),
        ),
      )
      .sort(
        (a, b) =>
          sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key), //! performance optimization here or sort
      )
      .map((riskData) => {
        const riskFound = risk.find((r) => r.id === riskData.riskId);

        if (riskFound?.representAll && riskFound.type === RiskEnum.OUTROS) {
          representAllRiskData[0] = [riskData, riskFound];
        }
        //! attention risk not found
        //! here we are finding the risk and if not found does not apear, error if this risk is from company different than user will fail
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
            riskFactorGroupDataId: riskGroupId,
          },
          riskFound,
        ];
      }
    }

    if (homoId) data.push(...representAllRiskData);

    const sortableData = data.filter(
      (pair): pair is [IRiskData, IRiskFactors] =>
        !!pair?.[0] && !!pair?.[1]?.id,
    );

    if (
      (!selectedGhoFilter.value && !selectedGhoFilter.key) ||
      selectedGhoFilter?.value == 'none'
    )
      return sortableData
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

    return sortableData.sort(([, a], [, b]) =>
      sortNumber(
        effectiveRiskOrderForGSEGrid(a),
        effectiveRiskOrderForGSEGrid(b),
      ),
    );
  }, [
    riskDataQuery,
    userCompanyId,
    homoId,
    selectedGhoFilter.value,
    selectedGhoFilter.key,
    riskGroupId,
  ]);

  return (
    <>
      {isRiskGhoLoading && <LinearProgress />}
      {!isRiskGhoLoading && riskOrderedData.length === 0 && (
        <Box sx={{ py: 4, px: 2 }}>
          <SText color="text.secondary">
            {homoId
              ? 'Nenhum fator de risco vinculado. Você pode adicionar riscos pelo botão acima.'
              : 'Selecione um GSE, elemento caracterizado, hierarquia ou funcionário para visualizar os riscos.'}
          </SText>
        </Box>
      )}
      {riskOrderedData.map(([riskData, risk]) => (
        <RiskToolGSEViewRow
          key={riskData?.id || risk?.id || riskData?.riskId}
          risk={risk}
          riskData={riskData}
          riskGroupId={riskGroupId}
        />
      ))}
    </>
  );
};
