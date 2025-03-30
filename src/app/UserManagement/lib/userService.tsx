import { api } from '@/lib/sdkConfig';

export interface UserList {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  phoneNumber: string;
  gender: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: unknown;
  lastOrderDate: unknown;
  role: string;
  isValidated: boolean;
  profile: {
    profilePicture: string;
    birthDate: string;
    gender: string;
  };
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export interface UserResponse {
  results: UserItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

/**
 * Transforma un objeto UserList (devuelto por la API) al modelo interno UserItem.
 */
const transformUser = (user: UserList): UserItem => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.isValidated ? 'Validated' : 'Not Validated',
});

interface ApiUserService {
  findAll: (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    },
    token: string,
  ) => Promise<{
    results: UserList[];
    count: number;
    next: string | null;
    previous: string | null;
  }>;
  getById: (userId: string, token: string) => Promise<UserList>;
  post: (data: Omit<UserList, 'id'>, token: string) => Promise<UserList>;
  put: (
    userId: string,
    data: Partial<UserList>,
    token: string,
  ) => Promise<UserList>;
  delete: (userId: string, token: string) => Promise<void>;
}

// Se forzará la conversión al tipo esperado:
const userApi = api.user as unknown as ApiUserService;

export const findAllUsers = async (
  {
    page = 1,
    limit = 10,
    search,
  }: { page?: number; limit?: number; search?: string },
  token: string,
): Promise<UserResponse> => {
  const response = await userApi.findAll({ page, limit, search }, token);
  return {
    ...response,
    results: response.results.map(transformUser),
  };
};

export const findUserById = async (
  userId: string,
  token: string,
): Promise<UserItem> => {
  const user = await userApi.getById(userId, token);
  return transformUser(user);
};

export const createUser = async (
  data: Omit<UserItem, 'id' | 'status'>,
  token: string,
): Promise<UserItem> => {
  const newUser = await userApi.post(
    {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      documentId: '',
      phoneNumber: '',
      gender: '',
      password: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      lastOrderDate: null,
      isValidated: true,
      profile: {
        profilePicture: '',
        birthDate: new Date().toISOString(),
        gender: '',
      },
    },
    token,
  );

  return transformUser(newUser);
};

export const updateUser = async (
  userId: string,
  data: Partial<UserItem>,
  token: string,
): Promise<UserItem> => {
  const updateData: Partial<UserList> = {};

  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;

  const user = await userApi.put(userId, updateData, token);
  return transformUser(user);
};

export const deleteUser = async (
  userId: string,
  token: string,
): Promise<void> => {
  await userApi.delete(userId, token);
};
