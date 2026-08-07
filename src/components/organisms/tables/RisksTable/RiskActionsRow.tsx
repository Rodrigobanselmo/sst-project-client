import { FC, MouseEvent, useMemo, useState } from 'react';

import EditIcon from 'assets/icons/SEditIcon';
import { SCopyIcon } from 'assets/icons/SCopyIcon';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { SMenu } from 'components/molecules/SMenu';
import { IMenuOption } from 'components/molecules/SMenu/types';
import { useDuplicateRiskFactor } from 'core/hooks/useDuplicateRiskFactor';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

type RiskActionsRowProps = {
  risk: IRiskFactors;
  companyId: string;
  onEdit: (risk: IRiskFactors) => void;
};

export const RiskActionsRow: FC<RiskActionsRowProps> = ({
  risk,
  companyId,
  onEdit,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
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

    return items;
  }, [canDuplicateRiskFactor]);

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
      requestDuplicateRiskFactor(risk, companyId);
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
    </>
  );
};
