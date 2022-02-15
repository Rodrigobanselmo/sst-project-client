import { FC, useMemo, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { BoxProps } from '@mui/material';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import SystemRow from 'components/atoms/STable/components/Rows/SystemRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddChecklist } from 'components/modals/ModalAddChecklist';
import { StatusSelect } from 'components/tagSelects/StatusSelect';
import Fuse from 'fuse.js';
import { useRouter } from 'next/router';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { StatusEnum } from 'core/enums/status.enum';
import { useModal } from 'core/hooks/useModal';
import { useQueryChecklist } from 'core/services/hooks/queries/useQueryChecklist';
import { sortData } from 'core/utils/sorts/data.sort';

export const ChecklistTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryChecklist();

  const { onOpenModal } = useModal();
  const { push } = useRouter();

  const [search, setSearch] = useState<string>('');

  const handleEditStatus = (status: StatusEnum) => {
    console.log(status); // TODO edit checklist status
  };

  const handleGoToChecklistTree = (id: number) => {
    push(`${RoutesEnum.CHECKLIST}/${id}`);
  };

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const fuse = useMemo(() => {
    return new Fuse(data, { keys: ['name'], ignoreLocation: true });
  }, [data]);

  const results = useMemo(() => {
    const fuseResults = fuse.search(search, { limit: 20 });
    return search
      ? fuseResults.map((result) => result.item)
      : data.sort((a, b) => sortData(b, a, 'created_at'));
  }, [data, fuse, search]);

  return (
    <>
      <STableTitle icon={LibraryAddCheckIcon}>Checklist</STableTitle>
      <STableSearch
        onAddClick={() => onOpenModal(ModalEnum.CHECKLIST_ADD)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable loading={isLoading} columns="minmax(200px, 1fr) 100px 100px">
        <STableHeader>
          <STableHRow>Checklist</STableHRow>
          <STableHRow justifyContent="center">Sistema</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          maxHeight={500}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <TextIconRow
                  onClick={() => handleGoToChecklistTree(row.id)}
                  icon={EditIcon}
                  text={row.name}
                />
                <SystemRow system={row.system} />
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
