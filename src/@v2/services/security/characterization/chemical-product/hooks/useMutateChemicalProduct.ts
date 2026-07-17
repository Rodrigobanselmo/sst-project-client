import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  activateChemicalFispqDocument,
  archiveChemicalProduct,
  commitChemicalExcelImport,
  createChemicalFispqDocument,
  createCompositionVersion,
  createFromFispqChemicalProduct,
  createManualChemicalProduct,
  createPureChemicalProduct,
  downloadChemicalExcelTemplate,
  exportChemicalExcel,
  hardDeleteChemicalProduct,
  parseChemicalFispqPdf,
  previewChemicalExcelImport,
  restoreChemicalProduct,
  setChemicalFispqEmployeeVisibility,
  updateChemicalProduct,
  uploadChemicalFispqFile,
} from '../service/chemical-product.service';
import { chemicalProductQueryKeys } from './chemical-product.query-keys';

const invalidateChemicalProducts = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: chemicalProductQueryKeys.all });
};

export const useMutateChemicalProduct = () => {
  const queryClient = useQueryClient();

  const createManual = useMutation({
    mutationFn: createManualChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const createPure = useMutation({
    mutationFn: createPureChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const createFromFispq = useMutation({
    mutationFn: createFromFispqChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const updateProduct = useMutation({
    mutationFn: updateChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const archive = useMutation({
    mutationFn: archiveChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const restore = useMutation({
    mutationFn: restoreChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const hardDelete = useMutation({
    mutationFn: hardDeleteChemicalProduct,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const createComposition = useMutation({
    mutationFn: createCompositionVersion,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const parseFispq = useMutation({
    mutationFn: parseChemicalFispqPdf,
  });

  const uploadFispqFile = useMutation({
    mutationFn: uploadChemicalFispqFile,
  });

  const createFispq = useMutation({
    mutationFn: createChemicalFispqDocument,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const setVisibility = useMutation({
    mutationFn: setChemicalFispqEmployeeVisibility,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const activateFispq = useMutation({
    mutationFn: activateChemicalFispqDocument,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  const downloadExcelTemplate = useMutation({
    mutationFn: downloadChemicalExcelTemplate,
  });

  const exportExcel = useMutation({
    mutationFn: exportChemicalExcel,
  });

  const previewExcelImport = useMutation({
    mutationFn: previewChemicalExcelImport,
  });

  const commitExcelImport = useMutation({
    mutationFn: commitChemicalExcelImport,
    onSuccess: () => invalidateChemicalProducts(queryClient),
  });

  return {
    createManual,
    createPure,
    createFromFispq,
    updateProduct,
    archive,
    restore,
    hardDelete,
    createComposition,
    parseFispq,
    uploadFispqFile,
    createFispq,
    setVisibility,
    activateFispq,
    downloadExcelTemplate,
    exportExcel,
    previewExcelImport,
    commitExcelImport,
  };
};
