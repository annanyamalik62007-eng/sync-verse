import { useEffect, useState } from "react";

const KEY = "syncverse_user_id";

export function useCurrentUserId(): string | null {
  const [id, setId] = useState<string | null>(() => localStorage.getItem(KEY));
  useEffect(() => {
    const onStorage = () => setId(localStorage.getItem(KEY));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return id;
}

export function setCurrentUserId(id: string): void {
  localStorage.setItem(KEY, id);
  window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: id }));
}
