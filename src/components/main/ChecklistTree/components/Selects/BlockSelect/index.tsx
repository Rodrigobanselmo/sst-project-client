import React, { FC, useCallback, useMemo, useState } from 'react';
import { useStore } from 'react-redux';

import KeyIcon from '@mui/icons-material/Key';
import SFlex from 'components/atoms/SFlex';
import { nodeTypesConstant } from 'components/main/ChecklistTree/constants/node-type.constant';
import {
  ITreeMap,
  ITreeMapObject,
} from 'components/main/ChecklistTree/interfaces';
import { SMenuSimpleFilter } from 'components/molecules/SMenuSearch/SMenuSimpleFilter';

import { useTreeActions } from 'core/hooks/useTreeActions';

import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { blockFilter } from './constants/filters';
import { ITypeSelectProps } from './types';

export const BlockSelect: FC<ITypeSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { getHigherLevelNodes, setBlockNode } = useTreeActions();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const store = useStore();

  const handleSelectBlock = (options: string[]) => {
    if (handleSelect) handleSelect(options);
    else {
      setBlockNode({ id: node.id, block: options });
    }
  };

  const blockLength = String(node?.block ? node.block.length : 0);

  const handleActiveBlock = useCallback(
    (filter: string) => {
      if (activeFilters.includes(filter))
        return setActiveFilters(
          activeFilters.filter((type) => type !== filter),
        );

      return setActiveFilters([...activeFilters, filter]);
    },
    [activeFilters, setActiveFilters],
  );

  const options = useMemo(() => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    const nodeId = node.id;

    const higherIds = getHigherLevelNodes(nodeId);

    return Object.values(nodesMap).filter(
      (fNode) => !higherIds.includes(fNode.id) && fNode.id !== nodeId,
    );
  }, [getHigherLevelNodes, node.id, store]);

  return (
    <STagSearchSelect
      options={options}
      icon={KeyIcon}
      multiple
      text={blockLength === '0' ? '' : blockLength}
      keys={['label', 'id']}
      large={large}
      handleSelectMenu={handleSelectBlock}
      selected={node?.block ?? []}
      tooltipTitle={
        'Essa opção manterá outro card bloqueado e servirá como chave para desbloquea-lo, ou seja, o outro card só estará visivel caso esta opção seja selecionada.'
      }
      optionsFieldName={{ valueField: 'id', contentField: 'label' }}
      renderFilter={() => (
        <SMenuSimpleFilter
          options={blockFilter}
          activeFilters={activeFilters}
          onClickFilter={handleActiveBlock}
        />
      )}
      startAdornment={(options: ITreeMapObject | undefined) => {
        if (!options) return null;
        return (
          <SFlex
            justify="center"
            sx={{
              backgroundColor: `tree.card.${
                nodeTypesConstant[options.type].color
              }`,
              mr: 6,
              fontSize: '0.8rem',
              p: '1px 1px',
              width: '70px',
              color: 'common.white',
              borderRadius: 4,
            }}
          >
            {options.id}
          </SFlex>
        );
      }}
      {...props}
    />
  );
};
