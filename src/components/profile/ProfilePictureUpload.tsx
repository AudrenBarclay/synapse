import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function ProfilePictureUpload({
  name,
  value,
  onChange
}: {
  name: string;
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft">
      <Avatar name={name || "User"} src={value} size="lg" />
      <div className="flex-1 space-y-1">
        <div className="text-sm font-semibold text-slate-900">Profile photo</div>
        <div className="text-sm text-slate-600">
          Upload a professional headshot (optional).
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              onChange(url);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

