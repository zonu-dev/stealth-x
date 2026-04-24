import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  isSettingsStorageChange,
  loadSettings,
  normalizeSettings,
  type MaskSettings
} from "../shared/settings";
import {
  applyMasking,
  clearMaskingArtifacts,
  ensureMaskStyles,
  restoreMasking
} from "./masking";

let currentSettings: MaskSettings = DEFAULT_SETTINGS;
let flushHandle: number | null = null;
let observerStarted = false;
let navigationStarted = false;
let fullRefreshQueued = false;
let lastKnownPathname = window.location.pathname;

const pendingRoots = new Set<ParentNode>();

function isParentNode(node: Node): node is ParentNode {
  return (
    node instanceof Element ||
    node instanceof Document ||
    node instanceof DocumentFragment
  );
}

function requestFlush() {
  if (flushHandle !== null) {
    return;
  }

  flushHandle = window.requestAnimationFrame(() => {
    flushHandle = null;

    if (!currentSettings.enabled) {
      pendingRoots.clear();
      fullRefreshQueued = false;
      return;
    }

    const pathname = window.location.pathname;

    if (fullRefreshQueued || pathname !== lastKnownPathname) {
      lastKnownPathname = pathname;
      fullRefreshQueued = false;
      pendingRoots.clear();
      applyCurrentSettings();
      return;
    }

    for (const pendingRoot of pendingRoots) {
      applyMasking(pendingRoot, currentSettings);
    }

    pendingRoots.clear();
  });
}

function enqueueRoot(root: ParentNode) {
  pendingRoots.add(root);
  requestFlush();
}

function refreshAfterNavigation(pathname = window.location.pathname) {
  if (pathname === lastKnownPathname && !fullRefreshQueued) {
    return;
  }

  lastKnownPathname = pathname;
  fullRefreshQueued = true;
  pendingRoots.clear();
  clearMaskingArtifacts(document);
  requestFlush();
}

function applyCurrentSettings() {
  lastKnownPathname = window.location.pathname;
  restoreMasking(document);

  if (!currentSettings.enabled) {
    return;
  }

  ensureMaskStyles(document);
  applyMasking(document, currentSettings);
}

function watchDocument() {
  if (observerStarted) {
    return;
  }

  observerStarted = true;

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const targetRoot = isParentNode(record.target)
        ? record.target
        : record.target.parentNode;

      if (targetRoot && isParentNode(targetRoot)) {
        enqueueRoot(targetRoot);
      }

      record.addedNodes.forEach((node) => {
        if (isParentNode(node)) {
          enqueueRoot(node);
        }
      });
    }
  });

  observer.observe(document.documentElement ?? document, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

function watchNavigation() {
  if (navigationStarted) {
    return;
  }

  navigationStarted = true;

  const originalPushState = window.history.pushState.bind(window.history);
  window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
    originalPushState(...args);
    refreshAfterNavigation(window.location.pathname);
  }) as History["pushState"];

  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
    originalReplaceState(...args);
    refreshAfterNavigation(window.location.pathname);
  }) as History["replaceState"];

  window.addEventListener("popstate", () => {
    refreshAfterNavigation(window.location.pathname);
  });
}

async function initialize() {
  ensureMaskStyles(document);
  watchDocument();
  watchNavigation();

  currentSettings = await loadSettings();
  applyCurrentSettings();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (!isSettingsStorageChange(changes, areaName)) {
      return;
    }

    currentSettings = normalizeSettings(
      changes[SETTINGS_KEY]?.newValue as Partial<MaskSettings> | undefined
    );

    applyCurrentSettings();
  });
}

void initialize();
