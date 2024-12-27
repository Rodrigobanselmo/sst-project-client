import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { CommentHeaderMenuHeaderMenu } from '../CommentHeaderMenuHeaderMenu/CommentHeaderMenuHeaderMenu';
import { ICommentHeaderRowrops } from './CommentHeaderRow.types';

export const CommentHeaderRow: FC<ICommentHeaderRowrops> = ({
  orderByMap,
  setOrderBy,
  field,
  isFiltered,
  onClean,
  text,
  onHidden,
  justify,
  filters,
}) => {
  return (
    <STableActionHRow
      isFiltered={isFiltered}
      boxProps={{ justifyContent: justify }}
      direction={field ? orderByMap[field] : undefined}
      menu={({ close }) => (
        <CommentHeaderMenuHeaderMenu
          filters={filters}
          close={close}
          onHidden={onHidden}
          onClean={onClean}
          setOrderBy={
            setOrderBy && field
              ? (direction) =>
                  setOrderBy({
                    field: field,
                    order: direction,
                  })
              : undefined
          }
        />
      )}
    >
      {text}
    </STableActionHRow>
  );
};
