import { useEffect } from 'react';
import { useQuery, UseQueryResult } from 'react-query';

import { QueryEnum } from '../../../../enums/query';
import api from '../../../api';
import { queryClient } from '../../../queryClient';
import {
  IPdpCarResponse,
  IPdpCar,
  IPdpQueryResponse,
  IPdpQueryReturn,
} from './@interfaces';

const dataTransform = (data: IPdpCarResponse): IPdpCar => {
  return {
    id: data.iD_Veiculo,
    seats: 'missing api',
    doors: data.num_NumPortas,
    fuel: data.desc_Combustivel,
    km: `${data.kM_Veiculo} Km`,
    type: data.desc_TipoCambio,
    year: data.anoveic_Modelo,
    optionals: data.opcionais.split(', ').filter((i) => i),
    brand: data.desc_VeicMarca,
    model: data.desc_VeicModelo,
    info: data.desc_VeicTipo,
    price: `R$ ${data.vlrPzo_Veiculo}/mês`,
    img: data.foto,
  };
};

export async function getPdp(carId: string) {
  const response = await api.get<IPdpQueryResponse>(
    `/controller/buscar.php?token=a0b6ce947b0bc27d85371a98076f1ae5&iD_Veiculo=${carId}&oncar=true`,
  );

  if (!response.data) return null;
  if (!response.data.result) return null;

  const data: IPdpQueryReturn = {
    car: dataTransform(response.data.result),
    suggestions: response.data.similar
      .slice(1, 8)
      .map((car) => dataTransform(car)),
  };

  return data;
}

export function useQueryPdp(
  carId: string,
  initialData?: IPdpQueryReturn,
): UseQueryResult<IPdpQueryReturn | null> {
  useEffect(() => {
    if (initialData) queryClient.setQueryData(QueryEnum.PDP, initialData);
  }, [initialData]);

  const data = useQuery(QueryEnum.PDP, () => getPdp(carId), {
    staleTime: 1000 * 60 * 10, // 10 minutes
    initialData,
  });

  return data;
}
