"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { setAvatarUrl } from "@/lib/actions/profile";

/**
 * Profile photo.
 *
 * The upload goes browser → Supabase Storage directly (never through a route
 * handler), because the file is up to a few megabytes and the serverless
 * request body limit is not worth fighting. Storage RLS is what makes that
 * safe: 0015_profile.sql only allows a write under `<auth.uid()>/…`, so the
 * path below is not a trust decision the client gets to make.
 *
 * The public URL is then handed to a server action, which re-derives the
 * expected prefix from the session rather than trusting what was posted.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** jpg for jpeg, otherwise the subtype — keeps the object path predictable. */
function extensionFor(type: string): string {
  const subtype = type.split("/")[1] ?? "jpg";
  return subtype === "jpeg" ? "jpg" : subtype;
}

export function AvatarUploader({
  userId,
  avatarUrl,
  fallback,
}: {
  userId: string;
  avatarUrl: string | null;
  fallback: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const busy = uploading || isPending;

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Under 4MB, please.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Storage isn't connected yet.");
      return;
    }

    setUploading(true);
    // Timestamped so the CDN serves the new photo immediately instead of a
    // cached object at a reused path. The previous file is removed below.
    const path = `${userId}/avatar-${Date.now()}.${extensionFor(file.type)}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setUploading(false);
      setError("That didn't upload. Try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const previous = preview;
    setPreview(publicUrl);
    setUploading(false);

    startTransition(async () => {
      const result = await setAvatarUrl(publicUrl);
      if (!result.ok) {
        setPreview(previous);
        setError("Uploaded, but saving it to your profile failed.");
        return;
      }
      // Best effort — an orphaned old photo is harmless, a failed swap is not.
      const stalePath = previous?.split("/avatars/")[1];
      if (stalePath) {
        await supabase.storage.from("avatars").remove([stalePath]);
      }
    });
  }

  return (
    <div className="flex items-center gap-5">
      <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-[1.6rem] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(26,26,26,0.18)]">
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          fallback
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-ink/60 text-[0.65rem] font-medium tracking-wide text-white">
            …
          </span>
        )}
      </span>

      <div className="flex min-w-0 flex-col gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="w-fit cursor-pointer rounded-full bg-white/60 px-5 py-2.5 text-[0.9rem] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
        >
          {preview ? "Change photo" : "Add a photo"}
        </button>
        <p
          className={`text-[0.8rem] ${error ? "text-error" : "text-faint"}`}
          role={error ? "alert" : undefined}
        >
          {error ?? "JPG, PNG, or WebP — under 4MB. Founders see this."}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so re-picking the same file still fires a change event.
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
