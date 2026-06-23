export type AnalysisItemCodeType =
  | 'fontesGeradoras'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

export type AnalysisItemCodeEntry = {
  code: string;
  itemType: AnalysisItemCodeType;
  itemIndex: number;
  nome: string;
};

export type AnalysisItemCodeRegistry = {
  entries: AnalysisItemCodeEntry[];
  getCode: (itemType: AnalysisItemCodeType, itemIndex: number) => string | undefined;
};

type AnalysisContentForCodes = {
  fontesGeradoras?: Array<{ nome: string }>;
  medidasEngenhariaRecomendadas?: Array<{ nome: string }>;
  medidasAdministrativasRecomendadas?: Array<{ nome: string }>;
};

export function buildAnalysisItemCodeRegistry(
  analysisContent?: AnalysisContentForCodes | null,
): AnalysisItemCodeRegistry {
  const entries: AnalysisItemCodeEntry[] = [];

  analysisContent?.fontesGeradoras?.forEach((item, index) => {
    entries.push({
      code: `F${index + 1}`,
      itemType: 'fontesGeradoras',
      itemIndex: index,
      nome: item.nome,
    });
  });

  const engCount = analysisContent?.medidasEngenhariaRecomendadas?.length ?? 0;

  analysisContent?.medidasEngenhariaRecomendadas?.forEach((item, index) => {
    entries.push({
      code: `R${index + 1}`,
      itemType: 'medidasEngenhariaRecomendadas',
      itemIndex: index,
      nome: item.nome,
    });
  });

  analysisContent?.medidasAdministrativasRecomendadas?.forEach((item, index) => {
    entries.push({
      code: `R${engCount + index + 1}`,
      itemType: 'medidasAdministrativasRecomendadas',
      itemIndex: index,
      nome: item.nome,
    });
  });

  const codeByKey = new Map(
    entries.map((entry) => [`${entry.itemType}:${entry.itemIndex}`, entry.code]),
  );

  return {
    entries,
    getCode: (itemType, itemIndex) => codeByKey.get(`${itemType}:${itemIndex}`),
  };
}

export function resolveAnalysisItemCode(
  analysisContent: AnalysisContentForCodes | null | undefined,
  itemType: AnalysisItemCodeType,
  itemIndex: number,
): string | undefined {
  return buildAnalysisItemCodeRegistry(analysisContent).getCode(itemType, itemIndex);
}
