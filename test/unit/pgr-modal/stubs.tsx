import React from 'react';
import { useFetch } from '@v2/hooks/api/useFetch';
export async function request(path: string, body?: unknown) {
  const response = await fetch(
    path,
    body === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
  );
  if (!response.ok) throw new Error(`Fixture HTTP ${response.status}`);
  return response.json();
}
export const api = {
  get: async (path: string) => ({ data: await request(path) }),
};
export const queryExams = async (_pagination: unknown, query: any) =>
  request(
    '/risk/company/' + query.companyId + '?workspaceId=' + query.workspaceId,
  );
export const queryDocVersions = async (_pagination: unknown, query: unknown) =>
  request('/versions?' + new URLSearchParams(query as any));
export const queryGroupDocumentData = async () => request('/document-data');
export const useQueryCompany = () => ({ data: { id: 'company-test' } });
export const useSnackbar = () => ({
  enqueueSnackbar: (message: string) => {
    (window as any).messages.push(message);
  },
});
export const useConfirmationModal = () => ({
  showConfirmation: async () => true,
});
const mutation = (path: string) => () => ({
  isLoading: false,
  mutateAsync: (body: unknown) => request(path, body),
});
export const useMutUpsertPGRDocumentData = mutation('/upsert');
export const useMutUpsertPCSMODocumentData = useMutUpsertPGRDocumentData;
export const useMutUpsertPERICULOSIDADEDocumentData =
  useMutUpsertPGRDocumentData;
export const useMutUpsertLTCATDocumentData = useMutUpsertPGRDocumentData;
export const useMutUpsertINSALUBRIDADEDocumentData =
  useMutUpsertPGRDocumentData;
export const useMutUpsertFRPSDocumentData = useMutUpsertPGRDocumentData;
export const useMutAddQueueDocs = mutation('/create');
export const useMutRegenerateDocVersion = mutation('/regenerate');
export const useFetchBrowseFormApplication = () => {
  const { data, ...rest } = useFetch({
    queryKey: ['fixture-applications'],
    queryFn: () => request('/applications'),
  });
  return { ...rest, formApplication: data };
};
export const readFormApplication = async () => request('/application');
export const SAutocompleteSelect = (props: any) => (
  <div>
    <span data-testid="application-loading">{String(props.loading)}</span>
    <span>{props.value?.label || ''}</span>
  </div>
);
export const SButton = ({ children, onClick, disabled }: any) => (
  <button disabled={disabled} onClick={onClick}>
    {children}
  </button>
);
export default function SText({ children }: any) {
  return <p>{children}</p>;
}
