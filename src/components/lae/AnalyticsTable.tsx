import { CheckSquare, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TableDataItem {
  label: string;
  count: number;
}

interface AnalyticsTableProps {
  data: TableDataItem[];
  total: number;
  headerLabel: string;
  onItemClick: (label: string) => void;
  multiSelectMode: boolean;
  selectedItems: string[];
  onToggleMultiSelect: () => void;
  onViewSelected: () => void;
}

export function AnalyticsTable({
  data,
  total,
  headerLabel,
  onItemClick,
  multiSelectMode,
  selectedItems,
  onToggleMultiSelect,
  onViewSelected,
}: AnalyticsTableProps) {
  const handleRowClick = (label: string) => {
    if (!multiSelectMode) {
      onItemClick(label);
    }
  };

  const handleCheckboxChange = (label: string, checked: boolean) => {
    onItemClick(label);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Multi-select toolbar */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant={multiSelectMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleMultiSelect}
        >
          {multiSelectMode ? (
            <>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </>
          ) : (
            <>
              <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
              Select Multiple
            </>
          )}
        </Button>
        {multiSelectMode && (
          <Button
            variant="default"
            size="sm"
            onClick={onViewSelected}
            disabled={selectedItems.length === 0}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Selected ({selectedItems.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              {multiSelectMode && (
                <TableHead className="w-[40px] text-center">
                  <Checkbox
                    checked={selectedItems.length === data.length && data.length > 0}
                    ref={(el) => {
                      if (el) {
                        const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;
                        (el as unknown as HTMLInputElement).indeterminate = isIndeterminate;
                      }
                    }}
                    onCheckedChange={(checked) => {
                      const allLabels = data.map((item) => item.label);
                      if (checked) {
                        // Select all not already selected
                        allLabels.forEach((label) => {
                          if (!selectedItems.includes(label)) {
                            onItemClick(label);
                          }
                        });
                      } else {
                        // Deselect all currently selected
                        selectedItems.forEach((label) => {
                          if (allLabels.includes(label)) {
                            onItemClick(label);
                          }
                        });
                      }
                    }}
                  />
                </TableHead>
              )}
              <TableHead>{headerLabel}</TableHead>
              <TableHead className="text-right w-[100px]">Count</TableHead>
              <TableHead className="text-right w-[100px]">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const percentage =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
              const isSelected = selectedItems.includes(item.label);

              return (
                <TableRow
                  key={item.label}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected && "bg-primary/10"
                  )}
                  onClick={() => handleRowClick(item.label)}
                >
                  {multiSelectMode && (
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(item.label, !!checked)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-right">{item.count.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{percentage}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              {multiSelectMode && <TableCell />}
              <TableCell className="font-semibold">Total</TableCell>
              <TableCell className="text-right font-semibold">
                {total.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold">100%</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
}
