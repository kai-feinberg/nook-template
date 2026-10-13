export type StoredPhoto = { id: string; name: string; addedAt: number; blob: Blob };
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_PHOTOS = 24;
const databaseName = "nook-template-photos";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("photos", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Close other Nook tabs and try again."));
  });
}

export async function readPhotos(): Promise<StoredPhoto[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("photos", "readonly");
    const request = transaction.objectStore("photos").getAll();
    transaction.oncomplete = () => { database.close(); resolve((request.result as StoredPhoto[]).sort((a, b) => a.addedAt - b.addedAt || a.id.localeCompare(b.id))); };
    transaction.onabort = () => { database.close(); reject(transaction.error); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

export function photoValidationError(files: readonly { type: string; size: number }[], existing = 0): string | null {
  if (!files.length) return "Choose at least one image.";
  if (files.length + existing > MAX_PHOTOS) return "Use up to 24 photos. Remove some photos, then try again.";
  if (files.some(file => !["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(file.type))) return "Choose JPG, PNG, WebP, AVIF, or GIF images.";
  if (files.some(file => file.size > MAX_PHOTO_BYTES)) return "Each photo must be 8 MB or less.";
  return null;
}

export async function addPhotos(files: File[]): Promise<void> {
  const validationError = photoValidationError(files);
  if (validationError) throw new Error(validationError);
  for (const file of files) {
    try { const bitmap = await createImageBitmap(file); bitmap.close(); }
    catch { throw new Error(`Could not read ${file.name}. Choose another image.`); }
  }
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("photos", "readwrite");
    const store = transaction.objectStore("photos");
    const count = store.count();
    let limitError: string | null = null;
    count.onsuccess = () => {
      limitError = photoValidationError(files, count.result);
      if (limitError) { transaction.abort(); return; }
      files.forEach((file, index) => store.put({ id: `photo-${crypto.randomUUID()}`, name: file.name, addedAt: Date.now() + index, blob: file } satisfies StoredPhoto));
    };
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onabort = () => { database.close(); reject(new Error(limitError ?? "Could not save photos. Check browser storage and try again.")); };
    transaction.onerror = () => { database.close(); reject(new Error("Could not save photos. Check browser storage and try again.")); };
  });
}

export async function removePhoto(id: string): Promise<void> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("photos", "readwrite");
    transaction.objectStore("photos").delete(id);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onabort = () => { database.close(); reject(new Error("Could not remove the photo. Try again.")); };
    transaction.onerror = () => { database.close(); reject(new Error("Could not remove the photo. Try again.")); };
  });
}
