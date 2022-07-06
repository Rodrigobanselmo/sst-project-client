import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { SSelectButton } from 'components/molecules/SSelectButton';
import { setModalIds } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

interface IItem extends BoxProps {}

export const ModalListGHO: FC<IItem> = () => {
  const { data: ghoQuery } = useQueryGHO();
  const selected = useAppSelector((state) => state.hierarchy.modalSelectIds);
  const dispatch = useAppDispatch();

  return (
    <>
      {ghoQuery.map((gho) => {
        if (gho.type) return null;
        return (
          <SSelectButton
            onClick={() =>
              dispatch(
                setModalIds(
                  removeDuplicate(
                    [
                      ...(gho.hierarchies || []).map(
                        (hierarchy) =>
                          hierarchy.id + '//' + hierarchy.workspaceId,
                      ),
                      ...selected,
                    ],
                    { simpleCompare: true },
                  ),
                ),
              )
            }
            active={(gho.hierarchies || []).some((h) =>
              selected.includes(h.id + '//' + h.workspaceId),
            )}
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
