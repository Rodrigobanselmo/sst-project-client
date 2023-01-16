import React, { FC, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  clinicFilterList,
  FilterFieldEnum,
} from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterBox } from 'components/atoms/STable/components/STableFilter/STableFilterBox/STableFilterBox';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialBlankState } from 'components/organisms/modals/ModalBlank/ModalBlank';
import { initialReportState } from 'components/organisms/modals/ModalReport/ModalReport';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useModal } from 'core/hooks/useModal';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useQueryCbo } from 'core/services/hooks/queries/useQueryCbo/useQueryCbo';

import { IReportJson, reports } from './report.constants';
import { IReportAccordionProps } from './types';

export const ReportAccordion: FC<IReportAccordionProps> = ({ ...props }) => {
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
    console.log(report);

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
