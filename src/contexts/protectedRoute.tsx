import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { rememberPostLoginRedirect } from "@/utils/postLoginRedirect";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token  = localStorage.getItem("token");
  const router = useRouter();
  useEffect(() => {
    if (!token) {
      // Remember where the patient was going (e.g. an intake link from their practice) so
      // signing in brings them back there instead of the dashboard — see GetToken.
      rememberPostLoginRedirect(window.location.pathname + window.location.search);
      // Redirect to login if not authenticated
      router.push("/");
    }
  }, [token, router]);

  // If the user is not authenticated, the redirection happens before rendering the children
  return <>{token && children}</>;
};
