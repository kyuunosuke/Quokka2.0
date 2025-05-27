"use client";

import React, { useState, useEffect } from "react";
import CompetitionCard from "./CompetitionCard";

interface Competition {
  id: string;
  title: string;
  thumbnail: string;
  deadline: string;
  prizeValue: string;
  category: string;
  difficulty: string;
  requirements: string;
  rules: string;
}

interface CompetitionGridProps {
  competitions?: Competition[];
  filters?: {
    category?: string;
    minPrize?: number;
    maxPrize?: number;
    endDate?: Date;
    difficulty?: string;
  };
}

const CompetitionGrid = ({
  competitions = [],
  filters = {},
}: CompetitionGridProps) => {
  // Default competitions data if none provided
  const [displayedCompetitions, setDisplayedCompetitions] =
    useState<Competition[]>(competitions);

  useEffect(() => {
    // If no competitions are provided, use default data
    if (competitions.length === 0) {
      const defaultCompetitions: Competition[] = [
        {
          id: "1",
          title: "Photography Challenge",
          thumbnail:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
          deadline: "2023-12-31",
          prizeValue: "$5,000",
          category: "Photography",
          difficulty: "Intermediate",
          requirements:
            "Submit a series of 3-5 photographs that tell a story about urban life.",
          rules:
            "All photos must be original work. No digital manipulation beyond basic color correction and cropping.",
        },
        {
          id: "2",
          title: "Short Story Contest",
          thumbnail:
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80",
          deadline: "2023-11-15",
          prizeValue: "$2,500",
          category: "Writing",
          difficulty: "Advanced",
          requirements:
            "Write a short story (max 5,000 words) on the theme of 'Transformation'.",
          rules:
            "Stories must be original and unpublished. One entry per participant.",
        },
        {
          id: "3",
          title: "Logo Design Challenge",
          thumbnail:
            "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&q=80",
          deadline: "2023-10-30",
          prizeValue: "$3,000",
          category: "Design",
          difficulty: "Beginner",
          requirements:
            "Create a modern logo for a sustainable fashion brand named 'EcoThread'.",
          rules:
            "Submit in vector format. Include color and monochrome versions.",
        },
        {
          id: "4",
          title: "Mobile App Innovation",
          thumbnail:
            "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80",
          deadline: "2023-12-15",
          prizeValue: "$10,000",
          category: "Technology",
          difficulty: "Advanced",
          requirements:
            "Develop a mobile app concept that addresses a social or environmental issue.",
          rules:
            "Submit wireframes, prototype link, and a 500-word description of functionality.",
        },
        {
          id: "5",
          title: "Culinary Innovation",
          thumbnail:
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&q=80",
          deadline: "2023-11-01",
          prizeValue: "$4,000",
          category: "Food",
          difficulty: "Intermediate",
          requirements:
            "Create an innovative recipe using sustainable ingredients.",
          rules:
            "Recipe must be original. Include photos of the final dish and preparation process.",
        },
        {
          id: "6",
          title: "Music Production Contest",
          thumbnail:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
          deadline: "2023-12-01",
          prizeValue: "$6,000",
          category: "Music",
          difficulty: "Advanced",
          requirements:
            "Produce an original track (3-5 minutes) that fuses two distinct musical genres.",
          rules:
            "All elements must be original or properly licensed. Submit in high-quality audio format.",
        },
        {
          id: "7",
          title: "Sustainable Architecture",
          thumbnail:
            "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&q=80",
          deadline: "2024-01-15",
          prizeValue: "$15,000",
          category: "Architecture",
          difficulty: "Expert",
          requirements:
            "Design a small-scale sustainable housing solution for urban environments.",
          rules:
            "Submit detailed plans, 3D renderings, and materials specifications.",
        },
        {
          id: "8",
          title: "Animation Challenge",
          thumbnail:
            "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=400&q=80",
          deadline: "2023-11-30",
          prizeValue: "$7,500",
          category: "Animation",
          difficulty: "Intermediate",
          requirements:
            "Create a 30-60 second animated short on the theme of 'Connection'.",
          rules:
            "Any animation technique accepted. Must include original soundtrack.",
        },
      ];
      setDisplayedCompetitions(defaultCompetitions);
    } else {
      setDisplayedCompetitions(competitions);
    }
  }, [competitions]);

  // Apply filters when they change
  useEffect(() => {
    let filtered = [
      ...(competitions.length > 0 ? competitions : displayedCompetitions),
    ];

    if (filters.category) {
      filtered = filtered.filter((comp) => comp.category === filters.category);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (comp) => comp.difficulty === filters.difficulty,
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter((comp) => {
        const compDate = new Date(comp.deadline);
        return compDate <= filters.endDate!;
      });
    }

    if (filters.minPrize || filters.maxPrize) {
      filtered = filtered.filter((comp) => {
        const prizeNumber = parseInt(comp.prizeValue.replace(/[^0-9]/g, ""));
        const minCheck = filters.minPrize
          ? prizeNumber >= filters.minPrize
          : true;
        const maxCheck = filters.maxPrize
          ? prizeNumber <= filters.maxPrize
          : true;
        return minCheck && maxCheck;
      });
    }

    setDisplayedCompetitions(filtered);
  }, [filters, competitions]);

  return (
    <div className="bg-background p-4 md:p-6 lg:p-8 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {displayedCompetitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            id={competition.id}
            title={competition.title}
            thumbnail={competition.thumbnail}
            deadline={competition.deadline}
            prizeValue={competition.prizeValue}
            category={competition.category}
            difficulty={competition.difficulty}
            requirements={competition.requirements}
            rules={competition.rules}
          />
        ))}

        {displayedCompetitions.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-xl font-semibold mb-2">
              No competitions found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionGrid;
