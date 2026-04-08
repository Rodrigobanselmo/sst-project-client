import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { FormPreliminaryLibraryBlockDetailApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
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
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export const PreliminaryLibraryBlockDetailDialog = ({
  open,
  onClose,
  block,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  block: FormPreliminaryLibraryBlockDetailApi | undefined;
  isLoading: boolean;
}) => {
  const originLabel = block?.system ? 'Sistema' : 'Empresa';

  const sortedItems = block?.items
    ? [...block.items].sort((a, b) => a.order - b.order)
    : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhe do bloco</DialogTitle>
      <DialogContent>
        {isLoading && <Typography>Carregando…</Typography>}
        {!isLoading && block && (
          <Stack gap={2} sx={{ pt: 1 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle2" color="text.secondary">
                Origem
              </Typography>
              <Chip size="small" label={originLabel} />
            </Stack>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Nome
              </Typography>
              <Typography>{block.name}</Typography>
            </Box>
            {block.description ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Descrição
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {block.description}
                </Typography>
              </Box>
            ) : null}
            <Divider />
            <Typography variant="subtitle1">Perguntas do bloco</Typography>
            {sortedItems.length === 0 && (
              <Typography color="text.secondary">Nenhuma pergunta no bloco.</Typography>
            )}
            {sortedItems.map((item, idx) => {
              const q = item.library_question;
              if (!q) return null;
              return (
                <Box
                  key={item.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Pergunta {idx + 1} (ordem no bloco: {item.order})
                  </Typography>
                  <Stack gap={1}>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={q.system ? 'Sistema' : 'Empresa'}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {q.name}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {translatePreliminaryLibraryCategory(q.category)} ·{' '}
                      {translatePreliminaryLibraryQuestionType(q.question_type)} ·{' '}
                      {FormIdentifierTypeTranslate[
                        q.identifier_type as FormIdentifierTypeEnum
                      ] ?? q.identifier_type}
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{q.question_text}</Typography>
                    {q.accept_other ? (
                      <Typography variant="caption">Aceita &quot;Outro&quot;: Sim</Typography>
                    ) : null}
                    {q.options?.length > 0 && (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Ordem</TableCell>
                            <TableCell>Opção</TableCell>
                            <TableCell align="right">Valor</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...q.options]
                            .sort((a, b) => a.order - b.order)
                            .map((opt) => (
                              <TableRow key={opt.id}>
                                <TableCell>{opt.order}</TableCell>
                                <TableCell>{opt.text}</TableCell>
                                <TableCell align="right">{opt.value ?? '—'}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
