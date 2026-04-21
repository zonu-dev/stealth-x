import type { MaskSettings } from "../shared/settings";

const STYLE_ID = "stealth-x-styles";
const MASKED_TEXT_ATTR = "data-stealth-x-original-text";
const BLOCK_ATTR = "data-stealth-x-block";
const BLOCK_LABEL_ATTR = "data-stealth-x-label";
const AVATAR_ATTR = "data-stealth-x-avatar";
const MEDIA_ATTR = "data-stealth-x-media";
const ORIGINAL_TITLE_ATTR = "data-stealth-x-original-title";
const HIDDEN_CLASS = "stealth-x-hidden";

const DISPLAY_ALIAS = "非表示";
const USERNAME_ALIAS = "@hidden";
const PROFILE_PRIMARY_COLUMN_SELECTOR = '[data-testid="primaryColumn"]';

const NAME_CONTAINER_SELECTORS = [
  '[data-testid="User-Name"]',
  '[data-testid="UserName"]'
];
const COMPOSER_TEXTAREA_SELECTORS = [
  '[data-testid="tweetTextarea_0"]',
  '[data-testid^="tweetTextarea_"]'
];
const PROFILE_HEADER_SELECTORS = ['[data-testid="primaryColumn"] header'];

const BIO_SELECTORS = ['[data-testid="UserDescription"]'];

const LOCATION_SELECTORS = ['[data-testid="UserLocation"]'];
const JOIN_DATE_SELECTORS = ['[data-testid="UserJoinDate"]'];

const STAT_SELECTORS = [
  'a[href$="/followers"]:not([role="tab"])',
  'a[href$="/following"]:not([role="tab"])',
  'a[href$="/verified_followers"]:not([role="tab"])'
];

const SIDEBAR_ACCOUNT_SELECTORS = ['[data-testid="SideNav_AccountSwitcher_Button"]'];
const VERIFIED_BADGE_SELECTORS = [
  '[data-testid="icon-verified"]',
  '[data-testid="UserBadges"]',
  '[data-testid*="verifiedBadge"]',
  '[data-testid*="VerifiedBadge"]',
  'button[aria-label*="認証"]',
  'button[aria-label*="Verified"]',
  'button[aria-label*="verified"]',
  'a[href*="/i/premium"]',
  'a[href*="/i/verified"]',
  'a[href*="premium_sign_up"]'
];
const AVATAR_CONTAINER_SELECTORS = ['[data-testid^="UserAvatar-Container-"]'];

const AVATAR_IMAGE_SELECTORS = [
  '[data-testid="Tweet-User-Avatar"] img',
  '[data-testid="UserCell"] img',
  '[data-testid="SideNav_AccountSwitcher_Button"] img',
  '[data-testid="primaryColumn"] header img',
  '[data-testid="primaryColumn"] a[href$="/photo"] img',
  '[data-testid="primaryColumn"] form img'
];
const PROFILE_HEADER_MEDIA_SELECTORS = [
  '[data-testid="primaryColumn"] a[href$="/header_photo"] img',
  '[data-testid="primaryColumn"] img[src*="profile_banners"]',
  '[data-testid="primaryColumn"] [style*="profile_banners"]'
];

const TIME_PATTERN =
  /^(?:\d+[smhdwy]|\d+(?:秒|分|時間|日|週(?:間)?|か?月|ヶ月|年)|\d{4}年\d{1,2}月\d{1,2}日|[A-Z][a-z]{2}\s\d{1,2}(?:,\s\d{4})?|(?:午前|午後)?\d{1,2}:\d{2}|(?:AM|PM)\s?\d{1,2}:\d{2}|·)$/u;
const POST_COUNT_PATTERN =
  /^\s*[\d,.]+\s*(?:件\s*の\s*)?(?:ポスト|ツイート|posts?|tweets?)\s*$/iu;
const NON_NAME_TEXT = new Set([
  "Following",
  "Follows you",
  "Promoted",
  "Replying to",
  "フォローされています",
  "フォロー中",
  "広告",
  "返信先:"
]);
const RESERVED_TOP_LEVEL_ROUTES = new Set([
  "compose",
  "explore",
  "home",
  "i",
  "login",
  "messages",
  "notifications",
  "search",
  "settings",
  "signup",
  "tos",
  "privacy"
]);
const PROFILE_SUBROUTES = new Set([
  "about",
  "followers",
  "following",
  "likes",
  "media",
  "verified_followers",
  "with_replies"
]);

