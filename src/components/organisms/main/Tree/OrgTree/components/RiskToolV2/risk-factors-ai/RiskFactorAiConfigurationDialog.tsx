import { transcribeAiAnalyzeHierarchyAudio } from '@v2/services/security/hierarchy/ai-analyze-hierarchy-risk.service';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { AiAnalyzeGuidanceAudioField } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';
import { appendTranscribedGuidance } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util';
import { transcribeAiAnalyzeGseAudio } from '@v2/services/security/homogeneous-group/ai-analyze-gse/service/transcribe-ai-analyze-gse-audio.service';
import { GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE } from 'components/organisms/modals/ModalAddGHO/gse-ai-analyze.constants';
import type { RiskFactorAiSelectedField } from './risk-factors-ai-scope.util';

const GROUPS: Array<{
  title: string;
  fields: Array<{ field: RiskFactorAiSelectedField; label: string }>;
}> = [
  {
    title: 'Fontes geradoras',
    fields: [{ field: 'generateSource', label: 'Fontes geradoras' }],
  },
  {
    title: 'Medidas de controle existentes',
    fields: [
      { field: 'existingEngineeringMeasures', label: 'EPC / Engenharia' },
      {
        field: 'existingAdministrativeMeasures',
        label: 'Medidas administrativas',
      },
    ],
  },
  {
    title: 'Recomendações',
    fields: [
      { field: 'recommendedEngineeringMeasures', label: 'EPC / Engenharia' },
      {
        field: 'recommendedAdministrativeMeasures',
        label: 'Medidas administrativas',
      },
    ],
  },
  {
    title: 'Probabilidade',
    fields: [{ field: 'probability', label: 'Probabilidade efetiva' }],
  },
];

const ALL_FIELDS = GROUPS.flatMap((group) =>
  group.fields.map(({ field }) => field),
);

type Props = {
  riskName: string;
  target: {
    kind: 'gse' | 'characterization' | 'hierarchy';
    hierarchyType?: string;
    companyId: string;
    workspaceId: string;
    entityId: string;
    missingWorkspace?: boolean;
  };
  onClose: () => void;
  onGenerate: (configuration: {
    selectedFields: RiskFactorAiSelectedField[];
    userGuidance: string;
  }) => void;
};

export function RiskFactorAiConfigurationDialog({
  riskName,
  target,
  onClose,
  onGenerate,
}: Props) {
  const [selectedFields, setSelectedFields] = useState<
    RiskFactorAiSelectedField[]
  >(() => [...ALL_FIELDS]);
  const allSelected = ALL_FIELDS.every((field) =>
    selectedFields.includes(field),
  );
  const [userGuidance, setUserGuidance] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const submitted = useRef(false);
  const blocked =
    !selectedFields.length ||
    audioBusy ||
    target.missingWorkspace ||
    !target.workspaceId;

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="risk-ai-configuration-title"
    >
      <DialogTitle id="risk-ai-configuration-title">
        Analisar fator de risco com IA
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {riskName}
        </Typography>
        {(target.missingWorkspace || !target.workspaceId) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE}
          </Alert>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
            mb: 1,
          }}
        >
          <Typography variant="subtitle1">
            O que você deseja analisar?
          </Typography>
          <Button
            variant="text"
            size="small"
            sx={{ ml: 'auto', textTransform: 'none', color: 'text.secondary' }}
            onClick={() =>
              setSelectedFields((current) =>
                ALL_FIELDS.every((field) => current.includes(field))
                  ? []
                  : [...ALL_FIELDS],
              )
            }
          >
            {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
          </Button>
        </Box>
        {GROUPS.map((group) => (
          <Box
            key={group.title}
            component="fieldset"
            sx={{ border: 0, p: 0, m: 0, mb: 1.5 }}
          >
            <Typography component="legend" variant="subtitle2">
              {group.title}
            </Typography>
            <FormGroup>
              {group.fields.map(({ field, label }) => (
                <FormControlLabel
                  key={field}
                  label={label}
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field)}
                      onChange={(_, checked) =>
                        setSelectedFields((current) =>
                          checked
                            ? [...current, field]
                            : current.filter((item) => item !== field),
                        )
                      }
                    />
                  }
                />
              ))}
            </FormGroup>
          </Box>
        ))}
        <AiAnalyzeGuidanceAudioField
          label="Orientações adicionais para a IA (opcional)"
          companyId={target.companyId}
          workspaceId={target.workspaceId}
          characterizationId={
            target.kind === 'characterization' ? target.entityId : undefined
          }
          transcribe={
            target.kind === 'hierarchy'
              ? ({ audio, fileName }) =>
                  transcribeAiAnalyzeHierarchyAudio({
                    companyId: target.companyId,
                    workspaceId: target.workspaceId,
                    hierarchyId: target.entityId,
                    hierarchyType: target.hierarchyType!,
                    audio,
                    fileName,
                  })
              : target.kind === 'gse'
                ? ({ audio, fileName }) =>
                    transcribeAiAnalyzeGseAudio({
                      companyId: target.companyId,
                      workspaceId: target.workspaceId,
                      gseId: target.entityId,
                      audio,
                      fileName,
                    })
                : undefined
          }
          value={userGuidance}
          onChange={setUserGuidance}
          disabled={!target.workspaceId || target.missingWorkspace}
          onBusyChange={setAudioBusy}
          onTranscription={(text) =>
            setUserGuidance((current) =>
              appendTranscribedGuidance(current, text),
            )
          }
        />
      </DialogContent>
      <DialogActions>
        <SButton
          text="Cancelar"
          variant="outlined"
          size="s"
          onClick={onClose}
        />
        <SButton
          text="Gerar sugestões com IA"
          variant="shade"
          size="s"
          disabled={!!blocked}
          onClick={() => {
            if (blocked || submitted.current) return;
            submitted.current = true;
            onGenerate({ selectedFields, userGuidance });
          }}
        />
      </DialogActions>
    </Dialog>
  );
}
