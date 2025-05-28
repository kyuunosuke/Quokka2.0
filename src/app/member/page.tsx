"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getCurrentUser,
  getUserProfile,
  signOut,
  supabase,
} from "@/lib/supabase";
import {
  Loader2,
  Trophy,
  BookOpen,
  Settings,
  LogOut,
  Star,
  Target,
  Zap,
  Award,
  Calendar,
  Users,
  TrendingUp,
  Crown,
  Flame,
  Shield,
  Heart,
  Clock,
  CheckCircle,
} from "lucide-react";
import CompetitionCard from "@/components/competitions/CompetitionCard";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Competition {
  id: string;
  title: string;
  thumbnail_url: string;
  deadline: string;
  prize_value: string;
  category: string;
  difficulty: string;
  description: string;
  status: string;
}

interface GamificationStats {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  badges: string[];
  rank: string;
  totalCompetitions: number;
  wins: number;
  savedCompetitions: number;
}

export default function MemberDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedCompetitions, setSavedCompetitions] = useState<Competition[]>([]);
  const [participatedCompetitions, setParticipatedCompetitions] = useState<
    Competition[]
  >([]);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>(
    {
      level: 1,
      xp: 150,
      xpToNext: 350,
      streak: 5,
      badges: ["First Entry", "Early Bird", "Consistent Creator"],
      rank: "Rising Star",
      totalCompetitions: 8,
      wins: 2,
      savedCompetitions: 7,
    },
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user, error } = await getCurrentUser();

      if (error || !user) {
        router.push("/memberlogin");
        return;
      }

      // Try to get profile, with retry logic for newly created users
      let profileData = null;
      let profileError = null;
      let retries = 3;

      while (retries > 0 && !profileData) {
        const result = await getUserProfile(user.id);
        profileData = result.data;
        profileError = result.error;

        if (!profileData && retries > 1) {
          // Wait a bit and retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        retries--;
      }

      if (profileError || !profileData) {
        // If profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            role: user.user_metadata?.role || "member",
          })
          .select()
          .single();

        if (createError || !newProfile) {
          console.error("Error creating profile:", createError);
          router.push("/memberlogin");
          return;
        }

        profileData = newProfile;
      }

      // Check if user has member role (allow admin too for testing)
      if (profileData.role !== "member" && profileData.role !== "admin") {
        router.push("/memberlogin");
        return;
      }

      setProfile(profileData);
      await loadUserCompetitions(user.id);
    } catch (err) {
      console.error("Auth check error:", err);
      router.push("/memberlogin");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCompetitions = async (userId: string) => {
    try {
      // Load saved competitions
      const { data: savedData } = await supabase
        .from("saved_competitions")
        .select(
          `
          competition_id,
          competitions (
            id,
            title,
            thumbnail_url,
            deadline,
            prize_value,
            category,
            difficulty,
            description,
            status
          )
        `,
        )
        .eq("user_id", userId);

      if (savedData) {
        const saved = savedData
          .map((item) => item.competitions)
          .filter(Boolean) as Competition[];
        setSavedCompetitions(saved);
      }

      // Mock data for participated and past competitions
      // In a real app, you'd have submission/participation tables
      const mockParticipated: Competition[] = [
        {
          id: "1",
          title: "Photography Challenge",
          thumbnail_url:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
          deadline: "2024-01-15",
          prize_value: "$5,000",
          category: "Photography",
          difficulty: "Intermediate",
          description: "Capture the essence of urban life",
          status: "active",
        },
        {
          id: "2",
          title: "Logo Design Challenge",
          thumbnail_url:
            "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&q=80",
          deadline: "2024-02-01",
          prize_value: "$3,000",
          category: "Design",
          difficulty: "Beginner",
          description: "Create a modern logo for EcoThread",
          status: "active",
        },
      ];

      const mockPast: Competition[] = [
        {
          id: "3",
          title: "Short Story Contest",
          thumbnail_url:
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80",
          deadline: "2023-11-15",
          prize_value: "$2,500",
          category: "Writing",
          difficulty: "Advanced",
          description: "Write about transformation",
          status: "completed",
        },
      ];

      setParticipatedCompetitions(mockParticipated);
      setPastCompetitions(mockPast);
    } catch (error) {
      console.error("Error loading competitions:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/memberlogin");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`}
              />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">
                Welcome back, {profile.full_name}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{gamificationStats.rank}</Badge>
                <Badge variant="outline">Level {gamificationStats.level}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">
                {gamificationStats.streak} day streak
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Gamification Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Level Progress */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Crown className="h-6 w-6" />
                <span className="text-2xl font-bold">
                  Lv.{gamificationStats.level}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP Progress</span>
                  <span>
                    {gamificationStats.xp}/
                    {gamificationStats.xp + gamificationStats.xpToNext}
                  </span>
                </div>
                <Progress
                  value={
                    (gamificationStats.xp /
                      (gamificationStats.xp + gamificationStats.xpToNext)) *
                    100
                  }
                  className="bg-white/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Achievements</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {gamificationStats.badges.length}
              </div>
              <p className="text-sm text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>

          {/* Competition Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Competitions</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {gamificationStats.totalCompetitions}
              </div>
              <p className="text-sm text-muted-foreground">
                {gamificationStats.wins} wins
              </p>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">Streak</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {gamificationStats.streak}
              </div>
              <p className="text-sm text-muted-foreground">Days active</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Your Badges</span>
            </CardTitle>
            <CardDescription>
              Achievements unlocked through your competition journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {gamificationStats.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-2">
                  <Award className="h-4 w-4 mr-2" />
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competition Tabs */}
        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Saved ({savedCompetitions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Active ({participatedCompetitions.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Completed ({pastCompetitions.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Saved Competitions</h3>
              <Button onClick={() => router.push("/")}>
                <Trophy className="h-4 w-4 mr-2" />
                Browse More
              </Button>
            </div>
            {savedCompetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    id={competition.id}
                    title={competition.title}
                    imageUrl={
                      competition.thumbnail_url ||
                      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80"
                    }
                    deadline={competition.deadline}
                    prizeValue={competition.prize_value || "$0"}
                    category={competition.category}
                    difficulty={competition.difficulty}
                    requirements={
                      competition.description || "No requirements specified"
                    }
                    rules="Standard competition rules apply"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No saved competitions yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring competitions and save the ones you're
                    interested in!
                  </p>
                  <Button onClick={() => router.push("/")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Browse Competitions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Active Competitions</h3>
              <Badge variant="outline">
                {participatedCompetitions.length} in progress
              </Badge>
            </div>
            {participatedCompetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participatedCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    id={competition.id}
                    title={competition.title}
                    imageUrl={competition.thumbnail_url}
                    deadline={competition.deadline}
                    prizeValue={competition.prize_value}
                    category={competition.category}
                    difficulty={competition.difficulty}
                    requirements={competition.description}
                    rules="Standard competition rules apply"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No active competitions
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Join a competition to start building your portfolio!
                  </p>
                  <Button onClick={() => router.push("/")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Find Competitions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Completed Competitions</h3>
              <Badge variant="outline">
                {pastCompetitions.length} finished
              </Badge>
            </div>
            {pastCompetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastCompetitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    id={competition.id}
                    title={competition.title}
                    imageUrl={competition.thumbnail_url}
                    deadline={competition.deadline}
                    prizeValue={competition.prize_value}
                    category={competition.category}
                    difficulty={competition.difficulty}
                    requirements={competition.description}
                    rules="Standard competition rules apply"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No completed competitions
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Complete your first competition to see it here!
                  </p>
                  <Button onClick={() => router.push("/")}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Start Competing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push("/")}
                className="h-auto p-4 flex-col space-y-2"
              >
                <Trophy className="h-6 w-6" />
                <span>Browse Competitions</span>
                <span className="text-xs opacity-75">Find new challenges</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
              >
                <BookOpen className="h-6 w-6" />
                <span>My Submissions</span>
                <span className="text-xs opacity-75">Track your entries</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
              >
                <Settings className="h-6 w-6" />
                <span>Profile Settings</span>
                <span className="text-xs opacity-75">
                  Customize your profile
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
