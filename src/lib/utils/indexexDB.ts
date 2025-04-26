import { openDB } from 'idb';

const DB_NAME = 'csvUploaderDB';
const STORE_NAME = 'csvFiles';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveCsvData(key: string, data: Record<string, unknown>) {
  const db = await getDB();
  await db.put(STORE_NAME, data, key);
}

export async function getCsvData(key: string) {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}

export async function clearCsvData(key: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}
