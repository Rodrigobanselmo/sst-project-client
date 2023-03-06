import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IProfessionalToDocumentData } from '../../../../../../interfaces/api/IProfessional';
import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertPGRDocumentData {
  id?: string;
  name?: string;
  status?: StatusEnum;
  workspaceId?: string;
  companyId?: string;
  validityEnd?: Date;
  validityStart?: Date;
  type?: DocumentTypeEnum;

  elaboratedBy?: string;
  revisionBy?: string;
  approvedBy?: string;
  coordinatorBy?: string;
  professionals?: (IProfessional | IProfessionalToDocumentData)[];

  json?: {
    source?: string;
    visitDate?: Date;
    isQ5?: boolean;
    hasEmergencyPlan?: boolean;
    complementaryDocs?: string[];
    complementarySystems?: string[];
  };
}

export async function upsertDocumentData(
  data: IUpsertPGRDocumentData,
  companyId?: string,
) {
  if (!companyId) return null;
  data.type = DocumentTypeEnum.PGR;

  if (data?.professionals)
    data.professionals = data?.professionals?.map((professional) => {
      if ('isSigner' in professional) return professional;

      return {
        professionalId: professional.id,
        isSigner: professional.professionalDocumentDataSignature?.isSigner,
        isElaborator:
          professional.professionalDocumentDataSignature?.isElaborator,
      };
    }) as any;

  const response = await api.post<IRiskGroupData>(
    `${ApiRoutesEnum.DOCUMENT_DATA}/pgr`.replace(':companyId', companyId),
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertPGRDocumentData() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertPGRDocumentData) =>
      upsertDocumentData({ ...data }, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.DOCUMENT_DATA]);

        enqueueSnackbar('Documento editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
