import { beforeEach, describe, expect, it, vi } from "vitest";

const defaultSettings = vi.hoisted(() => {
  return {
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
  } as const;
});

const maskingMocks = vi.hoisted(() => {
  return {
    applyMasking: vi.fn(),
    clearMaskingArtifacts: vi.fn(),
    ensureMaskStyles: vi.fn(),
    restoreMasking: vi.fn()
  };
});

const settingsMocks = vi.hoisted(() => {
  return {
    SETTINGS_KEY: "stealth-x-settings",
    DEFAULT_SETTINGS: defaultSettings,
    isSettingsStorageChange: vi.fn(() => false),
    loadSettings: vi.fn(async () => defaultSettings),
    normalizeSettings: vi.fn(() => defaultSettings)
  };
});

vi.mock("./masking", () => maskingMocks);
vi.mock("../shared/settings", () => settingsMocks);

describe("content navigation handling", () => {
  let rafQueue: FrameRequestCallback[];

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    document.head.innerHTML = "";
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/janedoe");

    rafQueue = [];

    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      rafQueue.push(callback);
      return rafQueue.length;
    });

    window.cancelAnimationFrame = vi.fn();

    Object.assign(globalThis, {
      chrome: {
        storage: {
          onChanged: {
            addListener: vi.fn()
          }
        }
      }
    });
  });

  it("clears masking artifacts before reapplying masking on SPA profile navigation", async () => {
    await import("./index");
    await Promise.resolve();
    await Promise.resolve();

    maskingMocks.applyMasking.mockClear();
    maskingMocks.clearMaskingArtifacts.mockClear();
    maskingMocks.ensureMaskStyles.mockClear();
    maskingMocks.restoreMasking.mockClear();

    window.history.pushState({}, "", "/otheruser");

    expect(maskingMocks.clearMaskingArtifacts).toHaveBeenCalledTimes(1);
    expect(maskingMocks.clearMaskingArtifacts).toHaveBeenLastCalledWith(document);
    expect(maskingMocks.restoreMasking).not.toHaveBeenCalled();
    expect(maskingMocks.applyMasking).not.toHaveBeenCalled();

    const [flush] = rafQueue;

    expect(flush).toBeTypeOf("function");

    flush(16);

    expect(maskingMocks.clearMaskingArtifacts).toHaveBeenCalledTimes(1);
    expect(maskingMocks.restoreMasking).toHaveBeenCalledTimes(1);
    expect(maskingMocks.applyMasking).toHaveBeenCalledTimes(1);
    expect(maskingMocks.applyMasking).toHaveBeenLastCalledWith(document, defaultSettings);
  });
});
