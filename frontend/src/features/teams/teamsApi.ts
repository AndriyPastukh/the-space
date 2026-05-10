import api from "../../api";

export interface Team {
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
    requests: number;
  };
  currentUserStatus: string;
  createdAt: string;
}

export interface TeamsResponse {
  items: Team[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const teamsApi = {
  findAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    directionId?: number;
  }) => {
    const { data } = await api.get<TeamsResponse>("/api/teams", {
      params,
    });
    return data;
  },

  findOne: async (slug: string) => {
    const { data } = await api.get<Team>(`/api/teams/${slug}`);
    return data;
  },

  create: async (dto: any) => {
    const { data } = await api.post<Team>("/api/teams", dto);
    return data;
  },

  joinRequest: async (id: number) => {
    const { data } = await api.post(`/api/teams/${id}/join-request`);
    return data;
  },

  getPresignedUrl: async (fileName: string, contentType: string) => {
    const { data } = await api.post("/api/teams/avatar/presign", {
      fileName,
      contentType,
    });
    return data;
  },
};
