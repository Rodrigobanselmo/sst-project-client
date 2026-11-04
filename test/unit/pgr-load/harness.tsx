import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormApplicationBrowseAutocomplete } from '../../../src/@v2/components/organisms/forms/FormApplicationBrowseAutocomplete/FormApplicationBrowseAutocomplete';
function Harness() {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState<string | null>(new URLSearchParams(location.search).get('binding'));
  return <><output data-testid="status">{status}</output><output data-testid="binding">{value}</output><FormApplicationBrowseAutocomplete companyId="tenant-a" value={value} onChange={setValue} onStatusChange={setStatus}/></>;
}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><Harness/></QueryClientProvider>);
