import { FC, useState } from 'react';

import { Box, Tab, Tabs } from '@mui/material';
import { HoLaboratoryTable } from './components/HoLaboratoryTable';
import { HoMethodsPageContent } from './components/HoMethodsPageContent';

export const HoMethodsPage: FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ px: { xs: 2, md: 5 }, pb: 10, pt: 2 }}>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label="Catálogo de higiene ocupacional"
        sx={{ mb: 3 }}
      >
        <Tab
          label="Métodos"
          id="ho-methods-tab"
          aria-controls="ho-methods-panel"
        />
        <Tab
          label="Laboratórios"
          id="ho-labs-tab"
          aria-controls="ho-labs-panel"
        />
      </Tabs>
      <Box
        role="tabpanel"
        id={tab === 0 ? 'ho-methods-panel' : 'ho-labs-panel'}
        aria-labelledby={tab === 0 ? 'ho-methods-tab' : 'ho-labs-tab'}
      >
        {tab === 0 ? <HoMethodsPageContent /> : <HoLaboratoryTable />}
      </Box>
    </Box>
  );
};
