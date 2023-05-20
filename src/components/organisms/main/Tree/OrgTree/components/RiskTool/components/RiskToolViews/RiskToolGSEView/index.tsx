import React, { FC, useMemo } from 'react';

import { RuleSharp } from '@mui/icons-material';
import { LinearProgress } from '@mui/material';
import { STagButton } from 'components/atoms/STagButton';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { RiskEnum, RiskOrderEnum } from 'project/enum/risk.enums';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { IdsEnum } from 'core/enums/ids.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryClient } from 'core/services/queryClient';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<{ children?: any } & RiskToolGSEViewProps> = ({
  riskGroupId,
}) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const { enqueueSnackbar } = useSnackbar();

  const { companyId: userCompanyId } = useGetCompanyId(true);

  const gho = useAppSelector((state) => state.gho.selected);
  const homoId = useMemo(() => String(gho?.id || '').split('//')[0], [gho?.id]);

  //! performance optimization here
  const { data: riskDataQuery, isLoading: isRiskGhoLoading } =
    useQueryRiskDataByGho(riskGroupId as string, homoId);

  const handleAddRisk = () => {
    if (!selectedGho)
      enqueueSnackbar(
        'Selecione um Cargo / GSE / Ambiente acima antes de adicionar um risco',
        {
          variant: 'warning',
          autoHideDuration: 5000,
        },
      );

    document.getElementById(IdsEnum.RISK_SELECT)?.click();
  };

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

    if (
      (!selectedGhoFilter.value && !selectedGhoFilter.key) ||
      selectedGhoFilter?.value == 'none'
    )
      return data
        .sort(([, a], [, b]) => sortString(a, b, 'name'))
        .sort(([, a], [, b]) =>
          sortNumber(RiskOrderEnum[a.type], RiskOrderEnum[b.type]),
        );

    return data;
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
      {riskOrderedData.map(([riskData, risk]) => (
        <RiskToolGSEViewRow
          key={riskData.id}
          risk={risk}
          riskData={riskData}
          riskGroupId={riskGroupId}
        />
      ))}
      {gho && (
        <STagButton
          active={!!selectedGho}
          text={'Adicionar fator de risco'}
          onClick={handleAddRisk}
          sx={{ mt: 5, mb: 0, maxWidth: 287 }}
        />
      )}
    </>
  );
};
