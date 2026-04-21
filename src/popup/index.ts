import {
  DEFAULT_SETTINGS,
  loadSettings,
  normalizeSettings,
  saveSettings,
  type MaskSettings
} from "../shared/settings";

const extensionChrome = globalThis.chrome;
let previewSettings: MaskSettings = { ...DEFAULT_SETTINGS };

function assertElement<T extends HTMLElement>(element: T | null): T {
  if (!element) {
    throw new Error("Missing popup element");
  }

  return element;
}

async function loadPopupSettings(): Promise<MaskSettings> {
  if (extensionChrome?.storage?.sync) {
    return loadSettings(extensionChrome.storage.sync);
  }

  return normalizeSettings(previewSettings);
}

async function savePopupSettings(partial: Partial<MaskSettings>): Promise<MaskSettings> {
  if (extensionChrome?.storage?.sync) {
    return saveSettings(partial, extensionChrome.storage.sync);
  }

  previewSettings = normalizeSettings({
    ...previewSettings,
    ...partial
  });

  return previewSettings;
}

async function initializePopup() {
  const enabledInput = assertElement(
    document.querySelector<HTMLInputElement>("#enabled")
  );
  const advancedEl = assertElement(
    document.querySelector<HTMLDetailsElement>(".advanced")
  );
  const resetButton = assertElement(
    document.querySelector<HTMLButtonElement>("#reset")
  );
  const detailInputs = {
    maskAvatar: assertElement(document.querySelector<HTMLInputElement>("#maskAvatar")),
    maskBanner: assertElement(document.querySelector<HTMLInputElement>("#maskBanner")),
    maskBio: assertElement(document.querySelector<HTMLInputElement>("#maskBio")),
    maskDisplayName: assertElement(
      document.querySelector<HTMLInputElement>("#maskDisplayName")
    ),
    maskJoinDate: assertElement(
      document.querySelector<HTMLInputElement>("#maskJoinDate")
    ),
    maskLocation: assertElement(
      document.querySelector<HTMLInputElement>("#maskLocation")
    ),
    maskPostCount: assertElement(
      document.querySelector<HTMLInputElement>("#maskPostCount")
    ),
    maskStats: assertElement(document.querySelector<HTMLInputElement>("#maskStats")),
    maskUsername: assertElement(document.querySelector<HTMLInputElement>("#maskUsername"))
  };

  function renderAdvancedState(enabled: boolean) {
    if (enabled) {
      advancedEl.dataset.disabled = "false";
      advancedEl.removeAttribute("inert");
    } else {
      advancedEl.dataset.disabled = "true";
      advancedEl.setAttribute("inert", "");
    }
  }

  function areDetailSettingsDefault(settings: MaskSettings): boolean {
    return (
      settings.maskAvatar === DEFAULT_SETTINGS.maskAvatar &&
      settings.maskBanner === DEFAULT_SETTINGS.maskBanner &&
      settings.maskBio === DEFAULT_SETTINGS.maskBio &&
      settings.maskDisplayName === DEFAULT_SETTINGS.maskDisplayName &&
      settings.maskJoinDate === DEFAULT_SETTINGS.maskJoinDate &&
      settings.maskLocation === DEFAULT_SETTINGS.maskLocation &&
      settings.maskPostCount === DEFAULT_SETTINGS.maskPostCount &&
      settings.maskStats === DEFAULT_SETTINGS.maskStats &&
      settings.maskUsername === DEFAULT_SETTINGS.maskUsername
    );
  }

  function renderForm(settings: MaskSettings) {
    enabledInput.checked = settings.enabled;
    detailInputs.maskAvatar.checked = settings.maskAvatar;
    detailInputs.maskBanner.checked = settings.maskBanner;
    detailInputs.maskBio.checked = settings.maskBio;
    detailInputs.maskDisplayName.checked = settings.maskDisplayName;
    detailInputs.maskJoinDate.checked = settings.maskJoinDate;
    detailInputs.maskLocation.checked = settings.maskLocation;
    detailInputs.maskPostCount.checked = settings.maskPostCount;
    detailInputs.maskStats.checked = settings.maskStats;
    detailInputs.maskUsername.checked = settings.maskUsername;
    renderAdvancedState(settings.enabled);
    resetButton.disabled = areDetailSettingsDefault(settings);
  }

  function readDetailSettings(): Partial<MaskSettings> {
    return {
      maskAvatar: detailInputs.maskAvatar.checked,
      maskBanner: detailInputs.maskBanner.checked,
      maskBio: detailInputs.maskBio.checked,
      maskDisplayName: detailInputs.maskDisplayName.checked,
      maskJoinDate: detailInputs.maskJoinDate.checked,
      maskLocation: detailInputs.maskLocation.checked,
      maskPostCount: detailInputs.maskPostCount.checked,
      maskStats: detailInputs.maskStats.checked,
      maskUsername: detailInputs.maskUsername.checked
    };
  }

  const settings = await loadPopupSettings();

  renderForm(settings);

  enabledInput.addEventListener("change", async () => {
    const next = await savePopupSettings({ enabled: enabledInput.checked });
    renderForm(next);
  });

  for (const input of Object.values(detailInputs)) {
    input.addEventListener("change", async () => {
      const next = await savePopupSettings(readDetailSettings());
      renderForm(next);
    });
  }

  resetButton.addEventListener("click", async () => {
    const next = await savePopupSettings(DEFAULT_SETTINGS);

    renderForm(next);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  void initializePopup();
});
