export type ActionResult = { success: boolean; error?: string };

export type PageMeta = {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type ListQuery = {
  page: number;
  pageSize: number;
  q?: string;
};

// The API keeps each resource's own list key ({ pictograms }, { boards }…)
// and puts meta beside it.
export type Paginated<K extends string, T> = { [P in K]: T[] } & {
  meta: PageMeta;
};
