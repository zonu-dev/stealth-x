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
    maskAvatarBlur: assertElement(
      document.querySelector<HTMLInputElement>("#maskAvatarBlur")
    ).checked,
    maskBanner: assertElement(
      document.querySelector<HTMLInputElement>("#maskBanner")
    ).checked,
    maskBio: assertElement(document.querySelector<HTMLInputElement>("#maskBio")).checked,
    maskDisplayName: assertElement(
      document.querySelector<HTMLInputElement>("#maskDisplayName")
    ).checked,
    maskVerifiedBadge: assertElement(
      document.querySelector<HTMLInputElement>("#maskVerifiedBadge")
    ).checked,
    maskWebsite: assertElement(
      document.querySelector<HTMLInputElement>("#maskWebsite")
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
  assertElement(document.querySelector<HTMLInputElement>("#maskAvatarBlur")).checked =
    settings.maskAvatarBlur;
  assertElement(document.querySelector<HTMLInputElement>("#maskBanner")).checked =
    settings.maskBanner;
  assertElement(document.querySelector<HTMLInputElement>("#maskBio")).checked =
    settings.maskBio;
  assertElement(
    document.querySelector<HTMLInputElement>("#maskDisplayName")
  ).checked = settings.maskDisplayName;
  assertElement(document.querySelector<HTMLInputElement>("#maskVerifiedBadge")).checked =
    settings.maskVerifiedBadge;
  assertElement(document.querySelector<HTMLInputElement>("#maskWebsite")).checked =
    settings.maskWebsite;
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

function syncBlurAvailability(
  avatarInput: HTMLInputElement,
  blurInput: HTMLInputElement
) {
  const label = blurInput.closest<HTMLLabelElement>("label");

  blurInput.disabled = !avatarInput.checked;

  if (label) {
    label.style.opacity = avatarInput.checked ? "1" : "0.4";
  }
}

async function initializeOptions() {
  const form = assertElement(document.querySelector<HTMLFormElement>("#settings-form"));
  const resetButton = assertElement(document.querySelector<HTMLButtonElement>("#reset"));
  const status = assertElement(document.querySelector<HTMLElement>("#status"));
  const avatarInput = assertElement(
    document.querySelector<HTMLInputElement>("#maskAvatar")
  );
  const blurInput = assertElement(
    document.querySelector<HTMLInputElement>("#maskAvatarBlur")
  );

  writeForm(await loadSettings());
  syncBlurAvailability(avatarInput, blurInput);
  status.textContent = "変更後に保存してください。";

  avatarInput.addEventListener("change", () => {
    syncBlurAvailability(avatarInput, blurInput);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    await saveSettings(readForm());
    status.textContent = "保存しました。開いている X タブにも順次反映されます。";
  });

  resetButton.addEventListener("click", async () => {
    writeForm(DEFAULT_SETTINGS);
    syncBlurAvailability(avatarInput, blurInput);
    await saveSettings(DEFAULT_SETTINGS);
    status.textContent = "初期値に戻しました。";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  void initializeOptions();
});
