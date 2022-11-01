import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SSelectButton } from 'components/molecules/SSelectButton';
import { SSelectList } from 'components/molecules/SSelectList';
import { setModalIds } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IGho } from 'core/interfaces/api/IGho';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

interface IItem extends BoxProps {
  ghoQuery: IGho[];
}

export const ModalListGHO: FC<IItem> = ({ ghoQuery }) => {
  const selected = useAppSelector((state) => state.hierarchy.modalSelectIds);
  const dispatch = useAppDispatch();
  return (
    <>
      {ghoQuery.map((gho) => {
        if (gho.type) return null;

        const isActive = (gho.hierarchies || []).every((h) =>
          selected.includes(h.id + '//' + h.workspaceId),
        );

        return (
          <SSelectList
            onClick={() => {
              const ghoHierarchy = (gho.hierarchies || []).map(
                (hierarchy) => hierarchy.id + '//' + hierarchy.workspaceId,
              );

              const actualActives = ghoQuery
                .filter((_gho) => {
                  if (_gho.type) return null;
                  if (_gho.id == gho.id) return false;

                  const active = (_gho.hierarchies || []).every((h) =>
                    selected.includes(h.id + '//' + h.workspaceId),
                  );
                  return active;
                })
                .reduce((acc, gho) => {
                  const ghoHierarchy = (gho.hierarchies || []).map(
                    (hierarchy) => hierarchy.id + '//' + hierarchy.workspaceId,
                  );

                  acc = [...acc, ...ghoHierarchy];
                  return acc;
                }, [] as string[]);

              const newIds = isActive
                ? selected.filter((id) => !ghoHierarchy.includes(id))
                : [...ghoHierarchy, ...selected];

              dispatch(
                setModalIds(
                  removeDuplicate([...newIds, ...actualActives], {
                    simpleCompare: true,
                  }),
                ),
              );
            }}
            active={isActive}
            key={gho.id}
            tooltipText={gho.name}
            text={gho.name}
            label={'GSE'}
          />
        );
      })}
    </>
  );
};
