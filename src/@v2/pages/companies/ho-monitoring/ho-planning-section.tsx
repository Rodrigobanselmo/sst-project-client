import { PropsWithChildren } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
export function HoPlanningSection({
  title,
  children,
  defaultExpanded = true,
}: PropsWithChildren<{ title: string; defaultExpanded?: boolean }>) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      variant="outlined"
      disableGutters
      sx={{ '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ChevronRightIcon />}
        sx={{
          flexDirection: 'row-reverse',
          gap: 4,
          px: 10,
          '& .MuiAccordionSummary-expandIconWrapper': {
            transform: 'rotate(0deg)',
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(90deg)',
          },
        }}
      >
        <Typography
          component="h3"
          sx={{ fontSize: { xs: '17px', md: '20px' }, fontWeight: 700 }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 10, pt: 4 }}>{children}</AccordionDetails>
    </Accordion>
  );
}
