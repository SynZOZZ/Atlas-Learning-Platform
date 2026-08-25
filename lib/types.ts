export type PlatformRole = "admin" | "instructor" | "student";
export type PlatformUser = {
  id: number;
  email: string;
  name: string;
  role: PlatformRole;
  status: string;
  phone: string;
  whatsapp: string;
  country: string;
  city: string;
  specialty: string;
  trustedDeviceId: string | null;
};
