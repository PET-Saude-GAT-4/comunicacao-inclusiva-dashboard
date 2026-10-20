"use client";

import { useEffect, useState } from "react";
import { getUserEmails } from "@/services/users";

// Kept for as long as the page is loaded, so each author is asked for once
// however often their rows come back into view. An author the API would not
// return is kept as null too, since asking again would only fail again.
const emails = new Map<string, Promise<string | null>>();
let queued = new Map<string, (email: string | null) => void>();

// Every row that mounts in the same render asks before this runs, so a page of
// rows costs a single request.
function flush() {
  const batch = queued;
  queued = new Map();

  getUserEmails([...batch.keys()])
    .then((found) => batch.forEach((resolve, uuid) => resolve(found[uuid] ?? null)))
    // The whole request failing says nothing about the authors, so they are
    // forgotten and asked for again the next time a row shows them.
    .catch(() =>
      batch.forEach((resolve, uuid) => {
        emails.delete(uuid);
        resolve(null);
      }),
    );
}

function lookup(uuid: string): Promise<string | null> {
  let email = emails.get(uuid);
  if (!email) {
    email = new Promise((resolve) => {
      if (queued.size === 0) queueMicrotask(flush);
      queued.set(uuid, resolve);
    });
    emails.set(uuid, email);
  }
  return email;
}

// The email of the user with this uuid, or null while it loads, when there is
// none, or when it cannot be read. Pass null to skip the lookup.
export function useAuthorEmail(uuid: string | null): string | null {
  const [resolved, setResolved] = useState<{
    uuid: string;
    email: string | null;
  } | null>(null);

  useEffect(() => {
    if (!uuid) return;
    let cancelled = false;
    lookup(uuid).then((email) => {
      if (!cancelled) setResolved({ uuid, email });
    });
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  return resolved?.uuid === uuid ? resolved.email : null;
}
