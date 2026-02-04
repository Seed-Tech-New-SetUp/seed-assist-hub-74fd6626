import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface YearFilterProps {
  value: string;
  onChange: (value: string) => void;
  years?: string[];
}

export function YearFilter({ value, onChange, years = ["All", "2024", "2025", "2026"] }: YearFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-muted-foreground whitespace-nowrap">Year:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SeasonFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const SEASONS = ["All", "Spring", "Summer", "Fall"];

export function SeasonFilter({ value, onChange }: SeasonFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-muted-foreground whitespace-nowrap">Season:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Season" />
        </SelectTrigger>
        <SelectContent>
          {SEASONS.map((season) => (
            <SelectItem key={season} value={season}>
              {season}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface MonthFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const MONTHS = [
  "All",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthFilter({ value, onChange }: MonthFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-muted-foreground whitespace-nowrap">Month:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface RegionFilterProps {
  value: string;
  onChange: (value: string) => void;
  regions: string[];
}

export function RegionFilter({ value, onChange, regions }: RegionFilterProps) {
  const options = ["All", ...regions.filter(Boolean).sort()];
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-muted-foreground whitespace-nowrap">Region:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          {options.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Backward compatibility alias
export const CountryFilter = RegionFilter;

interface CityFilterProps {
  value: string;
  onChange: (value: string) => void;
  cities: string[];
}

export function CityFilter({ value, onChange, cities }: CityFilterProps) {
  // Include empty cities as "Unknown"
  const hasEmptyCities = cities.some(c => !c);
  const nonEmptyCities = cities.filter(Boolean).sort();
  const options = ["All", ...nonEmptyCities, ...(hasEmptyCities ? ["Unknown"] : [])];
  return (
    <div className="flex items-center gap-2">
      <Label className="text-sm text-muted-foreground whitespace-nowrap">City:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          {options.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Helper functions for filtering
export function getSeasonFromDate(dateStr: string): string {
  const month = new Date(dateStr).getMonth() + 1; // 1-12
  // Spring: Jan - May (1-5)
  // Summer: Jun - Jul (6-7)
  // Fall: Aug - Dec (8-12)
  if (month >= 1 && month <= 5) return "Spring";
  if (month >= 6 && month <= 7) return "Summer";
  return "Fall";
}

export function getMonthFromDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", { month: "long" });
}

export function getYearFromDate(dateStr: string): string {
  return new Date(dateStr).getFullYear().toString();
}

export function filterByYear<T extends { date: string }>(items: T[], year: string): T[] {
  if (year === "All") return items;
  return items.filter((item) => getYearFromDate(item.date) === year);
}

export function filterBySeason<T extends { date: string }>(items: T[], season: string): T[] {
  if (season === "All") return items;
  return items.filter((item) => getSeasonFromDate(item.date) === season);
}

export function filterByMonth<T extends { date: string }>(items: T[], month: string): T[] {
  if (month === "All") return items;
  return items.filter((item) => getMonthFromDate(item.date) === month);
}

export function filterByCountry<T extends { country?: string }>(items: T[], country: string): T[] {
  if (country === "All") return items;
  return items.filter((item) => item.country === country);
}

export function filterByCity<T extends { city?: string }>(items: T[], city: string): T[] {
  if (city === "All") return items;
  if (city === "Unknown") return items.filter((item) => !item.city);
  return items.filter((item) => item.city === city);
}
