// types/hospital.ts
export interface Hospital {
  id: string;
  name: string;
  address: string;
  description: string; // Make this required
  photo?: string;
  // Add other fields as needed
}