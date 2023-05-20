import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialProtocolState } from 'components/organisms/modals/ModalAddProtocol/hooks/useEditProtocols';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IProtocol } from 'core/interfaces/api/IProtocol';
import { useQueryProtocols } from 'core/services/hooks/queries/useQueryProtocols/useQueryProtocols';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IProtocolSelectProps } from './types';

export const ProtocolSelect: FC<{ children?: any } & IProtocolSelectProps> = ({
  large,
  handleSelect,
  text,
  multiple = true,
  selected,
  onlyProtocol = false,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQueryProtocols(
    1,
    { search, status: StatusEnum.ACTIVE },
    15,
  );
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleSelectProtocol = (options: IProtocol) => {
    if (onlyProtocol) {
      if (handleSelect) handleSelect(options);
      return;
    }
  };

  const handleEditProtocol = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IProtocol,
  ) => {
    e.stopPropagation();

    if (option?.id)
      onStackOpenModal<Partial<typeof initialProtocolState>>(
        ModalEnum.PROTOCOLS_ADD,
        {
          ...option,
        },
      );
  };

  const handleAddProtocol = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const name = inputSelect?.value || '';

    onStackOpenModal<Partial<typeof initialProtocolState>>(
      ModalEnum.PROTOCOLS_ADD,
      {
        name,
      },
    );
  };

  const onCloseMenu = () => {
    setSearch('');
  };

  const options = useMemo(() => {
    return data.map((protocol) => ({
      ...protocol,
      name: protocol.name,
      value: protocol.id,
    }));
  }, [data]);

  const protocolLength = String(selected ? selected.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={SExamIcon}
      onSearch={(value) => handleSearchChange(value)}
      multiple={multiple}
      additionalButton={handleAddProtocol}
      tooltipTitle={`${protocolLength} protocolos selecionados`}
      text={text ? text : protocolLength === '0' ? '' : protocolLength}
      keys={['name']}
      onClose={onCloseMenu}
      placeholder="pesquisar..."
      large={large}
      handleSelectMenu={handleSelectProtocol}
      selected={selected || []}
      loading={isLoading}
      endAdornment={(options: IProtocol | undefined) => {
        return (
          <STooltip enterDelay={1200} withWrapper title={'editar'}>
            <SIconButton
              onClick={(e) => handleEditProtocol(e, options)}
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
