"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  Eye,
  Copy,
  Calendar,
  Trophy,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";

type Competition = Tables<"competitions">;

interface CompetitionListProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
}

export default function CompetitionList({
  searchTerm,
  statusFilter,
  categoryFilter,
}: CompetitionListProps) {
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompetitionStatus = (competition: Competition) => {
    const now = new Date();
    const deadline = new Date(competition.deadline);

    if (competition.status === "archived") return "archived";
    if (deadline < now) return "ended";
    if (deadline > now) return "active";
    return "upcoming";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      upcoming: "bg-blue-100 text-blue-800 border-blue-200",
      ended: "bg-gray-100 text-gray-800 border-gray-200",
      archived: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <Badge
        variant="outline"
        className={variants[status as keyof typeof variants] || variants.active}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredCompetitions = competitions.filter((competition) => {
    const matchesSearch = competition.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      getCompetitionStatus(competition) === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || competition.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleArchive = async (competitionId: string) => {
    try {
      const { error } = await supabase
        .from("competitions")
        .update({ status: "archived" })
        .eq("id", competitionId);

      if (error) throw error;
      fetchCompetitions();
    } catch (error) {
      console.error("Error archiving competition:", error);
    }
  };

  const handleDelete = async (competitionId: string) => {
    try {
      const { error } = await supabase
        .from("competitions")
        .delete()
        .eq("id", competitionId);

      if (error) throw error;
      fetchCompetitions();
    } catch (error) {
      console.error("Error deleting competition:", error);
    }
  };

  const handleDuplicate = async (competition: Competition) => {
    try {
      const { id, created_at, updated_at, ...competitionData } = competition;
      const { error } = await supabase.from("competitions").insert({
        ...competitionData,
        title: `${competition.title} (Copy)`,
      });

      if (error) throw error;
      fetchCompetitions();
    } catch (error) {
      console.error("Error duplicating competition:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredCompetitions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No competitions found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Get started by creating your first competition"}
            </p>
            <Button onClick={() => router.push("/admin/competitions/new")}>
              <Trophy className="h-4 w-4 mr-2" />
              Create Competition
            </Button>
          </CardContent>
        </Card>
      ) : (
        filteredCompetitions.map((competition) => {
          const status = getCompetitionStatus(competition);
          return (
            <Card
              key={competition.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {competition.title}
                      </CardTitle>
                      {getStatusBadge(status)}
                      <Badge variant="secondary">{competition.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {competition.description || "No description available"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/competitions/${competition.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/competitions/${competition.id}/edit`,
                            )
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(competition)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArchive(competition.id)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Competition
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;
                                {competition.title}&quot;? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(competition.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">
                      {new Date(competition.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Prize:</span>
                    <span className="font-medium">
                      {competition.prize_value || "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="font-medium">
                      {competition.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(
                        competition.created_at || "",
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
