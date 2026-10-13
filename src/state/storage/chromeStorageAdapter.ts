import type { NookState } from "../schema.ts";
import type { NookStorage } from "./nookStorage.ts";
import { NOOK_STATE_STORAGE_KEY } from "./nookStorage.ts";

export const chromeStorageAdapter: NookStorage = {
  async getState() {
    const result = await chrome.storage.local.get(NOOK_STATE_STORAGE_KEY);
    return (result[NOOK_STATE_STORAGE_KEY] as NookState | undefined) ?? null;
  },
  async setState(state) {
    await chrome.storage.local.set({ [NOOK_STATE_STORAGE_KEY]: state });
  },
  async resetState() {
    await chrome.storage.local.remove(NOOK_STATE_STORAGE_KEY);
  },
  subscribe(listener) {
    const handler = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === "local" && changes[NOOK_STATE_STORAGE_KEY]?.newValue) {
        listener(changes[NOOK_STATE_STORAGE_KEY].newValue as NookState);
      }
    };

    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }
};
