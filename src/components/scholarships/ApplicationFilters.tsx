import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Search, X, Filter } from "lucide-react";

export interface FilterState {
  standardizedTests: string[];
  testScoreRange: [number, number];
  ugCompletionYears: number[];
  cgpaScale: "4" | "10";
  cgpaRange: [number, number];
  workExpRange: [number, number];
  nationalities: string[];
  genders: string[];
}

interface ApplicationFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTests: string[];
  availableYears: number[];
  availableNationalities: string[];
  availableGenders: string[];
}

const testScoreRanges: Record<string, [number, number]> = {
  GMAT: [200, 800],
  GRE: [260, 340],
  TOEFL: [0, 120],
  IELTS: [0, 9],
};

interface MultiSelectFilterProps {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  placeholder?: string;
}

function MultiSelectFilter({ label, options, selected, onChange, placeholder }: MultiSelectFilterProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      String(opt).toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (option: string | number) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-between min-w-[160px] h-9 text-sm font-normal"
        >
          <span className="truncate">
            {selected.length > 0 ? `${label} (${selected.length})` : placeholder || label}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-2 space-y-1">
            {filteredOptions.map((option) => (
              <div
                key={String(option)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => toggleOption(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
            )}
          </div>
        </ScrollArea>
        {selected.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8"
              onClick={() => onChange([])}
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  suffix?: string;
}

function RangeFilter({ label, min, max, value, onChange, step = 1, suffix = "" }: RangeFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-between min-w-[140px] h-9 text-sm font-normal"
        >
          <span className="truncate">
            {value[0] === min && value[1] === max 
              ? label 
              : `${value[0]}${suffix} - ${value[1]}${suffix}`}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">
              {value[0]}{suffix} - {value[1]}{suffix}
            </span>
          </div>
          <Slider
            value={value}
            onValueChange={(v) => onChange(v as [number, number])}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Min</label>
              <Input
                type="number"
                value={value[0]}
                onChange={(e) => onChange([Number(e.target.value), value[1]])}
                min={min}
                max={value[1]}
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Max</label>
              <Input
                type="number"
                value={value[1]}
                onChange={(e) => onChange([value[0], Number(e.target.value)])}
                min={value[0]}
                max={max}
                className="h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ApplicationFilters({
  filters,
  onFiltersChange,
  availableTests,
  availableYears,
  availableNationalities,
  availableGenders,
}: ApplicationFiltersProps) {
  const getTestScoreMax = () => {
    if (filters.standardizedTests.length === 1) {
      return testScoreRanges[filters.standardizedTests[0]]?.[1] || 800;
    }
    return 800;
  };

  const getTestScoreMin = () => {
    if (filters.standardizedTests.length === 1) {
      return testScoreRanges[filters.standardizedTests[0]]?.[0] || 0;
    }
    return 0;
  };

  const getCgpaMax = () => {
    return filters.cgpaScale === "4" ? 4 : 10;
  };

  const hasActiveFilters = () => {
    return (
      filters.standardizedTests.length > 0 ||
      filters.ugCompletionYears.length > 0 ||
      filters.nationalities.length > 0 ||
      filters.genders.length > 0 ||
      filters.testScoreRange[0] !== getTestScoreMin() ||
      filters.testScoreRange[1] !== getTestScoreMax() ||
      filters.cgpaRange[0] !== 0 ||
      filters.cgpaRange[1] !== getCgpaMax() ||
      filters.workExpRange[0] !== 0 ||
      filters.workExpRange[1] !== 20
    );
  };

  const clearAllFilters = () => {
    onFiltersChange({
      standardizedTests: [],
      testScoreRange: [0, 800],
      ugCompletionYears: [],
      cgpaScale: "4",
      cgpaRange: [0, 4],
      workExpRange: [0, 20],
      nationalities: [],
      genders: [],
    });
  };

  const activeFilterCount = [
    filters.standardizedTests.length > 0,
    filters.testScoreRange[0] !== getTestScoreMin() || filters.testScoreRange[1] !== getTestScoreMax(),
    filters.ugCompletionYears.length > 0,
    filters.cgpaRange[0] !== 0 || filters.cgpaRange[1] !== getCgpaMax(),
    filters.workExpRange[0] !== 0 || filters.workExpRange[1] !== 20,
    filters.nationalities.length > 0,
    filters.genders.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} active
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 items-start">
        {/* Standardized Test Filter */}
        <MultiSelectFilter
          label="Standardized Test"
          options={availableTests}
          selected={filters.standardizedTests}
          onChange={(selected) => {
            const tests = selected as string[];
            const newRange: [number, number] = tests.length === 1
              ? testScoreRanges[tests[0]] || [0, 800]
              : [0, 800];
            onFiltersChange({ ...filters, standardizedTests: tests, testScoreRange: newRange });
          }}
          placeholder="Test Type"
        />

        {/* Test Score Range */}
        <RangeFilter
          label="Test Score"
          min={getTestScoreMin()}
          max={getTestScoreMax()}
          value={filters.testScoreRange}
          onChange={(value) => onFiltersChange({ ...filters, testScoreRange: value })}
        />

        {/* UG Completion Year */}
        <MultiSelectFilter
          label="UG Completion Year"
          options={availableYears}
          selected={filters.ugCompletionYears}
          onChange={(selected) => onFiltersChange({ ...filters, ugCompletionYears: selected as number[] })}
          placeholder="Completion Year"
        />

        {/* CGPA Scale Selection */}
        <Select
          value={filters.cgpaScale}
          onValueChange={(value: "4" | "10") => {
            const newMax = value === "4" ? 4 : 10;
            onFiltersChange({
              ...filters,
              cgpaScale: value,
              cgpaRange: [0, newMax],
            });
          }}
        >
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue placeholder="CGPA Scale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">Scale 4.0</SelectItem>
            <SelectItem value="10">Scale 10.0</SelectItem>
          </SelectContent>
        </Select>

        {/* CGPA Range */}
        <RangeFilter
          label="CGPA Range"
          min={0}
          max={getCgpaMax()}
          value={filters.cgpaRange}
          onChange={(value) => onFiltersChange({ ...filters, cgpaRange: value })}
          step={0.1}
        />

        {/* Work Experience Range */}
        <RangeFilter
          label="Work Experience"
          min={0}
          max={20}
          value={filters.workExpRange}
          onChange={(value) => onFiltersChange({ ...filters, workExpRange: value })}
          suffix=" yrs"
        />

        {/* Nationality */}
        <MultiSelectFilter
          label="Nationality"
          options={availableNationalities}
          selected={filters.nationalities}
          onChange={(selected) => onFiltersChange({ ...filters, nationalities: selected as string[] })}
          placeholder="Nationality"
        />

        {/* Gender */}
        <MultiSelectFilter
          label="Gender"
          options={availableGenders}
          selected={filters.genders}
          onChange={(selected) => onFiltersChange({ ...filters, genders: selected as string[] })}
          placeholder="Gender"
        />

        {/* Clear All */}
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {filters.standardizedTests.map(test => (
            <Badge key={test} variant="secondary" className="text-xs gap-1">
              {test}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({
                  ...filters,
                  standardizedTests: filters.standardizedTests.filter(t => t !== test),
                })}
              />
            </Badge>
          ))}
          {filters.ugCompletionYears.map(year => (
            <Badge key={year} variant="secondary" className="text-xs gap-1">
              {year}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({
                  ...filters,
                  ugCompletionYears: filters.ugCompletionYears.filter(y => y !== year),
                })}
              />
            </Badge>
          ))}
          {filters.nationalities.map(nat => (
            <Badge key={nat} variant="secondary" className="text-xs gap-1">
              {nat}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({
                  ...filters,
                  nationalities: filters.nationalities.filter(n => n !== nat),
                })}
              />
            </Badge>
          ))}
          {filters.genders.map(gender => (
            <Badge key={gender} variant="secondary" className="text-xs gap-1">
              {gender}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({
                  ...filters,
                  genders: filters.genders.filter(g => g !== gender),
                })}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
