import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddGenerateSourceState } from 'components/organisms/modals/ModalAddGenerateSource/hooks/useAddGenerateSource';
import { RiskEnum } from 'project/enum/risk.enums';
import sortArray from 'sort-array';

import EditIcon from 'assets/icons/SEditIcon';
import SGenerateSource from 'assets/icons/SGenerateSource';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';
import { useQueryGenerateSource } from 'core/services/hooks/queries/useQueryGenerateSource/useQueryGenerateSource';
import { useQueryAllRisk } from 'core/services/hooks/queries/useQueryRiskAll';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { sortString } from 'core/utils/sorts/string.sort';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IGenerateSourceSelectProps } from './types';

export const GenerateSourceSelect: FC<
  { children?: any } & IGenerateSourceSelectProps
> = ({
  large,
  handleSelect,
  riskIds,
  selectedGS,
  text,
  multiple = true,
  risk,
  onlyFromActualRisks,
  onCreate = () => {},
  ...props
}) => {
  const riskIdsArray = [...(riskIds.map((rId) => String(rId)) || [])];
  if (risk) riskIdsArray.push(risk.id);

  const [disabled, isDisabled] = useState(true);

  const { data } = useQueryGenerateSource(
    1,
    {
      riskIds: riskIdsArray,
      riskType: risk?.type,
    },
    300,
    disabled,
  );

  const { onStackOpenModal } = useModal();

  const handleSelectGenerateSource = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleEditGenerateSource = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IGenerateSource,
  ) => {
    e.stopPropagation();

    onStackOpenModal<Partial<typeof initialAddGenerateSourceState>>(
      ModalEnum.GENERATE_SOURCE_ADD,
      {
        riskIds: riskIds,
        edit: true,
        risk,
        name: option?.name || '',
        status: option?.status,
        id: option?.id,
      },
    );
  };

  const handleAddGenerateSource = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const name = inputSelect?.value || '';

    const passModalData = {
      riskIds: riskIds,
      onCreate,
      name,
    } as Partial<typeof initialAddGenerateSourceState>;

    if (risk) passModalData.risk = risk;

    onStackOpenModal<Partial<typeof initialAddGenerateSourceState>>(
      ModalEnum.GENERATE_SOURCE_ADD,
      passModalData,
    );
  };

  const options = useMemo(() => {
    const dataList = data;

    return sortArray(dataList, {
      by: ['all', 'name'],
      order: ['desc', 'asc'],
      computed: {
        all: (v) => !v.isAll,
      },
    });
  }, [data]);
  const generateSourceLength = String(selectedGS ? selectedGS.length : 0);

  return (
    <STagSearchSelect
      onClick={() => isDisabled(false)}
      options={options}
      icon={SGenerateSource}
      multiple={multiple}
      additionalButton={handleAddGenerateSource}
      tooltipTitle={`${generateSourceLength} fontes geradas`}
      text={
        text ? text : generateSourceLength === '0' ? '' : generateSourceLength
      }
      keys={['name']}
      large={large}
      handleSelectMenu={handleSelectGenerateSource}
      selected={selectedGS || []}
      endAdornment={(options: IGenerateSource | undefined) => {
        return (
          <STooltip enterDelay={1200} withWrapper title={'editar'}>
            <SIconButton
              onClick={(e) => handleEditGenerateSource(e, options)}
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
