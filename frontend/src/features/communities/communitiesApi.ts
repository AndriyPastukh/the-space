import api from "../../api";

export interface Community {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatarUrl: string | null;
  directions: { id: number; name: string }[];
  memberCount: number;
  members?: {
    id: number;
    name: string;
    avatarUrl: string | null;
    role: string;
  }[];
  statistics: {
    views: number;
    posts: number;
  };
  currentUserStatus: string;
  createdAt: string;
}

export interface CommunitiesResponse {
  items: Community[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const communitiesApi = {
  findAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    directionId?: number;
  }) => {
    const { data } = await api.get<CommunitiesResponse>("/api/communities", {
      params,
    });
    return data;
  },

  findOne: async (slug: string) => {
    const { data } = await api.get<Community>(`/api/communities/${slug}`);
    return data;
  },

  create: async (dto: any) => {
    const { data } = await api.post<Community>("/api/communities", dto);
    return data;
  },

  joinRequest: async (id: number) => {
    const { data } = await api.post(`/api/communities/${id}/join-request`);
    return data;
  },

  getPresignedUrl: async (fileName: string, contentType: string) => {
    const { data } = await api.post("/api/communities/avatar/presign", {
      fileName,
      contentType,
    });
    return data;
  },
};
