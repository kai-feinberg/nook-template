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

import { initialPlacement, validPlacement } from "../src/layouts/placement.ts";
import { photoValidationError, MAX_PHOTO_BYTES } from "../src/state/storage/photoStorage.ts";

test("default placement stays within bounds and has no overlapping pieces", () => {
  const ids: DashboardWidgetId[] = ["personalNote", "rituals", "quickLinks", "curatedArt", "quote"];
  const sizes = { personalNote: "large", rituals: "small", quickLinks: "small", curatedArt: "medium", quote: "small" } as const;
  for (const cols of [4, 6, 12]) {
    const layout = initialPlacement(ids, sizes, cols);
    assert.equal(validPlacement(layout, ids, cols).length, ids.length);
    for (const item of layout) {
      assert.ok(item.x + item.w <= cols);
      for (const other of layout) if (other.i !== item.i) {
        assert.ok(item.x + item.w <= other.x || other.x + other.w <= item.x || item.y + item.h <= other.y || other.y + other.h <= item.y);
      }
    }
  }
});

test("invalid or duplicate saved coordinates cannot enter the grid", () => {
  const valid = {i: "personalNote", x: 0, y: 0, w: 8, h: 9};
  assert.equal(validPlacement([valid, valid, {...valid, i: "quote", w: 20}, {...valid, i: "rituals", x: -1}], ["personalNote", "quote", "rituals"], 12).length, 1);
});

test("photo selection rejects unsupported, oversized, and excessive files", () => {
  assert.equal(photoValidationError([{type: "image/png", size: 10}]), null);
  assert.match(photoValidationError([{type: "text/html", size: 10}])!, /Choose JPG/);
  assert.match(photoValidationError([{type: "image/png", size: MAX_PHOTO_BYTES + 1}])!, /8 MB/);
  assert.match(photoValidationError([{type: "image/png", size: 10}], 24)!, /24 photos/);
});

import { dailyWord, normalizeWords } from "../src/data/words.ts";

test("personal words rotate by date, persist selection within a day, and allow no author", () => {
  const personal = [{id: "a", text: "Take one step", author: ""}, {id: "b", text: "Look outside", author: ""}];
  const day = new Date(2026, 9, 13, 8);
  assert.equal(dailyWord([], personal, "personal", day)?.text, dailyWord([], personal, "personal", new Date(2026, 9, 13, 23))?.text);
  assert.notEqual(dailyWord([], personal, "personal", day)?.text, dailyWord([], personal, "personal", new Date(2026, 9, 14))?.text);
  assert.equal(dailyWord([], personal, "personal", day)?.author, "");
});

test("empty personal words fall back and saved entries are checked", () => {
  const starter = [{text: "Starter", author: ""}];
  assert.equal(dailyWord(starter, [{id: "a", text: "  ", author: ""}], "personal")?.text, "Starter");
  const normalized = normalizeWords([null, {id: "a", text: "Hello"}, {id: "a", text: "World", author: 42}]);
  assert.equal(normalized.length, 2);
  assert.notEqual(normalized[0].id, normalized[1].id);
  assert.equal(normalized[1].author, "");
});
