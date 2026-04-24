import type { MaskSettings } from "../shared/settings";

const STYLE_ID = "stealth-x-styles";
const MASKED_TEXT_ATTR = "data-stealth-x-original-text";
const CSS_TEXT_MASK_ATTR = "data-stealth-x-text-mask";
const CSS_TEXT_REPLACEMENT_ATTR = "data-stealth-x-text-replacement";
const BLOCK_ATTR = "data-stealth-x-block";
const BLOCK_LABEL_ATTR = "data-stealth-x-label";
const AVATAR_ATTR = "data-stealth-x-avatar";
const MEDIA_ATTR = "data-stealth-x-media";
const ORIGINAL_TITLE_ATTR = "data-stealth-x-original-title";
const HIDDEN_CLASS = "stealth-x-hidden";
const AVATAR_BLUR_CSS_VAR = "--stealth-x-avatar-blur";
const AVATAR_SCALE_CSS_VAR = "--stealth-x-avatar-scale";

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
const WEBSITE_SELECTORS = ['[data-testid="UserUrl"]'];
const PROFILE_VERIFICATION_SELECTORS = [
  '[data-testid="UserName"] [data-testid="icon-verified"]',
  '[data-testid="UserName"] svg[aria-label*="認証"]',
  '[data-testid="UserName"] svg[aria-label*="Verified"]',
  '[data-testid="primaryColumn"] a[href*="/i/premium_sign_up"]',
  '[data-testid="primaryColumn"] a[href*="/i/verified"]'
];

const STAT_SELECTORS = [
  'a[href$="/followers"]:not([role="tab"])',
  'a[href$="/following"]:not([role="tab"])',
  'a[href$="/verified_followers"]:not([role="tab"])'
];

const SIDEBAR_ACCOUNT_SELECTORS = ['[data-testid="SideNav_AccountSwitcher_Button"]'];
const ACCOUNT_SWITCHER_HOVER_CARD_SELECTORS = ['[data-testid="HoverCard"]'];
const ACCOUNT_SWITCHER_MARKER_SELECTOR = '[data-testid^="AccountSwitcher_"]';
const ACCOUNT_SWITCHER_LOGOUT_SELECTOR = '[data-testid="AccountSwitcher_Logout_Button"]';
const HANDLE_IN_TEXT_PATTERN = /@[A-Za-z0-9_]{1,15}/gu;
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

