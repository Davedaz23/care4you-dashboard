import { useAdminAuth } from "../context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const RequireAdminRole = ({ children, role }: { children: React.ReactNode; role: string }) => {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== role)) {
      router.push("/unauthorized");
    }
  }, [user, loading, role]);

  if (loading || !user) return <div>Loading...</div>;

  return <>{children}</>;
};
