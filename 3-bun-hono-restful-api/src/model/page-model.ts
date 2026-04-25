export type Paging = {
  page: number;
  size: number;
  total_pages: number;
};

export type Pageable<T> = {
  data: Array<T>;
  paging: Paging;
};