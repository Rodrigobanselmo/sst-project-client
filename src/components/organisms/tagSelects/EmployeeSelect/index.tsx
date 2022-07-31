import React, { FC, useRef, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialEmployeeState } from 'components/organisms/modals/ModalAddEmployees/hooks/useEditEmployees';
import { useSnackbar } from 'notistack';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import SEmployeeIcon from 'assets/icons/SEmployeeIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IEmployeeSelectProps } from './types';

export const EmployeeSelect: FC<IEmployeeSelectProps> = ({
  large,
  handleSelect,
  text,
  multiple = true,
  selected,
  selectedEmployees = [],
  handleMultiSelect,
  loading,
  actualHierarchy,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const [reloadOptions, setReloadOptions] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const listSelected = useRef<IEmployee[]>([]);
  const { data, isLoading } = useQueryEmployees(
    1,
    { search: search || null },
    12,
  );

  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleSelectEmployee = (options: number[]) => {
    if (handleSelect)
      handleSelect(
        options,
        removeDuplicate(listSelected.current, { removeById: 'id' }),
      );
  };

  const handleEditEmployee = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IEmployee,
  ) => {
    e.stopPropagation();
    if (option?.id)
      onStackOpenModal<Partial<typeof initialEmployeeState>>(
        ModalEnum.EMPLOYEES_ADD,
        {
          ...option,
          name: option.name.split(' - ')[0], //! missing hierarchy para passar na edição
          hierarchy: { id: option.hierarchyId, name: 'Editar cargo' } as any,
        },
      );
  };

  const handleAddEmployee = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const value = inputSelect?.value || '';
    const name = value.split(' - ')[0].replace(/\D/g, '');
    const cpf = value.replace(/\d/g, '');

    onStackOpenModal<Partial<typeof initialEmployeeState>>(
      ModalEnum.EMPLOYEES_ADD,
      {
        name,
        cpf,
        hierarchy: actualHierarchy,
      },
    );
  };

  const onCloseMenu = () => {
    setSearch('');
    listSelected.current = [];
    setReloadOptions(reloadOptions + 1);
  };

  const handleMultiSelectMenu = (
    employee: IEmployee,
    list: (number | string)[],
  ) => {
    let newList = [...listSelected.current];
    const isChecked = list.includes(employee.id);
    const actualHierarchyId = (String(actualHierarchy?.id) || '').split(
      '//',
    )[0];
    if (isChecked) newList.push(employee);
    if (!isChecked && employee.hierarchyId != actualHierarchyId)
      newList = newList.filter((e) => e.id != employee.id);
    if (!isChecked && employee.hierarchyId == actualHierarchyId) {
      const check = document.getElementById(
        IdsEnum.MENU_ITEM_CHECKBOX_ID.replace(':id', String(employee.id)),
      ) as HTMLInputElement;
      setTimeout(() => {
        if (check) check.click();
      }, 100);

      return enqueueSnackbar(
        'Você não pode remover um empregado, clique em editar ao lado caso queira trocar seu cargo',
        { variant: 'error' },
      );
    }

    listSelected.current = removeDuplicate(newList, { removeById: 'id' });
    handleMultiSelect?.(employee);
  };

  const options = useMemo(() => {
    return removeDuplicate(
      [...listSelected.current, ...selectedEmployees, ...data],
      {
        removeById: 'id',
      },
    ).map((employee) => ({
      ...employee,
      name: employee.name + ' - ' + cpfMask.mask(employee.cpf),
      value: employee.id,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedEmployees, reloadOptions]);

  const selectedIds = useMemo(() => {
    return [
      ...[...listSelected.current, ...selectedEmployees].map((i) => i.id),
      ...(selected || []),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployees, selected, reloadOptions]);

  const employeeLength = String(
    selected
      ? [...selectedEmployees, ...selected].length
      : selectedEmployees.length,
  );

  return (
    <STagSearchSelect
      options={options}
      icon={SEmployeeIcon}
      onClick={() => (listSelected.current = selectedEmployees)}
      onSearch={(value) => handleSearchChange(value)}
      multiple={multiple}
      additionalButton={handleAddEmployee}
      tooltipTitle={`${employeeLength} empregados selecionados`}
      text={`${text || ''} ${employeeLength === '0' ? '' : employeeLength}`}
      keys={['name', 'cpf']}
      onClose={onCloseMenu}
      placeholder="pesquisar por nome ou CPF"
      large={large}
      handleSelectMenu={handleSelectEmployee}
      selected={selectedIds}
      isLoading={isLoading || loading}
      handleMultiSelectMenu={handleMultiSelectMenu}
      endAdornment={(options: IEmployee | undefined) => {
        return (
          <STooltip enterDelay={1200} withWrapper title={'editar'}>
            <SIconButton
              onClick={(e) => handleEditEmployee(e, options)}
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
