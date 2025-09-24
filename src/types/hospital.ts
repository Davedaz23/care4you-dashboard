export interface Hospital {
  id: string;
  name: string;
  address: string;
  description: string;
  photoBase64?: string | null; // Changed from photo to photoBase64
  services?: string[];
  email?: string;
  website?: string;
  hours?: string;
  status?: string;
  phone?: string;
  createdAt?: string;
  adminId?: string;
}