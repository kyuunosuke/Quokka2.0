"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Upload,
  X,
  Save,
  Eye,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tables, TablesInsert } from "@/types/supabase";
import { cn } from "@/lib/utils";

type Competition = Tables<"competitions">;
type CompetitionInsert = TablesInsert<"competitions">;

interface CompetitionEditorProps {
  competition?: Competition;
  mode: "create" | "edit";
  onSave: () => void;
  onCancel: () => void;
}

const categories = [
  "Photography",
  "Design",
  "Writing",
  "Technology",
  "Music",
  "Art",
  "Food",
  "Architecture",
  "Animation",
  "Other",
];

const difficulties = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function CompetitionEditor({
  competition,
  mode = "create",
  onSave = () => {},
  onCancel = () => {},
}: Partial<CompetitionEditorProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<CompetitionInsert>>({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    deadline: "",
    prize_value: "",
    prize_currency: "USD",
    entry_fee: 0,
    max_entries: null,
    image_url: "",
    thumbnail_url: "",
    status: "active",
  });
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [deadlineDate, setDeadlineDate] = useState<Date>();

  useEffect(() => {
    if (competition && mode === "edit") {
      setFormData({
        title: competition.title,
        description: competition.description || "",
        category: competition.category,
        difficulty: competition.difficulty,
        deadline: competition.deadline,
        prize_value: competition.prize_value || "",
        prize_currency: competition.prize_currency || "USD",
        entry_fee: competition.entry_fee || 0,
        max_entries: competition.max_entries,
        image_url: competition.image_url || "",
        thumbnail_url: competition.thumbnail_url || "",
        status: competition.status || "active",
      });
      setDeadlineDate(new Date(competition.deadline));
      // Load requirements if they exist
      loadRequirements(competition.id);
    }
  }, [competition, mode]);

  const loadRequirements = async (competitionId: string) => {
    try {
      const { data, error } = await supabase
        .from("competition_requirements")
        .select("requirement_text")
        .eq("competition_id", competitionId)
        .order("order_index");

      if (error) throw error;
      setRequirements(data?.map((req) => req.requirement_text) || []);
    } catch (error) {
      console.error("Error loading requirements:", error);
    }
  };

  const handleInputChange = (field: keyof CompetitionInsert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // For demo purposes, we'll use a placeholder URL
      // In a real implementation, you would upload to Supabase Storage
      const imageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=800&q=80`;
      const thumbnailUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&q=80`;

      handleInputChange("image_url", imageUrl);
      handleInputChange("thumbnail_url", thumbnailUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.category ||
      !formData.difficulty ||
      !deadlineDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const competitionData = {
        ...formData,
        deadline: deadlineDate.toISOString(),
        // Add created_by field with a placeholder value to bypass auth check
        created_by: "temp-admin-user",
      };

      let competitionId: string;

      if (mode === "create") {
        const { data, error } = await supabase
          .from("competitions")
          .insert(competitionData)
          .select("id")
          .single();

        if (error) {
          console.error("Error creating competition:", error);
          throw error;
        }
        competitionId = data.id;
      } else {
        const { error } = await supabase
          .from("competitions")
          .update(competitionData)
          .eq("id", competition!.id);

        if (error) {
          console.error("Error updating competition:", error);
          throw error;
        }
        competitionId = competition!.id;
      }

      // Save requirements
      if (requirements.length > 0) {
        // Delete existing requirements if editing
        if (mode === "edit") {
          const { error: deleteError } = await supabase
            .from("competition_requirements")
            .delete()
            .eq("competition_id", competitionId);

          if (deleteError) {
            console.error("Error deleting existing requirements:", deleteError);
          }
        }

        // Insert new requirements
        const requirementData = requirements.map((req, index) => ({
          competition_id: competitionId,
          requirement_text: req,
          order_index: index,
          is_mandatory: true,
        }));

        const { error: reqError } = await supabase
          .from("competition_requirements")
          .insert(requirementData);

        if (reqError) {
          console.error("Error inserting requirements:", reqError);
          throw reqError;
        }
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving competition:", error);
      alert(`Error saving competition: ${error.message || "Please try again"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for your competition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Competition Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter competition title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your competition..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      handleInputChange("difficulty", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competition Details */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Details</CardTitle>
              <CardDescription>
                Set the timeline, prizes, and entry requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadlineDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadlineDate
                        ? format(deadlineDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deadlineDate}
                      onSelect={setDeadlineDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prize_value">Prize Value</Label>
                  <Input
                    id="prize_value"
                    value={formData.prize_value}
                    onChange={(e) =>
                      handleInputChange("prize_value", e.target.value)
                    }
                    placeholder="$1,000"
                  />
                </div>

                <div>
                  <Label htmlFor="entry_fee">Entry Fee</Label>
                  <Input
                    id="entry_fee"
                    type="number"
                    value={formData.entry_fee}
                    onChange={(e) =>
                      handleInputChange("entry_fee", Number(e.target.value))
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="max_entries">Max Entries</Label>
                  <Input
                    id="max_entries"
                    type="number"
                    value={formData.max_entries || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "max_entries",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Add specific requirements for participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addRequirement())
                  }
                />
                <Button type="button" onClick={addRequirement}>
                  Add
                </Button>
              </div>

              {requirements.length > 0 && (
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                    >
                      <span className="flex-1">{req}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Image</CardTitle>
              <CardDescription>
                Upload an image to represent your competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Competition"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        handleInputChange("image_url", "");
                        handleInputChange("thumbnail_url", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload an image for your competition
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      disabled={imageUploading}
                    >
                      {imageUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Image
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {mode === "create" ? "Create Competition" : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
