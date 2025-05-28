"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserProfile } from "@/lib/supabase";
import AdminSidenav from "@/components/admin/AdminSidenav";
import CompetitionEditor from "@/components/admin/CompetitionEditor";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function NewCompetitionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user, error } = await getCurrentUser();

      if (error || !user) {
        router.push("/adminlogin");
        return;
      }

      const { data: profileData, error: profileError } = await getUserProfile(
        user.id,
      );

      if (profileError || !profileData) {
        router.push("/adminlogin");
        return;
      }

      if (profileData.role !== "admin") {
        router.push("/adminlogin");
        return;
      }

      setProfile(profileData);
    } catch (err) {
      router.push("/adminlogin");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidenav */}
      <AdminSidenav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/competitions")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Competition</h1>
              <p className="text-muted-foreground">
                Add a new competition to the platform
              </p>
            </div>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 p-6">
          <CompetitionEditor
            mode="create"
            onSave={() => router.push("/admin/competitions")}
            onCancel={() => router.push("/admin/competitions")}
          />
        </div>
      </div>
    </div>
  );
}
