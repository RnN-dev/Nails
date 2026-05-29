export type Photo = {
  id: string;
  title: string;
  category: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export type PhotoListResponse = {
  photos: Photo[];
};

export type Service = {
  name: string;
  description: string;
  price: string;
  icon: "gel" | "acrylic" | "art" | "shield" | "remove" | "classic";
};

export type Testimonial = {
  name: string;
  avatar: string;
  text: string;
  rating: number;
};

export type AuthResponse = {
  token: string;
  expiresIn: number;
};
