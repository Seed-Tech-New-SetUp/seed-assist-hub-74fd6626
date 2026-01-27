import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Organization {
  id: string;
  name: string;
}

interface OrganizationComboboxProps {
  organizations: Organization[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function OrganizationCombobox({
  organizations,
  value,
  onValueChange,
  placeholder = "Select organisation...",
  disabled = false,
}: OrganizationComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOrg = organizations.find((org) => org.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOrg ? selectedOrg.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organisations..." />
          <CommandList>
            <CommandEmpty>No organisation found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => {
                    onValueChange(org.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{org.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
