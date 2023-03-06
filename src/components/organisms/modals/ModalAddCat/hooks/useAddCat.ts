import { useCallback, useEffect, useRef, useState } from 'react';

import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  ICat,
  isAskCompany,
  isCepRequired,
  isCityUfRequired,
  isCountryRequired,
  isHrsWorked,
  isLocalEmpty,
  isOriginCat,
  isShowOriginCat,
  isWithDeath,
} from 'core/interfaces/api/ICat';
import { ICid } from 'core/interfaces/api/ICid';
import {
  IEsocialTable13Body,
  IEsocialTable14And15Acid,
  IEsocialTable17Injury,
  IEsocialTable18Mot,
  IEsocialTable20Lograd,
  IEsocialTable6Country,
} from 'core/interfaces/api/IEsocial';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { ICities } from 'core/interfaces/api/IUFCities';
import { useMutationCEP } from 'core/services/hooks/mutations/general/useMutationCep';
import { useMutationCNPJ } from 'core/services/hooks/mutations/general/useMutationCnpj';
import { useMutCreateCat } from 'core/services/hooks/mutations/manager/cat/useMutCreateCat/useMutCreateCat';
import { useMutDeleteCat } from 'core/services/hooks/mutations/manager/cat/useMutDeleteCat/useMutDeleteCat';
import { useMutUpdateCat } from 'core/services/hooks/mutations/manager/cat/useMutUpdateCat/useMutUpdateCat';
import { useQueryCat } from 'core/services/hooks/queries/useQueryCat/useQueryCat';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryEmployee } from 'core/services/hooks/queries/useQueryEmployee/useQueryEmployee';
import { useQueryEsocial18Tables } from 'core/services/hooks/queries/useQueryEsocial18/useQueryEsocial18';
import { cleanObjectNullValues } from 'core/utils/helpers/cleanObjectValues';

import { IEmployee } from '../../../../../core/interfaces/api/IEmployee';

export const initialCatState = {
  id: 0,
  companyId: undefined as string | undefined,
  dtAcid: undefined as undefined | Date,
  dtAtendimento: undefined as undefined | Date,
  tpAcid: undefined as undefined | number,
  tpCat: undefined as undefined | number,
  iniciatCAT: undefined as undefined | number,
  tpLocal: undefined as undefined | number,
  lateralidade: undefined as undefined | number,
  durTrat: undefined as undefined | number,
  docId: undefined as undefined | number,
  employeeId: undefined as undefined | number,
  codSitGeradora: undefined as undefined | string,
  dscLocal: undefined as undefined | string,
  dscLograd: undefined as undefined | string,
  nrLograd: undefined as undefined | string,
  codParteAting: undefined as undefined | string,
  codAgntCausador: undefined as undefined | string,
  hrAtendimento: undefined as undefined | string,
  dscLesao: undefined as undefined | string,
  codCID: undefined as undefined | string,
  isIndInternacao: undefined as undefined | boolean,
  isIndAfast: undefined as undefined | boolean,
  status: undefined as undefined | StatusEnum,

  dtObito: undefined as undefined | Date,
  ultDiaTrab: undefined as undefined | Date,
  ideLocalAcidTpInsc: 1 as undefined | number,
  hrAcid: undefined as undefined | string,
  hrsTrabAntesAcid: undefined as undefined | string,
  obsCAT: undefined as undefined | string,
  tpLograd: undefined as undefined | string,
  complemento: undefined as undefined | string,
  bairro: undefined as undefined | string,
  cep: undefined as undefined | string,
  codMunic: undefined as undefined | string,
  uf: undefined as undefined | string,
  pais: undefined as undefined | string,
  codPostal: undefined as undefined | string,
  ideLocalAcidCnpj: undefined as undefined | string,
  dscCompLesao: undefined as undefined | string,
  diagProvavel: undefined as undefined | string,
  observacao: undefined as undefined | string,
  catOriginId: undefined as undefined | number,
  isIndComunPolicia: undefined as undefined | boolean,
  houveAfast: undefined as undefined | boolean,

  catOrigin: undefined as undefined | ICat,
  doc: undefined as undefined | IProfessional,
  esocialSitGeradora: undefined as undefined | IEsocialTable14And15Acid,
  esocialLograd: undefined as undefined | IEsocialTable20Lograd,
  countryCodeEsocial6: undefined as undefined | IEsocialTable6Country,
  cid: undefined as undefined | ICid,
  city: undefined as undefined | ICities,
  esocialAgntCausador: undefined as undefined | IEsocialTable14And15Acid,
  codParteAtingEsocial13: undefined as undefined | IEsocialTable13Body,
  esocialLesao: undefined as undefined | IEsocialTable17Injury,

  // time: undefined as number | undefined,
  // esocial18: undefined as IEsocialTable18Mot | undefined,
};

