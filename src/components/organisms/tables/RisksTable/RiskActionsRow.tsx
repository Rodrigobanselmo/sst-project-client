import { FC, MouseEvent, useMemo, useState } from 'react';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from 'assets/icons/SEditIcon';
import { SCopyIcon } from 'assets/icons/SCopyIcon';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { SMenu } from 'components/molecules/SMenu';
import { IMenuOption } from 'components/molecules/SMenu/types';
import { useAccess } from 'core/hooks/useAccess';
import { useDuplicateRiskFactor } from 'core/hooks/useDuplicateRiskFactor';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { RiskHardDeleteImpactModal } from './RiskHardDeleteImpactModal';

type RiskActionsRowProps = {
  risk: IRiskFactors;
  companyId?: string;
  onEdit: (risk: IRiskFactors) => void;
};

export const RiskActionsRow: FC<RiskActionsRowProps> = ({
  risk,
  companyId,
  onEdit,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
  const { isMaster } = useAccess();
  const { canDuplicateRiskFactor, requestDuplicateRiskFactor } =
    useDuplicateRiskFactor();

  const options = useMemo(() => {
    const items: IMenuOption[] = [
      {
        value: 'edit',
        name: 'Editar',
        icon: EditIcon,
      },
    ];

    if (canDuplicateRiskFactor) {
      items.push({
        value: 'duplicate',
        name: 'Duplicar',
        icon: SCopyIcon,
        borderTop: true,
      });
    }

    if (isMaster) {
      items.push({
        value: 'hard-delete',
        name: 'Excluir definitivamente',
        icon: DeleteForeverIcon,
        borderTop: true,
      });
    }

    return items;
  }, [canDuplicateRiskFactor, isMaster]);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (option: { value: string | number }, e: MouseEvent) => {
    e.stopPropagation();
    handleClose();

    if (option.value === 'edit') {
      onEdit(risk);
      return;
    }

    if (option.value === 'duplicate') {
      requestDuplicateRiskFactor(risk);
      return;
    }

    if (option.value === 'hard-delete') {
      setHardDeleteOpen(true);
    }
  };

  return (
    <>
      <IconButtonRow
        icon={<EditIcon />}
        tooltipTitle="Ações"
        onClick={handleOpen}
      />
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        handleSelect={handleSelect}
        options={options}
      />
      <RiskHardDeleteImpactModal
        open={hardDeleteOpen}
        riskId={hardDeleteOpen ? risk.id : null}
        riskName={risk.name}
        onClose={() => setHardDeleteOpen(false)}
      />
    </>
  );
};
