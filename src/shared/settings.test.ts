import { describe, expect, it } from "vitest";

import { normalizeSettings } from "./settings";

describe("normalizeSettings", () => {
  it("coerces legacy blur mode to alias", () => {
    expect(normalizeSettings({ mode: "blur" as never }).mode).toBe("alias");
  });
});
