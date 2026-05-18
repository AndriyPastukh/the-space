import { useEffect, useState } from "react";
import api from "../api";

export const useProfile = (id?: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const endpoint = id ? `/api/users/${id}` : "/api/users/me";
        const { data } = await api.get(endpoint);
        setProfile(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  return { profile, isLoading, error };
};
