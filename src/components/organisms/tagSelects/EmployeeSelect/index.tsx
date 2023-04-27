import React, { FC, useRef, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { initialEditEmployeeState } from 'components/organisms/modals/ModalEditEmployee/hooks/useEditEmployee';
import { useSnackbar } from 'notistack';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import SEmployeeIcon from 'assets/icons/SEmployeeIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { useMutDeleteSubOfficeEmployee } from 'core/services/hooks/mutations/manager/useMutDeleteSubOfficeEmployee';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { getCompanyName } from 'core/utils/helpers/companyName';
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
  preload,
  filterByHierarchyId,
  maxPerPage,
  addButton = true,
  queryEmployee,
  editOnSelection,
  searchAllEmployees,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const [reloadOptions, setReloadOptions] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const listSelected = useRef<IEmployee[]>([]);
  const deleteSubOfficeMut = useMutDeleteSubOfficeEmployee();

  const { data, isLoading } = useQueryEmployees(
    1,
    {
      search: search || (preload ? '' : ''),
      ...(filterByHierarchyId && !(searchAllEmployees && search)
        ? { hierarchyId: filterByHierarchyId || undefined }
        : {}),
      ...queryEmployee,
    },
    maxPerPage,
  );

  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleEditEmployee = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IEmployee,
  ) => {
    e.stopPropagation();
    if (option?.id)
      onStackOpenModal<Partial<any>>(ModalEnum.EMPLOYEES_ADD, {
        ...option,
        name: option.name.split(' - ')[0], //! missing hierarchy para passar na edição
        hierarchy: { id: option.hierarchyId, name: 'Editar cargo' } as any,
      });
  };

  const handleSelectEmployee = (options: number[], e: any) => {
    if (editOnSelection && !multiple) {
      handleEditEmployee(e, options as unknown as any);
    }

    if (handleSelect)
      handleSelect(
        options,
        removeDuplicate(listSelected.current, { removeById: 'id' }),
      );
  };

  const handleAddEmployee = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const value = inputSelect?.value || '';
    const name = value.split(' - ')[0].replace(/\D/g, '');
    const cpf = value.replace(/\d/g, '');

    onStackOpenModal<Partial<typeof initialEditEmployeeState>>(
      ModalEnum.EMPLOYEES_ADD,
      {
        name,
        cpf,
        hierarchy: actualHierarchy,
        onCreate: props.handleAddEmployee,
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

    // only for db saved employees cant remove
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

    if (
      !isChecked &&
      employee.hierarchyId ==
        String(actualHierarchy?.parentId)?.split('//')?.[0]
    ) {
      deleteSubOfficeMut.mutate({
        employeeId: employee.id,
        subOfficeId: String(actualHierarchy?.id).split('//')?.[0],
      });
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
      id={IdsEnum.EMPLOYEE_SELECT_ID}
      icon={SEmployeeIcon}
      onClick={() => (listSelected.current = selectedEmployees)}
      onSearch={(value) => handleSearchChange(value)}
      multiple={multiple}
      additionalButton={addButton ? handleAddEmployee : undefined}
      tooltipTitle={`${employeeLength} funcionários selecionados`}
      text={`${text || ''} ${employeeLength === '0' ? '' : employeeLength}`}
      keys={['name', 'email', 'cpf']}
      onClose={onCloseMenu}
      renderContent={(employee) => (
        <>
          <SText color="text.label" fontSize={13}>
            {employee.name}
          </SText>
          {
            <SText color="text.label" fontSize={11}>
              <b style={{ marginRight: 10 }}>{cpfMask.mask(employee.cpf)}</b>
              {employee?.email || ''}
            </SText>
          }
          {employee.company && (
            <SText color="grey.400" fontSize={11}>
              {getCompanyName(employee.company)}
              {employee.company.cnpj}
            </SText>
          )}
        </>
      )}
      placeholder="pesquisar por nome, email ou CPF"
      large={large}
      handleSelectMenu={handleSelectEmployee}
      selected={selectedIds}
      isLoading={isLoading || loading || deleteSubOfficeMut.isLoading}
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