interface CurrentAccount {
  displayName: string | null;
  handle: string;
  usernameLabel: string;
}

function createStyles(avatarPlaceholderUrl: string): string {
  return `
#${STYLE_ID} {}
.${HIDDEN_CLASS} {
  display: none !important;
}
[${BLOCK_ATTR}="conceal"],
[${BLOCK_ATTR}="stat"] {
  position: relative !important;
  overflow: hidden !important;
  color: transparent !important;
  height: 1.2em !important;
  line-height: 1.2em !important;
  vertical-align: middle !important;
  text-align: left !important;
}
[${BLOCK_ATTR}="conceal"]:not(a):not(span) {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
}
[data-testid="UserLocation"][${BLOCK_ATTR}],
[data-testid="UserJoinDate"][${BLOCK_ATTR}],
[data-testid^="UserProfessionalCategory"][${BLOCK_ATTR}] {
  display: inline-block !important;
  width: auto !important;
  max-width: none !important;
  min-width: 5em !important;
  margin-right: 12px !important;
}
[data-testid="UserLocation"][${BLOCK_ATTR}]::after,
[data-testid="UserJoinDate"][${BLOCK_ATTR}]::after,
[data-testid^="UserProfessionalCategory"][${BLOCK_ATTR}]::after {
  right: 0 !important;
}
[${BLOCK_ATTR}="conceal"] *,
[${BLOCK_ATTR}="stat"] * {
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  line-height: 0 !important;
}
[${BLOCK_ATTR}="conceal"]::after,
[${BLOCK_ATTR}="stat"]::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 0.9em;
  border-radius: 999px;
  background: rgba(113, 107, 97, 0.36);
  transform: translateY(-50%);
}
[${AVATAR_ATTR}="conceal"] {
  position: relative !important;
  overflow: hidden !important;
  border-radius: 999px !important;
  background-image: none !important;
  background-color: transparent !important;
}
[${AVATAR_ATTR}="conceal"] * {
  visibility: hidden !important;
}
[${AVATAR_ATTR}="conceal"] img {
  opacity: 0 !important;
}
[${AVATAR_ATTR}="conceal"] [style*="background-image"] {
  background-image: none !important;
}
[${AVATAR_ATTR}="conceal"]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("${avatarPlaceholderUrl}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
[${MEDIA_ATTR}="conceal"] {
  position: relative !important;
  overflow: hidden !important;
}
[${MEDIA_ATTR}="conceal"] img {
  opacity: 0 !important;
}
[${MEDIA_ATTR}="conceal"]::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12px 12px, rgba(138, 147, 164, 0.18) 0 2px, transparent 2.5px),
    linear-gradient(135deg, rgba(110, 122, 144, 0.88), rgba(68, 76, 90, 0.94));
  background-size: 32px 32px, auto;
}
`;
}

function getAvatarPlaceholderUrl(): string {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("avatar-placeholder.png");
  }

  return "avatar-placeholder.png";
}

function isElement(target: ParentNode): target is Element {
  return target instanceof Element;
}

function isAnchorElement(element: Element): element is HTMLAnchorElement {
  return element.tagName.toLowerCase() === "a";
}

function isImageElement(element: Element): element is HTMLImageElement {
  return element.tagName.toLowerCase() === "img";
}

function isSvgElement(element: Element): boolean {
  return element.tagName.toLowerCase() === "svg";
}

function getDocumentNode(root: ParentNode): Document {
  const node = root as Node;

  return node.nodeType === Node.DOCUMENT_NODE
    ? (node as Document)
    : node.ownerDocument ?? document;
}

function collectMatches<T extends Element>(
  root: ParentNode,
  selectors: string[]
): T[] {
  const matches = new Set<T>();

  for (const selector of selectors) {
    if (isElement(root) && root.matches(selector)) {
      matches.add(root as T);
    }

    root.querySelectorAll<T>(selector).forEach((element) => {
      matches.add(element);
    });
  }

  return [...matches];
}

