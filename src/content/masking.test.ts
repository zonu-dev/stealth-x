import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

import { DEFAULT_SETTINGS } from "../shared/settings";
import {
  applyMasking,
  clearMaskingArtifacts,
  ensureMaskStyles,
  restoreMasking
} from "./masking";

const CSS_TEXT_MASK_SELECTOR = "[data-stealth-x-text-mask]";
const CSS_TEXT_REPLACEMENT_ATTR = "data-stealth-x-text-replacement";

const CURRENT_ACCOUNT_SIDEBAR = `
  <button data-testid="SideNav_AccountSwitcher_Button">
    <span>Jane Doe</span>
    <span>@janedoe</span>
  </button>
`;

function setupDocument(
  body: string,
  url = "https://x.com/home",
  title = ""
) {
  const dom = new JSDOM(`<body>${CURRENT_ACCOUNT_SIDEBAR}${body}</body>`, { url });
  const { document } = dom.window;

  document.title = title;

  ensureMaskStyles(document);

  return document;
}

describe("applyMasking", () => {
  it("masks only the current user's timeline identity", () => {
    const document = setupDocument(`
      <article id="self-post">
        <div data-testid="Tweet-User-Avatar"><img src="self.png" alt="Jane Doe" /></div>
        <div data-testid="User-Name">
          <a href="/janedoe"><span>Jane Doe</span></a>
          <a href="/janedoe"><span>@janedoe</span></a>
          <span>·</span>
          <span>2h</span>
        </div>
      </article>
      <article id="other-post">
        <div data-testid="Tweet-User-Avatar"><img src="other.png" alt="Other User" /></div>
        <div data-testid="User-Name">
          <a href="/otheruser"><span>Other User</span></a>
          <a href="/otheruser"><span>@otheruser</span></a>
          <span>·</span>
          <span>1h</span>
        </div>
      </article>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const selfPost = document.querySelector("#self-post");
    const otherPost = document.querySelector("#other-post");
    const selfAvatar = document.querySelector<HTMLElement>(
      '#self-post [data-testid="Tweet-User-Avatar"]'
    );
    const otherAvatar = document.querySelector('#other-post [data-testid="Tweet-User-Avatar"]');

    expect(selfPost?.textContent).toContain("非表示");
    expect(selfPost?.textContent).toContain("@hidden");
    expect(selfPost?.textContent).toContain("2h");
    expect(selfAvatar?.getAttribute("data-stealth-x-avatar")).toBe("conceal");

    expect(otherPost?.textContent).toContain("Other User");
    expect(otherPost?.textContent).toContain("@otheruser");
    expect(otherAvatar?.hasAttribute("data-stealth-x-avatar")).toBe(false);

    restoreMasking(document);

    expect(selfPost?.textContent).toContain("Jane Doe");
    expect(selfPost?.textContent).toContain("@janedoe");
  });

  it("masks the current user's post even when another user name appears earlier in the article", () => {
    const document = setupDocument(`
      <article id="self-post-with-leading-other-name">
        <div data-testid="User-Name">
          <a href="/otheruser"><span>Other User</span></a>
          <a href="/otheruser"><span>@otheruser</span></a>
        </div>
        <div data-testid="Tweet-User-Avatar">
          <div data-testid="UserAvatar-Container-janedoe"><img src="self.png" alt="Jane Doe" /></div>
        </div>
        <div data-testid="User-Name">
          <a href="/janedoe"><span>Jane Doe</span></a>
          <a href="/janedoe"><span>@janedoe</span></a>
          <a href="/janedoe/status/1"><time>2h</time></a>
        </div>
      </article>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const selfPost = document.querySelector("#self-post-with-leading-other-name");

    expect(selfPost?.textContent).toContain("非表示");
    expect(selfPost?.textContent).toContain("@hidden");
    expect(selfPost?.textContent).not.toContain("Jane Doe");
  });

  it("does not mask another user's post just because the article contains the current user's identity", () => {
    const document = setupDocument(`
      <article id="other-post-with-self-reference">
        <div data-testid="Tweet-User-Avatar">
          <div data-testid="UserAvatar-Container-otheruser"><img src="other.png" alt="Other User" /></div>
        </div>
        <div data-testid="User-Name">
          <a href="/otheruser"><span>Other User</span></a>
          <a href="/otheruser"><span>@otheruser</span></a>
          <a href="/otheruser/status/1"><time>1h</time></a>
        </div>
        <div>
          <a href="/janedoe"><span>Jane Doe</span></a>
          <a href="/janedoe"><span>@janedoe</span></a>
        </div>
      </article>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const otherPost = document.querySelector("#other-post-with-self-reference");
    const otherAvatar = document.querySelector(
      '#other-post-with-self-reference [data-testid="UserAvatar-Container-otheruser"]'
    );

    expect(otherPost?.textContent).toContain("Other User");
    expect(otherPost?.textContent).toContain("@otheruser");
    expect(otherPost?.textContent).toContain("Jane Doe");
    expect(otherAvatar?.hasAttribute("data-stealth-x-avatar")).toBe(false);
  });

  it("conceals profile bio and stats only on the current user's profile route", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
            <div data-testid="UserDescription">Security engineer. Coffee.</div>
            <a href="/janedoe/followers">120 followers</a>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const bio = document.querySelector('[data-testid="UserDescription"]');
    const stats = document.querySelector('a[href="/janedoe/followers"]');

    expect(bio?.getAttribute("data-stealth-x-block")).toBe("conceal");
    expect(stats?.getAttribute("data-stealth-x-block")).toBe("stat");
  });

  it("does not conceal another user's profile metadata", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Other User</span>
              <span>@otheruser</span>
            </div>
            <div data-testid="UserDescription">Other bio</div>
            <a href="/otheruser/followers">500 followers</a>
          </header>
        </div>
      `,
      "https://x.com/otheruser"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const bio = document.querySelector('[data-testid="UserDescription"]');
    const stats = document.querySelector('a[href="/otheruser/followers"]');

    expect(bio?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(stats?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(document.body.textContent).toContain("Other User");
  });

  it("does not treat another profile subtree as the current user after navigation", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn" id="other-profile">
          <header>
            <div data-testid="UserName">
              <span>Other User</span>
              <span>@otheruser</span>
            </div>
            <div data-testid="UserLocation">Tokyo</div>
            <div data-testid="UserJoinDate">2021年1月からXを利用しています</div>
            <div data-testid="UserDescription">Other bio</div>
            <a href="/otheruser/followers">500 followers</a>
            <div data-testid="UserAvatar-Container-otheruser">
              <img src="other.png" alt="Other User" />
            </div>
          </header>
        </div>
      `,
      "https://x.com/otheruser"
    );

    const otherProfile = document.querySelector("#other-profile");

    expect(otherProfile).not.toBeNull();

    applyMasking(otherProfile as HTMLElement, DEFAULT_SETTINGS);

    const bio = document.querySelector('[data-testid="UserDescription"]');
    const location = document.querySelector('[data-testid="UserLocation"]');
    const joinDate = document.querySelector('[data-testid="UserJoinDate"]');
    const stats = document.querySelector('a[href="/otheruser/followers"]');
    const avatar = document.querySelector('[data-testid="UserAvatar-Container-otheruser"]');

    expect(bio?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(location?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(joinDate?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(stats?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(avatar?.hasAttribute("data-stealth-x-avatar")).toBe(false);
    expect(document.body.textContent).toContain("Other User");
    expect(document.body.textContent).toContain("@otheruser");
  });

  it("replaces the sidebar account switcher text in alias mode", () => {
    const document = setupDocument("");

    applyMasking(document, DEFAULT_SETTINGS);

    const button = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]');

    expect(button?.textContent).toContain("非表示");
    expect(button?.textContent).toContain("@hidden");
    expect(document.querySelector(".stealth-x-blur")).toBeNull();
  });

  it("clears profile identity CSS masks without restoring stale text", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const profileName = document.querySelector('[data-testid="UserName"]');
    const masks = profileName?.querySelectorAll<HTMLElement>(CSS_TEXT_MASK_SELECTOR) ?? [];

    expect(masks).toHaveLength(2);
    expect(masks[0].getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("非表示");
    expect(masks[1].getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("@hidden");

    masks[0].textContent = "Other User";
    masks[1].textContent = "@otheruser";

    clearMaskingArtifacts(document);

    expect(profileName?.textContent).toContain("Other User");
    expect(profileName?.textContent).toContain("@otheruser");
    expect(profileName?.querySelector(CSS_TEXT_MASK_SELECTOR)).toBeNull();
    expect(document.querySelector('[data-stealth-x-original-text]')).toBeNull();
  });

  it("does not restore the previous profile identity when a profile DOM is reused", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn" id="profile-column">
          <header>
            <h2>
              <span>Jane Doe</span>
              <span>60件のポスト</span>
            </h2>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    document.defaultView?.history.pushState({}, "", "/otheruser");

    const profileColumn = document.querySelector("#profile-column");

    profileColumn
      ?.querySelectorAll<HTMLElement>('[data-stealth-x-variant="displayName"]')
      .forEach((element) => {
        element.textContent = "Other User";
      });
    profileColumn
      ?.querySelectorAll<HTMLElement>('[data-stealth-x-variant="username"]')
      .forEach((element) => {
        element.textContent = "@otheruser";
      });

    clearMaskingArtifacts(document);
    applyMasking(document, DEFAULT_SETTINGS);

    expect(profileColumn?.textContent).toContain("Other User");
    expect(profileColumn?.textContent).toContain("@otheruser");
    expect(profileColumn?.textContent).not.toContain("Jane Doe");
    expect(profileColumn?.textContent).not.toContain("@janedoe");
    expect(profileColumn?.textContent).not.toContain("非表示");
    expect(profileColumn?.textContent).not.toContain("@hidden");
  });

  it("keeps masking the own profile header after navigation cleanup removes sidebar originals", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <div data-testid="sticky-name-bar">
            <button type="button">戻る</button>
            <div>
              <span>Jane Doe</span>
              <span>60件のポスト</span>
            </div>
          </div>
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);
    clearMaskingArtifacts(document);

    const stickyBar = document.querySelector('[data-testid="sticky-name-bar"]');

    expect(stickyBar?.querySelector(CSS_TEXT_MASK_SELECTOR)).toBeNull();

    if (stickyBar) {
      stickyBar.innerHTML = `
        <button type="button">戻る</button>
        <div>
          <span>Jane Doe</span>
          <span>60件のポスト</span>
        </div>
      `;
    }

    applyMasking(document, DEFAULT_SETTINGS);

    const displayNameMask = stickyBar?.querySelector<HTMLElement>(
      '[data-stealth-x-text-mask="displayName"]'
    );

    expect(displayNameMask?.getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("非表示");
  });

  it("conceals the current user's home composer avatar", () => {
    const document = setupDocument(`
      <div data-testid="primaryColumn">
        <form>
          <div data-testid="UserAvatar-Container-janedoe">
            <button type="button">
              <img src="self-composer.png" alt="Jane Doe" />
            </button>
          </div>
          <div data-testid="tweetTextarea_0">いまどうしてる？</div>
        </form>
      </div>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const composerAvatar = document.querySelector(
      '[data-testid="UserAvatar-Container-janedoe"]'
    );

    expect(composerAvatar?.getAttribute("data-stealth-x-avatar")).toBe("conceal");
  });

  it("conceals a home composer avatar rendered as a background image", () => {
    const document = setupDocument(`
      <div data-testid="primaryColumn">
        <form>
          <div data-testid="UserAvatar-Container-janedoe">
            <button type="button">
              <div id="composer-avatar" style="background-image:url(self-avatar.png)"></div>
            </button>
          </div>
          <div data-testid="tweetTextarea_0">いまどうしてる？</div>
        </form>
      </div>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const composerAvatar = document.querySelector("#composer-avatar");

    expect(
      composerAvatar?.closest('[data-testid="UserAvatar-Container-janedoe"]')?.getAttribute(
        "data-stealth-x-avatar"
      )
    ).toBe("conceal");
  });

  it("conceals a home composer avatar even when the composer is not a form", () => {
    const document = setupDocument(`
      <div data-testid="primaryColumn">
        <section>
          <div>
            <div data-testid="UserAvatar-Container-janedoe">
              <button type="button">
                <div id="composer-avatar-no-form" style="background-image:url(self-avatar.png)"></div>
              </button>
            </div>
            <div data-testid="tweetTextarea_0">いまどうしてる？</div>
          </div>
        </section>
      </div>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const composerAvatar = document.querySelector("#composer-avatar-no-form");

    expect(
      composerAvatar?.closest('[data-testid="UserAvatar-Container-janedoe"]')?.getAttribute(
        "data-stealth-x-avatar"
      )
    ).toBe("conceal");
  });

  it("replaces the profile sticky header display name on the current user's profile", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div>
              <div>
                <span>Jane Doe</span>
              </div>
            </div>
            <div>0件のポスト</div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const header = document.querySelector('[data-testid="primaryColumn"] header');
    const displayNameMask = header?.querySelector<HTMLElement>(
      '[data-stealth-x-text-mask="displayName"]'
    );

    expect(displayNameMask?.getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("非表示");
    expect(header?.textContent).toContain("0件のポスト");
  });

  it("replaces the current user's sticky display name even outside header tags", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <div data-testid="sticky-name-bar">
            <button type="button">戻る</button>
            <div>
              <span>Jane Doe</span>
              <span>0件のポスト</span>
            </div>
          </div>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const stickyBar = document.querySelector('[data-testid="sticky-name-bar"]');
    const displayNameMask = stickyBar?.querySelector<HTMLElement>(
      '[data-stealth-x-text-mask="displayName"]'
    );

    expect(displayNameMask?.getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("非表示");
    expect(stickyBar?.textContent).toContain("0件のポスト");
  });

  it("conceals the current user's profile header media and avatar only in the hero area", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <div>
            <a href="/janedoe/header_photo">
              <img src="https://pbs.twimg.com/profile_banners/1/banner.jpg" alt="banner" />
            </a>
            <a href="/janedoe/photo">
              <img src="https://pbs.twimg.com/profile_images/1/avatar.jpg" alt="avatar" />
            </a>
          </div>
          <div role="tablist"></div>
          <article>
            <img id="post-image" src="https://pbs.twimg.com/media/post.jpg" alt="post media" />
          </article>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const banner = document.querySelector(
      '[data-testid="primaryColumn"] a[href="/janedoe/header_photo"]'
    );
    const avatar = document.querySelector(
      '[data-testid="primaryColumn"] a[href="/janedoe/photo"]'
    );
    const postImage = document.querySelector("#post-image");

    expect(banner?.getAttribute("data-stealth-x-media")).toBe("conceal");
    expect(avatar?.getAttribute("data-stealth-x-avatar")).toBe("conceal");
    expect(postImage?.parentElement?.hasAttribute("data-stealth-x-media")).toBe(false);
  });

  it("conceals the post count label on the current user's profile header", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
            </div>
            <div>288 件のポスト</div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const postCountDiv = [...document.querySelectorAll('[data-testid="primaryColumn"] header div')].find(
      (el) => el.getAttribute("data-stealth-x-block") === "stat"
    );

    expect(postCountDiv).toBeDefined();
    expect(postCountDiv?.textContent).toContain("288 件のポスト");
  });

  it("conceals location and join date on the current user's profile", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
            <span data-testid="UserLocation">日本 東京</span>
            <span data-testid="UserJoinDate">2022年3月からXを利用しています</span>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const location = document.querySelector('[data-testid="UserLocation"]');
    const joinDate = document.querySelector('[data-testid="UserJoinDate"]');

    expect(location?.getAttribute("data-stealth-x-block")).toBe("conceal");
    expect(joinDate?.getAttribute("data-stealth-x-block")).toBe("conceal");
  });

  it("conceals the current user's profile website link", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
            <span data-testid="UserLocation">Tokyo</span>
            <a data-testid="UserUrl" href="https://t.co/example">example.com</a>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const website = document.querySelector('[data-testid="UserUrl"]');

    expect(website?.getAttribute("data-stealth-x-block")).toBe("conceal");
    expect(website?.getAttribute("data-stealth-x-label")).toBe("ウェブサイト非表示");
  });

  it("does not conceal another user's profile website link", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Other User</span>
              <span>@otheruser</span>
            </div>
            <a data-testid="UserUrl" href="https://t.co/example">example.com</a>
          </header>
        </div>
      `,
      "https://x.com/otheruser"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const website = document.querySelector('[data-testid="UserUrl"]');

    expect(website?.hasAttribute("data-stealth-x-block")).toBe(false);
    expect(website?.textContent).toContain("example.com");
  });

  it("conceals display name and username on the account's about page", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <div>
            <div>
              <span>Jane Doe</span>
              <svg data-testid="icon-lock"></svg>
            </div>
            <div>
              <span>@janedoe</span>
            </div>
          </div>
        </div>
      `,
      "https://x.com/janedoe/about"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const primary = document.querySelector('[data-testid="primaryColumn"]');
    const displayNameMask = primary?.querySelector<HTMLElement>(
      '[data-stealth-x-text-mask="displayName"]'
    );
    const usernameMask = primary?.querySelector<HTMLElement>(
      '[data-stealth-x-text-mask="username"]'
    );

    expect(displayNameMask?.getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("非表示");
    expect(usernameMask?.getAttribute(CSS_TEXT_REPLACEMENT_ATTR)).toBe("@hidden");
  });

  it("does not conceal follower/following tabs on the follower list page", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <nav role="navigation">
            <div role="tablist">
              <a href="/janedoe/verified_followers" role="tab" aria-selected="false">
                <span>認証済みのフォロワー</span>
              </a>
              <a href="/janedoe/followers" role="tab" aria-selected="false">
                <span>フォロワー</span>
              </a>
              <a href="/janedoe/following" role="tab" aria-selected="true">
                <span>フォロー中</span>
              </a>
            </div>
          </nav>
        </div>
      `,
      "https://x.com/janedoe/following"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const tabs = document.querySelectorAll('a[role="tab"]');

    tabs.forEach((tab) => {
      expect(tab.getAttribute("data-stealth-x-block")).toBeNull();
    });
  });

  it("does not conceal the audience selector button near the home composer", () => {
    const document = setupDocument(`
      <div data-testid="primaryColumn">
        <div>
          <div>
            <button aria-label="オーディエンスを選択" aria-haspopup="menu" role="button" type="button">
              <span>
                <span>全員</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 8l9 9 9-9"></path></g></svg>
              </span>
            </button>
          </div>
          <div data-testid="tweetTextarea_0">いまどうしてる？</div>
        </div>
      </div>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const audience = document.querySelector('[aria-label="オーディエンスを選択"]');

    expect(audience?.querySelector('[data-stealth-x-avatar]')).toBeNull();
    expect(audience?.textContent).toContain("全員");
  });

  it("does not mask Japanese relative time labels on tweets", () => {
    const document = setupDocument(`
      <article id="self-post">
        <div data-testid="Tweet-User-Avatar"><img src="self.png" alt="Jane Doe" /></div>
        <div data-testid="User-Name">
          <a href="/janedoe"><span>Jane Doe</span></a>
          <a href="/janedoe"><span>@janedoe</span></a>
          <span>·</span>
          <a href="/janedoe/status/1" aria-label="50 分前" role="link">
            <time datetime="2026-04-19T12:00:00.000Z">
              <span>50分</span>
            </time>
          </a>
        </div>
      </article>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const time = document.querySelector('time');

    expect(time?.textContent).toContain("50分");
    expect(time?.textContent).not.toContain("非表示");
  });

  it("conceals the premium sign up CTA in the current user's profile header", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
              <a href="/i/premium_sign_up" role="link">
                <svg viewBox="0 0 22 22" aria-hidden="true"></svg>
                <span>
                  <span>認証される</span>
                </span>
              </a>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const cta = document.querySelector('a[href="/i/premium_sign_up"]');

    expect(cta?.classList.contains("stealth-x-hidden")).toBe(true);
  });

  it("leaves the premium sign up CTA visible when verified badge masking is disabled", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
            <a href="/i/premium_sign_up" role="link">
              <svg viewBox="0 0 22 22" aria-hidden="true"></svg>
              <span>認証される</span>
            </a>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, {
      ...DEFAULT_SETTINGS,
      maskVerifiedBadge: false
    });

    const cta = document.querySelector('a[href="/i/premium_sign_up"]');

    expect(cta?.classList.contains("stealth-x-hidden")).toBe(false);
    expect(cta?.textContent).toContain("認証される");
  });

  it("conceals the current user's verified icon without replacing badge text", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
              <button type="button">
                <svg data-testid="icon-verified"></svg>
                <span>Jane Doe</span>
              </button>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const icon = document.querySelector('[data-testid="icon-verified"]');
    const badge = document.querySelector('[data-testid="UserName"] button');

    expect(icon?.classList.contains("stealth-x-hidden")).toBe(true);
    expect(badge?.textContent).toContain("Jane Doe");
    expect(badge?.textContent).not.toContain("非表示");
  });

  it("does not mask the display name inside a plain button badge with verified icon", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
              <button type="button">
                <svg data-testid="icon-verified"></svg>
                <span>Jane Doe</span>
              </button>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const badge = document.querySelector('[data-testid="UserName"] button');

    expect(badge?.textContent).toContain("Jane Doe");
    expect(badge?.textContent).not.toContain("非表示");
  });

  it("does not mask the display name inside the verified badge pill", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
              <button data-testid="verifiedBadgeDialogTrigger" aria-label="認証済みアカウント">
                <svg data-testid="icon-verified"></svg>
                <span>Jane Doe</span>
              </button>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    const badge = document.querySelector('[data-testid="verifiedBadgeDialogTrigger"]');

    expect(badge?.textContent).toContain("Jane Doe");
    expect(badge?.textContent).not.toContain("非表示");
  });

  it("conceals all accounts shown in the account switcher popup", () => {
    const document = setupDocument(`
      <div data-testid="hoverCardParent">
        <div data-testid="HoverCard">
          <li data-testid="UserCell">
            <div data-testid="UserAvatar-Container-janedoe"><img src="janedoe.png" /></div>
            <span>Jane Doe</span>
            <span>@janedoe</span>
          </li>
          <button data-testid="UserCell" aria-label="@alt_accountに切り替える">
            <div data-testid="UserAvatar-Container-alt_account"><img src="alt.png" /></div>
            <span>Alternate Name</span>
            <span>@alt_account</span>
          </button>
          <button data-testid="UserCell" aria-label="@taro_yamadaに切り替える">
            <div data-testid="UserAvatar-Container-taro_yamada"><img src="taro.png" /></div>
            <span>山田 太郎</span>
            <span>@taro_yamada</span>
          </button>
          <a href="/i/flow/login" data-testid="AccountSwitcher_AddAccount_Button">
            <span>既存のアカウントを追加</span>
          </a>
          <a href="/logout" data-testid="AccountSwitcher_Logout_Button">
            <span>@janedoeからログアウト</span>
          </a>
        </div>
      </div>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const hoverCard = document.querySelector('[data-testid="HoverCard"]');
    const altAvatar = document.querySelector('[data-testid="UserAvatar-Container-alt_account"]');
    const taroAvatar = document.querySelector('[data-testid="UserAvatar-Container-taro_yamada"]');
    const selfAvatar = document.querySelector('[data-testid="UserAvatar-Container-janedoe"]');
    const logoutButton = document.querySelector('[data-testid="AccountSwitcher_Logout_Button"]');

    expect(hoverCard?.textContent).not.toContain("Alternate Name");
    expect(hoverCard?.textContent).not.toContain("@alt_account");
    expect(hoverCard?.textContent).not.toContain("山田 太郎");
    expect(hoverCard?.textContent).not.toContain("@taro_yamada");
    expect(hoverCard?.textContent).not.toContain("Jane Doe");
    expect(hoverCard?.textContent).not.toContain("@janedoe");

    expect(altAvatar?.getAttribute("data-stealth-x-avatar")).toBe("conceal");
    expect(taroAvatar?.getAttribute("data-stealth-x-avatar")).toBe("conceal");
    expect(selfAvatar?.getAttribute("data-stealth-x-avatar")).toBe("conceal");

    expect(logoutButton?.textContent).toContain("@hiddenからログアウト");
    expect(logoutButton?.textContent).not.toContain("@janedoe");

    expect(hoverCard?.textContent).toContain("既存のアカウントを追加");
  });

  it("leaves non-AccountSwitcher hover cards untouched", () => {
    const document = setupDocument(`
      <div data-testid="HoverCard">
        <div data-testid="UserCell">
          <div data-testid="UserAvatar-Container-stranger"><img src="stranger.png" /></div>
          <span>Stranger User</span>
          <span>@stranger</span>
        </div>
      </div>
    `);

    applyMasking(document, DEFAULT_SETTINGS);

    const hoverCard = document.querySelector('[data-testid="HoverCard"]');
    const avatar = document.querySelector('[data-testid="UserAvatar-Container-stranger"]');

    expect(hoverCard?.textContent).toContain("Stranger User");
    expect(hoverCard?.textContent).toContain("@stranger");
    expect(avatar?.hasAttribute("data-stealth-x-avatar")).toBe(false);
  });

  it("applies the blur variant to the current user's avatar when maskAvatarBlur is enabled", () => {
    const document = setupDocument(`
      <article id="self-post">
        <div
          data-testid="Tweet-User-Avatar"
          style="width: 40px; height: 40px;"
        ><img src="self.png" alt="Jane Doe" /></div>
        <div data-testid="User-Name">
          <a href="/janedoe"><span>Jane Doe</span></a>
          <a href="/janedoe"><span>@janedoe</span></a>
        </div>
      </article>
    `);

    applyMasking(document, { ...DEFAULT_SETTINGS, maskAvatarBlur: true });

    const selfAvatar = document.querySelector<HTMLElement>(
      '#self-post [data-testid="Tweet-User-Avatar"]'
    );

    expect(selfAvatar?.getAttribute("data-stealth-x-avatar")).toBe("blur");
    expect(selfAvatar?.style.getPropertyValue("--stealth-x-avatar-blur")).toBe("4px");
  });

  it("applies a stronger blur to larger profile avatars", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div
              data-testid="UserAvatar-Container-janedoe"
              style="width: 160px; height: 160px;"
            >
              <img src="profile.png" alt="Jane Doe" />
            </div>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
          </header>
        </div>
        <article id="self-post">
          <div
            data-testid="UserAvatar-Container-janedoe"
            style="width: 40px; height: 40px;"
          >
            <img src="self.png" alt="Jane Doe" />
          </div>
          <div data-testid="User-Name">
            <a href="/janedoe"><span>Jane Doe</span></a>
            <a href="/janedoe"><span>@janedoe</span></a>
          </div>
        </article>
      `,
      "https://x.com/janedoe"
    );

    applyMasking(document, { ...DEFAULT_SETTINGS, maskAvatarBlur: true });

    const avatars = document.querySelectorAll<HTMLElement>(
      '[data-testid="UserAvatar-Container-janedoe"]'
    );
    const profileAvatar = avatars[0];
    const timelineAvatar = avatars[1];

    expect(profileAvatar?.getAttribute("data-stealth-x-avatar")).toBe("blur");
    expect(timelineAvatar?.getAttribute("data-stealth-x-avatar")).toBe("blur");
    expect(profileAvatar?.style.getPropertyValue("--stealth-x-avatar-blur")).toBe("12px");
    expect(timelineAvatar?.style.getPropertyValue("--stealth-x-avatar-blur")).toBe("4px");
  });

  it("does not blur the avatar when maskAvatar is disabled", () => {
    const document = setupDocument(`
      <article id="self-post">
        <div data-testid="Tweet-User-Avatar"><img src="self.png" alt="Jane Doe" /></div>
        <div data-testid="User-Name">
          <a href="/janedoe"><span>Jane Doe</span></a>
          <a href="/janedoe"><span>@janedoe</span></a>
        </div>
      </article>
    `);

    applyMasking(document, {
      ...DEFAULT_SETTINGS,
      maskAvatar: false,
      maskAvatarBlur: true
    });

    const selfAvatar = document.querySelector('#self-post [data-testid="Tweet-User-Avatar"]');

    expect(selfAvatar?.hasAttribute("data-stealth-x-avatar")).toBe(false);
  });

  it("replaces the current user's profile title in the browser tab", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe",
      "Jane Doe (@janedoe) / X"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    expect(document.title).toBe("非表示 (@hidden) / X");

    restoreMasking(document);

    expect(document.title).toBe("Jane Doe (@janedoe) / X");
  });

  it("replaces the current user's title outside profile routes", () => {
    const document = setupDocument(
      "",
      "https://x.com/home",
      "Jane Doe (@janedoe) さん / X"
    );

    applyMasking(document, DEFAULT_SETTINGS);

    expect(document.title).toBe("非表示 (@hidden) さん / X");

    restoreMasking(document);

    expect(document.title).toBe("Jane Doe (@janedoe) さん / X");
  });

  it("replaces a leaked home title after profile navigation", () => {
    const document = setupDocument(
      `
        <div data-testid="primaryColumn">
          <header>
            <div data-testid="UserName">
              <span>Jane Doe</span>
              <span>@janedoe</span>
            </div>
          </header>
        </div>
      `,
      "https://x.com/janedoe",
      "Jane Doe (@janedoe) / X"
    );

    applyMasking(document, DEFAULT_SETTINGS);
    expect(document.title).toBe("非表示 (@hidden) / X");

    document.defaultView?.history.replaceState({}, "", "/home");
    document.title = "Jane Doe (@janedoe) さん / X";

    applyMasking(document, DEFAULT_SETTINGS);

    expect(document.title).toBe("非表示 (@hidden) さん / X");
  });
});
