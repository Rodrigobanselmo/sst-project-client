import { useCallback, useMemo, useState } from 'react';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Collapse,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { SActionStepCheck } from 'components/atoms/SActionStepCheck';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
import SText from 'components/atoms/SText';
import { ReactNode } from 'react';

import SClinicIcon from 'assets/icons/SClinicIcon';

export type CompanyHomeStepGroup = {
  group: string;
  items: ISActionButtonProps[];
};

type Props = {
  companyName: string;
  stepsActionsList: CompanyHomeStepGroup[];
  headerActions: ReactNode;
};

function getGroupProgress(items: ISActionButtonProps[]) {
  const total = items.length;
  const done = items.filter((item) => Boolean(item.count)).length;
  return { done, total };
}

export function CompanyHomeOperationalHeader({
  companyName,
  stepsActionsList,
  headerActions,
}: Props): JSX.Element {
  const prefersFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [clickExpanded, setClickExpanded] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  const visibleGroups = useMemo(
    () => stepsActionsList.filter((entry) => entry.items.length > 0),
    [stepsActionsList],
  );

  const groupColumnCount = Math.max(visibleGroups.length, 1);

  const summaryText = useMemo(
    () =>
      visibleGroups
        .map(({ group, items }) => {
          const { done, total } = getGroupProgress(items);
          return `${group} ${done}/${total}`;
        })
        .join(' · '),
    [visibleGroups],
  );

  const isDetailsOpen =
    clickExpanded || (prefersFinePointer && hoverExpanded);

  const toggleClickExpanded = useCallback(() => {
    setClickExpanded((open) => !open);
  }, []);

  const handleSummaryEnter = useCallback(() => {
    if (prefersFinePointer) setHoverExpanded(true);
  }, [prefersFinePointer]);

  const handleSummaryLeave = useCallback(() => {
    if (prefersFinePointer) setHoverExpanded(false);
  }, [prefersFinePointer]);

  return (
    <Box sx={{ mb: 2 }}>
      <SPageTitle icon={SClinicIcon} mb={0} rightElement={headerActions}>
        {companyName}
      </SPageTitle>

      {visibleGroups.length > 0 && (
        <Box
          onMouseEnter={handleSummaryEnter}
          onMouseLeave={handleSummaryLeave}
          sx={{ mt: 0.75 }}
        >
          <SFlex
            align="center"
            gap={1}
            flexWrap="wrap"
            sx={{
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={toggleClickExpanded}
            role="button"
            tabIndex={0}
            aria-expanded={isDetailsOpen}
            aria-label="Expandir ou recolher detalhes do progresso"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleClickExpanded();
              }
            }}
          >
            <SText
              fontSize={11}
              color="text.secondary"
              lineHeight={1.35}
              sx={{ flex: '1 1 auto', minWidth: 0 }}
            >
              {summaryText}
            </SText>
            <SFlex align="center" gap={0.5} sx={{ flexShrink: 0 }}>
              <SText fontSize={11} color="text.secondary" fontWeight={600}>
                Detalhes
              </SText>
              <IconButton
                size="small"
                aria-hidden
                tabIndex={-1}
                sx={{ p: 0.25 }}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleClickExpanded();
                }}
              >
                {isDetailsOpen ? (
                  <ExpandLessIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </SFlex>
          </SFlex>

          <Collapse in={isDetailsOpen} timeout="auto" unmountOnExit={false}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: `repeat(${Math.min(groupColumnCount, 4)}, minmax(0, 1fr))`,
                },
                columnGap: { xs: 2, md: 4 },
                rowGap: 1.5,
                mt: 1,
                pt: 1,
                pb: 0.5,
                width: '100%',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {visibleGroups.map(({ group, items }) => (
                <Box key={group} minWidth={0}>
                  <SText
                    fontSize={11}
                    fontWeight={600}
                    color="text.secondary"
                    lineHeight={1.2}
                    mb={0.5}
                  >
                    {group}
                  </SText>
                  <Box
                    component="ul"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.25,
                      m: 0,
                      p: 0,
                      listStyle: 'none',
                    }}
                  >
                    {items.map((itemProps, index) => (
                      <Box
                        component="li"
                        key={itemProps.text}
                        sx={{ minWidth: 0 }}
                      >
                        <SActionStepCheck index={index} {...itemProps} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}
