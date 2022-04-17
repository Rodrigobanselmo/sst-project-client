import React, { FC, useMemo, MouseEvent } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialAddGenerateSourceState } from 'components/modals/ModalAddGenerateSource/hooks/useAddGenerateSource';

import EditIcon from 'assets/icons/SEditIcon';
import SGenerateSource from 'assets/icons/SGenerateSource';

import { ModalEnum } from 'core/enums/modal.enums';
import { useChecklistTreeActions } from 'core/hooks/useChecklistTreeActions';
import { useModal } from 'core/hooks/useModal';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk';

import { STagSearchSelect } from '../../../../../../molecules/STagSearchSelect';
import { IGenerateSourceSelectProps } from './types';

export const GenerateSourceSelect: FC<IGenerateSourceSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRisk();
  const { getAllParentRisksById } = useChecklistTreeActions();
  const { onOpenModal } = useModal();

  const handleSelectGenerateSource = (options: string[]) => {
    if (handleSelect) handleSelect(options);
  };

  const handleEditGenerateSource = (
    e: MouseEvent<HTMLButtonElement>,
    option?: IGenerateSource,
  ) => {
    e.stopPropagation();
    const nodeRisks = node.risks || [];
    const risk = data.find((r) => r.id === option?.riskId);

    if (risk)
      onOpenModal<Partial<typeof initialAddGenerateSourceState>>(
        ModalEnum.GENERATE_SOURCE_ADD,
        {
          riskIds: [...nodeRisks, ...getAllParentRisksById(node.id)],
          edit: true,
          risk,
          name: option?.name || '',
          status: option?.status,
          id: option?.id,
        },
      );
  };

  const handleAddGenerateSource = () => {
    const nodeRisks = node.risks || [];

    onOpenModal<Partial<typeof initialAddGenerateSourceState>>(
      ModalEnum.GENERATE_SOURCE_ADD,
      {
        riskIds: [...nodeRisks, ...getAllParentRisksById(node.id)],
      },
    );
  };

  const options = useMemo(() => {
    const nodeRisks = node.risks || [];
    const allRisksIds = [...nodeRisks, ...getAllParentRisksById(node.id)].map(
      (id) => String(id),
    );

    if (data)
      return data
        .reduce((acc, risk) => {
          const generateSource = risk.generateSource || [];
          return [...acc, ...generateSource];
        }, [] as IGenerateSource[])
        .map((generateSource) => {
          return {
            ...generateSource,
            hideWithoutSearch: !allRisksIds.includes(
              String(generateSource.riskId),
            ),
          };
        });

    return [];
  }, [data, getAllParentRisksById, node.id, node.risks]);

  const generateSourceLength = String(
    node.generateSource ? node.generateSource.length : 0,
  );

  return (
    <STagSearchSelect
      options={options}
      icon={SGenerateSource}
      multiple
      additionalButton={handleAddGenerateSource}
      tooltipTitle={`${generateSourceLength} fontes geradas`}
      text={generateSourceLength === '0' ? '' : generateSourceLength}
      keys={['name']}
      large={large}
      handleSelectMenu={handleSelectGenerateSource}
      selected={node?.generateSource ?? []}
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
