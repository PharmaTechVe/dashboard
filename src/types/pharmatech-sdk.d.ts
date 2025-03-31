import { z } from 'zod';

declare module '@pharmatech/sdk' {
  export const categorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
  }>;

  export type CategoryFormValues = z.infer<typeof categorySchema>;

  interface ApiResponse<T> {
    data: T;
    // ... otros campos de la respuesta ...
  }

  export class Client {
    constructor(isDevMode: boolean, origin?: string);
    get<T>(config: {
      url: string;
      params?: object;
      jwt?: string;
    }): Promise<ApiResponse<T>>;
    post<T>(config: {
      url: string;
      data?: object;
      jwt?: string;
    }): Promise<ApiResponse<T>>;
    patch<T>(config: {
      url: string;
      data?: object;
      jwt?: string;
    }): Promise<ApiResponse<T>>;
    delete<T>(config: { url: string; jwt?: string }): Promise<ApiResponse<T>>;
  }

  export class CategoryService {
    constructor(client: Client);
    getById(id: string): Promise<ApiResponse<CategoryFormValues>>;
    findAll(params: {
      page: number;
      limit: number;
    }): Promise<ApiResponse<CategoryFormValues[]>>;
    create(
      category: CategoryFormValues,
      jwt: string,
    ): Promise<ApiResponse<CategoryFormValues>>;
    update(
      id: string,
      partialCategory: Partial<CategoryFormValues>,
      jwt: string,
    ): Promise<ApiResponse<CategoryFormValues>>;
    delete(id: string, jwt: string): Promise<void>;
  }
}
