import { useState, useRef } from "react";
import { Image, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Click to upload image",
  aspectRatio = "auto",
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange?.(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onChange?.("");
    onRemove?.();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[3/1]",
    auto: "min-h-[120px]",
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center overflow-hidden",
        aspectClasses[aspectRatio],
        preview ? "border-solid border-muted" : "border-muted-foreground/25",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="text-center p-4">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">{placeholder}</p>
        </div>
      )}
    </div>
  );
}
