/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useRef, useEffect } from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { setHierarchySearch } from 'store/reducers/hierarchy/hierarchySlice';
import { useDebouncedCallback } from 'use-debounce';

import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';

import { STSInput } from './styles';
import { GhoHeaderProps } from './types';

export const HierarchyFilter: FC<GhoHeaderProps> = () => {
  const dispatch = useAppDispatch();
  const { onOpenModal } = useModal();
  const ref = useRef<HTMLInputElement>();
  const search = useAppSelector((s) => s.hierarchy.search);
  const { searchFilterNodes } = useHierarchyTreeActions();

  useEffect(() => {
    if (ref.current) {
      if (search) ref.current.value = search;
      else ref.current.value = '';
    }
  }, [search]);

  const handleSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 1000);

  const onSearch = (value: string) => {
    searchFilterNodes(value);
    dispatch(setHierarchySearch(value));
  };
  const handleOpenHierarchyModal = () => {
    onOpenModal(ModalEnum.HIERARCHIES_EXCEL_ADD);
  };

  return (
    <SFlex align="center" gap={4} ml={13} mt={10}>
      <STSInput
        size="small"
        inputRef={ref}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={'Pesquisar no organograma...'}
        subVariant="search"
        fullWidth
      />
      <STagButton
        large
        tooltipTitle="Importar e exportar o organograma da empresa por planilhas"
        icon={SUploadIcon}
        onClick={handleOpenHierarchyModal}
      />
    </SFlex>
  );
};
