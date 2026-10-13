import type { NookState } from "../schema.ts";
import { chromeStorageAdapter } from "./chromeStorageAdapter.ts";
import { localStorageAdapter } from "./localStorageAdapter.ts";

export const NOOK_STATE_STORAGE_KEY = "nook-template.state";

export interface NookStorage {
  getState(): Promise<NookState | null>;
  setState(state: NookState): Promise<void>;
  resetState(): Promise<void>;
  subscribe?(listener: (state: NookState) => void): () => void;
}

export function getNookStorage(): NookStorage {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    return chromeStorageAdapter;
  }

  return localStorageAdapter;
}
