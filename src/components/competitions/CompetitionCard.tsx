"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, ChevronDown, ChevronUp, TrophyIcon } from "lucide-react";

interface CompetitionCardProps {
  id: string;
  title: string;
  imageUrl: string;
  deadline: string;
  prizeValue: string;
  category: string;
  difficulty: string;
  requirements: string;
  rules: string;
}

export default function CompetitionCard({
  id = "1",
  title = "Photography Competition",
  imageUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  deadline = "May 15, 2023",
  prizeValue = "$1,000",
  category = "Photography",
  difficulty = "Intermediate",
  requirements = "Submit a high-resolution photograph that captures the theme 'Urban Nature'. Photos must be original and taken within the last 6 months.",
  rules = "No watermarks or digital manipulation beyond basic color correction and cropping. Maximum of 3 entries per participant.",
}: CompetitionCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };

  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  return (
    <Card className="bg-background w-full h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] relative">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="bg-white/80 backdrop-blur-sm text-primary"
          >
            {category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isSaved ? "text-primary" : "text-muted-foreground"}`}
            onClick={toggleSaved}
          >
            <BookmarkIcon size={18} className={isSaved ? "fill-primary" : ""} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="font-medium">Deadline:</span>
            <span className="ml-1">{deadline}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-primary">
            <TrophyIcon size={16} className="mr-1" />
            {prizeValue}
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <span className="font-medium">Difficulty:</span>
          <span className="ml-1">{difficulty}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-1 bg-muted/30 hover:bg-muted/50"
              onClick={toggleDetails}
            >
              {isDetailsOpen ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>View Details</span>
                  <ChevronDown size={16} />
                </>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh] overflow-auto">
            <div className="p-4 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>

              <div className="mb-4">
                <h4 className="font-medium mb-1">Requirements</h4>
                <p className="text-sm text-muted-foreground">{requirements}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-1">Rules</h4>
                <p className="text-sm text-muted-foreground">{rules}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Deadline:</span> {deadline}
                </div>
                <div className="text-sm font-medium text-primary flex items-center">
                  <TrophyIcon size={16} className="mr-1" />
                  {prizeValue}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <Button className="w-full bg-primary hover:bg-primary/90">
          Enter Now
        </Button>
      </CardFooter>
    </Card>
  );
}
