import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddEpiState } from 'components/organisms/modals/ModalAddEpi/hooks/useAddEpi';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import { SEpiIcon } from 'assets/icons/SEpiIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IEpi } from 'core/interfaces/api/IEpi';
import { useQueryEpis } from 'core/services/hooks/queries/useQueryEpis';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IEpiSelectProps } from './types';

export const EpiSelect: FC<IEpiSelectProps> = ({
  large,
  handleSelect,
  text,
  multiple = true,
  selected,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { data } = useQueryEpis(0, { ca: search }, 5);
  const { onOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleSelectEpi = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleEditEpi = (e: MouseEvent<HTMLButtonElement>, option?: IEpi) => {
    e.stopPropagation();

    if (option?.id)
      onOpenModal<Partial<typeof initialAddEpiState>>(ModalEnum.EPI_ADD, {
        ca: option?.ca || '',
        description: option?.description || '',
        status: option?.status,
        id: option.id,
      });
  };

  const handleAddEpi = () => {
    onOpenModal<Partial<typeof initialAddEpiState>>(ModalEnum.EPI_ADD);
  };

  const onCloseMenu = () => {
    setSearch('');
  };

  const options = useMemo(() => {
    const isNa = (ca: string) => ['1', '2', '0'].includes(ca);

    return data.map((epi) => ({
      name: (!isNa(epi.ca) ? epi.ca + ' ' : '') + epi.equipment,
      value: epi.id,
      ...epi,
    }));
  }, [data]);

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
