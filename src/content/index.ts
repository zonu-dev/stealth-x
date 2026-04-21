import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  isSettingsStorageChange,
  loadSettings,
  normalizeSettings,
  type MaskSettings
} from "../shared/settings";
import { applyMasking, ensureMaskStyles, restoreMasking } from "./masking";

let currentSettings: MaskSettings = DEFAULT_SETTINGS;
let flushHandle: number | null = null;
let observerStarted = false;

const pendingRoots = new Set<ParentNode>();

function isParentNode(node: Node): node is ParentNode {
  return (
    node instanceof Element ||
    node instanceof Document ||
    node instanceof DocumentFragment
  );
}

function enqueueRoot(root: ParentNode) {
  pendingRoots.add(root);

  if (flushHandle !== null) {
    return;
  }

  flushHandle = window.requestAnimationFrame(() => {
    flushHandle = null;

    if (!currentSettings.enabled) {
      pendingRoots.clear();
      return;
    }

    for (const pendingRoot of pendingRoots) {
      applyMasking(pendingRoot, currentSettings);
    }

    pendingRoots.clear();
  });
}

function applyCurrentSettings() {
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
      if (isParentNode(record.target)) {
        enqueueRoot(record.target);
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
    subtree: true
  });
}

async function initialize() {
  ensureMaskStyles(document);
  watchDocument();

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
