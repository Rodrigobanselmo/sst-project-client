import React, { FC, useMemo } from 'react';

import SText from 'components/atoms/SText';

import TextIconRow from '../TextIconRow';
import { TextHierarchyRowProps } from './types';

export const TextHierarchyRow: FC<
  { children?: any } & TextHierarchyRowProps
> = ({ office, sector, ...props }) => {
  if (!office) return <div />;

  return (
    <TextIconRow
      tooltipTitle={
        <div onClick={(e) => e.stopPropagation()}>
          <SText color="common.white" fontSize={13} mt={1}>
            CARGO: {office.name}
          </SText>
          {sector && (
            <SText color="common.white" fontSize={13} mt={1}>
              SETOR: {sector.name}
            </SText>
          )}
        </div>
      }
      text={office.name ? '' : '-'}
      {...props}
    >
      <div>
        <SText className="table-row-text" fontSize={12} lineNumber={1} mt={2}>
          {office.name}
          <SText
            className="table-row-text"
            fontSize={9}
            ml={2}
            component="span"
          >
            (CARGO)
          </SText>
        </SText>
        {sector && (
          <SText className="table-row-text" fontSize={11} mt={0}>
            {sector.name}
            <SText
              className="table-row-text"
              fontSize={9}
              ml={2}
              component="span"
            >
              (SETOR)
            </SText>
          </SText>
        )}
      </div>
    </TextIconRow>
  );
};
