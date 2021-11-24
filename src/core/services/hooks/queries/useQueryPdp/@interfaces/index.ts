export interface IPdpCarResponse {
  iD_Veiculo: string;
  kM_Veiculo: string;
  desc_TipoCambio: string;
  desc_Combustivel: string;
  anoveic_Modelo: string;
  num_NumPortas: string;
  opcionais: string;

  desc_VeicMarca: string;
  desc_VeicModelo: string;
  desc_VeicTipo: string;
  vlrPzo_Veiculo: string;
  foto: string;
}

export interface IPdpQueryResponse {
  result: IPdpCarResponse;
  similar: IPdpCarResponse[];
}

export interface IPdpCar {
  id: string;
  seats: string;
  type: string;
  fuel: string;
  doors: string;
  year: string;
  km: string;
  optionals: string[];

  brand: string;
  model: string;
  info: string;
  price: string;
  img: string;
}

export interface IPdpQueryReturn {
  car: IPdpCar;
  suggestions: IPdpCar[];
}
