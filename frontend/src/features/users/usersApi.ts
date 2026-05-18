import api from "../../api";

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  avatarUrl: string;
  bio: string;
  reputation: number;
  skillTags: string[];
  interestTags: string[];
  currentLevel: number;
  xpPoints: number;
  stats?: {
    rating: number;
    completedTaskPoints: number;
    level: number;
    xpProgress: number;
    reputation: number;
  };
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  communities?: Array<{
    name: string;
    slug: string;
    avatarUrl: string;
  }>;
}

export interface UsersResponse {
  data: UserProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  search: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const { data } = await api.get<UsersResponse>("/api/users/search", {
      params,
    });
    return data;
  },

  findOne: async (id: number) => {
    const { data } = await api.get<UserProfile>(`/api/users/${id}`);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<UserProfile>("/api/users/me");
    return data;
  },

  updateMyProfile: async (payload: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    nickname?: string;
    avatarUrl?: string;
    categories?: number[];
    bio?: string;
    phoneNumber?: string;
    status?: string;
    country?: string;
    city?: string;
    skillTags?: string[];
    interestTags?: string[];
  }) => {
    const { data } = await api.patch<UserProfile>("/api/users/me", payload);
    return data;
  },

  getAvatarPresignedUrl: async (contentType: string) => {
    const { data } = await api.post<{ uploadUrl: string; fileName: string; publicUrl: string }>(
      "/api/users/profile/avatar/presign",
      { contentType }
    );
    return data;
  },
};