function getTextNodes(root: Node): Text[] {
  const documentRef = root.ownerDocument ?? document;
  const walker = documentRef.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      const value = node.textContent?.trim();

      if (!parent || !value) {
        return NodeFilter.FILTER_REJECT;
      }

      if (parent.closest(`[${MASKED_TEXT_ATTR}]`)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  return textNodes;
}

function withPreservedWhitespace(original: string, replacement: string): string {
  const leading = original.match(/^\s*/u)?.[0] ?? "";
  const trailing = original.match(/\s*$/u)?.[0] ?? "";

  return `${leading}${replacement}${trailing}`;
}

function getMaskedOriginalStrings(element: Element): string[] {
  const values: string[] = [];

  if (element.hasAttribute(MASKED_TEXT_ATTR)) {
    const original = element.getAttribute(MASKED_TEXT_ATTR);

    if (original?.trim()) {
      values.push(original.trim());
    }
  }

  element.querySelectorAll<HTMLElement>(`[${MASKED_TEXT_ATTR}]`).forEach((maskedElement) => {
    const original = maskedElement.getAttribute(MASKED_TEXT_ATTR);

    if (original?.trim()) {
      values.push(original.trim());
    }
  });

  return values;
}

function getVisibleStrings(element: Element): string[] {
  return getTextNodes(element)
    .map((textNode) => textNode.textContent?.trim() ?? "")
    .filter(Boolean);
}

function getIdentityStrings(element: Element): string[] {
  return [...getMaskedOriginalStrings(element), ...getVisibleStrings(element)];
}

function parseHandleFromUsernameText(value: string): string | null {
  const match = value.trim().match(/^@([A-Za-z0-9_]{1,15})(?:\b|$)/u);

  return match?.[1]?.toLowerCase() ?? null;
}

function parseHandleFromAvatarTestId(value: string | null): string | null {
  const match = value?.match(/^UserAvatar-Container-([A-Za-z0-9_]{1,15})$/u);

  return match?.[1]?.toLowerCase() ?? null;
}

function extractHandleFromHref(href: string, baseUrl: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    const [firstSegment] = url.pathname.split("/").filter(Boolean);

    if (!firstSegment || RESERVED_TOP_LEVEL_ROUTES.has(firstSegment.toLowerCase())) {
      return null;
    }

    if (!/^[A-Za-z0-9_]{1,15}$/u.test(firstSegment)) {
      return null;
    }

    return firstSegment.toLowerCase();
  } catch {
    return null;
  }
}

function classifyIdentityText(value: string): "displayName" | "username" | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("@")) {
    return "username";
  }

  if (TIME_PATTERN.test(trimmed) || NON_NAME_TEXT.has(trimmed)) {
    return null;
  }

  if (POST_COUNT_PATTERN.test(trimmed)) {
    return null;
  }

  return "displayName";
}

function resolveFromSidebarButton(root: ParentNode): CurrentAccount | null {
  const documentRef = getDocumentNode(root);
  const sidebarAccount = documentRef.querySelector<HTMLElement>(
    SIDEBAR_ACCOUNT_SELECTORS.join(",")
  );

  if (!sidebarAccount) {
    return null;
  }

  const candidates = getIdentityStrings(sidebarAccount).filter(
    (value) => value !== DISPLAY_ALIAS && value !== USERNAME_ALIAS
  );
  const handle = candidates.map(parseHandleFromUsernameText).find(Boolean);

  if (!handle) {
    return null;
  }

  return {
    displayName:
      candidates.find((value) => classifyIdentityText(value) === "displayName") ?? null,
    handle,
    usernameLabel: `@${handle}`
  };
}

function resolveFromProfileUrl(root: ParentNode): CurrentAccount | null {
  const pathname = getLocationPathname(root);
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const firstSegment = segments[0];

  if (RESERVED_TOP_LEVEL_ROUTES.has(firstSegment.toLowerCase())) {
    return null;
  }

  if (!/^[A-Za-z0-9_]{1,15}$/u.test(firstSegment)) {
    return null;
  }

  return {
    displayName: null,
    handle: firstSegment.toLowerCase(),
    usernameLabel: `@${firstSegment.toLowerCase()}`
  };
}

