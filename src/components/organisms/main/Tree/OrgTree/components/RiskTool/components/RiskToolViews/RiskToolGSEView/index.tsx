import React, { FC, useMemo } from 'react';

import { STagButton } from 'components/atoms/STagButton';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { RiskOrderEnum } from 'project/enum/risk.enums';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { IdsEnum } from 'core/enums/ids.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryClient } from 'core/services/queryClient';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<RiskToolGSEViewProps> = ({ riskGroupId }) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const { enqueueSnackbar } = useSnackbar();

  const { companyId: userCompanyId } = useGetCompanyId(true);

  const gho = useAppSelector((state) => state.gho.selected);
  const homoId = String(gho?.id || '').split('//')[0];

  //! performance optimization here
  const { data: riskDataQuery } = useQueryRiskDataByGho(
    riskGroupId as string,
    homoId,
  );

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

  const riskOrderedData = useMemo(() => {
    if (!riskDataQuery) return [];

    //! if other company adds a risk it does not appear for me
    const risk = queryClient.getQueryData([
      QueryEnum.RISK,
      userCompanyId,
    ]) as IRiskFactors[];

    if (!risk) return [];

    //! here we are finding the risk and if not found does not apear, error if this risk is from company different than user will fail
    const data = riskDataQuery
      .sort(
        (a, b) =>
          sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key), //! performance optimization here or sort
      )
      .map((riskData) => {
        //! attention risk not found
        //! here we are finding the risk and if not found does not apear, error if this risk is from company different than user will fail
        return [riskData, risk.find((r) => r.id === riskData.riskId)] as [
          IRiskData,
          IRiskFactors,
        ];
      })
      .filter(([, r]) => r);

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
    userCompanyId,
    riskDataQuery,
    selectedGhoFilter.key,
    selectedGhoFilter.value,
  ]);

  return (
    <>
      {riskOrderedData.map(([riskData, risk]) => (
        <RiskToolGSEViewRow key={riskData.id} risk={risk} riskData={riskData} />
      ))}
      <STagButton
        active={!!selectedGho}
        text={'Adicionar fator de risco'}
        onClick={handleAddRisk}
        sx={{ mt: 5, mb: 0, maxWidth: 287 }}
      />
    </>
  );
};
