import { FC } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { STextRowProps } from './STextRow.types';

export const STextRow: FC<STextRowProps> = ({
  tooltipTitle,
  text,
  bottomText,
  tooltipMinLength = 30,
  bottomTextProps,
  containerProps,
  tooltipProps,
  fontSize = 12,
  lineNumber = 2,
  textProps = {},
  textAlign,
  color,
  justify,
  boxProps,
  startAddon,
}) => {
  const oneLine = lineNumber === 1;
  return (
    <STooltip
      title={tooltipTitle ?? text}
      placement="right"
      minLength={tooltipMinLength || 30}
      {...tooltipProps}
    >
      <SFlex align="center" gap={4} justify={justify} {...containerProps}>
        {startAddon}
        <SFlex
          justify={'center'}
          className="table-row-box"
          align={justify}
          overflow="hidden"
          height={'100%'}
          flexDirection={'column'}
          {...boxProps}
        >
          <SText
            textAlign={textAlign}
            fontSize={fontSize}
            lineNumber={oneLine ? undefined : lineNumber}
            className="table-row-text"
            noBreak={oneLine}
            color={color}
            {...textProps}
            sx={{
              whiteSpace: oneLine ? 'nowrap' : 'pre-line',
              ...textProps?.sx,
            }}
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
