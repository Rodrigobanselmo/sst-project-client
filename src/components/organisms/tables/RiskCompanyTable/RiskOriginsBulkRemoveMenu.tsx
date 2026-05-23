import { FC, useMemo, useState } from 'react';

import { Menu, MenuItem } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import SText from 'components/atoms/SText';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  getMassRemoveTargetLabel,
  MassRemoveOccupationalRiskTarget,
  OCCUPATIONAL_RISK_LEVEL_NAMES,
  OccupationalRiskLevel,
  resolveOccupationalRiskLevel,
} from 'core/utils/helpers/occupational-risk-level.util';
import {
  useMutDeleteManyRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';

type Props = {
  risk: IRiskFactors;
  riskFactorData: IRiskData[];
  riskGroupId?: string;
};

const REMOVE_OPTIONS: { value: MassRemoveOccupationalRiskTarget; label: string }[] =
  [
    { value: 'all', label: 'Remover todos os vínculos' },
    { value: 1, label: `Remover apenas ${OCCUPATIONAL_RISK_LEVEL_NAMES[1]}` },
    { value: 2, label: `Remover apenas ${OCCUPATIONAL_RISK_LEVEL_NAMES[2]}` },
    { value: 3, label: `Remover apenas ${OCCUPATIONAL_RISK_LEVEL_NAMES[3]}` },
    { value: 4, label: `Remover apenas ${OCCUPATIONAL_RISK_LEVEL_NAMES[4]}` },
    { value: 5, label: `Remover apenas ${OCCUPATIONAL_RISK_LEVEL_NAMES[5]}` },
  ];

export const RiskOriginsBulkRemoveMenu: FC<Props> = ({
  risk,
  riskFactorData,
  riskGroupId,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { preventDelete } = usePreventAction();
  const deleteManyMut = useMutDeleteManyRiskData();

  const levelByRiskDataId = useMemo(() => {
    const map = new Map<string, OccupationalRiskLevel | null>();
    riskFactorData.forEach((item) => {
      if (!item?.id) return;
      map.set(
        item.id,
        resolveOccupationalRiskLevel(
          risk?.severity,
          item?.probability,
          item?.level,
        ),
      );
    });
    return map;
  }, [risk?.severity, riskFactorData]);

  const countByTarget = useMemo(() => {
    const counts = new Map<MassRemoveOccupationalRiskTarget, number>();
    REMOVE_OPTIONS.forEach((opt) => counts.set(opt.value, 0));

    riskFactorData.forEach((item) => {
      const level = levelByRiskDataId.get(item.id) ?? null;
      counts.set('all', (counts.get('all') ?? 0) + 1);
      if (level != null) {
        counts.set(level, (counts.get(level) ?? 0) + 1);
      }
    });

    return counts;
  }, [riskFactorData, levelByRiskDataId]);

  const filterRiskData = (target: MassRemoveOccupationalRiskTarget) => {
    if (target === 'all') return riskFactorData;
    return riskFactorData.filter(
      (item) => levelByRiskDataId.get(item.id) === target,
    );
  };

  const handleRemove = (target: MassRemoveOccupationalRiskTarget) => {
    setAnchorEl(null);

    const items = filterRiskData(target);
    if (!items.length || !riskGroupId) return;

    const count = items.length;
    const targetLabel = getMassRemoveTargetLabel(target);

    preventDelete(
      async () => {
        await deleteManyMut.mutateAsync({
          ids: items.map((item) => item.id),
          riskFactorGroupDataId: riskGroupId,
        });
      },
      <SText fontSize={14}>
        Serão removidos <b>{count}</b> vínculo(s) ({targetLabel}) do risco{' '}
        <b>{risk?.name ?? 'risco'}</b>. Esta ação não pode ser desfeita.
      </SText>,
    );
  };

  if (!riskFactorData.length) return null;

  return (
    <>
      <SButton
        variant="shade"
        color="danger"
        size="s"
        text="Remover vínculos em massa"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        buttonProps={{
          sx: { width: 'fit-content', mb: 2 },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {REMOVE_OPTIONS.map((option) => {
          const count = countByTarget.get(option.value) ?? 0;
          return (
            <MenuItem
              key={String(option.value)}
              disabled={count === 0 || !riskGroupId || deleteManyMut.isLoading}
              onClick={() => handleRemove(option.value)}
            >
              {option.label} ({count})
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
