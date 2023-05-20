import React, { FC, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import SText from 'components/atoms/SText';
import { initialReportState } from 'components/organisms/modals/ModalReport/ModalReport';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useModal } from 'core/hooks/useModal';

import { IReportJson, reports } from './report.constants';
import { IReportAccordionProps } from './types';

export const ReportAccordion: FC<
  { children?: any } & IReportAccordionProps
> = ({ ...props }) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();
  const { isValidRoles, isValidPermissions, isToRemoveWithRoles } = useAccess();
  const filterProps = useFilterTable();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const onSelectReport = (report: IReportJson['reports'][0]) => {
    onStackOpenModal(ModalEnum.MODAL_REPORT, {
      subtitle: report.name,
      report,
    } as Partial<typeof initialReportState>);
  };

  return (
    <div>
      {reports.map((group) => {
        if (!isValidRoles(group?.roles)) return null;
        if (!isValidPermissions(group?.permissions)) return null;

        return (
          <Accordion
            key={group.name}
            sx={{ px: 6 }}
            expanded={expanded === group.name}
            onChange={handleChange(group.name)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-content-${group.name}`}
              id={`panel-content-${group.name}`}
            >
              <SText>{group.name}</SText>
            </AccordionSummary>
            <AccordionDetails sx={{ mt: -2 }}>
              {group.reports.map((report) => {
                if (!isValidRoles(report?.roles)) return null;
                if (!isValidPermissions(report?.permissions)) return null;

                return (
                  <SFlex
                    key={report.name}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'grey.50',
                      '&:hover': {
                        filter: 'brightness(0.95)',
                        '> p': {
                          textDecoration: 'underline',
                        },
                      },
                    }}
                    mb={3}
                    px={8}
                    border={'1px solid'}
                    borderColor={'grey.400'}
                    borderRadius={1}
                    onClick={() => onSelectReport(report)}
                  >
                    <SText fontSize={14} color={'text.light'}>
                      {report.name}
                    </SText>
                  </SFlex>
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};
