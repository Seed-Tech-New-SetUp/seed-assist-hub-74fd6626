import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus, 
  Eye, 
  MousePointer, 
  Search, 
  Download,
  Loader2,
} from "lucide-react";
import {
  useLeadUserData,
  useLeadStats,
  useLeadPrograms,
  useLeadCountries,
  useLeads,
  useExportLeads,
} from "@/hooks/useLeads";
import { LeadsFilter } from "@/lib/api/leads";
import { format } from "date-fns";

// Country code to flag emoji mapping
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function ProfileLeads() {
  // Filters
  const [filterPage, setFilterPage] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Build filter object for API
  const apiFilters: LeadsFilter = useMemo(() => {
    const filters: LeadsFilter = {};
    if (filterPage !== "all") filters.filter_page = filterPage;
    if (dateFilter !== "all") filters.date_filter = dateFilter;
    if (countryFilter !== "all") filters.country = countryFilter;
    return filters;
  }, [filterPage, dateFilter, countryFilter]);

  // Queries
  const { data: userData } = useLeadUserData();
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const { data: programs = [] } = useLeadPrograms();
  const { data: countries = [] } = useLeadCountries();
  const { data: leads = [], isLoading: leadsLoading } = useLeads(apiFilters);
  const exportMutation = useExportLeads();

  // Client-side search filtering
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.country?.toLowerCase().includes(query)
    );
  }, [leads, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredLeads.length);
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset page on filter change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Page number generator
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // Stats cards config
  const statsCards = [
    {
      title: "TOTAL LEADS",
      value: stats?.total_leads ?? 0,
      icon: Users,
      iconBg: "bg-slate-600",
    },
    {
      title: "NEW LEADS (7 DAYS)",
      value: stats?.new_leads_7days ?? 0,
      icon: UserPlus,
      iconBg: "bg-orange-500",
    },
    {
      title: "ACTIVE LEADS",
      value: stats?.active_leads ?? 0,
      subtitle: "Viewed multiple pages",
      icon: Eye,
      iconBg: "bg-slate-600",
    },
    {
      title: "ENGAGED LEADS",
      value: stats?.engaged_leads ?? 0,
      subtitle: "Multiple clicks recorded",
      icon: MousePointer,
      iconBg: "bg-orange-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, idx) => (
            <Card key={idx} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Card with Filters & Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">All Leads</CardTitle>
            {userData?.school_name && (
              <p className="text-sm text-muted-foreground">{userData.school_name}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Pages</span>
                <Select value={filterPage} onValueChange={(v) => { setFilterPage(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {programs.map((p) => (
                      <SelectItem key={p.program_id} value={p.program_id}>
                        {p.program_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Date Range</span>
                <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Country</span>
                <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c.country_code} value={c.country_name}>
                        {getFlagEmoji(c.country_code)} {c.country_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="default"
                className="bg-orange-500 hover:bg-orange-600 text-white ml-auto"
                onClick={() => exportMutation.mutate(apiFilters)}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Leads
              </Button>
            </div>

            {/* Page Size & Search Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 25, 50].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>leads per page</span>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Programs Viewed</TableHead>
                    <TableHead className="text-center">Start Year</TableHead>
                    <TableHead className="text-center">Registered On</TableHead>
                    <TableHead className="text-center">Page Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedLeads.length > 0 ? (
                    paginatedLeads.map((lead, idx) => (
                      <TableRow key={lead.lead_id || idx}>
                        <TableCell>
                          <input type="checkbox" className="rounded border-gray-300" />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.phone && (
                              <p className="text-xs text-muted-foreground">{lead.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{lead.email}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            {lead.country_code && (
                              <span>{getFlagEmoji(lead.country_code)}</span>
                            )}
                            {lead.country}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.programs_viewed?.map((program, pIdx) => (
                              <Badge
                                key={pIdx}
                                variant="secondary"
                                className="bg-purple-500 text-white text-xs"
                              >
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{lead.start_year}</TableCell>
                        <TableCell className="text-center">
                          {lead.registered_on
                            ? format(new Date(lead.registered_on), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span>{lead.page_views}</span>
                            {lead.clicks > 0 && (
                              <Badge className="bg-orange-500 text-white text-xs">
                                {lead.clicks} cli
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No leads found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{endIndex} of {filteredLeads.length} leads
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, idx) =>
                      page === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
