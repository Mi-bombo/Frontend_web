import type { ApiResult } from "./types";

const defaultHeaders = {
  "Content-Type": "application/json",
};

export async function apiRequest<T>(
  input: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(input, {
      credentials: "include",
      ...init,
      headers: {
        ...defaultHeaders,
        ...(init.headers || {}),
      },
    });

    const payload = await parseBody(response);

    if (!response.ok) {
      const errorMessage =
        (payload as any)?.error ||
        (payload as any)?.message ||
        `Error ${response.status}`;
      return { success: false, error: errorMessage, raw: payload };
    }
    return { success: true, data: payload as T };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al comunicarse con la API";
    return { success: false, error: message, raw: error };
  }
}

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
