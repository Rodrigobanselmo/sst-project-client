import { useMutation } from '@tanstack/react-query';
import {
  generateFrpsContextualExplanation,
  generateFrpsItemExplanation,
  patchConceptualExplanation,
  patchContextualExplanation,
  readFrpsItemExplanation,
  rejectConceptualExplanation,
  rejectContextualExplanation,
  validateConceptualExplanation,
  validateContextualExplanation,
} from './frps-explainability.service';
import type {
  GenerateFrpsItemExplanationParams,
  ReadFrpsItemExplanationParams,
} from './frps-explainability.types';

export function useMutateReadFrpsItemExplanation() {
  return useMutation({
    mutationFn: (params: ReadFrpsItemExplanationParams) =>
      readFrpsItemExplanation(params),
  });
}

export function useMutateGenerateFrpsItemExplanation() {
  return useMutation({
    mutationFn: (params: GenerateFrpsItemExplanationParams) =>
      generateFrpsItemExplanation(params),
  });
}

export function useMutateGenerateFrpsContextualExplanation() {
  return useMutation({
    mutationFn: (
      params: Omit<GenerateFrpsItemExplanationParams, 'conceptualModel'>,
    ) => generateFrpsContextualExplanation(params),
  });
}

export function useMutatePatchConceptualExplanation() {
  return useMutation({
    mutationFn: patchConceptualExplanation,
  });
}

export function useMutatePatchContextualExplanation() {
  return useMutation({
    mutationFn: patchContextualExplanation,
  });
}

export function useMutateValidateConceptualExplanation() {
  return useMutation({
    mutationFn: (id: string) => validateConceptualExplanation(id),
  });
}

export function useMutateValidateContextualExplanation() {
  return useMutation({
    mutationFn: (id: string) => validateContextualExplanation(id),
  });
}

export function useMutateRejectConceptualExplanation() {
  return useMutation({
    mutationFn: (id: string) => rejectConceptualExplanation(id),
  });
}

export function useMutateRejectContextualExplanation() {
  return useMutation({
    mutationFn: (id: string) => rejectContextualExplanation(id),
  });
}
