import { individualPanelUrl } from '../../../../../clinical/ClinicalParticipantsTable';
import { stripHtmlForDisplay } from '../FormQuestionsDashboard/components/FormRisksAnalysis/frps-explainability/strip-html-for-display.util';
import { useQuery } from 'react-query';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { api } from 'core/services/apiClient';
import { FormParticipantsFilterSummary } from './components/FormParticipantsFilterSummary';
import { useFetchFormParticipantsAdherenceEvolution } from '@v2/services/forms/form-participants/adherence-evolution/hooks/useFetchFormParticipantsAdherenceEvolution';
import { useFormParticipantsActions } from './hooks/useFormParticipantsActions';
import { useSendFormReminderFlow } from '@v2/services/forms/form-participants/send-form-reminder';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

export const participantPrivacyPath=(companyId:string,applicationId:string)=>`v2/companies/${companyId}/forms/applications/${applicationId}/participants`;
export type ParticipantAccess={canViewIdentity:boolean;canViewIndividualAnswers:boolean;answerCompanyIds:string[];restricted:boolean};
export function useParticipantAccess(companyId:string,applicationId:string){
  return useQuery<ParticipantAccess>(['frps-participant-access',companyId,applicationId],async()=>(await api.get(`${participantPrivacyPath(companyId,applicationId)}/access`)).data,{staleTime:0,cacheTime:0,refetchOnWindowFocus:'always',refetchInterval:15000,retry:false});
}

export function RestrictedParticipantView({companyId,applicationId,formApplication}:{companyId:string;applicationId:string;formApplication?:FormApplicationReadModel}){
  const report=useQuery(['frps-private-participation',companyId,applicationId],async()=>(await api.get(`${participantPrivacyPath(companyId,applicationId)}/participation-report`)).data,{staleTime:0,refetchOnWindowFocus:true});
  const {evolution,isLoading:evolutionLoading,isError:evolutionError}=useFetchFormParticipantsAdherenceEvolution({companyId,applicationId,filters:{}});
  const {onSendFormEmail,sendFormEmailMutation}=useFormParticipantsActions({companyId,applicationId});
  const {sendReminder,isSending:isSendingReminder}=useSendFormReminderFlow();
  const summary=report.data?.summary;
  const accepting=formApplication?.status===FormApplicationStatusEnum.PROGRESS;
  return <Box>
    <Alert severity="info" sx={{mb:6}}>A empresa restringiu a identificação dos participantes. Seu acesso permite acompanhar a adesão e os resultados agregados. Nomes, dados de contato e status individuais não são exibidos.</Alert>
    {summary?.shouldHideData && <Alert severity="info" sx={{mb:6}}>Participação protegida: este recorte não atende ao mínimo de três participantes.</Alert>}
    {report.isError ? <Alert severity="error">Não foi possível carregar a participação. Tente atualizar a página.</Alert> : <FormParticipantsFilterSummary summary={{totalParticipants:summary?.eligibleTotal??0,respondedCount:summary?.respondents??0,notRespondedCount:summary?.nonRespondents??0,responseRatePercent:summary?.responseRatePercent??0}} isLoading={report.isLoading} evolution={evolution} evolutionLoading={evolutionLoading} evolutionError={evolutionError} />}
    <Box sx={{display:'flex',gap:6,flexWrap:'wrap',my:6}}>
      <Button variant="outlined" disabled={!accepting || sendFormEmailMutation.isPending} onClick={()=>onSendFormEmail()}>Enviar todos os e-mails</Button>
      <Button variant="outlined" disabled={!accepting || isSendingReminder} onClick={()=>void sendReminder({companyId,applicationId,reminderCount:formApplication?.reminderCount??0,reminderLimit:formApplication?.reminderLimit,isAcceptingResponses:accepting})}>Enviar reforço aos pendentes</Button>
    </Box>
    <Typography color="text.secondary">O reforço é direcionado pelo sistema, sem revelar os destinatários.</Typography>
    <Box sx={{overflowX:'auto',mt:6}}><Table size="small"><TableHead><TableRow><TableCell>Setor / agrupamento</TableCell><TableCell>Participantes</TableCell><TableCell>Responderam</TableCell><TableCell>Adesão</TableCell></TableRow></TableHead><TableBody>{(report.data?.hierarchyDistribution??[]).map((row:any)=><TableRow key={row.groupKey}><TableCell>{row.groupLabel}</TableCell><TableCell>{row.eligibleTotal}</TableCell><TableCell>{row.respondents??'Protegido'}</TableCell><TableCell>{row.responseRatePercent==null?'Protegido':`${row.responseRatePercent}%`}</TableCell></TableRow>)}</TableBody></Table></Box>
  </Box>;
}

