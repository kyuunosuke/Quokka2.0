"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "@/lib/supabase";
import { Loader2, Shield } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "passcode">("email");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Verify the email exists in admin users
      // 2. Send a passcode to the email
      // For demo purposes, we'll simulate this

      // Simulate API call to verify admin email and send passcode
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, accept any email ending with @admin.com
      if (email.endsWith("@admin.com")) {
        setStep("passcode");
      } else {
        setError("Email not found in admin directory");
      }
    } catch (err) {
      setError("Failed to send passcode. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would verify the passcode
      // For demo purposes, accept "123456" as valid passcode
      if (passcode === "123456") {
        // Create a temporary password for admin login
        const tempPassword = "admin123";

        const { data, error } = await signIn(email, tempPassword);

        if (error) {
          // If user doesn't exist, you might need to create admin account
          setError(
            "Admin account not found. Please contact system administrator.",
          );
          return;
        }

        if (data.user) {
          router.push("/admin");
        }
      } else {
        setError("Invalid passcode. Please try again.");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPasscode("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your admin email to receive a verification passcode"
              : "Enter the 6-digit passcode sent to your email"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Passcode
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode">Verification Passcode</Label>
                <Input
                  id="passcode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={passcode}
                  onChange={(e) =>
                    setPasscode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Passcode sent to {email}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || passcode.length !== 6}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify & Sign In
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                >
                  Back to Email
                </Button>
              </div>
            </form>
          )}

          {step === "passcode" && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo:</strong> Use passcode{" "}
                <code className="bg-background px-1 rounded">123456</code> to
                continue
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
