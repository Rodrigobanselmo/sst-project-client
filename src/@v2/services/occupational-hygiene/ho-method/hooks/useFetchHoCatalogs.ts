import { useFetch } from '@v2/hooks/api/useFetch';

import {
  browseHoExtractionSolvents,
  browseHoLaboratories,
  browseHoSamplers,
} from '../service/ho-method.service';
import { hoMethodQueryKeys } from './ho-method.query-keys';

export const useFetchBrowseHoSamplers = (search?: string, enabled = true) => {
  return useFetch({
    queryKey: [...hoMethodQueryKeys.samplers(search ?? '')],
    queryFn: () => browseHoSamplers(search),
    enabled,
    refetchOnMount: true,
  });
};

export const useFetchBrowseHoExtractionSolvents = (
  search?: string,
  enabled = true,
) => {
  return useFetch({
    queryKey: [...hoMethodQueryKeys.extractionSolvents(search ?? '')],
    queryFn: () => browseHoExtractionSolvents(search),
    enabled,
    refetchOnMount: true,
  });
};

export const useFetchBrowseHoLaboratories = (
  search?: string,
  enabled = true,
) => {
  return useFetch({
    queryKey: [...hoMethodQueryKeys.laboratories(search ?? '')],
    queryFn: () => browseHoLaboratories(search),
    enabled,
    refetchOnMount: true,
  });
};