type AnswerResult={employee:{id:number;name:string};submissions:{id:string;createdAt:string;status:string;answers:{id:string;question:string;value:string|null;options:string[]}[]}[]};
export function ParticipantAnswersDialog({companyId,applicationId,employee,onClose}:{companyId:string;applicationId:string;employee:{id:number;name:string}|null;onClose:()=>void}){
  const query=useQuery<AnswerResult>(['frps-individual-answers',companyId,applicationId,employee?.id],async()=>(await api.get(`${participantPrivacyPath(companyId,applicationId)}/${employee!.id}/answers`)).data,{enabled:!!employee,retry:false,cacheTime:0,staleTime:0});
  return <Dialog open={!!employee} onClose={onClose} maxWidth="md" fullWidth><DialogTitle>Respostas individuais — {employee?.name}
    {employee && <Button component="a" href={individualPanelUrl(companyId,applicationId,employee.id)} target="_blank" rel="noopener noreferrer" variant="contained" sx={{display:'block',mt:4,width:'fit-content'}}>Abrir painel individual</Button>}
    </DialogTitle><DialogContent>
    <Alert severity="warning" sx={{mb:6}}><Typography fontWeight={600} sx={{mb:3}}>Acesso individual sob sigilo profissional</Typography>
      <Typography variant="body2">Esta visualização exige autorização específica da empresa e destina-se ao médico do trabalho responsável, para finalidade assistencial e de proteção à saúde do trabalhador. As informações são confidenciais: utilize apenas o necessário para essa finalidade e preserve o sigilo perante gestores e terceiros.</Typography>
      <Typography variant="body2" sx={{mt:3}}>A LGPD (art. 11, II, “f”) prevê o tratamento indispensável à tutela da saúde em procedimentos realizados por profissionais ou serviços de saúde. O Código de Ética Médica (Resolução CFM nº 2.217/2018, arts. 73 e 76) estabelece os deveres de sigilo. A permissão no sistema não substitui a verificação da finalidade, da base legal e da responsabilidade profissional em cada caso.</Typography>
      <Typography variant="body2" sx={{mt:3}}>A consulta é registrada com usuário, campanha e participante. Referências: <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm" target="_blank" rel="noopener noreferrer">LGPD</a> · <a href="https://portal.cfm.org.br/images/PDF/cem2019.pdf" target="_blank" rel="noopener noreferrer">Código de Ética Médica</a>.</Typography></Alert>
    {query.isLoading&&<CircularProgress size={24}/>}
    {query.isError&&<Alert severity="error">Não foi possível consultar as respostas. Confirme sua autorização e se o participante possui respostas identificadas nesta campanha.</Alert>}
    {!query.isError&&query.data?.submissions.map(submission=><Box key={submission.id} sx={{mb:8}}><Typography fontWeight={600}>Envio em {new Date(submission.createdAt).toLocaleString('pt-BR')} · {submission.status==='TESTING'?'Teste':'Válido'}</Typography>{submission.answers.map((answer,index)=><Box key={answer.id} component="section" sx={{my:6,p:8,border:'1px solid',borderColor:'divider',borderRadius:2}}>
        <Typography variant="caption" color="text.secondary">Questão {index+1}</Typography>
        <Typography sx={{mt:2,overflowWrap:'anywhere'}}><Box component="span" fontWeight={600}>Pergunta: </Box>{stripHtmlForDisplay(answer.question)}</Typography>
        <Box sx={{mt:6,p:6,bgcolor:'action.hover',borderRadius:1}}>
          <Typography variant="body2" fontWeight={600} sx={{mb:2}}>Resposta do participante:</Typography>
          <Typography sx={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{[answer.value??'',...answer.options].map(stripHtmlForDisplay).filter(Boolean).join('; ')||'Sem resposta'}</Typography>
        </Box>
      </Box>)}</Box>)}
  </DialogContent><DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions></Dialog>;
}
