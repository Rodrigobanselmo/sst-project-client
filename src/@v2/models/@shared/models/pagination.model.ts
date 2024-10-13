export interface IPaginationModelConstructor {
  total: number;
  limit: number;
  page: number;
}

export class PaginationModel {
  total: number;
  limit: number;
  page: number;

  constructor({ total, limit, page }: IPaginationModelConstructor) {
    this.total = total;
    this.limit = limit;
    this.page = page;
  }
}
