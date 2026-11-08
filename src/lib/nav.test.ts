import { describe, expect, it } from "vitest";
import { currentTab, helpHref } from "./nav";

describe("currentTab: which bottom bar button is lit up", () => {
  it("lights My Bills on the main screen and on Add a bill", () => {
    expect(currentTab("/")).toBe("my-bills");
    expect(currentTab("/add")).toBe("my-bills");
  });

  it("lights Paid Bills on the Paid Bills page", () => {
    expect(currentTab("/history")).toBe("paid-bills");
  });

  it("lights Handy tools on Handy tools and on each tool inside it", () => {
    expect(currentTab("/handy-tools")).toBe("handy-tools");
    expect(currentTab("/calculator")).toBe("handy-tools");
    expect(currentTab("/converter")).toBe("handy-tools");
  });

  it("lights nothing on Help, which is not one of the three", () => {
    expect(currentTab("/help")).toBeNull();
  });

  it("ignores a trailing slash", () => {
    expect(currentTab("/calculator/")).toBe("handy-tools");
  });
});

describe("helpHref: where the Help button goes", () => {
  it("opens the help topic for the page the Person is on", () => {
    expect(helpHref("/history")).toBe("/help#history");
    expect(helpHref("/calculator")).toBe("/help#calculator");
    expect(helpHref("/converter")).toBe("/help#converter");
  });

  it("opens the top of Help on pages without their own topic", () => {
    expect(helpHref("/")).toBe("/help");
    expect(helpHref("/add")).toBe("/help");
    expect(helpHref("/handy-tools")).toBe("/help");
    expect(helpHref("/help")).toBe("/help");
  });
});
