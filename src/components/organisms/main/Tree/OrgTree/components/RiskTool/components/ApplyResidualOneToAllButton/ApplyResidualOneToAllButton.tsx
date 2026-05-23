import { FC } from 'react';

import { SButton } from 'components/atoms/SButton';
import STooltip from 'components/atoms/STooltip';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { useApplyResidualOneToAll } from '../../hooks/useApplyResidualOneToAll';
import { ViewTypeEnum } from '../../utils/view-risk-type.constant';

type Props = {
  riskGroupId: string;
  viewType: ViewTypeEnum;
};

export const ApplyResidualOneToAllButton: FC<Props> = ({
  riskGroupId,
  viewType,
}) => {
  const risk = useAppSelector(selectRisk);
  const { eligibleCount, isApplying, openConfirmAndApply } =
    useApplyResidualOneToAll(riskGroupId);

  if (viewType !== ViewTypeEnum.SIMPLE_BY_RISK || !risk?.id) {
    return null;
  }

  const disabled = eligibleCount === 0 || isApplying;
  const tooltip =
    eligibleCount === 0
      ? 'Nenhum vínculo elegível (probabilidade real definida, com recomendações e residual diferente de 1).'
      : `Aplicar probabilidade residual 1 em ${eligibleCount} vínculo(s) elegível(is).`;

  return (
    <STooltip title={tooltip}>
      <span>
        <SButton
          variant="outlined"
          color="primary"
          size="small"
          disabled={disabled}
          loading={isApplying}
          onClick={openConfirmAndApply}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Aplicar residual 1 em todos
          {eligibleCount > 0 ? ` (${eligibleCount})` : ''}
        </SButton>
      </span>
    </STooltip>
  );
};
