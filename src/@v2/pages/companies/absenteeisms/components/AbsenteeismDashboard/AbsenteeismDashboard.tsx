import { Box } from '@mui/material';
import { GraphBarTotal } from './graphs/GraphBarTotal/GraphBarTotal';
import { GraphPieType } from './graphs/GraphPieType/GraphPieType';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { GraphPieRangeDays } from './graphs/GraphPieRangeDays/GraphPieRangeDays';
import { TableEmployeeTotal } from './tables/table-employee-total/TableEmployeeTotal';
import { TableHierarchyTotal } from './tables/table-hierarchy-total/TableHierarchyTotal';

export const AbsenteeismDashboard = ({ companyId }: { companyId: string }) => {
  // In a real app, you would fetch and process data based on companyId here

  return (
    <Box width={'100%'} overflow={'scroll'}>
      <SFlex gap={6} flexDirection="column">
        <SFlex gap={6} display="grid" gridTemplateColumns="1fr">
          <TableHierarchyTotal companyId={companyId} />
        </SFlex>
        <SFlex gap={6} display="grid" gridTemplateColumns="1fr 450px">
          <GraphBarTotal companyId={companyId} />
          <GraphPieRangeDays companyId={companyId} />
        </SFlex>
        <SFlex gap={6} display="grid" gridTemplateColumns="500px 1fr">
          <GraphPieType companyId={companyId} />
          <TableEmployeeTotal companyId={companyId} />
        </SFlex>
      </SFlex>
    </Box>
  );
};
