import { FC } from 'react';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { BoxProps } from '@mui/material';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import SystemRow from 'components/atoms/STable/components/Rows/SystemRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddChecklist } from 'components/organisms/modals/ModalAddChecklist';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useQueryChecklist } from 'core/services/hooks/queries/useQueryChecklist';
import { sortData } from 'core/utils/sorts/data.sort';

export const ChecklistTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryChecklist();

  const { onOpenModal } = useModal();
  const { push } = useRouter();
  const { handleSearchChange, results } = useTableSearch({
    data,
    keys: ['name'],
    sort: (a, b) => sortData(a, b, 'created_at'),
  });

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleGoToChecklistTree = (id: number) => {
    push(`${RoutesEnum.CHECKLIST}/${id}`);
  };

  return (
    <>
      <STableTitle icon={LibraryAddCheckIcon}>Checklist</STableTitle>
      <STableSearch
        onAddClick={() => onOpenModal(ModalEnum.CHECKLIST_ADD)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable loading={isLoading} columns="minmax(200px, 1fr) 50px  70px 100px">
        <STableHeader>
          <STableHRow>Checklist</STableHRow>
          <STableHRow justifyContent="center"></STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          maxHeight={500}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow text={row.name} />
                <SystemRow system={row.system} />
                <IconButtonRow
                  onClick={() => handleGoToChecklistTree(row.id)}
                  icon={<EditIcon />}
                />
                <StatusSelect
                  large
                  sx={{ maxWidth: '120px', justifyContent: 'flex-start' }}
                  selected={row.status}
                  statusOptions={[
                    StatusEnum.PROGRESS,
                    StatusEnum.ACTIVE,
                    StatusEnum.INACTIVE,
                  ]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalAddChecklist />
    </>
  );
};
