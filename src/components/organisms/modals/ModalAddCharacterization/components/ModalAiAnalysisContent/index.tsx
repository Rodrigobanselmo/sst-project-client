import React, { useState } from 'react';

import {
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SButton } from '@v2/components/atoms/SButton/SButton';

import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSelectForm } from '@v2/components/forms/controlled/SSelectForm/SSelectForm';
import { useForm, FormProvider } from 'react-hook-form';

import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import { Result } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';

interface AiAnalysisFormData {
  customPrompt?: string;
  model?: {
    label: string;
    value: string;
  };
}

const AI_MODEL_OPTIONS = [
  // GPT-5 Series
  { label: 'GPT-5 (Premium) - $0.625/$5.00', value: 'gpt-5' },
  { label: 'GPT-5 Mini (Balanceado) - $0.125/$1.00', value: 'gpt-5-mini' },
  { label: 'GPT-5 Nano (Ultra Rápido) - $0.025/$0.20', value: 'gpt-5-nano' },
  // {
  //   label: 'GPT-5 Pro (Máxima Performance) - $7.50/$60.00',
  //   value: 'gpt-5-pro',
  // },

  // GPT-4.1 Series
  { label: 'GPT-4.1 (Avançado) - $1.00/$4.00', value: 'gpt-4.1' },
  { label: 'GPT-4.1 Mini (Eficiente) - $0.20/$0.80', value: 'gpt-4.1-mini' },
  { label: 'GPT-4.1 Nano (Econômico) - $0.05/$0.20', value: 'gpt-4.1-nano' },

  // GPT-4o Series
  { label: 'GPT-4o (Recomendado) - $1.25/$5.00', value: 'gpt-4o' },
  {
    label: 'GPT-4o 2024-05-13 (Versão Específica) - $2.50/$7.50',
    value: 'gpt-4o-2024-05-13',
  },
  { label: 'GPT-4o Mini (Rápido) - $0.075/$0.30', value: 'gpt-4o-mini' },

  // O1 Series
  // { label: 'O1 (Raciocínio Avançado) - $7.50/$30.00', value: 'o1' },
  // { label: 'O1 Pro (Raciocínio Premium) - $75.00/$300.00', value: 'o1-pro' },
  { label: 'O1 Mini (Raciocínio Rápido) - $0.55/$2.20', value: 'o1-mini' },

  // O3 Series
  // { label: 'O3 Pro (Pesquisa Avançada) - $10.00/$40.00', value: 'o3-pro' },
  // { label: 'O3 (Análise Profunda) - $1.00/$4.00', value: 'o3' },
  // {
  //   label: 'O3 Deep Research (Pesquisa Especializada) - $5.00/$20.00',
  //   value: 'o3-deep-research',
  // },
  { label: 'O3 Mini (Análise Rápida) - $0.55/$2.20', value: 'o3-mini' },

  // O4 Series
  { label: 'O4 Mini (Nova Geração) - $0.55/$2.20', value: 'o4-mini' },
  {
    label: 'O4 Mini Deep Research (Pesquisa Nova Geração) - $1.00/$4.00',
    value: 'o4-mini-deep-research',
  },
];

