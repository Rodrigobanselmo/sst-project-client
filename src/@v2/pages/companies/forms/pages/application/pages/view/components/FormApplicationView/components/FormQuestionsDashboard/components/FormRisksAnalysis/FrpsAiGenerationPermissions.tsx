import { useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useQueryFrpsPrivacySettings } from 'core/services/hooks/queries/useQueryFrpsPrivacySettings/useQueryFrpsPrivacySettings';
import { useMutUpdateFrpsPrivacySettings } from 'core/services/hooks/mutations/company/useMutUpdateFrpsPrivacySettings/useMutUpdateFrpsPrivacySettings';
export function FrpsAiGenerationPermissions({ companyId }: { companyId: string }) {
  const { data, isLoading, isError } = useQueryFrpsPrivacySettings(companyId);
  const mutation = useMutUpdateFrpsPrivacySettings();
  const [levels, setLevels] = useState<number[]>([]);
  const key = JSON.stringify(data.aiGenerationAdditionalLevels ?? []);
  useEffect(() => { setLevels(JSON.parse(key)); }, [key, companyId]);
  return <Box sx={{ mb: 8, p: 6, border: '1px solid', borderColor: 'divider', borderRadius: 2, color: 'text.primary', '& .MuiFormControlLabel-label': { color: 'text.primary' } }}>
    <Typography color="text.primary" fontWeight={700}>Liberação de geração de FRPS para usuários da empresa</Typography>
    <Typography color="text.secondary" variant="body2" sx={{ my: 3 }}>Alto e Muito Alto estão sempre disponíveis. O MASTER pode gerar em qualquer faixa. Libere abaixo as faixas adicionais para os demais usuários desta empresa; em agrupamentos entre empresas, todas precisam permitir a faixa.</Typography>
    {isError && <Alert severity="error">Não foi possível carregar as liberações.</Alert>}
    {[{ level: 3, label: 'Moderado' }, { level: 2, label: 'Baixo' }, { level: 1, label: 'Muito Baixo' }].map(({level,label}) => <FormControlLabel key={level} label={label} control={<Checkbox checked={levels.includes(level)} disabled={isLoading || isError || mutation.isLoading} onChange={(_,checked) => setLevels(prev => checked ? [...prev,level] : prev.filter(n => n !== level))} />} />)}
    <Button type="button" variant="outlined" disabled={isLoading || isError || mutation.isLoading} onClick={() => mutation.mutate({ companyId, aiGenerationAdditionalLevels: levels })}>Salvar liberações da empresa</Button>
  </Box>;
}
