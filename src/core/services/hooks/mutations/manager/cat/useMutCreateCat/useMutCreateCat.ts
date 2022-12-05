import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICat } from 'core/interfaces/api/ICat';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateCat {
  dtAcid: Date;
  dtObito?: Date;
  ultDiaTrab?: Date;
  dtAtendimento: Date;
  tpAcid: number;
  tpCat: number;
  iniciatCAT: number;
  tpLocal: number;
  ideLocalAcidTpInsc?: number;
  lateralidade: number;
  durTrat: number;
  docId: number;
  employeeId: number;
  catOriginId: number;
  hrAcid?: string;
  hrsTrabAntesAcid?: string;
  codSitGeradora: string;
  obsCAT?: string;
  dscLocal: string;
  tpLograd?: string;
  dscLograd: string;
  nrLograd: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  codMunic?: string;
  uf?: string;
  pais?: string;
  codPostal?: string;
  ideLocalAcidCnpj?: string;
  codParteAting: string;
  codAgntCausador: string;
  hrAtendimento: string;
  dscLesao: string;
  dscCompLesao?: string;
  diagProvavel?: string;
  codCID: string;
  observacao?: string;
  nrRecCatOrig?: string;
  isIndComunPolicia?: boolean;
  houveAfast?: boolean;
  isIndInternacao: boolean;
  isIndAfast: boolean;
  companyId: string;
  status: StatusEnum;
}

export async function upsertRiskDocs(data: ICreateCat, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<ICat>(
    ApiRoutesEnum.CATS.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateCat() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateCat) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.CATS]);

        enqueueSnackbar('CAT criado com sucesso', {
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
