import axios from "axios";
import type { AuthResponse, Photo, PhotoListResponse } from "../types";
import { clearToken, getToken } from "./auth";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken();
    }

    return Promise.reject(error);
  }
);

export async function loginAdmin(email: string, password: string, signal?: AbortSignal): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth", { email, password }, { signal });
  return response.data;
}

export async function fetchPhotos(signal?: AbortSignal): Promise<Photo[]> {
  const response = await api.get<PhotoListResponse>("/photos", { signal });
  return Array.isArray(response.data.photos) ? response.data.photos : [];
}

export async function uploadPhoto(payload: {
  title: string;
  category: string;
  filename: string;
  image: string;
}): Promise<Photo> {
  const response = await api.post<Photo>("/photos", payload);
  return response.data;
}

export async function updatePhoto(id: string, payload: Pick<Photo, "title" | "category">): Promise<Photo> {
  const response = await api.patch<Photo>(`/photos/${id}`, payload);
  return response.data;
}

export async function deletePhoto(id: string): Promise<void> {
  await api.delete(`/photos/${id}`);
}