let cachedCurrentAccount: CurrentAccount | null = null;

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
[${CSS_TEXT_MASK_ATTR}] {
  position: relative !important;
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
}
[${CSS_TEXT_MASK_ATTR}]::after {
  content: attr(${CSS_TEXT_REPLACEMENT_ATTR});
  position: absolute;
  top: 0;
  left: 0;
  color: rgb(231, 233, 234);
  -webkit-text-fill-color: rgb(231, 233, 234);
  white-space: pre;
  pointer-events: none;
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
[${AVATAR_ATTR}="blur"] {
  position: relative !important;
  overflow: hidden !important;
  border-radius: 999px !important;
}
[${AVATAR_ATTR}="blur"] img {
  filter: blur(var(${AVATAR_BLUR_CSS_VAR}, 4px)) !important;
  transform: scale(var(${AVATAR_SCALE_CSS_VAR}, 1.08)) !important;
}
[${AVATAR_ATTR}="blur"] [style*="background-image"] {
  filter: blur(var(${AVATAR_BLUR_CSS_VAR}, 4px)) !important;
  transform: scale(var(${AVATAR_SCALE_CSS_VAR}, 1.08)) !important;
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
  const documentRef = getDocumentNode(root);

  // Try sidebar account switcher (primary method)
  let account = resolveFromSidebarButton(documentRef);
  if (account) {
    cachedCurrentAccount = account;
    return account;
  }

  if (cachedCurrentAccount) {
    return cachedCurrentAccount;
  }

  // Subtree updates may not include the sidebar, so fall back using document state.
  account = resolveFromProfileUrl(documentRef);
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

function getArticleAuthorHandle(article: Element): string | null {
  const avatarHandle = parseHandleFromAvatarTestId(
    article
      .querySelector<HTMLElement>('[data-testid="Tweet-User-Avatar"] [data-testid^="UserAvatar-Container-"]')
      ?.getAttribute("data-testid") ?? null
  );

  if (avatarHandle) {
    return avatarHandle;
  }

  const documentRef = getDocumentNode(article);
  const baseUrl = documentRef.location?.href ?? window.location.href;

  for (const container of article.querySelectorAll<HTMLElement>(NAME_CONTAINER_SELECTORS.join(","))) {
    const directAnchorHandle = [...container.querySelectorAll<HTMLAnchorElement>("a[href]")]
      .map((anchor) => extractHandleFromHref(anchor.getAttribute("href") ?? "", baseUrl))
      .find(Boolean);

    if (directAnchorHandle) {
      return directAnchorHandle;
    }

    const textHandle = getIdentityStrings(container)
      .map(parseHandleFromUsernameText)
      .find(Boolean);

    if (textHandle) {
      return textHandle;
    }
  }

  return null;
}

function articleBelongsToCurrentUser(article: Element, account: CurrentAccount): boolean {
  const articleAuthorHandle = getArticleAuthorHandle(article);

  if (articleAuthorHandle) {
    return articleAuthorHandle === account.handle;
  }

  return false;
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
  // Skip elements inside quoted tweets to avoid masking other users' info in quotes
  if (isInsideQuotedTweet(element)) {
    return false;
  }

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

  // Only check for links on own profile route to avoid masking own account info
  // referenced on other profiles (e.g., notification messages on other users' profiles)
  if (isOwnProfileRoute(element, account)) {
    return elementLinksToHandle(element, account.handle);
  }

  return false;
}

function isBeforeElement(candidate: Element, boundary: Element): boolean {
  return Boolean(
    candidate.compareDocumentPosition(boundary) & Node.DOCUMENT_POSITION_FOLLOWING
  );
}

function isInsideQuotedTweet(element: Element): boolean {
  // Check if "引用" (quoted) text exists in ancestor chain
  // Quoted tweets are marked with a "引用" label in their parent structure
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    // Check if current element's immediate children contain "引用" text
    for (const child of current.children) {
      if (child.textContent?.trim() === "引用") {
        return true;
      }
    }

    current = current.parentElement;
  }

  return false;
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

function maskTextNodeInPlace(
  textNode: Text,
  replacement: string,
  variant: "displayName" | "username"
) {
  const element = textNode.parentElement;

  if (
    !element ||
    element.closest(`[${MASKED_TEXT_ATTR}], [${CSS_TEXT_MASK_ATTR}]`) ||
    element.closest("time") ||
    isInsideVerifiedBadge(element)
  ) {
    return;
  }

  element.setAttribute(CSS_TEXT_MASK_ATTR, variant);
  element.setAttribute("data-stealth-x-variant", variant);
  element.setAttribute(
    CSS_TEXT_REPLACEMENT_ATTR,
    withPreservedWhitespace(textNode.textContent ?? "", replacement)
  );
}

function applyIdentityTextMask(
  textNode: Text,
  replacement: string,
  variant: "displayName" | "username",
  preserveDomStructure: boolean
) {
  if (preserveDomStructure) {
    maskTextNodeInPlace(textNode, replacement, variant);
    return;
  }

  wrapTextNode(textNode, replacement, variant);
}

function concealBlock(element: Element, label: string) {
  element.setAttribute(BLOCK_ATTR, "conceal");
  element.setAttribute(BLOCK_LABEL_ATTR, label);
}

function concealStat(element: Element) {
  element.setAttribute(BLOCK_ATTR, "stat");
  element.removeAttribute(BLOCK_LABEL_ATTR);
}

type AvatarMaskVariant = "conceal" | "blur";

function getAvatarMaskVariant(settings: MaskSettings): AvatarMaskVariant {
  return settings.maskAvatarBlur ? "blur" : "conceal";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parsePixelValue(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function resolveAvatarTargetSize(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const rectSize = Math.max(rect.width, rect.height);

  if (rectSize > 0) {
    return rectSize;
  }

  const styleWidth = parsePixelValue(element.style.width);
  const styleHeight = parsePixelValue(element.style.height);
  const styleSize = Math.max(styleWidth ?? 0, styleHeight ?? 0);

  if (styleSize > 0) {
    return styleSize;
  }

  const attributeWidth = parsePixelValue(element.getAttribute("width"));
  const attributeHeight = parsePixelValue(element.getAttribute("height"));
  const attributeSize = Math.max(attributeWidth ?? 0, attributeHeight ?? 0);

  if (attributeSize > 0) {
    return attributeSize;
  }

  const childImage = element.querySelector<HTMLImageElement>("img");

  if (childImage) {
    const childRect = childImage.getBoundingClientRect();
    const childRectSize = Math.max(childRect.width, childRect.height);

    if (childRectSize > 0) {
      return childRectSize;
    }

    const childStyleWidth = parsePixelValue(childImage.style.width);
    const childStyleHeight = parsePixelValue(childImage.style.height);
    const childStyleSize = Math.max(childStyleWidth ?? 0, childStyleHeight ?? 0);

    if (childStyleSize > 0) {
      return childStyleSize;
    }

    const childAttributeSize = Math.max(childImage.width, childImage.height);

    if (childAttributeSize > 0) {
      return childAttributeSize;
    }
  }

  return 40;
}

function applyAvatarMaskAppearance(target: HTMLElement, variant: AvatarMaskVariant) {
  target.setAttribute(AVATAR_ATTR, variant);

  if (variant !== "blur") {
    target.style.removeProperty(AVATAR_BLUR_CSS_VAR);
    target.style.removeProperty(AVATAR_SCALE_CSS_VAR);
    return;
  }

  const size = resolveAvatarTargetSize(target);
  const blur = clamp(Math.round(size * 0.075), 4, 12);
  const scale = clamp(1 + blur / 100, 1.08, 1.12);

  target.style.setProperty(AVATAR_BLUR_CSS_VAR, `${blur}px`);
  target.style.setProperty(AVATAR_SCALE_CSS_VAR, scale.toFixed(2));
}

function concealAvatar(image: HTMLImageElement, variant: AvatarMaskVariant) {
  const avatarContainer = image.closest<HTMLElement>(AVATAR_CONTAINER_SELECTORS.join(","));

  if (avatarContainer) {
    applyAvatarMaskAppearance(avatarContainer, variant);
    return;
  }

  const wrapper = image.parentElement;

  if (!wrapper) {
    return;
  }

  applyAvatarMaskAppearance(wrapper, variant);
}

function concealMediaElement(element: HTMLElement) {
  const target = isImageElement(element) ? element.parentElement ?? element : element;

  target.setAttribute(MEDIA_ATTR, "conceal");
}

function hideElement(element: Element) {
  element.classList.add(HIDDEN_CLASS);
}

function getProfileVerificationTarget(element: HTMLElement): HTMLElement {
  const premiumLink = element.closest<HTMLElement>(
    'a[href*="/i/premium_sign_up"], a[href*="/i/verified"]'
  );

  if (premiumLink) {
    return premiumLink;
  }

  return (
    element.closest<HTMLElement>(
      '[data-testid="verifiedBadgeDialogTrigger"], [data-testid="UserBadges"], [data-testid*="verifiedBadge"], [data-testid*="VerifiedBadge"]'
    ) ?? element
  );
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

    const preserveDomStructure = isProfileSummaryElement(container, account);

    for (const textNode of getTextNodes(container)) {
      const classification = classifyIdentityText(textNode.textContent ?? "");

      if (classification === "displayName" && settings.maskDisplayName) {
        applyIdentityTextMask(
          textNode,
          DISPLAY_ALIAS,
          classification,
          preserveDomStructure
        );
      }

      if (classification === "username" && settings.maskUsername) {
        applyIdentityTextMask(
          textNode,
          USERNAME_ALIAS,
          classification,
          preserveDomStructure
        );
      }
    }
  }
}

function applyProfileHeaderMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (
    (!settings.maskDisplayName && !settings.maskUsername) ||
    !isOwnProfileRoute(root, account)
  ) {
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
        maskTextNodeInPlace(textNode, DISPLAY_ALIAS, "displayName");

        displayNameMasked = true;
        continue;
      }

      if (
        classification === "username" &&
        settings.maskUsername &&
        !usernameMasked
      ) {
        maskTextNodeInPlace(textNode, USERNAME_ALIAS, "username");

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

      maskTextNodeInPlace(textNode, DISPLAY_ALIAS, "displayName");
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

      maskTextNodeInPlace(textNode, USERNAME_ALIAS, "username");
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

  const variant = getAvatarMaskVariant(settings);

  for (const textarea of collectMatches<HTMLElement>(root, COMPOSER_TEXTAREA_SELECTORS)) {
    const target = findHomeComposerAvatarTarget(textarea);

    if (!target) {
      continue;
    }

    applyAvatarMaskAppearance(target, variant);
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

function applyWebsiteMask(root: ParentNode, settings: MaskSettings, account: CurrentAccount) {
  if (!settings.maskWebsite) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, WEBSITE_SELECTORS)) {
    if (!elementBelongsToCurrentUser(element, account)) {
      continue;
    }

    concealBlock(element, "ウェブサイト非表示");
  }
}

function applyVerifiedBadgeMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskVerifiedBadge) {
    return;
  }

  for (const element of collectMatches<HTMLElement>(root, PROFILE_VERIFICATION_SELECTORS)) {
    const target = getProfileVerificationTarget(element);

    if (!isProfileSummaryElement(target, account)) {
      continue;
    }

    hideElement(target);
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

  const variant = getAvatarMaskVariant(settings);

  for (const container of collectMatches<HTMLElement>(root, AVATAR_CONTAINER_SELECTORS)) {
    if (parseHandleFromAvatarTestId(container.getAttribute("data-testid")) !== account.handle) {
      continue;
    }

    applyAvatarMaskAppearance(container, variant);
  }

  for (const image of collectMatches<HTMLImageElement>(root, AVATAR_IMAGE_SELECTORS)) {
    if (!elementBelongsToCurrentUser(image, account)) {
      continue;
    }

    concealAvatar(image, variant);
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

function applyUserCellIdentityMask(
  root: ParentNode,
  settings: MaskSettings,
  account: CurrentAccount
) {
  if (!settings.maskDisplayName && !settings.maskUsername) {
    return;
  }

  for (const userCell of collectMatches<HTMLElement>(root, ['[data-testid="UserCell"]'])) {
    if (!userCellBelongsToCurrentUser(userCell, account)) {
      continue;
    }

    for (const textNode of getTextNodes(userCell)) {
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

function isAccountSwitcherHoverCard(hoverCard: Element): boolean {
  return hoverCard.querySelector(ACCOUNT_SWITCHER_MARKER_SELECTOR) !== null;
}

// ログアウトボタン等、テキスト中に混在する @handle だけを置換する。
// wrapTextNode はテキスト全体を置き換えてしまうため別経路が必要。
function maskHandleOccurrencesInText(textNode: Text, replacement: string) {
  const parent = textNode.parentNode;

  if (!parent || textNode.parentElement?.closest(`[${MASKED_TEXT_ATTR}]`)) {
    return;
  }

  const original = textNode.textContent ?? "";
  const masked = original.replace(HANDLE_IN_TEXT_PATTERN, replacement);

  if (masked === original) {
    return;
  }

  const wrapper = (textNode.ownerDocument ?? document).createElement("span");

  wrapper.setAttribute(MASKED_TEXT_ATTR, original);
  wrapper.setAttribute("data-stealth-x-variant", "username");
  wrapper.textContent = masked;

  parent.replaceChild(wrapper, textNode);
}

function applyAccountSwitcherMask(root: ParentNode, settings: MaskSettings) {
  if (!settings.maskDisplayName && !settings.maskUsername && !settings.maskAvatar) {
    return;
  }

  for (const hoverCard of collectMatches<HTMLElement>(root, ACCOUNT_SWITCHER_HOVER_CARD_SELECTORS)) {
    if (!isAccountSwitcherHoverCard(hoverCard)) {
      continue;
    }

    if (settings.maskDisplayName || settings.maskUsername) {
      for (const userCell of hoverCard.querySelectorAll<HTMLElement>('[data-testid="UserCell"]')) {
        for (const textNode of getTextNodes(userCell)) {
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

    if (settings.maskAvatar) {
      const variant = getAvatarMaskVariant(settings);

      for (const container of hoverCard.querySelectorAll<HTMLElement>(AVATAR_CONTAINER_SELECTORS.join(","))) {
        applyAvatarMaskAppearance(container, variant);
      }
    }

    if (settings.maskUsername) {
      for (const logoutButton of hoverCard.querySelectorAll<HTMLElement>(ACCOUNT_SWITCHER_LOGOUT_SELECTOR)) {
        for (const textNode of getTextNodes(logoutButton)) {
          maskHandleOccurrencesInText(textNode, USERNAME_ALIAS);
        }
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
  const currentTitleIsMasked =
    currentTitle.includes(DISPLAY_ALIAS) || currentTitle.includes(USERNAME_ALIAS);

  if (currentTitleIsMasked) {
    if (storedOriginalTitle) {
      const remaskedTitle = maskTitleText(storedOriginalTitle, settings, account);

      if (remaskedTitle !== currentTitle) {
        documentRef.title = remaskedTitle;
      }
    }

    return;
  }

  const maskedTitle = maskTitleText(currentTitle, settings, account);

  if (maskedTitle === currentTitle) {
    host.removeAttribute(ORIGINAL_TITLE_ATTR);
    return;
  }

  host.setAttribute(ORIGINAL_TITLE_ATTR, currentTitle);
  documentRef.title = maskedTitle;
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

function unwrapMaskedText(
  root: ParentNode,
  resolveText: (element: HTMLElement) => string | null
) {
  collectMatches<HTMLElement>(root, [`[${MASKED_TEXT_ATTR}]`]).forEach((element) => {
    const nextText = resolveText(element);

    if (nextText === null || !element.parentNode) {
      return;
    }

    element.parentNode.replaceChild(
      (element.ownerDocument ?? document).createTextNode(nextText),
      element
    );
  });
}

function removeMaskDecorators(root: ParentNode) {
  collectMatches<HTMLElement>(root, [`.${HIDDEN_CLASS}`]).forEach((element) => {
    element.classList.remove(HIDDEN_CLASS);
  });

  collectMatches<HTMLElement>(root, [`[${CSS_TEXT_MASK_ATTR}]`]).forEach((element) => {
    element.removeAttribute(CSS_TEXT_MASK_ATTR);
    element.removeAttribute(CSS_TEXT_REPLACEMENT_ATTR);
    element.removeAttribute("data-stealth-x-variant");
  });

  collectMatches<HTMLElement>(root, [`[${BLOCK_ATTR}]`]).forEach((element) => {
    element.removeAttribute(BLOCK_ATTR);
    element.removeAttribute(BLOCK_LABEL_ATTR);
  });

  collectMatches<HTMLElement>(root, [`[${AVATAR_ATTR}]`]).forEach((element) => {
    element.removeAttribute(AVATAR_ATTR);
    element.style.removeProperty(AVATAR_BLUR_CSS_VAR);
    element.style.removeProperty(AVATAR_SCALE_CSS_VAR);
  });

  collectMatches<HTMLElement>(root, [`[${MEDIA_ATTR}]`]).forEach((element) => {
    element.removeAttribute(MEDIA_ATTR);
  });
}

export function clearMaskingArtifacts(root: ParentNode = document) {
  const documentRef = getDocumentNode(root);

  documentRef.documentElement.removeAttribute(ORIGINAL_TITLE_ATTR);

  unwrapMaskedText(root, (element) => {
    return element.textContent;
  });

  removeMaskDecorators(root);
}

export function restoreMasking(root: ParentNode = document) {
  const documentRef = getDocumentNode(root);
  const originalTitle = documentRef.documentElement.getAttribute(ORIGINAL_TITLE_ATTR);

  if (originalTitle !== null) {
    documentRef.title = originalTitle;
    documentRef.documentElement.removeAttribute(ORIGINAL_TITLE_ATTR);
  }

  unwrapMaskedText(root, (element) => {
    return element.getAttribute(MASKED_TEXT_ATTR);
  });

  removeMaskDecorators(root);
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
  applyVerifiedBadgeMask(root, settings, account);
  applyWebsiteMask(root, settings, account);
  applyLocationMask(root, settings, account);
  applyJoinDateMask(root, settings, account);
  applyPostCountMask(root, settings, account);
  applyStatsMask(root, settings, account);
  applySidebarMask(root, settings);
  applyUserCellIdentityMask(root, settings, account);
  applyAccountSwitcherMask(root, settings);
  applyDocumentTitleMask(root, settings, account);
}
