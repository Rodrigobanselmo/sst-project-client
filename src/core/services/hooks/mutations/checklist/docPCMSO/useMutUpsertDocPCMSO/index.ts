import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IDocumentPCMSO } from 'core/interfaces/api/IDocumentPCMSO';
import {
  IProfessional,
  IProfessionalToDocumentPCMSO,
} from 'core/interfaces/api/IProfessional';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpsertDocumentPCMSO {
  id?: string;
  name?: string;
  status?: StatusEnum;
  elaboratedBy?: string;
  revisionBy?: string;
  approvedBy?: string;
  source?: string;
  visitDate?: Date;
  companyId?: string;
  coordinatorBy?: string;
  validityEnd?: Date;
  validityStart?: Date;
  // users?: (IUser | IUserToRiskGroup)[];
  professionals?: (IProfessional | IProfessionalToDocumentPCMSO)[];
  professionalsIds?: string[];
}

export async function upsertDocumentPCMSO(
  data: IUpsertDocumentPCMSO,
  companyId?: string,
) {
  if (!companyId) return null;

  // if (data?.users)
  //   data.users = data?.users?.map((user) => {
  //     if ('isSigner' in user) return user;

  //     return {
  //       userId: user.id,
  //       isSigner: user.userPgrSignature?.isSigner,
  //     };
  //   }) as any;

  if (data?.professionals)
    data.professionals = data?.professionals?.map((professional) => {
      if ('isSigner' in professional) return professional;

      return {
        professionalId: professional.id,
        isSigner: professional.professionalPgrSignature?.isSigner,
        isElaborator: professional.professionalPgrSignature?.isElaborator,
      };
    }) as any;

  const response = await api.post<IDocumentPCMSO>(
    `${ApiRoutesEnum.DOCUMENT_PCMSO}`,
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertDocumentPCMSO() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertDocumentPCMSO) =>
      upsertDocumentPCMSO({ ...data }, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([
          QueryEnum.DOCUMENT_PCMSO,
          getCompanyId(resp),
        ]);

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
