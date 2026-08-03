import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createCharacterizationAiProfile,
  duplicateCharacterizationAiProfile,
  generateCharacterizationAiProfileDraft,
  setCharacterizationAiProfileDefault,
  setCharacterizationAiProfileStatus,
  setCharacterizationAiProfileTypeDefault,
  transcribeCharacterizationAiProfileAudio,
  updateCharacterizationAiProfile,
} from '../service/characterization-ai-profile.service';
import { characterizationAiProfileQueryKeys } from './characterization-ai-profile.query-keys';

const invalidateProfiles = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({
    queryKey: characterizationAiProfileQueryKeys.all,
  });
};

export const useMutateCharacterizationAiProfile = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createCharacterizationAiProfile,
    onSuccess: () => invalidateProfiles(queryClient),
  });

  const update = useMutation({
    mutationFn: updateCharacterizationAiProfile,
    onSuccess: () => invalidateProfiles(queryClient),
  });

  const duplicate = useMutation({
    mutationFn: duplicateCharacterizationAiProfile,
    onSuccess: () => invalidateProfiles(queryClient),
  });

  const setStatus = useMutation({
    mutationFn: setCharacterizationAiProfileStatus,
    onSuccess: () => invalidateProfiles(queryClient),
  });

  const setDefault = useMutation({
    mutationFn: setCharacterizationAiProfileDefault,
    onSuccess: () => invalidateProfiles(queryClient),
  });

  const setTypeDefault = useMutation({
    mutationFn: setCharacterizationAiProfileTypeDefault,
    onSuccess: () => invalidateProfiles(queryClient),
  });

  const transcribe = useMutation({
    mutationFn: transcribeCharacterizationAiProfileAudio,
  });

  const generateDraft = useMutation({
    mutationFn: generateCharacterizationAiProfileDraft,
  });

  return {
    create,
    update,
    duplicate,
    setStatus,
    setDefault,
    setTypeDefault,
    transcribe,
    generateDraft,
  };
};
