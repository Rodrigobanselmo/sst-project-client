/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { InputForm } from 'components/molecules/form/input';
import { SDisplaySimpleArray } from 'components/molecules/SDisplaySimpleArray';
import { SModalButtons } from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import AnimatedStep from 'components/organisms/main/Wizard/components/AnimatedStep/AnimatedStep';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import { HierarchySelect } from 'components/organisms/tagSelects/HierarchySelect ';
import dayjs from 'dayjs';

import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { cpfMask } from 'core/utils/masks/cpf.mask';
import { dateMask } from 'core/utils/masks/date.mask';

import { IUseAutomateSubOffice } from '../../hooks/useHandleActions';
import { useHierarchyStep } from './hooks/useHierarchyStep';

export const HierarchyModalStep = (props: IUseAutomateSubOffice) => {
  const { onSubmit, onCloseUnsaved } = useHierarchyStep(props);

  const { data, setData, companyId, onAddArray, onDeleteArray } = props;
  const buttons = [
    {},
    {
      text: 'Confirmar Dados',
      variant: 'contained',
      onClick: () => onSubmit(),
      disabled: !(data.selectedEmployees.length > 0),
    },
  ] as IModalButton[];

  return (
    <div>
      <AnimatedStep>
        <SFlex gap={8} direction="column" mt={8}>
          <SText fontSize="14px" color="text.light">
            Selecione o cargo que deseja adicionar riscos <br />
            personalizados por empregado
          </SText>

          <HierarchySelect
            filterOptions={[HierarchyEnum.OFFICE]}
            maxWidth="100%"
            large
            tooltipText={() => (
              <p>
                Selecione o cargo dos empregados que deseja adicionar os riscos
              </p>
            )}
            text="Selecionar Cargo"
            icon={SHierarchyIcon}
            handleSelect={(hierarchy: IHierarchy) =>
              setData((old) => ({
                ...old,
                selectedEmployees: [],
                hierarchy: hierarchy,
                hierarchyId: hierarchy.id,
              }))
            }
            companyId={companyId}
            active={!!data.hierarchyId}
            selectedId={data.hierarchyId}
          />

          {data.hierarchyId && (
            <SDisplaySimpleArray
              disabled={!data.hierarchyId}
              values={data.selectedEmployees || []}
              onAdd={(_, v) => onAddArray(v)}
              onDelete={(_, v) => onDeleteArray(v)}
              label={'Empregados'}
              valueField="name"
              renderText={(employee: IEmployee) => (
                <SFlex px={5} width="100%">
                  <SText width="100%" fontSize={14} color={'grey.600'}>
                    {employee.name.split(' - ')[0]}
                  </SText>
                  <SText
                    fontSize={14}
                    pr={'auto'}
                    minWidth="fit-content"
                    color={'grey.600'}
                  >
                    <b style={{ fontSize: 12 }}>CPF:</b>{' '}
                  </SText>
                  <SText
                    fontSize={14}
                    pr={'auto'}
                    minWidth="110px"
                    color={'grey.600'}
                  >
                    {cpfMask.mask(employee.cpf)}
                  </SText>
                </SFlex>
              )}
              buttonLabel={'Adicionar Empregados'}
              onRenderAddButton={(onAdd, values, props) => (
                <EmployeeSelect
                  preload
                  maxWidth="100%"
                  maxPerPage={30}
                  filterByHierarchyId={data.hierarchyId}
                  handleSelect={(_, list) =>
                    setData((old) => ({ ...old, selectedEmployees: list }))
                  }
                  selectedEmployees={values}
                  {...props}
                />
              )}
            />
          )}
        </SFlex>
      </AnimatedStep>
      <SModalButtons onClose={onCloseUnsaved} buttons={buttons} />
    </div>
  );
};
