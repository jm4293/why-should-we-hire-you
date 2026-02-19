"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { HistoryItem, DraftData, Persona } from "@/types";

interface AppDB extends DBSchema {
  history: {
    key: string;
    value: HistoryItem;
    indexes: { createdAt: string };
  };
  draft: {
    key: string;
    value: DraftData & { _key: string };
  };
  personas: {
    key: string;
    value: Persona;
  };
}

const DB_NAME = "why-we-hire-you";
const DB_VERSION = 1;
const MAX_HISTORY = 50;
const DRAFT_KEY = "current";

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const historyStore = db.createObjectStore("history", { keyPath: "id" });
        historyStore.createIndex("createdAt", "createdAt");

        db.createObjectStore("draft", { keyPath: "_key" });
        db.createObjectStore("personas", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

// History
export async function saveHistory(item: HistoryItem): Promise<void> {
  const db = await getDB();
  await db.put("history", item);
  await enforceHistoryLimit(db);
}

export async function getAllHistory(): Promise<HistoryItem[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex("history", "createdAt");
  return items.reverse();
}

export async function deleteHistory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("history", id);
}

export async function clearAllHistory(): Promise<void> {
  const db = await getDB();
  await db.clear("history");
}

async function enforceHistoryLimit(db: IDBPDatabase<AppDB>): Promise<void> {
  const items = await db.getAllFromIndex("history", "createdAt");
  if (items.length > MAX_HISTORY) {
    const toDelete = items.slice(0, items.length - MAX_HISTORY);
    for (const item of toDelete) {
      await db.delete("history", item.id);
    }
  }
}

// Draft
export async function saveDraft(data: DraftData): Promise<void> {
  const db = await getDB();
  await db.put("draft", { ...data, _key: DRAFT_KEY });
}

export async function getDraft(): Promise<DraftData | undefined> {
  const db = await getDB();
  const result = await db.get("draft", DRAFT_KEY);
  if (!result) return undefined;
  const { _key: _, ...rest } = result;
  return rest as DraftData;
}

export async function deleteDraft(): Promise<void> {
  const db = await getDB();
  await db.delete("draft", DRAFT_KEY);
}

// Personas
export async function savePersona(persona: Persona): Promise<void> {
  const db = await getDB();
  await db.put("personas", persona);
}

export async function getAllPersonas(): Promise<Persona[]> {
  const db = await getDB();
  return db.getAll("personas");
}

export async function deletePersona(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("personas", id);
}