export const ModalAiAnalysisContent = ({
  data: characterizationData,
}: IUseEditCharacterization) => {
  const methods = useForm<AiAnalysisFormData>();
  const { handleSubmit } = methods;
  const [analysisResult, setAnalysisResult] = useState<Result | null>(null);

  const aiAnalyzeMutation = useMutateAiAnalyzeCharacterization();

  const onSubmit = async (formData: AiAnalysisFormData) => {
    if (
      !characterizationData.id ||
      !characterizationData.companyId ||
      !characterizationData.workspaceId
    ) {
      return;
    }

    try {
      const result = await aiAnalyzeMutation.mutateAsync({
        companyId: characterizationData.companyId,
        workspaceId: characterizationData.workspaceId,
        characterizationId: characterizationData.id,
        customPrompt: formData.customPrompt,
        model: formData.model?.value,
      });

      setAnalysisResult(result);
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  const isDisabled = !characterizationData.id;

  return (
    <FormProvider {...methods}>
      <Box sx={{ px: 5, pb: 10 }}>
        <SFlex direction="column" gap={4}>
          <SText variant="h6" color="text.primary">
            Análise de IA da Caracterização
          </SText>

          {isDisabled ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 8,
              }}
            >
              <SText variant="body1" textAlign="center" color="text.secondary">
                Salve a caracterização primeiro para utilizar a análise de IA
              </SText>
            </Box>
          ) : (
            <>
              <Box>
                <SFlex direction="column" gap={3}>
                  <SSelectForm
                    label="Modelo de IA"
                    name="model"
                    options={AI_MODEL_OPTIONS}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                  />

                  <SInputMultilineForm
                    label="Prompt Personalizado (Opcional)"
                    name="customPrompt"
                    placeholder="Digite instruções específicas para a análise de IA..."
                    inputProps={{
                      minRows: 4,
                      maxRows: 8,
                    }}
                  />

                  <SButton
                    text="Analisar com IA"
                    variant="contained"
                    color="primary"
                    loading={aiAnalyzeMutation.isPending}
                    onClick={handleSubmit(onSubmit)}
                    buttonProps={{
                      sx: { alignSelf: 'flex-start' },
                    }}
                  />
                </SFlex>
              </Box>

              {analysisResult && (
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 3,
                    backgroundColor: 'background.paper',
                    mt: 3,
                  }}
                >
                  <SFlex direction="column" gap={3}>
                    <SText variant="subtitle2" color="text.primary">
                      Resultado da Análise de IA
                    </SText>

                    {/* Detailed Risks */}
                    {analysisResult.detailedRisks.length > 0 && (
                      <Box>
                        <SText variant="body1" color="text.primary" mb={2}>
                          <strong>Detalhes dos Riscos:</strong>
                        </SText>
                        <SFlex direction="column" gap={2}>
                          {analysisResult.detailedRisks.map((risk, index) => (
                            <Accordion key={index}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <SFlex
                                  direction="row"
                                  alignItems="center"
                                  gap={2}
                                >
                                  <SText variant="subtitle2">{risk.name}</SText>
                                  <Chip
                                    label={`Prob: ${risk.probability}/5`}
                                    size="small"
                                    color={
                                      risk.probability >= 4
                                        ? 'error'
                                        : risk.probability >= 3
                                          ? 'warning'
                                          : 'success'
                                    }
                                  />
                                  <Chip
                                    label={`Conf: ${Math.round(risk.confidence * 100)}%`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </SFlex>
                              </AccordionSummary>
                              <AccordionDetails>
                                <SFlex direction="column" gap={2}>
                                  <Box>
                                    <SText variant="body2" color="text.primary">
                                      <strong>Tipo:</strong> {risk.type}
                                    </SText>
                                  </Box>
                                  <Box>
                                    <SText variant="body2" color="text.primary">
                                      <strong>Explicação:</strong>
                                    </SText>
                                    <SText
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {risk.explanation}
                                    </SText>
                                  </Box>
                                  <Box>
                                    <SText variant="body2" color="text.primary">
                                      <strong>Fonte Geradora:</strong>
                                    </SText>
                                    <SText
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {risk.generateSource}
                                    </SText>
                                  </Box>
                                  <Box>
                                    <SText variant="body2" color="text.primary">
                                      <strong>Controles Existentes:</strong>
                                    </SText>
                                    <SText
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {risk.existingControls}
                                    </SText>
                                  </Box>
                                  {risk.engineeringMeasures.length > 0 && (
                                    <Box>
                                      <SText
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        <strong>Medidas de Engenharia:</strong>
                                      </SText>
                                      <ul
                                        style={{
                                          margin: 0,
                                          paddingLeft: '20px',
                                        }}
                                      >
                                        {risk.engineeringMeasures.map(
                                          (measure, idx) => (
                                            <li key={idx}>
                                              <SText
                                                variant="body2"
                                                color="text.secondary"
                                              >
                                                {measure}
                                              </SText>
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </Box>
                                  )}
                                  {risk.administrativeMeasures.length > 0 && (
                                    <Box>
                                      <SText
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        <strong>
                                          Medidas Administrativas:
                                        </strong>
                                      </SText>
                                      <ul
                                        style={{
                                          margin: 0,
                                          paddingLeft: '20px',
                                        }}
                                      >
                                        {risk.administrativeMeasures.map(
                                          (measure, idx) => (
                                            <li key={idx}>
                                              <SText
                                                variant="body2"
                                                color="text.secondary"
                                              >
                                                {measure}
                                              </SText>
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </Box>
                                  )}
                                </SFlex>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </SFlex>
                      </Box>
                    )}

                    {/* Characterization Info */}
                    <Box
                      sx={{
                        border: '1px solid #f0f0f0',
                        borderRadius: 1,
                        p: 2,
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <SText variant="caption" color="text.secondary">
                        <strong>Caracterização Analisada:</strong>{' '}
                        {analysisResult.characterization.name}
                      </SText>
                      <SText
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        <strong>Tipo:</strong>{' '}
                        {analysisResult.characterization.type}
                      </SText>
                    </Box>
                  </SFlex>
                </Box>
              )}

              {characterizationData.name && (
                <Box
                  sx={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <SText variant="caption" color="text.secondary">
                    <strong>Caracterização:</strong> {characterizationData.name}
                  </SText>
                  {characterizationData.description && (
                    <SText
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={1}
                    >
                      <strong>Descrição:</strong>{' '}
                      {characterizationData.description}
                    </SText>
                  )}
                </Box>
              )}
            </>
          )}
        </SFlex>
      </Box>
    </FormProvider>
  );
};
