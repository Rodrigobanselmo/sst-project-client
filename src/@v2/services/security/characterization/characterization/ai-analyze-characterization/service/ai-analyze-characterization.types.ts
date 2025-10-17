export interface AiAnalyzeCharacterizationParams {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  customPrompt?: string;
  model?: string; // Optional AI model to use (e.g., 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo')
}

export type DetailedRisk = {
  id: string;
  name: string;
  type: string;
  explanation: string;
  generateSource: string;
  probability: number; // 1-5 scale
  existingControls: string;
  engineeringMeasures: string[];
  administrativeMeasures: string[];
  confidence: number;
};

export type Result = {
  analysis: string;
  confidence: number;
  recommendedRisks: string[]; // Array of risk UUIDs recommended by AI
  detailedRisks: DetailedRisk[]; // Detailed information about each recommended risk
  metadata?: Record<string, any>;
  characterization: {
    id: string;
    name: string;
    type: string;
  };
};
