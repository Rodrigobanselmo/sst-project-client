export interface GetCEPResponse {
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}
export interface GetCompanyStructureResponse {
  createHierarchy?: boolean;
  createHomo?: boolean;
  createEmployee?: boolean;
  createHierOnHomo?: boolean;
  stopFirstError?: boolean;
  companyId?: string;
}
