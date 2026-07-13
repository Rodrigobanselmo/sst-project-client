import { FC, MouseEvent, useMemo, useState } from 'react';

import EditIcon from 'assets/icons/SEditIcon';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { SMenu } from 'components/molecules/SMenu';
import { IMenuOption } from 'components/molecules/SMenu/types';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutInactivateCompany } from 'core/services/hooks/mutations/manager/company/useMutInactivateCompany/useMutInactivateCompany';
import { useMutReactivateCompany } from 'core/services/hooks/mutations/manager/company/useMutReactivateCompany/useMutReactivateCompany';

const INACTIVATE_CONFIRM_MESSAGE =
  'Esta empresa será inativada e deixará de aparecer nas buscas e fluxos oficiais por padrão. Os dados históricos serão preservados. Esta ação não exclui documentos, PGRs ou registros existentes.';

type CompanyActionsRowProps = {
  company: ICompany;
};

export const CompanyActionsRow: FC<CompanyActionsRowProps> = ({ company }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { onStackOpenModal } = useModal();
  const { isMaster } = useAccess();
  const { preventWarn } = usePreventAction();
  const inactivateMutation = useMutInactivateCompany();
  const reactivateMutation = useMutReactivateCompany();

  const isInactive = company.status === StatusEnum.INACTIVE;

  const options = useMemo(() => {
    const items: IMenuOption[] = [
      {
        value: 'edit',
        name: 'Editar dados',
      },
    ];

    if (isMaster) {
      if (isInactive) {
        items.push({
          value: 'reactivate',
          name: 'Reativar empresa',
          borderTop: true,
        });
      } else {
        items.push({
          value: 'inactivate',
          name: 'Inativar empresa',
          borderTop: true,
          color: 'error.main',
        });
      }
    }

    return items;
  }, [isInactive, isMaster]);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isMaster) {
      onStackOpenModal(ModalEnum.COMPANY_EDIT, company);
      return;
    }
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (option: { value: string | number }, e: MouseEvent) => {
    e.stopPropagation();
    handleClose();

    if (option.value === 'edit') {
      onStackOpenModal(ModalEnum.COMPANY_EDIT, company);
      return;
    }

    if (option.value === 'inactivate') {
      preventWarn(
        INACTIVATE_CONFIRM_MESSAGE,
        () => {
          inactivateMutation.mutate(company.id);
        },
        {
          title: 'Inativar empresa?',
          confirmText: 'Inativar',
          tag: 'warning',
        },
      );
      return;
    }

    if (option.value === 'reactivate') {
      preventWarn(
        'Esta empresa voltará a aparecer nas buscas e fluxos oficiais.',
        () => {
          reactivateMutation.mutate(company.id);
        },
        {
          title: 'Reativar empresa?',
          confirmText: 'Reativar',
          tag: 'warning',
        },
      );
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
