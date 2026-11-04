import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  QueryClient as QueryClientV5,
  QueryClientProvider as QueryProviderV5,
} from '@tanstack/react-query';
import { useMainStep } from '../../../src/components/organisms/modals/ModalAddDocVersion/components/1-main/hooks/useMainStep';
import { FormApplicationBrowseAutocomplete } from '../../../src/@v2/components/organisms/forms/FormApplicationBrowseAutocomplete/FormApplicationBrowseAutocomplete';
import { DocumentRiskFilterModal } from '../../../src/components/organisms/modals/ModalAddDocVersion/components/1-main/components/DocumentRiskFilterModal';
import { formatRevisionDisplayLabel } from '../../../src/components/organisms/modals/ModalAddDocVersion/helpers/document-version.helpers';
const clients = [
  new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  }),
  new QueryClientV5({ defaultOptions: { queries: { retry: false } } }),
];
(window as any).messages = [];
(window as any).refetchRisks = () =>
  (clients[0] as QueryClient).refetchQueries();
function Main() {
  const linked = new URLSearchParams(location.search).has('linked');
  const companyId =
    new URLSearchParams(location.search).get('company') || 'company-test';
  const [data, setData] = useState<any>({
    companyId,
    workspaceId: 'workspace-test',
    type: 'PGR',
    modelId: 'model-sem-frps',
    versionFamily: 'test',
    professionals: [],
    ...(linked
      ? { regenerateVersionId: 'version-existing', lockedVersion: '0.0.0' }
      : {}),
    generationSnapshot: linked
      ? {
          formApplicationId: 'application-linked',
          riskFilter: { mode: 'EXCLUDE', excludedRiskFactorIds: ['r1'] },
        }
      : undefined,
  });
  const step = useMainStep({
    data,
    setData,
    doc: undefined,
    onClose: () => {},
    onCloseUnsaved: () => {},
  } as any);
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <>
      <output data-testid="version">
        {step.loadingDates
          ? 'Consultando próxima revisão…'
          : step.datesError
            ? 'Erro de revisão'
            : step.nextVersion
              ? formatRevisionDisplayLabel(step.nextVersion)
              : 'Consultando próxima revisão…'}
      </output>
      <button onClick={step.retryDates}>Repetir revisão</button>
      <button onClick={() => step.onVersionFamilyChange('official')}>
        Oficial
      </button>
      <button onClick={() => step.onVersionFamilyChange('test')}>Teste</button>
      <button onClick={step.onSubmit}>Criar versão</button>
      <FormApplicationBrowseAutocomplete
        companyId={companyId}
        value={step.formApplicationId}
        onChange={step.setFormApplicationId}
        onStatusChange={step.setFormApplicationPickerStatus}
      />
      <button onClick={() => setFilterOpen(true)}>Filtrar riscos</button>
      <button onClick={() => (clients[0] as QueryClient).refetchQueries()}>
        Recarregar riscos
      </button>
      <output data-testid="risk-filter">
        {JSON.stringify(step.riskFilter)}
      </output>
      <DocumentRiskFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onConfirm={step.setRiskFilter}
        companyId={companyId}
        workspaceId="workspace-test"
        value={step.riskFilter}
      />
    </>
  );
}
function App() {
  const [opening, setOpening] = useState(0);
  const methods = useForm({
    defaultValues: {
      name: 'PGR fixture',
      doc_description: 'Revisão fixture',
      elaboratedBy: 'Responsável fictício',
      versionFamily: 'test',
      documentCreatedAt: new Date(2026, 0, 1),
      documentDate: new Date(2026, 0, 1),
      validityYears: 2,
      validityMonths: 0,
    },
  });
  return (
    <QueryClientProvider client={clients[0] as QueryClient}>
      <QueryProviderV5 client={clients[1] as QueryClientV5}>
        <FormProvider {...methods}>
          <button onClick={() => setOpening((n) => n + 1)}>
            Reabrir modal
          </button>
          <Main key={opening} />
        </FormProvider>
      </QueryProviderV5>
    </QueryClientProvider>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
