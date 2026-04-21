import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

import { DEFAULT_SETTINGS } from "../shared/settings";
import { applyMasking, ensureMaskStyles, restoreMasking } from "./masking";

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
    const selfAvatar = document.querySelector('#self-post [data-testid="Tweet-User-Avatar"]');
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

  it("replaces the sidebar account switcher text in alias mode", () => {
    const document = setupDocument("");

    applyMasking(document, DEFAULT_SETTINGS);

    const button = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]');

    expect(button?.textContent).toContain("非表示");
    expect(button?.textContent).toContain("@hidden");
    expect(document.querySelector(".stealth-x-blur")).toBeNull();
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

    expect(header?.textContent).toContain("非表示");
    expect(header?.textContent).toContain("0件のポスト");
    expect(header?.textContent).not.toContain("Jane Doe");
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

    expect(stickyBar?.textContent).toContain("非表示");
    expect(stickyBar?.textContent).toContain("0件のポスト");
    expect(stickyBar?.textContent).not.toContain("Jane Doe");
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

    expect(primary?.textContent).toContain("非表示");
    expect(primary?.textContent).toContain("@hidden");
    expect(primary?.textContent).not.toContain("Jane Doe");
    expect(primary?.textContent).not.toContain("@janedoe");
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

  it("does not mask the premium sign up CTA label in the profile header", () => {
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

    expect(cta?.textContent).toContain("認証される");
    expect(cta?.textContent).not.toContain("非表示");
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
});
