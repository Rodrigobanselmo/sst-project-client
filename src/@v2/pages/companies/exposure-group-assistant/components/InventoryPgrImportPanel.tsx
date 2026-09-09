import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import { SInputFile } from '@v2/components/forms/fields/SInputFile/SInputFile';
import { useMutPreviewInventoryPgrImport } from '@v2/services/security/inventory-pgr-import/hooks/useMutPreviewInventoryPgrImport';
import { InventoryPgrImportReviewForm } from './InventoryPgrImportReviewForm';
import type { InventoryPgrImportPreview } from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';
import { useState } from 'react';

type Props = {
  companyId: string;
  workspaceId: string;
};

function resolveErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(data) && data[0]) return data[0];
  if (typeof data === 'string' && data.trim()) return data;
  if (err instanceof Error && err.message) return err.message;
  return 'Não foi possível processar o PDF. Tente novamente.';
}

export function InventoryPgrImportPanel({ companyId, workspaceId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<InventoryPgrImportPreview | null>(null);
  const mutation = useMutPreviewInventoryPgrImport();

  const onProcess = async () => {
    if (!file) return;
    setPreview(null);
    try {
      const result = await mutation.mutateAsync({
        companyId,
        workspaceId,
        file,
      });
      setPreview(result);
    } catch {
      setPreview(null);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Alert severity="info">
        <AlertTitle>Importar estrutura de Inventário / PGR</AlertTitle>
        Este fluxo parte de um documento técnico já consolidado e propõe cargos,
        GSEs e vínculos Cargo↔GSE para revisão humana. Ele é diferente de
        “Propostas de GSE”, que parte da estrutura já cadastrada no SimpleSST.
        A revisão monta o plano sem gravar. A importação só acontece no
        botão final, depois da confirmação humana.
      </Alert>

      <SInputFile
        label="PDF do Inventário / PGR"
        accept="application/pdf,.pdf"
        fullWidth
        value={file}
        onChange={(next) => {
          setFile(next);
          setPreview(null);
        }}
      />

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          disabled={!file || mutation.isPending}
          onClick={() => void onProcess()}
        >
          {mutation.isPending ? 'Processando…' : 'Gerar preview'}
        </Button>
        {mutation.isPending ? <CircularProgress size={20} /> : null}
      </Stack>

      {mutation.isError ? (
        <Alert severity="error">{resolveErrorMessage(mutation.error)}</Alert>
      ) : null}

      {preview ? (
        <Stack spacing={3}>
          <Alert
            severity={preview.extractionQuality?.needsReview ? 'warning' : 'success'}
          >
            {preview.message}
          </Alert>
          <InventoryPgrImportReviewForm
            companyId={companyId}
            workspaceId={workspaceId}
            preview={preview}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
