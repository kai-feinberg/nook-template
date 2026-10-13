import type { NookState } from "../schema.ts";
import type { NookStorage } from "./nookStorage.ts";
import { NOOK_STATE_STORAGE_KEY } from "./nookStorage.ts";

export const localStorageAdapter: NookStorage = {
  async getState() {
    const raw = localStorage.getItem(NOOK_STATE_STORAGE_KEY);
    try {
      return raw ? (JSON.parse(raw) as NookState) : null;
    } catch {
      return null;
    }
  },
  async setState(state) {
    localStorage.setItem(NOOK_STATE_STORAGE_KEY, JSON.stringify(state));
  },
  async resetState() {
    localStorage.removeItem(NOOK_STATE_STORAGE_KEY);
  },
  subscribe(listener) {
    const handler = (event: StorageEvent) => {
      if (event.key === NOOK_STATE_STORAGE_KEY && event.newValue) {
        listener(JSON.parse(event.newValue) as NookState);
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
};
