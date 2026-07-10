import React, { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';

import { SInputFileDropZone } from '@v2/components/forms/fields/SInputFileDropZone/SInputFileDropZone';
import { SText } from '@v2/components/atoms/SText/SText';
import {
  AI_TEMPORARY_PDF_MAX_BYTES,
  AiTemporaryDocumentSource,
  AiTemporaryPdfParseResult,
  toTemporaryDocumentSource,
} from '@v2/services/security/characterization/characterization/ai-temporary-source/ai-temporary-document-source.types';
import { parseAiTemporarySourcePdf } from '@v2/services/security/characterization/characterization/ai-temporary-source/parse-ai-temporary-source-pdf.service';
import { extractApiError } from '@v2/utils/extract-api-error';
import { IErrorResp } from '@v2/types/error.type';

type Props = {
  companyId?: string;
  workspaceId?: string;
  characterizationId?: string;
  value: AiTemporaryDocumentSource | null;
  onChange: (value: AiTemporaryDocumentSource | null) => void;
  disabled?: boolean;
};

function getParseErrorMessage(error: unknown): string {
  const apiMessage = extractApiError(error as IErrorResp);
  if (apiMessage?.trim()) return apiMessage.trim();
  if (error instanceof Error && error.message) return error.message;
  return 'Não foi possível ler este PDF.';
}

export const AiTemporaryPdfSourceField: React.FC<Props> = ({
  companyId,
  workspaceId,
  characterizationId,
  value,
  onChange,
  disabled,
}) => {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const canParse = Boolean(companyId && workspaceId && characterizationId);

  const handleRemove = () => {
    setError(null);
    setWarnings([]);
    onChange(null);
  };

  const handleFileSelect = async (file: File | null) => {
    setError(null);
    setWarnings([]);
    onChange(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Apenas arquivos PDF são aceitos neste MVP.');
      return;
    }

    if (file.size > AI_TEMPORARY_PDF_MAX_BYTES) {
      setError(
        `PDF grande demais. Limite: ${Math.floor(
          AI_TEMPORARY_PDF_MAX_BYTES / (1024 * 1024),
        )} MB.`,
      );
      return;
    }

    if (!canParse) {
      setError('Salve a caracterização antes de anexar um PDF temporário.');
      return;
    }

    setParsing(true);
    try {
      const result: AiTemporaryPdfParseResult = await parseAiTemporarySourcePdf({
        companyId: companyId as string,
        workspaceId: workspaceId as string,
        characterizationId: characterizationId as string,
        file,
      });
      onChange(toTemporaryDocumentSource(result));
      setWarnings(result.warnings || []);
    } catch (err) {
      setError(getParseErrorMessage(err));
      onChange(null);
    } finally {
      setParsing(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
        Documento PDF temporário (opcional)
      </SText>

      <Alert severity="info" sx={{ mb: 1.5 }}>
        Este PDF será usado apenas como contexto desta execução da IA. Ele não
        será salvo na caracterização.
      </Alert>

      <Alert severity="warning" sx={{ mb: 1.5 }}>
        O conteúdo extraído deste PDF será enviado à IA como documento
        temporário de apoio nesta execução. O arquivo não será salvo no
        SimpleSST.
      </Alert>

      {!value && (
        <SInputFileDropZone
          accept={{ 'application/pdf': ['.pdf'] }}
          label="Arraste um PGR/PDF de apoio ou clique para selecionar (1 arquivo)"
          maxFiles={1}
          maxSize={AI_TEMPORARY_PDF_MAX_BYTES}
          disabled={disabled || parsing || !canParse}
          onDrop={(acceptedFiles, rejections) => {
            if (rejections?.length) {
              const rejection = rejections[0];
              const code = rejection.errors?.[0]?.code;
              if (code === 'file-too-large') {
                setError(
                  `PDF grande demais. Limite: ${Math.floor(
                    AI_TEMPORARY_PDF_MAX_BYTES / (1024 * 1024),
                  )} MB.`,
                );
                return;
              }
              if (code === 'file-invalid-type') {
                setError('Apenas arquivos PDF são aceitos neste MVP.');
                return;
              }
              setError('Arquivo inválido. Selecione um PDF.');
              return;
            }
            void handleFileSelect(acceptedFiles[0] ?? null);
          }}
        />
      )}

      {parsing && (
        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1.5 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">Analisando PDF…</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}

      {value && !parsing && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              PDF carregado com sucesso
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {value.fileName}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {typeof value.pageCount === 'number' && (
                <Chip size="small" label={`${value.pageCount} pág.`} />
              )}
              {typeof value.charCount === 'number' && (
                <Chip
                  size="small"
                  label={`${value.charCount.toLocaleString('pt-BR')} caracteres`}
                />
              )}
              {value.truncated && (
                <Chip size="small" color="warning" label="Truncado" />
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            aria-label="Remover PDF temporário"
            onClick={handleRemove}
            disabled={disabled}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {value?.truncated && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          Texto truncado por limite de segurança. A IA usará apenas parte do
          documento.
        </Alert>
      )}

      {warnings
        .filter((warning) => !value?.truncated || !warning.toLowerCase().includes('truncado'))
        .map((warning) => (
          <Alert key={warning} severity="warning" sx={{ mt: 1 }}>
            {warning}
          </Alert>
        ))}
    </Box>
  );
};
