import { FC, useMemo, useState } from 'react';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { BoxProps } from '@mui/material';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddChecklist } from 'components/modals/ModalAddChecklist';
import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryChecklist } from 'core/services/hooks/queries/useQueryChecklist';

export const ChecklistTable: FC<BoxProps> = () => {
  const { data, isLoading } = useQueryChecklist();
  const { onOpenModal } = useModal();

  const [search, setSearch] = useState<string>('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const fuse = useMemo(() => {
    return new Fuse(data, { keys: ['name'], ignoreLocation: true });
  }, [data]);

  const results = useMemo(() => {
    const fuseResults = fuse.search(search, { limit: 20 });
    return search ? fuseResults.map((result) => result.item) : data;
  }, [data, fuse, search]);

  return (
    <>
      <STableTitle icon={LibraryAddCheckIcon}>Checklist</STableTitle>
      <STableSearch
        onAddClick={() => onOpenModal(ModalEnum.CHECKLIST_ADD)}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable loading={isLoading} columns="repeat(3, minmax(200px, 1fr))">
        <STableHeader>
          <STableHRow>Checklist</STableHRow>
          <STableHRow>Local</STableHRow>
          <STableHRow>IP</STableHRow>
        </STableHeader>
        <STableBody<typeof data[0]>
          rowsData={results}
          maxHeight={500}
          renderRow={(row) => {
            return (
              <STableRow key={row.id}>
                <span>{row.name}</span>
                <span>1----------------1</span>
                <span>1----------------1</span>
              </STableRow>
            );
          }}
        />
      </STable>
      <ModalAddChecklist />
    </>
  );
};
