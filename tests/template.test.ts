import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyItem, dayIndex, localDay, nextItem } from "../src/data/rotation.ts";
import { moveWidget, normalizeOrder, isWidgetSize } from "../src/layouts/grid.ts";
import type { DashboardWidgetId } from "../src/state/schema.ts";

test("daily content is stable within a local day and changes across midnight", () => {
  const items = ["one", "two", "three"];
  const morning = new Date(2026, 9, 13, 0, 0);
  assert.equal(dailyItem(items, morning), dailyItem(items, new Date(2026, 9, 13, 23, 59)));
  assert.notEqual(dailyItem(items, morning), dailyItem(items, new Date(2026, 9, 14, 0, 0)));
});

test("calendar indexing survives DST and year boundaries", () => {
  assert.equal(dayIndex(new Date(2026, 2, 9)) - dayIndex(new Date(2026, 2, 8)), 1);
  assert.equal(dayIndex(new Date(2027, 0, 1)) - dayIndex(new Date(2026, 11, 31)), 1);
  assert.equal(localDay(new Date(2026, 0, 2)), "2026-01-02");
});

test("empty and single collections do not break rotation", () => {
  assert.equal(dailyItem([]), undefined);
  assert.equal(dailyItem(["only"]), "only");
  assert.equal(nextItem([], "missing"), undefined);
});

test("next image wraps and recovers when an image is removed", () => {
  const items = [{id: "a"}, {id: "b"}, {id: "c"}];
  assert.equal(nextItem(items, "a")?.id, "b");
  assert.equal(nextItem(items, "c")?.id, "a");
  assert.equal(nextItem(items, "removed")?.id, "a");
});

test("moving earlier and later keeps every piece once", () => {
  const order: DashboardWidgetId[] = ["personalNote", "rituals", "quickLinks"];
  assert.deepEqual(moveWidget(order, "personalNote", "rituals"), ["rituals", "personalNote", "quickLinks"]);
  assert.deepEqual(moveWidget(order, "quickLinks", "personalNote"), ["quickLinks", "personalNote", "rituals"]);
  assert.deepEqual(order, ["personalNote", "rituals", "quickLinks"]);
  assert.equal(moveWidget(order, "quote", "personalNote"), order);
});

test("old order drops removed widgets and restores missing pieces", () => {
  const order = normalizeOrder(["githubTrending", "quote", "quote", "clock"], ["personalNote", "rituals", "quickLinks", "curatedArt", "quote"]);
  assert.deepEqual(order, ["quote", "personalNote", "rituals", "quickLinks", "curatedArt"]);
  assert.equal(normalizeOrder(null, []).length, 5);
  assert.equal(isWidgetSize("freeform"), false);
});
