import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Typography,
} from '@mui/material';
import React from 'react';

import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { IconContainer, SAccordionTextWrapper } from './SAccordion.styles';

export interface SAccordionProps {
  icon?: React.ReactNode;
  color?: string;
  fontWeight?: string;
  endComponent?: React.ReactNode;
  title: JSX.Element | string;
  subtitle?: JSX.Element | string;
  withDivider?: boolean;
  children?: React.ReactNode;
  accordionProps?: AccordionProps;
  expanded?: AccordionProps['expanded'];
  defaultExpanded?: AccordionProps['defaultExpanded'];
  onChange?: AccordionProps['onChange'];
  expandIcon?: React.ReactNode;
}

export const SAccordion = ({
  icon,
  color,
  fontWeight,
  endComponent,
  title,
  subtitle,
  children,
  withDivider = false,
  expandIcon = <ExpandMoreIcon />,
  ...rest
}: SAccordionProps) => {
  return (
    <Accordion {...rest}>
      <AccordionSummary expandIcon={expandIcon}>
        {icon && <IconContainer>{icon}</IconContainer>}
        <SAccordionTextWrapper>
          {typeof title === 'string' ? (
            <Typography fontWeight={fontWeight} color={color} variant="h5">
              {title}
            </Typography>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <Typography variant="body2" color="var(--mui-palette-grey-600)">
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )}
        </SAccordionTextWrapper>
        {endComponent}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0, pt: 1 }}>
        <>
          {withDivider && <SDivider sx={{ mb: 2 }} />}
          {children}
        </>
      </AccordionDetails>
    </Accordion>
  );
};
