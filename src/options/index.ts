import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type MaskSettings
} from "../shared/settings";

function assertElement<T extends HTMLElement>(element: T | null): T {
  if (!element) {
    throw new Error("Missing options element");
  }

  return element;
}

function readForm(): MaskSettings {
  return {
    enabled: assertElement(
      document.querySelector<HTMLInputElement>("#enabled")
    ).checked,
    mode: "alias",
    maskAvatar: assertElement(
      document.querySelector<HTMLInputElement>("#maskAvatar")
    ).checked,
    maskBanner: assertElement(
      document.querySelector<HTMLInputElement>("#maskBanner")
    ).checked,
    maskBio: assertElement(document.querySelector<HTMLInputElement>("#maskBio")).checked,
    maskDisplayName: assertElement(
      document.querySelector<HTMLInputElement>("#maskDisplayName")
    ).checked,
    maskJoinDate: assertElement(
      document.querySelector<HTMLInputElement>("#maskJoinDate")
    ).checked,
    maskLocation: assertElement(
      document.querySelector<HTMLInputElement>("#maskLocation")
    ).checked,
    maskPostCount: assertElement(
      document.querySelector<HTMLInputElement>("#maskPostCount")
    ).checked,
    maskStats: assertElement(
      document.querySelector<HTMLInputElement>("#maskStats")
    ).checked,
    maskUsername: assertElement(
      document.querySelector<HTMLInputElement>("#maskUsername")
    ).checked
  };
}

function writeForm(settings: MaskSettings) {
  assertElement(document.querySelector<HTMLInputElement>("#enabled")).checked =
    settings.enabled;
  assertElement(document.querySelector<HTMLInputElement>("#maskAvatar")).checked =
    settings.maskAvatar;
  assertElement(document.querySelector<HTMLInputElement>("#maskBanner")).checked =
    settings.maskBanner;
  assertElement(document.querySelector<HTMLInputElement>("#maskBio")).checked =
    settings.maskBio;
  assertElement(
    document.querySelector<HTMLInputElement>("#maskDisplayName")
  ).checked = settings.maskDisplayName;
  assertElement(document.querySelector<HTMLInputElement>("#maskJoinDate")).checked =
    settings.maskJoinDate;
  assertElement(document.querySelector<HTMLInputElement>("#maskLocation")).checked =
    settings.maskLocation;
  assertElement(document.querySelector<HTMLInputElement>("#maskPostCount")).checked =
    settings.maskPostCount;
  assertElement(document.querySelector<HTMLInputElement>("#maskStats")).checked =
    settings.maskStats;
  assertElement(document.querySelector<HTMLInputElement>("#maskUsername")).checked =
    settings.maskUsername;
}

async function initializeOptions() {
  const form = assertElement(document.querySelector<HTMLFormElement>("#settings-form"));
  const resetButton = assertElement(document.querySelector<HTMLButtonElement>("#reset"));
  const status = assertElement(document.querySelector<HTMLElement>("#status"));

  writeForm(await loadSettings());
  status.textContent = "変更後に保存してください。";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await saveSettings(readForm());
    status.textContent = "保存しました。開いている X タブにも順次反映されます。";
  });

  resetButton.addEventListener("click", async () => {
    writeForm(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
    status.textContent = "初期値に戻しました。";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  void initializeOptions();
});
