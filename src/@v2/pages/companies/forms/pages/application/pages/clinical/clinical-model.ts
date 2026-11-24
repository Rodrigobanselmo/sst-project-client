import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { buildCopsoqLongDimensionView } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildCopsoqLongDimensionView';
import { calculateFormIndicatorFromQuestions } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/calculate-form-indicator.util';
import type { RadarGroup } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/formIndicatorRadar';
import { stripHtmlForDisplay } from '../view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-explainability/strip-html-for-display.util';
export const plain = stripHtmlForDisplay;
export type ClinicalDashboard = {
  employee:{id:number;name:string}; application:{name:string;form:{id:string;name:string;indicator_hierarchy?:any}};
  submission:{id:string;created_at:string};generatedAt:string;professional:{name:string;councils:{councilType:string;councilUF:string;councilId:string}[]};
  overall:{score:number;percentage:number;hasValidAnswers:boolean;answeredItems:number};groups:any[];
  risks:{id:string;name:string;severity:number;probability:number;answeredItems:number}[];
};
export function clinicalView(data:ClinicalDashboard) {
  const model = new FormQuestionsAnswersBrowseModel({results:data.groups});
  const dimension = buildCopsoqLongDimensionView(data.application.form.id,model,data.application.form.indicator_hierarchy);
  const scaleGroups = dimension?.scaleResults ?? model.results;
  const summarize = (g:any) => calculateFormIndicatorFromQuestions(g.questions.filter((q:any)=>['RADIO','CHECKBOX','SELECT'].includes(q.details.type)).map((q:any)=>({...q,options:q.options.map((o:any)=>({...o,value:o.value?6-o.value:o.value}))})));
  const scales = scaleGroups.filter(g=>!g.identifier).map(g=>({id:g.id,name:plain(g.name),...summarize(g),dimensions:(dimension?.results??[]).filter(d=>dimension?.parentGroupIds[d.id]===g.id).map(d=>({id:d.id,name:plain(d.name),...summarize(d)}))}));
  const radar:RadarGroup[]=[{id:'individual',name:data.employee.name,protected:false,scales}];
  return {scales,radar,dimensions:scales.flatMap(s=>s.dimensions),questions:data.groups.flatMap(g=>g.questions)};
}
