import { useEffect } from "react";
import { useRouter } from "next/navigation";
 
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token  = localStorage.getItem("token");
  const router = useRouter();
  useEffect(() => {
    if (!token) {
      // Redirect to login if not authenticated
      router.push("/");
    }
  }, [token, router]);
 
  // If the user is not authenticated, the redirection happens before rendering the children
  return <>{token && children}</>;
};