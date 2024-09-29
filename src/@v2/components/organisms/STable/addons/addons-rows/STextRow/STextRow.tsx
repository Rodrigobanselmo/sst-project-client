import { FC } from 'react';

import { STextRowProps } from './STextRow.types';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

export const STextRow: FC<STextRowProps> = ({
  tooltipTitle,
  text,
  fontSize = 12,
  lineNumber = 2,
  textProps = {},
  textAlign,
  color,
  justify,
  boxProps,
}) => {
  return (
    <STooltip title={tooltipTitle ?? text} minLength={tooltipTitle ? 0 : 100}>
      <SFlex
        sx={{
          height: '100%',
        }}
        justify={justify}
        className="table-row-box"
        align="center"
        {...boxProps}
      >
        <SText
          textAlign={textAlign}
          fontSize={fontSize}
          lineNumber={lineNumber}
          className="table-row-text"
          color={color}
          {...textProps}
          sx={{ whiteSpace: 'pre-line', ...textProps?.sx }}
        >
          {text}
        </SText>
      </SFlex>
    </STooltip>
  );
};
