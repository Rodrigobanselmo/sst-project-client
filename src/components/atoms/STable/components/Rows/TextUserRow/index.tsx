import React, { FC, useMemo } from 'react';

import SText from 'components/atoms/SText';

import TextIconRow from '../TextIconRow';
import { TextUserRowProps } from './types';

const TextUserRow: FC<TextUserRowProps> = ({ user, ...props }) => {
  if (!user?.name || !user?.email) return <div />;

  return (
    <TextIconRow
      clickable
      tooltipTitle={
        <div onClick={(e) => e.stopPropagation()}>
          <SText color="common.white" lineNumber={1} fontSize={12}>
            {user.name}
          </SText>
          <SText color="common.white" lineNumber={1} fontSize={12}>
            {user.email}
          </SText>
        </div>
      }
      text={
        user?.name ? (
          <div onClick={(e) => e.stopPropagation()}>
            <SText className="table-row-text" lineNumber={1} fontSize={12}>
              {user.name}
            </SText>
            <SText className="table-row-text" lineNumber={1} fontSize={12}>
              {user.email}
            </SText>
          </div>
        ) : (
          '-'
        )
      }
      {...props}
    />
  );
};

export default TextUserRow;
