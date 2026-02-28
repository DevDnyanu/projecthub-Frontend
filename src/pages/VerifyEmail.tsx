import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. The link may have expired.");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 font-heading text-xl font-bold">Verifying your email...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 font-heading text-xl font-bold">Email Verified!</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link to="/login" className="mt-6 block">
              <Button className="w-full">Sign In to Your Account</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 font-heading text-xl font-bold">Verification Failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link to="/login" className="mt-6 block">
              <Button variant="outline" className="w-full">Back to Sign In</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
