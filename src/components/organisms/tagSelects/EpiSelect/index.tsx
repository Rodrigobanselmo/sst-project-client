import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddEpiState } from 'components/organisms/modals/ModalAddEpi/hooks/useAddEpi';
import { initialEpiDataState } from 'components/organisms/modals/ModalEditEpiRiskData/hooks/useEditEpis';
import { isNaEpi } from 'project/utils/isNa';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import { SEpiIcon } from 'assets/icons/SEpiIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IEpi } from 'core/interfaces/api/IEpi';
import { useQueryEpis } from 'core/services/hooks/queries/useQueryEpis';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IEpiSelectProps } from './types';

export const EpiSelect: FC<{ children?: any } & IEpiSelectProps> = ({
  large,
  handleSelect,
  text,
  multiple = true,
  selected,
  selectedItems,
  onlyEpi = false,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQueryEpis(0, { ca: search }, 5);
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleSelectEpi = (options: IEpi) => {
    if (onlyEpi || isNaEpi(options?.ca)) {
      if (handleSelect) handleSelect(options);
      return;
    }

    if (options.id)
      onStackOpenModal(ModalEnum.EPI_EPI_DATA, {
        onSubmit: handleSelect,
        ...options,
      } as Partial<typeof initialEpiDataState>);
  };

  const handleEditEpi = (e: MouseEvent<HTMLButtonElement>, option?: IEpi) => {
    e.stopPropagation();

    if (option?.id)
      onStackOpenModal<Partial<typeof initialAddEpiState>>(ModalEnum.EPI_ADD, {
        ca: option?.ca || '',
        description: option?.description || '',
        status: option?.status,
        id: option.id,
      });
  };

  const handleAddEpi = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const name = inputSelect?.value || '';

    onStackOpenModal<Partial<typeof initialAddEpiState>>(ModalEnum.EPI_ADD, {
      ca: name,
    });
  };

  const onCloseMenu = () => {
    setSearch('');
  };

  const options = useMemo(() => {
    const mapEpi = (epi: IEpi) => ({
      name: (!isNaEpi(epi.ca) ? epi.ca + ' ' : '') + epi.equipment,
      value: epi.id,
      ...epi,
    });
    const query = search.trim().toLowerCase();
    const queried = data.map(mapEpi);
    const pinned = (selectedItems ?? [])
      .filter((epi) => !!epi?.id)
      .filter((epi) => {
        if (!query) return true;
        const ca = String(epi.ca || '').toLowerCase();
        const equipment = String(epi.equipment || '').toLowerCase();
        return ca.includes(query) || equipment.includes(query);
      })
      .map(mapEpi);
    if (!pinned.length) return queried;
    const seen = new Set<string>();
    const merged: typeof queried = [];
    for (const item of [...pinned, ...queried]) {
      const id = String(item.id ?? item.value ?? '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(item);
    }
    return merged;
  }, [data, search, selectedItems]);

  const epiLength = String(selected ? selected.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={SEpiIcon}
      onSearch={(value) => handleSearchChange(value)}
      multiple={multiple}
      additionalButton={handleAddEpi}
      tooltipTitle={`${epiLength} epis selecionados`}
      text={text ? text : epiLength === '0' ? '' : epiLength}
      keys={['ca']}
      onClose={onCloseMenu}
      placeholder="pesquisar por CA"
      large={large}
      handleSelectMenu={handleSelectEpi}
      selected={selected || []}
      loading={isLoading}
      endAdornment={(options: IEpi | undefined) => {
        return (
          <STooltip enterDelay={1200} withWrapper title={'editar'}>
            <SIconButton
              onClick={(e) => handleEditEpi(e, options)}
              sx={{ width: '2rem', height: '2rem' }}
            >
              <Icon
                sx={{ color: 'text.light', fontSize: '18px' }}
                component={EditIcon}
              />
            </SIconButton>
          </STooltip>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};
