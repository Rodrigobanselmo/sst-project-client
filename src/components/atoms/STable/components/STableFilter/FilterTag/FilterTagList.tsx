/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import SFlex from 'components/atoms/SFlex';
import { SFlexProps } from 'components/atoms/SFlex/types';

import { FilterFieldEnum } from '../constants/filter.map';
import { IUseFilterTableData } from '../hooks/useFilterTable';
import { FilterTag } from './FilterTag';

export type IFilterTagProps = { filterProps: IUseFilterTableData } & SFlexProps;

export const FilterTagList: FC<IFilterTagProps> = ({
  filterProps,
  ...props
}) => {
  const tagsMemo = React.useMemo(() => {
    const tags = Object.values(filterProps.filter)
      .filter((f) => f.field != FilterFieldEnum.DOWNLOAD_TYPE)
      .flatMap((t) => [...t.filters.map((_t) => ({ ..._t, field: t.field }))]);

    return tags;
  }, [filterProps.filter]);

  return (
    <SFlex {...props} flexWrap={'wrap'}>
      {tagsMemo.map((tag) => {
        return (
          <FilterTag
            key={tag.field}
            onRemove={(tag) => filterProps.removeTagsFilter([tag])}
            tag={tag}
          />
        );
      })}
      {!!tagsMemo.length && (
        <FilterTag
          sx={{
            cursor: 'pointer',
            backgroundColor: 'white',
            borderColor: 'info.main',
          }}
          onClick={() => filterProps.clearFilter()}
          onRemove={() => filterProps.clearFilter()}
          tag={{ filterValue: '', name: 'Limpar Filtro' }}
        />
      )}
    </SFlex>
  );
};