function resolveCurrentAccount(root: ParentNode): CurrentAccount | null {
  // Try sidebar account switcher (primary method)
  let account = resolveFromSidebarButton(root);
  if (account) {
    return account;
  }

  // Fallback: extract from profile URL if on own profile
  account = resolveFromProfileUrl(root);
  if (account) {
    return account;
  }

  return null;
}

function getLocationPathname(root: ParentNode): string {
  const node = root as Node;

  if (node.nodeType === Node.DOCUMENT_NODE) {
    return (node as Document).defaultView?.location.pathname ?? window.location.pathname;
  }

  const ownerPathname = node.ownerDocument?.defaultView?.location.pathname;

  if (ownerPathname) {
    return ownerPathname;
  }

  return window.location.pathname;
}

function isOwnProfileRoute(root: ParentNode, account: CurrentAccount): boolean {
  const segments = getLocationPathname(root)
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return false;
  }

  const [firstSegment, secondSegment] = segments.map((segment) => segment.toLowerCase());

  if (firstSegment !== account.handle) {
    return false;
  }

  if (segments.length === 1) {
    return true;
  }

  return segments.length === 2 && secondSegment !== undefined
    ? PROFILE_SUBROUTES.has(secondSegment)
    : false;
}

function elementLinksToHandle(element: Element, handle: string): boolean {
  const documentRef = getDocumentNode(element);
  const baseUrl = documentRef.location?.href ?? window.location.href;
  const closestAnchor = element.closest<HTMLAnchorElement>("a[href]");

  if (
    closestAnchor &&
    extractHandleFromHref(closestAnchor.getAttribute("href") ?? "", baseUrl) === handle
  ) {
    return true;
  }

  if (isAnchorElement(element) &&
      extractHandleFromHref(element.getAttribute("href") ?? "", baseUrl) === handle) {
    return true;
  }

  return [...element.querySelectorAll<HTMLAnchorElement>("a[href]")].some((anchor) => {
    return extractHandleFromHref(anchor.getAttribute("href") ?? "", baseUrl) === handle;
  });
}

function articleBelongsToCurrentUser(article: Element, account: CurrentAccount): boolean {
  const nameContainer = article.querySelector<HTMLElement>(NAME_CONTAINER_SELECTORS.join(","));

  if (nameContainer) {
    if (elementLinksToHandle(nameContainer, account.handle)) {
      return true;
    }

    return getIdentityStrings(nameContainer).some((value) => {
      return parseHandleFromUsernameText(value) === account.handle;
    });
  }

  return elementLinksToHandle(article, account.handle);
}

function userCellBelongsToCurrentUser(element: Element, account: CurrentAccount): boolean {
  if (elementLinksToHandle(element, account.handle)) {
    return true;
  }

  return getIdentityStrings(element).some((value) => {
    return parseHandleFromUsernameText(value) === account.handle;
  });
}

function isProfileSummaryElement(element: Element, account: CurrentAccount): boolean {
  return (
    isOwnProfileRoute(element, account) &&
    element.closest(PROFILE_PRIMARY_COLUMN_SELECTOR) !== null &&
    element.closest("article") === null &&
    element.closest('[data-testid="UserCell"]') === null
  );
}

function elementBelongsToCurrentUser(element: Element, account: CurrentAccount): boolean {
  if (element.closest(SIDEBAR_ACCOUNT_SELECTORS.join(","))) {
    return true;
  }

  const avatarContainer = element.closest<HTMLElement>(AVATAR_CONTAINER_SELECTORS.join(","));

  if (
    avatarContainer &&
    parseHandleFromAvatarTestId(avatarContainer.getAttribute("data-testid")) === account.handle
  ) {
    return true;
  }

  const article = element.closest("article");

  if (article) {
    return articleBelongsToCurrentUser(article, account);
  }

  const userCell = element.closest('[data-testid="UserCell"]');

  if (userCell) {
    return userCellBelongsToCurrentUser(userCell, account);
  }

  if (isProfileSummaryElement(element, account)) {
    return true;
  }

  return elementLinksToHandle(element, account.handle);
}

function isBeforeElement(candidate: Element, boundary: Element): boolean {
  return Boolean(
    candidate.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING
  );
}

