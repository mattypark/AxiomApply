import { MAX_FILE, WEBHOOK_URL } from "@/lib/apply-contract";

/**
 * The frozen wire write.
 *
 * Byte-for-byte the same request the Astro build shipped and the Next port
 * kept: a browser fetch POST with mode "no-cors" and a URLSearchParams body,
 * files as `<name>_name` / `<name>_type` / `<name>_base64`. The Apps Script
 * response is opaque under no-cors, so this is fire-and-forget by design —
 * there is no success signal to read, only a network failure to swallow.
 *
 * Do not "improve" this into JSON, multipart, or a server-side fetch. The
 * Sheet's Apps Script parses exactly this shape.
 */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function postToWebhook(
  answers: Record<string, string>,
  files: Record<string, File>,
  /**
   * Which application this is. The intern side omits it, so its payload stays
   * byte-identical to the frozen contract; the startup side sends "startup"
   * and the Apps Script routes those rows to their own tab.
   */
  formType?: "startup",
): Promise<void> {
  const payload: Record<string, string> = {};
  if (formType) payload.form_type = formType;

  for (const [key, value] of Object.entries(answers)) {
    const trimmed = value?.trim();
    if (trimmed) payload[key] = trimmed;
  }

  for (const [name, file] of Object.entries(files)) {
    if (!file || file.size > MAX_FILE) continue;
    payload[`${name}_name`] = file.name;
    payload[`${name}_type`] = file.type || "application/octet-stream";
    payload[`${name}_base64`] = await fileToBase64(file);
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(payload),
    });
  } catch {
    /* opaque by design */
  }
}
