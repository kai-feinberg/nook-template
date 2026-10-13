import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { addPhotos, readPhotos, removePhoto } from "../state/storage/photoStorage.ts";
import type { StoredPhoto } from "../state/storage/photoStorage.ts";

export type Photo = { id: string; title: string; imageUrl: string; alt: string; sourceUrl: string };
type Library = { photos: Photo[]; busy: boolean; ready: boolean; error: string; add: (files: File[]) => Promise<boolean>; remove: (id: string) => Promise<void> };
const PhotoContext = createContext<Library | null>(null);
export function PhotoLibraryProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredPhoto[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try { const records = await readPhotos(); if (active) setStored(records); }
      catch { if (active) setError("Could not load your photos. Check browser storage and reload."); }
      finally { if (active) setReady(true); }
    }
    void load();
    const channel = new BroadcastChannel("nook-template-photos");
    channel.onmessage = () => void load();
    return () => { active = false; channel.close(); };
  }, []);
  useEffect(() => {
    const next = stored.map(photo => ({ id: photo.id, title: photo.name.replace(/\.[^.]+$/, ""), imageUrl: URL.createObjectURL(photo.blob), alt: photo.name, sourceUrl: "" }));
    setPhotos(next);
    return () => next.forEach(photo => URL.revokeObjectURL(photo.imageUrl));
  }, [stored]);
  function notify() { const channel = new BroadcastChannel("nook-template-photos"); channel.postMessage("changed"); channel.close(); }
  async function add(files: File[]) {
    setBusy(true); setError("");
    try { await addPhotos(files); setStored(await readPhotos()); notify(); return true; }
    catch (error) { setError(error instanceof Error ? error.message : "Could not add photos. Try again."); return false; }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError("");
    try { await removePhoto(id); setStored(await readPhotos()); notify(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not remove the photo. Try again."); }
    finally { setBusy(false); }
  }
  return <PhotoContext.Provider value={{ photos, busy, ready, error, add, remove }}>{children}</PhotoContext.Provider>;
}
export function usePhotoLibrary() { const library = useContext(PhotoContext); if (!library) throw new Error("Photo library provider is missing."); return library; }
