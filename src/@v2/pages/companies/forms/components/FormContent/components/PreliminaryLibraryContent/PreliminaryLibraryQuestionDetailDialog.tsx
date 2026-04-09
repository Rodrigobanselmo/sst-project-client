import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { FormPreliminaryLibraryQuestionListItemApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import {
  translatePreliminaryLibraryCategory,
  translatePreliminaryLibraryQuestionType,
} from './preliminary-library-labels';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

function MetaInline({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Typography component="div" variant="body2" sx={{ lineHeight: 1.65 }}>
      <Box
        component="span"
        sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.75 }}
      >
        {label}:
      </Box>
      <Box component="span" sx={{ color: 'text.primary' }}>
        {children}
      </Box>
    </Typography>
  );
}

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75 }}
      >
        {label}:
      </Typography>
      <Box sx={{ pl: 0.5 }}>{children}</Box>
    </Box>
  );
}

export const PreliminaryLibraryQuestionDetailDialog = ({
  open,
  onClose,
  question,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  question: FormPreliminaryLibraryQuestionListItemApi | undefined;
  isLoading: boolean;
}) => {
  const originLabel = question?.system ? 'Sistema' : 'Empresa';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhe da pergunta</DialogTitle>
      <DialogContent>
        {isLoading && <Typography>Carregando…</Typography>}
        {!isLoading && question && (
          <Stack gap={2.25} sx={{ pt: 1 }}>
            <MetaInline label="Origem">
              <Chip size="small" label={originLabel} sx={{ verticalAlign: 'middle' }} />
            </MetaInline>
            <MetaInline label="Nome interno">{question.name}</MetaInline>
            <MetaInline label="Categoria">
              {translatePreliminaryLibraryCategory(question.category)}
            </MetaInline>
            <MetaInline label="Tipo de pergunta">
              {translatePreliminaryLibraryQuestionType(question.question_type)}
            </MetaInline>
            <MetaInline label="Tipo de identificador">
              {FormIdentifierTypeTranslate[
                question.identifier_type as FormIdentifierTypeEnum
              ] ?? question.identifier_type}
            </MetaInline>
            <MetaInline label='Aceitar "Outro"'>
              {question.accept_other ? 'Sim' : 'Não'}
            </MetaInline>
            <MetaBlock label="Texto da pergunta">
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {question.question_text}
              </Typography>
            </MetaBlock>
            {question.options?.length > 0 && (
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}
                >
                  Opções:
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ordem</TableCell>
                      <TableCell>Texto</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...question.options]
                      .sort((a, b) => a.order - b.order)
                      .map((opt) => (
                        <TableRow key={opt.id}>
                          <TableCell>{opt.order}</TableCell>
                          <TableCell>{opt.text}</TableCell>
                          <TableCell align="right">
                            {opt.value ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
