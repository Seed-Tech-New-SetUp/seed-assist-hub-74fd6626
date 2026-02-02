import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, RefreshCw, Eye, Upload } from "lucide-react";
import { fetchVisaLicenses, VisaLicense } from "@/lib/api/visa-tutor";
import { LicenseDetailModal } from "@/components/visa/LicenseDetailModal";
import { BulkUploadModal } from "@/components/visa/BulkUploadModal";

export default function VisaPrep() {
  const [search, setSearch] = useState("");
  const [activationStatus, setActivationStatus] = useState<string>("all");
  const [usageStatus, setUsageStatus] = useState<string>("all");
  const [visaStatus, setVisaStatus] = useState<string>("all");
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["visa-licenses", search, activationStatus, usageStatus, visaStatus],
    queryFn: () =>
      fetchVisaLicenses({
        search: search || undefined,
        activation_status: activationStatus !== "all" ? activationStatus : undefined,
        usage_status: usageStatus !== "all" ? usageStatus : undefined,
        visa_status: visaStatus !== "all" ? visaStatus : undefined,
      }),
  });

  const licenses = data?.data?.licenses || [];
  const pagination = data?.data?.pagination;

  const getActivationBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Inactive</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUsageBadge = (status: string) => {
    switch (status) {
      case "used":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Used</Badge>;
      case "unused":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Unused</Badge>;
      case "partial":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVisaStatusBadge = (status?: string) => {
    if (!status) return <span className="text-muted-foreground">—</span>;
    switch (status) {
      case "applied":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Applied</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>;
      case "scheduled":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Scheduled</Badge>;
      case "not_applied":
        return <Badge variant="outline">Not Applied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Visa Tutor</h1>
          <p className="text-muted-foreground mt-1">
            Manage visa tutoring licenses and student sessions
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, license..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={activationStatus} onValueChange={setActivationStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Activation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activation</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={usageStatus} onValueChange={setUsageStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Usage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Usage</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="unused">Unused</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={visaStatus} onValueChange={setVisaStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Visa Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visa Status</SelectItem>
                  <SelectItem value="not_applied">Not Applied</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={() => setShowBulkUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Licenses Table */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              Licenses {pagination?.total !== undefined && `(${pagination.total})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No licenses found. Try adjusting your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>License Number</TableHead>
                      <TableHead>Alloted To</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Target Degree</TableHead>
                      <TableHead>Visa App. Type</TableHead>
                      <TableHead>Visa Slot Date</TableHead>
                      <TableHead>Activation Expiry Date</TableHead>
                      <TableHead className="text-center">Activation Status</TableHead>
                      <TableHead>Activation Date</TableHead>
                      <TableHead>Usage Expiry Date</TableHead>
                      <TableHead className="text-center">Usage Status</TableHead>
                      <TableHead>Usage Start Date</TableHead>
                      <TableHead className="text-center sticky right-12 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">Test Attempted</TableHead>
                      <TableHead className="text-center sticky right-0 bg-background z-10">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license: VisaLicense) => (
                      <TableRow key={license.license_number}>
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {license.license_number}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{license.alloted_to || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.created_date || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.sub_partner_id || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.student_name || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.mobile || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {license.email || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{license.target_degree || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.visa_app_type || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.visa_slot_date || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.activation_expiry_date || "—"}</TableCell>
                        <TableCell className="text-center">
                          {getActivationBadge(license.activation_status)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{license.activation_date || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{license.usage_expiry_date || "—"}</TableCell>
                        <TableCell className="text-center">
                          {getUsageBadge(license.usage_status)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{license.usage_start_date || "—"}</TableCell>
                        <TableCell className="text-center font-medium sticky right-12 bg-background z-10 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                          {license.test_attempted ?? 0}
                        </TableCell>
                        <TableCell className="text-center sticky right-0 bg-background z-10">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedLicense(license.license_number)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* License Detail Modal */}
      <LicenseDetailModal
        licenseNumber={selectedLicense}
        open={!!selectedLicense}
        onClose={() => setSelectedLicense(null)}
        onUpdate={() => refetch()}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => {
          setShowBulkUpload(false);
          refetch();
        }}
      />
    </DashboardLayout>
  );
}
