import { FormQuestionsAnswersAnalysisBrowseResultModel } from './form-questions-answers-analysis-browse-result.model';

export type AnalysisItemInventoryEntry = {
  existsInInventory: boolean;
  existsInCatalog: boolean;
  /** Catálogo local resolvido; client monta itemKey = catalog:{itemType}:{catalogId}. */
  catalogId?: string | null;
};

export type AnalysisItemInventoryStatus = {
  fontesGeradoras: AnalysisItemInventoryEntry[];
  medidasEngenhariaRecomendadas: AnalysisItemInventoryEntry[];
  medidasAdministrativasRecomendadas: AnalysisItemInventoryEntry[];
};

export type AnalysisInventoryStatusMap = Record<string, AnalysisItemInventoryStatus>;

export type IFormQuestionsAnswersAnalysisBrowseModel = {
  results: FormQuestionsAnswersAnalysisBrowseResultModel[];
  analysisInventoryStatus?: AnalysisInventoryStatusMap;
};

export class FormQuestionsAnswersAnalysisBrowseModel {
  results: FormQuestionsAnswersAnalysisBrowseResultModel[];
  analysisInventoryStatus?: AnalysisInventoryStatusMap;

  constructor(params: IFormQuestionsAnswersAnalysisBrowseModel) {
    this.results = params.results.map(
      (result) => new FormQuestionsAnswersAnalysisBrowseResultModel(result),
    );
    this.analysisInventoryStatus = params.analysisInventoryStatus;
  }
}