function getAvatarTargetFromCandidate(candidate: Element): HTMLElement | null {
  if (isImageElement(candidate)) {
    return candidate.parentElement;
  }

  if (isSvgElement(candidate)) {
    return candidate.parentElement;
  }

  return candidate as HTMLElement;
}

function findComposerScope(textarea: HTMLElement): HTMLElement | null {
  const primaryColumn = textarea.closest(PROFILE_PRIMARY_COLUMN_SELECTOR) as
    | HTMLElement
    | null;
  let current = textarea.parentElement;

  while (current && current !== primaryColumn) {
    const hasCandidate = current.querySelector(
      'img, svg, [style*="background-image"], [data-testid="Tweet-User-Avatar"], button, [role="button"], a[href]'
    );

    if (hasCandidate) {
      return current;
    }

    current = current.parentElement;
  }

  return primaryColumn;
}

function findHomeComposerAvatarTarget(textarea: HTMLElement): HTMLElement | null {
  const scope = findComposerScope(textarea);

  if (!scope) {
    return null;
  }

  const explicitAvatar = [
    ...scope.querySelectorAll<HTMLElement>(
      '[data-testid="Tweet-User-Avatar"], [data-testid^="UserAvatar-Container-"]'
    )
  ].find((candidate) => {
    return !candidate.contains(textarea) && isBeforeElement(candidate, textarea);
  });

  if (explicitAvatar) {
    return explicitAvatar;
  }

  const candidates = [
    ...scope.querySelectorAll<HTMLElement>(
      'img, svg, [style*="background-image"], [data-testid="Tweet-User-Avatar"], button, [role="button"], a[href]'
    )
  ].filter((candidate) => {
    if (candidate.contains(textarea)) {
      return false;
    }

    if (!isBeforeElement(candidate, textarea)) {
      return false;
    }

    if (candidate.closest('[aria-haspopup]')) {
      return false;
    }

    return true;
  });

  for (const candidate of candidates.reverse()) {
    const target = getAvatarTargetFromCandidate(candidate);

    if (target) {
      return target;
    }
  }

  return null;
}

