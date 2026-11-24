import { useState } from 'react';
import { useQuery } from 'react-query';
import { Alert, Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { api } from 'core/services/apiClient';
import { queryUsers } from 'core/services/hooks/queries/useQueryUsers';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
export function ProfessionalDocuments({professionalId,companyId,professionalName,professionalEmail}:{professionalId:number;companyId:string;professionalName?:string;professionalEmail?:string}) {
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[selected,setSelected]=useState('');const {isMaster}=useAccess();
  const {companyId: currentCompanyId}=useGetCompanyId();
  const accountCompanyId=currentCompanyId||companyId;
  const base=`v2/companies/${companyId}/professionals/${professionalId}`;
  const query=useQuery<{userId:number|null;documents:{id:string;name:string;created_at:string}[]}>(['professional-documents',companyId,professionalId],async()=>(await api.get(`${base}/documents`)).data,{enabled:!!professionalId&&!!companyId,cacheTime:0,staleTime:0,retry:false});
  const users=useQuery(['professional-document-users',accountCompanyId],()=>queryUsers(accountCompanyId),{enabled:isMaster&&!!accountCompanyId,cacheTime:0,retry:false});
  const emailMatch=professionalEmail?.trim() ? users.data?.find(u=>u.email?.trim().toLowerCase()===professionalEmail.trim().toLowerCase()) : undefined;
  const nameTokens=(value?:string)=>value?.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split(/\s+/).filter(x=>x.length>2&&!['dos','das'].includes(x))??[];
  const professionalTokens=nameTokens(professionalName);
  const nameCandidates=professionalTokens.length>=3 ? users.data?.filter(u=>{const tokens=nameTokens(u.name);return tokens.length>=3&&tokens.every(t=>professionalTokens.includes(t));})??[] : [];
  const nameMatch=nameCandidates.length===1?nameCandidates[0]:undefined;
  const accountId=selected||String(query.data?.userId??emailMatch?.id??nameMatch?.id??'');
  const account=users.data?.find(u=>String(u.id)===accountId);
  if(!professionalId)return <Alert severity="info">Salve o cadastro profissional para vincular um usuário e anexar documentos.</Alert>;
  const act=async(work:()=>Promise<unknown>)=>{setBusy(true);setError('');try{await work();await query.refetch();}catch(e:any){setError(e.response?.data?.message??'Não foi possível concluir a operação. Confira seu acesso.');}finally{setBusy(false);}};
  return <Box sx={{my:8}}><Typography variant="h6">Conta de acesso deste profissional e documentos</Typography>
    <Typography variant="body2" sx={{my:4}}>O CRM informado abaixo pertence a este cadastro profissional. Associe a conta que este mesmo médico usa para entrar no sistema para que a permissão reconheça o CRM existente. CPF e documentos são opcionais.</Typography>
    {query.isError?<Alert severity="info">Documentos restritos ao profissional e à administração autorizada.</Alert>:<>
      {isMaster&&<Box sx={{my:4}}>
        <Typography variant="body2">Cadastro profissional: {professionalName || 'Nome não informado'} — {professionalEmail || 'E-mail não informado'}</Typography>
        <Box sx={{display:'flex',flexWrap:'wrap',gap:4,my:4}}>
          <TextField select size="small" label="Conta usada por este profissional para entrar no sistema" value={accountId} onChange={e=>setSelected(e.target.value)} disabled={!!query.data?.userId} sx={{minWidth:280,maxWidth:'100%'}} helperText="Selecione a conta da mesma pessoa na empresa atual. O e-mail pode ser diferente do cadastro profissional.">
            <MenuItem value="">Selecione a conta do próprio profissional</MenuItem>
            {users.data?.map(u=><MenuItem key={u.id} value={String(u.id)}>{u.name} — {u.email}</MenuItem>)}
            {query.data?.userId&&!account&&<MenuItem value={String(query.data.userId)}>Conta associada #{query.data.userId}</MenuItem>}
          </TextField>
          <Button disabled={busy||!accountId||!!query.data?.userId} onClick={()=>void act(()=>api.post(`${base}/link-user`,{userId:Number(accountId),accountCompanyId}))}>Confirmar que esta é a conta do profissional</Button>
        </Box>
        {account&&<Alert severity={query.data?.userId?'success':'info'}>{query.data?.userId?'Conta já associada':'Conta selecionada para conferência'}: {account.name} — {account.email}. {query.data?.userId?'O CRM deste cadastro é reconhecido para esta conta.':'Ao confirmar, o CRM deste cadastro será reconhecido para esta conta. A permissão às respostas continua sendo concedida separadamente.'}</Alert>}
        {!users.isLoading&&!accountId&&<Typography variant="body2" color="text.secondary">Não foi encontrada uma conta com o mesmo e-mail. Confira nome e e-mail e selecione a conta do próprio médico.</Typography>}
      </Box>}
      <Typography variant="body2">Currículo e documentos de formação (PDF, até 10 MB). Acesso privado; anexos não são obrigatórios para a permissão.</Typography>
      <Button component="label" disabled={busy||query.isLoading} sx={{my:4}}>Anexar documento PDF<input type="file" hidden accept="application/pdf" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>10*1024*1024){setError('O limite é 10 MB.');return;}void act(async()=>{const body=new FormData();body.append('file',file);await api.post(`${base}/documents`,body);});}}/></Button>
      {query.data?.documents.map(d=><Box key={d.id} sx={{my:3}}><Button disabled={busy} onClick={()=>void act(async()=>{const response=await api.get(`${base}/documents/${d.id}`);window.open(response.data.url,'_blank','noopener,noreferrer');})}>Consultar {d.name}</Button><Typography variant="caption">Anexado em {new Date(d.created_at).toLocaleDateString('pt-BR')}</Typography></Box>)}
      {!query.isLoading&&!query.data?.documents.length&&<Typography variant="body2" color="text.secondary">Nenhum documento anexado.</Typography>}
    </>}{error&&<Alert severity="error">{error}</Alert>}
  </Box>;
}
