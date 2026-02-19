"use client";

import { encrypt, decrypt } from "@/lib/crypto";
import type { AIProvider, APIKey } from "@/types";

const STORAGE_PREFIX = "whywhyhire_";

const KEY_MAP: Record<AIProvider, string> = {
  openai: `${STORAGE_PREFIX}oai`,
  anthropic: `${STORAGE_PREFIX}ant`,
  google: `${STORAGE_PREFIX}goo`,
};

const MODEL_MAP: Record<AIProvider, string> = {
  openai: `${STORAGE_PREFIX}oai_model`,
  anthropic: `${STORAGE_PREFIX}ant_model`,
  google: `${STORAGE_PREFIX}goo_model`,
};

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-opus-4-6",
  google: "gemini-2.0-flash",
};

export function saveAPIKey(provider: AIProvider, key: string, model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_MAP[provider], encrypt(key));
  localStorage.setItem(MODEL_MAP[provider], model);
}

export function getAPIKey(provider: AIProvider): APIKey | null {
  if (typeof window === "undefined") return null;
  const encrypted = localStorage.getItem(KEY_MAP[provider]);
  const model = localStorage.getItem(MODEL_MAP[provider]);
  if (!encrypted) return null;
  const key = decrypt(encrypted);
  if (!key) return null;
  return { provider, key, model: model || DEFAULT_MODELS[provider] };
}

export function removeAPIKey(provider: AIProvider): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_MAP[provider]);
  localStorage.removeItem(MODEL_MAP[provider]);
}

export function getAllAPIKeys(): APIKey[] {
  const providers: AIProvider[] = ["openai", "anthropic", "google"];
  return providers.map((p) => getAPIKey(p)).filter((k): k is APIKey => k !== null);
}

export function hasAnyAPIKey(): boolean {
  return getAllAPIKeys().length > 0;
}
