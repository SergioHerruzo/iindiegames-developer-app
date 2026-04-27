export type PaginatedResponse<T> = {
    items: T[];
    pageNumber: number;
    pageSize: number;
    pageCount: number;
    totalItemCount: number;
    hastNextPage: boolean;
    hasPreviousPage: boolean;
}