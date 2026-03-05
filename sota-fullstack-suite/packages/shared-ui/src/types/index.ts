export interface BaseComponentProps {
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  testId?: string;
}

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type Size = 'sm' | 'md' | 'lg' | 'xl';

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: Status;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
