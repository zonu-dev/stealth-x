export const SETTINGS_KEY = "stealthXSettings";

export type MaskMode = "alias";

export interface MaskSettings {
  enabled: boolean;
  mode: MaskMode;
  maskDisplayName: boolean;
  maskUsername: boolean;
  maskAvatar: boolean;
  maskAvatarBlur: boolean;
  maskBanner: boolean;
  maskBio: boolean;
  maskVerifiedBadge: boolean;
  maskWebsite: boolean;
  maskStats: boolean;
  maskLocation: boolean;
  maskJoinDate: boolean;
  maskPostCount: boolean;
}

export const DEFAULT_SETTINGS: MaskSettings = {
  enabled: true,
  mode: "alias",
  maskAvatar: true,
  maskAvatarBlur: false,
  maskBanner: true,
  maskBio: true,
  maskDisplayName: true,
  maskJoinDate: true,
  maskLocation: true,
  maskPostCount: true,
  maskStats: true,
  maskUsername: true,
  maskVerifiedBadge: true,
  maskWebsite: true
};

export function normalizeSettings(
  value: Partial<MaskSettings> | null | undefined
): MaskSettings {
  const normalizedMode: MaskMode = "alias";

  return {
    ...DEFAULT_SETTINGS,
    ...(value ?? {}),
    mode: normalizedMode
  };
}

function storageGet<T>(
  storage: chrome.storage.StorageArea,
  key: string
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    storage.get(key, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve(items[key] as T | undefined);
    });
  });
}

function storageSet(
  storage: chrome.storage.StorageArea,
  value: Record<string, unknown>
): Promise<void> {
  return new Promise((resolve, reject) => {
    storage.set(value, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      resolve();
    });
  });
}

export async function loadSettings(
  storage: chrome.storage.StorageArea = chrome.storage.sync
): Promise<MaskSettings> {
  const stored = await storageGet<MaskSettings>(storage, SETTINGS_KEY);

  return normalizeSettings(stored);
}

export async function saveSettings(
  partial: Partial<MaskSettings>,
  storage: chrome.storage.StorageArea = chrome.storage.sync
): Promise<MaskSettings> {
  const nextSettings = normalizeSettings({
    ...(await loadSettings(storage)),
    ...partial
  });

  await storageSet(storage, { [SETTINGS_KEY]: nextSettings });

  return nextSettings;
}

export function isSettingsStorageChange(
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string
): boolean {
  return areaName === "sync" && SETTINGS_KEY in changes;
}