const modalName = ModalEnum.CAT_ADD;

export const useAddCat = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const initialDataRef = useRef(initialCatState);

  const createMutation = useMutCreateCat();
  const updateMutation = useMutUpdateCat();
  const deleteMutation = useMutDeleteCat();
  const cepMutation = useMutationCEP();
  const cnpjMutation = useMutationCNPJ();

  const { preventUnwantedChanges, preventDelete } = usePreventAction();

  const [catData, setCatData] = useState({
    ...initialCatState,
  });

  const isEdit = !!catData.id;
  const isDeath = isWithDeath(catData.tpCat);
  const isOrigin = isOriginCat(catData.tpCat);
  const isShowOrigin = isShowOriginCat(catData.tpCat);
  const hrsWorked = isHrsWorked(catData.tpAcid);

  const askCompany = isAskCompany(catData.tpLocal);
  const cepRequired = isCepRequired(catData.tpLocal);
  const localEmpty = isLocalEmpty(catData.tpLocal);
  const cityUfRequired = isCityUfRequired(catData.tpLocal);
  const countryRequired = isCountryRequired(catData.tpLocal);

  const { data: company } = useQueryCompany(catData.companyId);

  const { data: employee, isLoading: employeeLoading } = useQueryEmployee({
    id: catData.employeeId,
    companyId: catData.companyId,
  });

  const { data: cat, isLoading: catLoading } = useQueryCat({
    id: catData.id,
    companyId: catData.companyId,
  });

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialCatState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
      setCatData((oldData) => {
        const newData = {
          ...oldData,
          ...cleanObjectNullValues(initialData),
          companyId: oldData.companyId || initialData.companyId,
          employeeId: oldData.employeeId || initialData.employeeId,
          ...cat,
        };

        initialDataRef.current = newData;
        return newData;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, cat]);

  const onClose = (data?: any) => {
    onCloseModal(modalName, data);
    setCatData(initialCatState);
  };

  const onCloseUnsaved = (action?: () => void) => {
    const before = { ...initialDataRef.current } as any;
    const after = { ...catData } as any;
    if (preventUnwantedChanges(before, after, onClose)) return;
    onClose();
    action?.();
  };

  const onSubmitData = async (
    submitData: any,
    nextStep: () => void,
    { save }: { save?: boolean } = { save: false },
  ) => {
    if (!isEdit && save) {
      await createMutation
        .mutateAsync(submitData)
        .then((employee) => {
          nextStep();
          setCatData((data) => ({
            ...data,
            ...submitData,
            ...employee,
          }));
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
    } else if (!isEdit) {
      nextStep();
      setCatData((data) => ({
        ...data,
        ...submitData,
      }));
    } else {
      await updateMutation
        .mutateAsync(submitData)
        .then(() => {
          onClose();
        })
        .catch(() => {});
    }
  };

  const handleDelete = () => {
    if (catData.id)
      deleteMutation
        .mutateAsync({
          id: catData.id,
          companyId: catData.companyId,
        })
        .then(() => {
          onClose();
        })
        .catch(() => {});
  };

  return {
    registerModal,
    onCloseUnsaved,
    onSubmitData,
    onClose,
    loading:
      createMutation.isLoading ||
      updateMutation.isLoading ||
      catLoading ||
      cepMutation.isLoading ||
      cnpjMutation.isLoading ||
      employeeLoading,
    catData,
    setCatData,
    isEdit,
    modalName,
    handleDelete: () => preventDelete(handleDelete),
    company,
    employee,
    cat,
    isDeath,
    isOrigin,
    isShowOrigin,
    hrsWorked,
    cepRequired,
    localEmpty,
    cityUfRequired,
    countryRequired,
    cepMutation,
    askCompany,
    cnpjMutation,
  };
};

export type IUseAddCat = ReturnType<typeof useAddCat>;
