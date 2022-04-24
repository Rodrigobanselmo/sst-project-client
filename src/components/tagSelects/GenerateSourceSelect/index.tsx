import React, { FC, MouseEvent, useMemo } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddGenerateSourceState } from 'components/modals/ModalAddGenerateSource/hooks/useAddGenerateSource';

import EditIcon from 'assets/icons/SEditIcon';
import SGenerateSource from 'assets/icons/SGenerateSource';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { STagSearchSelect } from '../../molecules/STagSearchSelect';
import { IGenerateSourceSelectProps } from './types';

export const GenerateSourceSelect: FC<IGenerateSourceSelectProps> = ({
  large,
  handleSelect,
  riskIds,
  selectedGS,
  text,
  multiple = true,
  risk,
  ...props
}) => {
  const { data } = useQueryRisk();
  const { onOpenModal } = useModal();

  const handleSelectGenerateSource = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleEditGenerateSource = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IGenerateSource,
  ) => {
    e.stopPropagation();
    const risk = data.find((r) => r.id === option?.riskId);

    if (risk)
      onOpenModal<Partial<typeof initialAddGenerateSourceState>>(
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
    const passModalData = {
      riskIds: riskIds,
    } as Partial<typeof initialAddGenerateSourceState>;

    if (risk) passModalData.risk = risk;

    onOpenModal<Partial<typeof initialAddGenerateSourceState>>(
      ModalEnum.GENERATE_SOURCE_ADD,
      passModalData,
    );
  };

  const options = useMemo(() => {
    const allRisksIds = riskIds.map((id) => String(id));

    [...allRisksIds].map((riskId) => {
      const riskFound = data.find((r) => r.id == riskId);
      if (riskFound) {
        const riskFoundAll = data.find(
          (r) => r.type === riskFound.type && r.representAll,
        );
        if (riskFoundAll) allRisksIds.push(String(riskFoundAll.id));
      }
    });

    const allRisksIdsUnique = removeDuplicate(allRisksIds, {
      simpleCompare: true,
    });

    if (data)
      return data
        .reduce((acc, risk) => {
          const generateSource = risk.generateSource || [];
          return [...acc, ...generateSource];
        }, [] as IGenerateSource[])
        .map((generateSource) => {
          return {
            ...generateSource,
            hideWithoutSearch: !allRisksIdsUnique.includes(
              String(generateSource.riskId),
            ),
          };
        });

    return [];
  }, [data, riskIds]);

  const generateSourceLength = String(selectedGS ? selectedGS.length : 0);

  return (
    <STagSearchSelect
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
