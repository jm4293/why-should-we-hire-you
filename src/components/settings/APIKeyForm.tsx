"use client";

import { PROVIDERS } from "./provider-config";
import { APIKeyFormItem } from "./APIKeyFormItem";

interface APIKeyFormProps {
  onSaved: () => void;
}

export function APIKeyForm({ onSaved }: APIKeyFormProps) {
  return (
    <div className="space-y-4">
      {PROVIDERS.map((config) => (
        <APIKeyFormItem key={config.provider} config={config} onSaved={onSaved} />
      ))}
    </div>
  );
}
