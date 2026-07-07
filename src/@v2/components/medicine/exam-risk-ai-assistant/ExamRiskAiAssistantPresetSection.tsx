import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useFetchExamRiskRuleRiskToExamAiPresets } from '@v2/services/medicine/exam-risk-rule/hooks/useFetchExamRiskRuleRiskToExamAiPresets';
import {
  useMutateCreateExamRiskRuleRiskToExamAiPreset,
  useMutateDeleteExamRiskRuleRiskToExamAiPreset,
  useMutateUpdateExamRiskRuleRiskToExamAiPreset,
} from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import type {
  ICreateExamRiskRuleRiskToExamAiPresetPayload,
  IExamRiskRuleRiskToExamAiPreset,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

type Props = {
  open: boolean;
  presetName: string;
  presetDescription: string;
  onPresetNameChange: (value: string) => void;
  onPresetDescriptionChange: (value: string) => void;
  buildPresetConfig: () => ICreateExamRiskRuleRiskToExamAiPresetPayload['config'];
  onApplyPreset: (preset: IExamRiskRuleRiskToExamAiPreset) => void;
  contextNote?: string;
};

const presetLabel = (preset: IExamRiskRuleRiskToExamAiPreset) => preset.name;

export const ExamRiskAiAssistantPresetSection: FC<Props> = ({
  open,
  presetName,
  presetDescription,
  onPresetNameChange,
  onPresetDescriptionChange,
  buildPresetConfig,
  onApplyPreset,
  contextNote,
}) => {
  const [presetSearch, setPresetSearch] = useState('');
  const [selectedPreset, setSelectedPreset] =
    useState<IExamRiskRuleRiskToExamAiPreset | null>(null);
  const [presetMessage, setPresetMessage] = useState('');

  const createPresetMutation = useMutateCreateExamRiskRuleRiskToExamAiPreset();
  const updatePresetMutation = useMutateUpdateExamRiskRuleRiskToExamAiPreset();
  const deletePresetMutation = useMutateDeleteExamRiskRuleRiskToExamAiPreset();
  const {
    data: presets = [],
    isLoading: isLoadingPresets,
    refetch: refetchPresets,
  } = useFetchExamRiskRuleRiskToExamAiPresets(
    { search: presetSearch.trim() || undefined },
    open,
  );

  const presetOptions = useMemo(() => {
    const byId = new Map<string, IExamRiskRuleRiskToExamAiPreset>();
    presets.forEach((preset) => byId.set(preset.id, preset));
    if (selectedPreset) byId.set(selectedPreset.id, selectedPreset);
    return Array.from(byId.values());
  }, [presets, selectedPreset]);

  const handleApplyPreset = (preset: IExamRiskRuleRiskToExamAiPreset) => {
    setSelectedPreset(preset);
    onPresetNameChange(preset.name);
    onPresetDescriptionChange(preset.description ?? '');
    onApplyPreset(preset);
    setPresetMessage(
      contextNote
        ? `Modelo carregado. ${contextNote}`
        : 'Modelo carregado. Os riscos selecionados não foram alterados e o resultado anterior foi limpo.',
    );
  };

  const handleSaveNewPreset = () => {
    if (!presetName.trim()) {
      setPresetMessage('Informe um nome para salvar o modelo.');
      return;
    }
    createPresetMutation.mutate(
      {
        name: presetName.trim(),
        description: presetDescription.trim() || null,
        config: buildPresetConfig(),
      },
      {
        onSuccess: (preset) => {
          setSelectedPreset(preset);
          setPresetMessage(
            'Modelo salvo. Ele não inclui riscos selecionados nem resultados.',
          );
        },
      },
    );
  };

  const handleUpdatePreset = () => {
    if (!selectedPreset) return;
    if (!presetName.trim()) {
      setPresetMessage('Informe um nome para atualizar o modelo.');
      return;
    }
    updatePresetMutation.mutate(
      {
        presetId: selectedPreset.id,
        payload: {
          name: presetName.trim(),
          description: presetDescription.trim() || null,
          config: buildPresetConfig(),
        },
      },
      {
        onSuccess: (preset) => {
          setSelectedPreset(preset);
          setPresetMessage('Modelo atualizado sem alterar riscos selecionados.');
        },
      },
    );
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) return;
    const presetId = selectedPreset.id;
    deletePresetMutation.mutate(
      { presetId },
      {
        onSuccess: () => {
          setSelectedPreset(null);
          setPresetMessage('Modelo excluído/inativado.');
        },
      },
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Modelos de pesquisa</Typography>
      <Alert severity="info">
        O modelo salva apenas filtros e instruções. Ele não salva riscos
        selecionados nem resultados.
      </Alert>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <Autocomplete
          sx={{ minWidth: 360, flex: 1 }}
          options={presetOptions}
          value={selectedPreset}
          openOnFocus
          loading={isLoadingPresets}
          getOptionLabel={presetLabel}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(options) => options}
          onOpen={() => {
            setPresetSearch('');
            void refetchPresets();
          }}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') setPresetSearch(value);
            if (reason === 'clear') {
              setPresetSearch('');
              setSelectedPreset(null);
            }
          }}
          onChange={(_, value) => {
            if (value) {
              handleApplyPreset(value);
            } else {
              setSelectedPreset(null);
              setPresetSearch('');
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Carregar modelo" />
          )}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedPreset(null);
            setPresetSearch('');
            setPresetMessage(
              'Modelo carregado limpo. A configuração atual foi mantida.',
            );
          }}
        >
          Limpar modelo
        </Button>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Nome do modelo"
          value={presetName}
          onChange={(event) => onPresetNameChange(event.target.value)}
          sx={{ minWidth: 320, flex: 1 }}
        />
        <TextField
          label="Descrição do modelo"
          value={presetDescription}
          onChange={(event) => onPresetDescriptionChange(event.target.value)}
          sx={{ minWidth: 420, flex: 2 }}
        />
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
        <Button
          variant="outlined"
          onClick={handleSaveNewPreset}
          disabled={createPresetMutation.isPending}
        >
          Salvar modelo
        </Button>
        <Button
          variant="outlined"
          onClick={handleUpdatePreset}
          disabled={!selectedPreset || updatePresetMutation.isPending}
        >
          Atualizar modelo
        </Button>
        <Button
          color="warning"
          variant="outlined"
          onClick={handleDeletePreset}
          disabled={!selectedPreset || deletePresetMutation.isPending}
        >
          Excluir
        </Button>
        {selectedPreset && (
          <Chip variant="outlined" label={`Carregado: ${selectedPreset.name}`} />
        )}
      </Box>

      {presetMessage && <Alert severity="info">{presetMessage}</Alert>}
    </Stack>
  );
};
