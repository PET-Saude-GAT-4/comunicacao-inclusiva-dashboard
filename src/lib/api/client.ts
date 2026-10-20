import { getSession, deleteSession } from "@/utils/session";
import { ListQuery } from "@/types/common";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | undefined> {
  const session = await getSession();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(session?.token && { Authorization: `Bearer ${session.token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth/")) {
      await deleteSession();
      // Use Next.js redirect to automatically send the user to the login page
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }
    throw new ApiError(res.status, await res.text());
  }

  const text = await res.text();
  if (!text) return undefined;
  return JSON.parse(text) as T;
}

// Builds "?page=…&pageSize=…&q=…" for a paginated list endpoint, plus any
// filter the endpoint accepts. Empty values are left out of the string.
export function listQueryString(
  query: ListQuery,
  filters: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, ...filters })) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `?${params}`;
}