function isInOwnProfileHeroRegion(element: Element, account: CurrentAccount): boolean {
  if (!isOwnProfileRoute(element, account)) {
    return false;
  }

  const primaryColumn = element.closest(PROFILE_PRIMARY_COLUMN_SELECTOR);

  if (!primaryColumn) {
    return false;
  }

  if (
    element.closest("article") ||
    element.closest('[data-testid="UserCell"]') ||
    element.closest("form")
  ) {
    return false;
  }

  const boundary = primaryColumn.querySelector('[role="tablist"], article');

  if (!boundary) {
    return true;
  }

  return Boolean(element.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function isCurrentDisplayNameTextNode(
  textNode: Text,
  account: CurrentAccount
): boolean {
  const displayName = account.displayName?.trim();
  const parent = textNode.parentElement;
  const value = textNode.textContent?.trim();

  if (!displayName || !parent || value !== displayName) {
    return false;
  }

  if (parent.closest(SIDEBAR_ACCOUNT_SELECTORS.join(","))) {
    return false;
  }

  if (parent.closest("article") || parent.closest('[data-testid="UserCell"]')) {
    return false;
  }

  return parent.closest(PROFILE_PRIMARY_COLUMN_SELECTOR) !== null;
}

function isInsideVerifiedBadge(element: Element | null | undefined): boolean {
  if (!element) {
    return false;
  }

  if (VERIFIED_BADGE_SELECTORS.some((selector) => element.closest(selector) !== null)) {
    return true;
  }

  const container = element.closest<HTMLElement>(
    'button, [role="button"], a[role="button"], [data-testid$="Badge"], [data-testid$="badge"]'
  );

  if (!container) {
    return false;
  }

  return (
    container.querySelector('[data-testid="icon-verified"]') !== null ||
    container.querySelector('svg[aria-label*="認証"]') !== null ||
    container.querySelector('svg[aria-label*="Verified"]') !== null ||
    container.querySelector('svg[aria-label*="verified"]') !== null
  );
}

function wrapTextNode(
  textNode: Text,
  replacement: string,
  variant: "displayName" | "username"
) {
  const parent = textNode.parentNode;

  if (!parent || textNode.parentElement?.closest(`[${MASKED_TEXT_ATTR}]`)) {
    return;
  }

  if (textNode.parentElement?.closest("time")) {
    return;
  }

  if (isInsideVerifiedBadge(textNode.parentElement)) {
    return;
  }

  const wrapper = (textNode.ownerDocument ?? document).createElement("span");
  const original = textNode.textContent ?? "";

  wrapper.setAttribute(MASKED_TEXT_ATTR, original);
  wrapper.setAttribute("data-stealth-x-variant", variant);
  wrapper.textContent = withPreservedWhitespace(original, replacement);

  parent.replaceChild(wrapper, textNode);
}

function concealBlock(element: Element, label: string) {
  element.setAttribute(BLOCK_ATTR, "conceal");
  element.setAttribute(BLOCK_LABEL_ATTR, label);
}

function concealStat(element: Element) {
  element.setAttribute(BLOCK_ATTR, "stat");
  element.removeAttribute(BLOCK_LABEL_ATTR);
}

function concealAvatar(image: HTMLImageElement) {
  const avatarContainer = image.closest<HTMLElement>(AVATAR_CONTAINER_SELECTORS.join(","));

  if (avatarContainer) {
    avatarContainer.setAttribute(AVATAR_ATTR, "conceal");
    return;
  }

  const wrapper = image.parentElement;

  if (!wrapper) {
    return;
  }

  wrapper.setAttribute(AVATAR_ATTR, "conceal");
}

function concealMediaElement(element: HTMLElement) {
  const target = isImageElement(element) ? element.parentElement ?? element : element;

  target.setAttribute(MEDIA_ATTR, "conceal");
}

function hideElement(element: Element) {
  element.classList.add(HIDDEN_CLASS);
}

function applyIdentityMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskDisplayName && !settings.maskUsername) {
    return;
  }

  for (const container of collectMatches<HTMLElement>(root, NAME_CONTAINER_SELECTORS)) {
    if (!elementBelongsToCurrentUser(container, account)) {
      continue;
    }

    for (const textNode of getTextNodes(container)) {
      const classification = classifyIdentityText(textNode.textContent ?? "");

      if (classification === "displayName" && settings.maskDisplayName) {
        wrapTextNode(textNode, DISPLAY_ALIAS, classification);
      }

      if (classification === "username" && settings.maskUsername) {
        wrapTextNode(textNode, USERNAME_ALIAS, classification);
      }
    }
  }
}

function applyProfileHeaderMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskDisplayName || !isOwnProfileRoute(root, account)) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, PROFILE_HEADER_SELECTORS)) {
    let displayNameMasked = false;
    let usernameMasked = false;

    for (const textNode of getTextNodes(element)) {
      const classification = classifyIdentityText(textNode.textContent ?? "");

      if (
        classification === "displayName" &&
        settings.maskDisplayName &&
        !displayNameMasked
      ) {
        wrapTextNode(textNode, DISPLAY_ALIAS, "displayName");

        displayNameMasked = true;
        continue;
      }

      if (
        classification === "username" &&
        settings.maskUsername &&
        !usernameMasked
      ) {
        wrapTextNode(textNode, USERNAME_ALIAS, "username");

        usernameMasked = true;
      }
    }
  }
}

function applyProfileDisplayNameFallbackMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskDisplayName || !isOwnProfileRoute(root, account)) {
    return;
  }

  for (const primaryColumn of collectMatches<HTMLElement>(root, [PROFILE_PRIMARY_COLUMN_SELECTOR])) {
    for (const textNode of getTextNodes(primaryColumn)) {
      if (!isCurrentDisplayNameTextNode(textNode, account)) {
        continue;
      }

      wrapTextNode(textNode, DISPLAY_ALIAS, "displayName");
    }
  }
}

function applyProfileUsernameFallbackMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskUsername || !isOwnProfileRoute(root, account)) {
    return;
  }

  for (const primaryColumn of collectMatches<HTMLElement>(root, [PROFILE_PRIMARY_COLUMN_SELECTOR])) {
    for (const textNode of getTextNodes(primaryColumn)) {
      const value = textNode.textContent?.trim() ?? "";

      if (value !== account.usernameLabel) {
        continue;
      }

      wrapTextNode(textNode, USERNAME_ALIAS, "username");
    }
  }
}

function applyProfileBannerMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskBanner) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, PROFILE_HEADER_MEDIA_SELECTORS)) {
    if (!isInOwnProfileHeroRegion(element, account)) {
      continue;
    }

    concealMediaElement(element);
  }
}

function applyHomeComposerAvatarMask(root: ParentNode, settings: MaskSettings) {
  if (!settings.maskAvatar) {
    return;
  }

  for (const textarea of collectMatches<HTMLElement>(root, COMPOSER_TEXTAREA_SELECTORS)) {
    const target = findHomeComposerAvatarTarget(textarea);

    if (!target) {
      continue;
    }

    target.setAttribute(AVATAR_ATTR, "conceal");
  }
}

function applyBioMask(root: ParentNode, settings: MaskSettings, account: CurrentAccount) {
  if (!settings.maskBio) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, BIO_SELECTORS)) {
    if (!elementBelongsToCurrentUser(element, account)) {
      continue;
    }

    concealBlock(element, "プロフィール非表示");
  }
}

function applyPostCountMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskPostCount) {
    return;
  }

  for (const primaryColumn of collectMatches<HTMLElement>(root, [PROFILE_PRIMARY_COLUMN_SELECTOR])) {
    if (!isOwnProfileRoute(primaryColumn, account)) {
      continue;
    }

    for (const textNode of getTextNodes(primaryColumn)) {
      const value = textNode.textContent?.trim() ?? "";

      if (!POST_COUNT_PATTERN.test(value)) {
        continue;
      }

      const parent = textNode.parentElement;

      if (!parent || parent.closest(`[${BLOCK_ATTR}]`)) {
        continue;
      }

      concealStat(parent);
    }
  }
}

function applyLocationMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskLocation) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, LOCATION_SELECTORS)) {
    if (!elementBelongsToCurrentUser(element, account)) {
      continue;
    }

    concealBlock(element, "位置情報非表示");
  }
}

function applyJoinDateMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskJoinDate) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, JOIN_DATE_SELECTORS)) {
    if (!elementBelongsToCurrentUser(element, account)) {
      continue;
    }

    concealBlock(element, "登録日非表示");
  }
}

function applyStatsMask(root: ParentNode, settings: MaskSettings, account: CurrentAccount) {
  if (!settings.maskStats) {
    return;
  }

  for (const element of collectMatches<HTMLAnchorElement>(root, STAT_SELECTORS)) {
    if (!elementBelongsToCurrentUser(element, account)) {
      continue;
    }

    concealStat(element);
  }
}

function applyAvatarMask(root: ParentNode, settings: MaskSettings, account: CurrentAccount) {
  if (!settings.maskAvatar) {
    return;
  }

  for (const container of collectMatches<HTMLElement>(root, AVATAR_CONTAINER_SELECTORS)) {
    if (parseHandleFromAvatarTestId(container.getAttribute("data-testid")) !== account.handle) {
      continue;
    }

    container.setAttribute(AVATAR_ATTR, "conceal");
  }

  for (const image of collectMatches<HTMLImageElement>(root, AVATAR_IMAGE_SELECTORS)) {
    if (!elementBelongsToCurrentUser(image, account)) {
      continue;
    }

    concealAvatar(image);
  }
}

function applySidebarMask(root: ParentNode, settings: MaskSettings) {
  if (!settings.maskDisplayName && !settings.maskUsername) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, SIDEBAR_ACCOUNT_SELECTORS)) {
    for (const textNode of getTextNodes(element)) {
      const classification = classifyIdentityText(textNode.textContent ?? "");

      if (classification === "displayName" && settings.maskDisplayName) {
        wrapTextNode(textNode, DISPLAY_ALIAS, classification);
      }

      if (classification === "username" && settings.maskUsername) {
        wrapTextNode(textNode, USERNAME_ALIAS, classification);
      }
    }
  }
}

function maskTitleText(
  title: string,
  settings: MaskSettings,
  account: CurrentAccount
): string {
  let maskedTitle = title;

  if (settings.maskDisplayName && account.displayName) {
    maskedTitle = maskedTitle.split(account.displayName).join(DISPLAY_ALIAS);
  }

  if (settings.maskUsername) {
    maskedTitle = maskedTitle.split(account.usernameLabel).join(USERNAME_ALIAS);
  }

  return maskedTitle;
}

function applyDocumentTitleMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  const documentRef = getDocumentNode(root);
  const host = documentRef.documentElement;
  const currentTitle = documentRef.title;
  const storedOriginalTitle = host.getAttribute(ORIGINAL_TITLE_ATTR);
  const isProfileRoute = isOwnProfileRoute(root, account);
  const currentTitleIsMasked =
    currentTitle.includes(DISPLAY_ALIAS) || currentTitle.includes(USERNAME_ALIAS);

  if (!isProfileRoute) {
    if (storedOriginalTitle && currentTitleIsMasked) {
      documentRef.title = storedOriginalTitle;
    }

    host.removeAttribute(ORIGINAL_TITLE_ATTR);
    return;
  }

  let originalTitle = storedOriginalTitle ?? currentTitle;

  if (storedOriginalTitle) {
    const maskedStoredTitle = maskTitleText(storedOriginalTitle, settings, account);

    if (currentTitle !== maskedStoredTitle && !currentTitleIsMasked) {
      originalTitle = currentTitle;
    }
  }

  host.setAttribute(ORIGINAL_TITLE_ATTR, originalTitle);

  const maskedTitle = maskTitleText(originalTitle, settings, account);

  if (maskedTitle !== currentTitle) {
    documentRef.title = maskedTitle;
  }
}

export function ensureMaskStyles(documentRef: Document = document) {
  if (documentRef.getElementById(STYLE_ID)) {
    return;
  }

  const style = documentRef.createElement("style");
  const parent = documentRef.head ?? documentRef.documentElement;

  style.id = STYLE_ID;
  style.textContent = createStyles(getAvatarPlaceholderUrl());

  if (parent) {
    parent.append(style);
  }
}

export function restoreMasking(root: ParentNode = document) {
  const documentRef = getDocumentNode(root);
  const originalTitle = documentRef.documentElement.getAttribute(ORIGINAL_TITLE_ATTR);

  if (originalTitle !== null) {
    documentRef.title = originalTitle;
    documentRef.documentElement.removeAttribute(ORIGINAL_TITLE_ATTR);
  }

  collectMatches<HTMLElement>(root, [`[${MASKED_TEXT_ATTR}]`]).forEach((element) => {
    const original = element.getAttribute(MASKED_TEXT_ATTR);

    if (original === null || !element.parentNode) {
      return;
    }

    element.parentNode.replaceChild(
      (element.ownerDocument ?? document).createTextNode(original),
      element
    );
  });

  collectMatches<HTMLElement>(root, [`.${HIDDEN_CLASS}`]).forEach((element) => {
    element.classList.remove(HIDDEN_CLASS);
  });

  collectMatches<HTMLElement>(root, [`[${BLOCK_ATTR}]`]).forEach((element) => {
    element.removeAttribute(BLOCK_ATTR);
    element.removeAttribute(BLOCK_LABEL_ATTR);
  });

  collectMatches<HTMLElement>(root, [`[${AVATAR_ATTR}]`]).forEach((element) => {
    element.removeAttribute(AVATAR_ATTR);
  });

  collectMatches<HTMLElement>(root, [`[${MEDIA_ATTR}]`]).forEach((element) => {
    element.removeAttribute(MEDIA_ATTR);
  });
}

export function applyMasking(root: ParentNode, settings: MaskSettings) {
  if (!settings.enabled) {
    return;
  }

  const account = resolveCurrentAccount(root);

  if (!account) {
    return;
  }

  applyIdentityMask(root, settings, account);
  applyProfileHeaderMask(root, settings, account);
  applyProfileDisplayNameFallbackMask(root, settings, account);
  applyProfileUsernameFallbackMask(root, settings, account);
  applyProfileBannerMask(root, settings, account);
  applyHomeComposerAvatarMask(root, settings);
  applyAvatarMask(root, settings, account);
  applyBioMask(root, settings, account);
  applyLocationMask(root, settings, account);
  applyJoinDateMask(root, settings, account);
  applyPostCountMask(root, settings, account);
  applyStatsMask(root, settings, account);
  applySidebarMask(root, settings);
  applyDocumentTitleMask(root, settings, account);
}
