"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, FilterIcon, X } from "lucide-react";

interface FilterControlsProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  category: string;
  prizeRange: [number, number];
  endDate: Date | null;
  difficulty: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  onFilterChange = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    prizeRange: [0, 10000],
    endDate: null,
    difficulty: "any",
  });

  const categories = [
    "Art",
    "Photography",
    "Writing",
    "Design",
    "Music",
    "Technology",
    "Other",
  ];
  const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      category: "all",
      prizeRange: [0, 10000],
      endDate: null,
      difficulty: "any",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.endDate) count++;
    if (filters.difficulty !== "any") count++;
    if (filters.prizeRange[0] > 0 || filters.prizeRange[1] < 10000) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="w-full bg-background border-b p-4 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto">
        {/* Mobile view */}
        <div className="md:hidden flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <FilterIcon size={16} />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Mobile expanded filters */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Difficulty
                </label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) =>
                    handleFilterChange("difficulty", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Difficulty</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Prize Range (${filters.prizeRange[0]} - $
                  {filters.prizeRange[1]})
                </label>
                <Slider
                  defaultValue={[0, 10000]}
                  min={0}
                  max={10000}
                  step={100}
                  value={filters.prizeRange}
                  onValueChange={(value) =>
                    handleFilterChange("prizeRange", value)
                  }
                  className="py-4"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  End Date Before
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate
                        ? format(filters.endDate, "PPP")
                        : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate || undefined}
                      onSelect={(date) => handleFilterChange("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Desktop view */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.difficulty}
              onValueChange={(value) => handleFilterChange("difficulty", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Any Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Difficulty</SelectItem>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 max-w-xs">
              <div className="text-sm font-medium mb-1">
                Prize Range: ${filters.prizeRange[0]} - ${filters.prizeRange[1]}
              </div>
              <Slider
                defaultValue={[0, 10000]}
                min={0}
                max={10000}
                step={100}
                value={filters.prizeRange}
                onValueChange={(value) =>
                  handleFilterChange("prizeRange", value)
                }
                className="py-2"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate
                    ? format(filters.endDate, "PPP")
                    : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => handleFilterChange("endDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X size={14} /> Clear Filters
            </Button>
          )}
        </div>

        {/* Active filter badges - desktop only */}
        {activeFilterCount > 0 && (
          <div className="hidden md:flex flex-wrap gap-2 mt-2">
            {filters.category !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("category", "all")}
                />
              </Badge>
            )}
            {(filters.prizeRange[0] > 0 || filters.prizeRange[1] < 10000) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Prize: ${filters.prizeRange[0]} - ${filters.prizeRange[1]}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("prizeRange", [0, 10000])}
                />
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Before: {format(filters.endDate, "PP")}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("endDate", null)}
                />
              </Badge>
            )}
            {filters.difficulty !== "any" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Difficulty: {filters.difficulty}
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("difficulty", "any")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
