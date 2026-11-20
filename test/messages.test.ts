import { expect, test } from "vitest";
import { messageCatalog } from "../src/index.js";
import { messages } from "../src/messages.js";

test("every message has its own ID, so the catalog loses none", () => {
  expect(Object.keys(messageCatalog())).toHaveLength(Object.keys(messages).length);
});
