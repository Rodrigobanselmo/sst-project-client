import { Box } from '@mui/material';
import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { SActionStepCheck } from 'components/atoms/SActionStepCheck';
import SPageTitle from 'components/atoms/SPageTitle';
import SText from 'components/atoms/SText';
import { ReactNode, useMemo } from 'react';

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

export function CompanyHomeOperationalHeader({
  companyName,
  stepsActionsList,
  headerActions,
}: Props): JSX.Element {
  const visibleGroups = useMemo(
    () => stepsActionsList.filter((entry) => entry.items.length > 0),
    [stepsActionsList],
  );

  const groupColumnCount = Math.max(visibleGroups.length, 1);

  return (
    <Box sx={{ mb: 2 }}>
      <SPageTitle icon={SClinicIcon} mb={0} rightElement={headerActions}>
        {companyName}
      </SPageTitle>

      {visibleGroups.length > 0 && (
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
            width: '100%',
          }}
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
                  <Box component="li" key={itemProps.text} sx={{ minWidth: 0 }}>
                    <SActionStepCheck index={index} {...itemProps} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
