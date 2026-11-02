import { useRef, useState } from 'react';
import {
  SstDateField,
  useSstDateValidity,
} from '../sst-operational/SstDateField';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Certificate,
  CertificateAssignment,
  CertificateScope,
  certificateMessage,
  uploadCertificate,
} from './api';

export function CertificateUploadDialog({
  ownerId,
  original,
  onClose,
  onSaved,
  scope = 'COMPANY',
  binding,
  activationRevision,
}: {
  ownerId: string;
  original?: Certificate;
  onClose: () => void;
  onSaved: () => Promise<void>;
  scope?: CertificateScope;
  binding?: Pick<
    CertificateAssignment,
    'companyId' | 'mode' | 'expectedRevision'
  >;
  activationRevision?: number;
}) {
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [password, setPassword] = useState('');
  const [label, setLabel] = useState(original?.label || '');
  const [operationId] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(binding?.mode || 'OWN');
  const [authorizationDeclared, setAuthorizationDeclared] = useState(false);
  const [authorizationExpiresAt, setAuthorizationExpiresAt] = useState('');
  const configureCompany = !!binding && !original;
  const activate = activationRevision !== undefined && !original;
  const close = () => {
    if (busy) return;
    setPassword('');
    setFile(undefined);
    onClose();
  };
  const save = async () => {
    if (!file || !label.trim()) return;
    if (file.size > 1024 * 1024 || !/\.pfx$/i.test(file.name)) {
      setError('Selecione um arquivo .pfx com até 1 MB.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await uploadCertificate(
        ownerId,
        file,
        password,
        label,
        operationId,
        original?.id,
        scope,
        {
          ...(configureCompany && {
            binding: {
              ...binding,
              mode,
              ...(mode === 'PROXY' && {
                authorizationDeclared,
                ...(authorizationExpiresAt && { authorizationExpiresAt }),
              }),
            },
          }),
          ...(activate && {
            activation: { expectedRevision: activationRevision },
          }),
        },
      );
      setPassword('');
      setFile(undefined);
      await onSaved();
      onClose();
    } catch (e) {
      setError(certificateMessage(e));
    } finally {
      setPassword('');
      setBusy(false);
    }
  };
  return (
    <Dialog
      open
      onClose={close}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { m: { xs: 8, sm: 16 }, maxHeight: 'calc(100% - 32px)' },
      }}
      aria-labelledby="certificate-upload-title"
    >
      <DialogTitle id="certificate-upload-title" sx={{ px: 12, pt: 12, pb: 6 }}>
        {original ? 'Renovar certificado' : 'Adicionar certificado'}
      </DialogTitle>
      <DialogContent sx={{ px: 12, py: 4 }}>
        <Stack spacing={8} useFlexGap>
          <Typography>
            Selecione o certificado A1 e informe a senha de importação. A senha
            é usada somente nesta operação.
          </Typography>
          {original && (
            <Alert severity="info">
              A renovação deve manter o CPF/CNPJ do titular. A configuração
              ativa será atualizada automaticamente. Os envios anteriores
              continuarão identificados pelo certificado original.
            </Alert>
          )}
          {(configureCompany || activate) && (
            <Alert severity="info">
              {activate
                ? 'O certificado será ativado para as próximas transmissões. O histórico dos envios anteriores será preservado.'
                : 'O certificado será habilitado para os próximos envios desta empresa. A senha não será solicitada novamente ao enviar.'}
            </Alert>
          )}
          <TextField
            label="Nome do certificado"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            inputProps={{ maxLength: 120 }}
            disabled={busy}
            autoFocus
          />
          <Stack spacing={4} useFlexGap>
            <Button variant="outlined" component="label" disabled={busy}>
              Selecionar arquivo .pfx
              <input
                ref={fileInput}
                aria-label="Arquivo do certificado"
                type="file"
                accept=".pfx"
                hidden
                onChange={(e) => {
                  setFile(e.target.files?.[0]);
                  setError('');
                }}
              />
            </Button>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {file?.name || 'Nenhum arquivo selecionado'} · máximo 1 MB
            </Typography>
          </Stack>
          <TextField
            label="Senha do certificado"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={busy}
            inputProps={{ maxLength: 1024 }}
          />
          {configureCompany && (
            <>
              <TextField
                label="Forma de representação"
                select
                value={mode}
                onChange={(event) => {
                  setMode(event.target.value as 'OWN' | 'PROXY');
                  setAuthorizationDeclared(false);
                }}
                disabled={busy}
              >
                <MenuItem value="OWN">
                  Certificado do próprio empregador
                </MenuItem>
                <MenuItem value="PROXY">Certificado de procurador</MenuItem>
              </TextField>
              {mode === 'PROXY' && (
                <>
                  <Typography variant="body2">
                    O titular precisa ter procuração válida na Receita Federal
                    com poderes para os eventos de SST. O eSocial verifica essa
                    autorização no processamento.
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={authorizationDeclared}
                        disabled={busy}
                        onChange={(event) =>
                          setAuthorizationDeclared(event.target.checked)
                        }
                      />
                    }
                    label="Confirmo que existe procuração válida para enviar os eventos de SST desta empresa"
                  />
                  <SstDateField
                    label="Término da procuração (opcional)"
                    value={authorizationExpiresAt}
                    onChange={setAuthorizationExpiresAt}
                    onValidityChange={dateFieldValidity(
                      'authorizationExpiresAt',
                    )}
                    disabled={busy}
                  />
                </>
              )}
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions
        disableSpacing
        sx={{ px: 12, pt: 8, pb: 12, gap: 4, flexWrap: 'wrap' }}
      >
        <Button onClick={close} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={
            busy ||
            !datesValid ||
            !file ||
            !label.trim() ||
            (configureCompany && mode === 'PROXY' && !authorizationDeclared)
          }
          onClick={save}
        >
          {busy
            ? 'Validando certificado…'
            : original
              ? 'Confirmar renovação'
              : configureCompany || activate
                ? 'Importar e ativar'
                : 'Importar certificado'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
