import { FC } from 'react';

import { STextRowProps } from './STextRow.types';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { Box } from '@mui/material';

export const STextRow: FC<STextRowProps> = ({
  tooltipTitle,
  text,
  bottomText,
  tooltipMinLength,
  bottomTextProps,
  fontSize = 12,
  lineNumber = 2,
  textProps = {},
  textAlign,
  color,
  justify,
  boxProps,
  startAddon,
}) => {
  return (
    <STooltip
      title={tooltipTitle ?? text}
      placement="right"
      minLength={tooltipTitle ? 0 : tooltipMinLength || 50}
    >
      <SFlex align="center" gap={4} justify={justify}>
        {startAddon}
        <SFlex
          sx={{
            height: '100%',
          }}
          justify={'center'}
          className="table-row-box"
          align={justify}
          flexDirection={'column'}
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
          <SText
            textAlign={textAlign}
            fontSize={10}
            lineNumber={1}
            color={'text.light'}
            mt={-2}
            {...bottomTextProps}
            sx={{ whiteSpace: 'pre-line', ...bottomTextProps?.sx }}
          >
            {bottomText}
          </SText>
        </SFlex>
      </SFlex>
    </STooltip>
  );
};
