import React, { FC, useMemo } from 'react';
import { useStore } from 'react-redux';

import LockIcon from '@mui/icons-material/Lock';
import { ITreeMap } from 'components/organisms/main/Tree/ChecklistTree/interfaces';

import { IMenuOptionResponse } from '../../../../../../../molecules/SMenu/types';
import { STagSelect } from '../../../../../../../molecules/STagSelect';
import { IBlockedBySelectProps } from './types';

export const BlockedBySelect: FC<
  { children?: any } & IBlockedBySelectProps
> = ({ large, node, ...props }) => {
  const store = useStore<any>();
  const nodeBlockedBySelect = node.blockedBy || [];

  const handleAction = ({ value }: IMenuOptionResponse) => {
    const card = document.getElementById(
      `node_card_${nodeBlockedBySelect.find((i) => i == value)}`,
    );

    if (card) {
      card.className = card.className + ' node_animation';
      setTimeout(() => {
        card?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setTimeout(() => {
        card.className = card.className.replace(' node_animation', '');
      }, 5000);
    }
  };

  const options = useMemo(() => {
    const nodes = store.getState().tree.nodes as ITreeMap;

    const nodeBlockedBySelect = node.blockedBy || [];
    return nodeBlockedBySelect.map((nodeBlockId) => {
      const nodeBlocked = nodes[nodeBlockId];

      const name = `${nodeBlockId} - ${nodeBlocked?.label}` ?? nodeBlockId;

      return {
        value: nodeBlockId,
        name,
      };
    });
  }, [node.blockedBy, store]);

  return (
    <STagSelect
      options={options}
      text={''}
      tooltipTitle={`Card bloqueado por: ${nodeBlockedBySelect.join(' ,')}`}
      large={large}
      iconProps={{ sx: { color: 'common.white' } }}
      sx={{
        backgroundColor: 'error.main',
        '&:hover': { backgroundColor: 'error.dark' },
      }}
      icon={LockIcon}
      handleSelectMenu={handleAction}
      {...props}
    />
  );
};
