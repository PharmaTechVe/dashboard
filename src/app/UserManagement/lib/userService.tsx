import { api } from '@/lib/sdkConfig';

export interface UserList {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  phoneNumber: string;
  // Si la API no envía estos campos en la raíz, se pueden obtener desde profile
  gender: string;
  birthDate: string;
  role: string;
  isValidated: boolean;
  // Propiedad opcional profile (con datos anidados)
  profile?: {
    birthDate?: string;
    gender?: string;
  };
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  documentId: string;
  phoneNumber: string;
  gender: string;
  birthDate: string;
}

export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  phoneNumber: string;
  gender: string;
  birthDate: string;
  role: string;
}

export interface UserResponse {
  results: UserItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Transformación: si existe profile, usamos sus datos; de lo contrario, usamos los del objeto raíz
const transformUser = (user: UserList): UserItem => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.isValidated ? 'Validated' : 'Not Validated',
  documentId: user.documentId,
  phoneNumber: user.phoneNumber,
  gender: user.profile?.gender || user.gender,
  birthDate: user.profile?.birthDate || user.birthDate,
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
  getProfile: (userId: string, token: string) => Promise<UserList>;
  create: (data: NewUser, token: string) => Promise<UserList>;
  update: (
    userId: string,
    data: Partial<UserList>,
    token: string,
  ) => Promise<UserList>;
  delete: (userId: string, token: string) => Promise<void>;
}

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
  const user = await userApi.getProfile(userId, token);
  return transformUser(user);
};

export const createUser = async (
  data: NewUser,
  token: string,
): Promise<UserItem> => {
  const newUser = await userApi.create(data, token);
  return transformUser(newUser);
};

export const updateUser = async (
  userId: string,
  data: Partial<UserItem>,
  token: string,
): Promise<UserItem> => {
  // Preparamos el objeto de actualización. Puedes ampliar esto si necesitas actualizar otros campos.
  const updateData: Partial<UserList> = {};
  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.documentId) updateData.documentId = data.documentId;
  if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
  if (data.gender) updateData.gender = data.gender;
  if (data.birthDate) updateData.birthDate = data.birthDate;

  const user = await userApi.update(userId, updateData, token);
  return transformUser(user);
};

export const deleteUser = async (
  userId: string,
  token: string,
): Promise<void> => {
  await userApi.delete(userId, token);
};
