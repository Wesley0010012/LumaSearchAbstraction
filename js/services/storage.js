export function safeParse(value, fallback) {
  try { return JSON.parse(value) ?? fallback; }
  catch { return fallback; }
}

export function createStorage(storage = window.localStorage) {
  return {
    read(key, fallback) {
      try { return JSON.parse(storage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    readRaw(key, fallback = null) {
      return storage.getItem(key) ?? fallback;
    },
    write(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
    writeRaw(key, value) {
      storage.setItem(key, value);
    },
    remove(key) {
      storage.removeItem(key);
    }
  };
}

export const appStorage = createStorage();
