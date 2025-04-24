import { FC } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { STagRowProps } from './STagRow.types';

export const STagRow: FC<STagRowProps> = ({
  tooltipTitle,
  text,
  bottomText,
  tooltipMinLength,
  bottomTextProps,
  fontSize = 12,
  lineNumber = 2,
  textProps = {},
  textAlign,
  color = 'text.label',
  border = '1px solid',
  borderColor = 'grey.400',
  backgroundColor = 'grey.100',
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
      <SFlex
        align="center"
        gap={4}
        justify={justify}
        bgcolor={backgroundColor}
        border={border}
        borderColor={borderColor}
        justifyContent={'center'}
        px={4}
        borderRadius={1}
        py={1}
      >
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
