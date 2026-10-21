import { describe, expect, test } from "bun:test";

import { snapshot } from "./lib/mapper.ts";
import { absoluteFixturePath } from "./lib/paths.ts";
import { externalMdFrontmatterSnapshot } from "./lib/spawn-value.ts";
import { rules } from "./rules.ts";

const RECEIPT = "Bun.YAML.parse + frontmatter split";
const normalize = rules.md.normalize;

// Splitter is regex-only; parity claim is YAML 1.2 frontmatter values + body text shape.
// Bun.markdown is a renderer (html/ansi/render/react), not { md, frontmatter } — not used here.

describe(`two-clock (md, ${RECEIPT})`, () => {
  test(`motherload mapper ≟ ${RECEIPT} (playground/fixtures/post.md)`, async () => {
    const fixture = "playground/fixtures/post.md";
    const absPath = absoluteFixturePath(fixture);

    const mapperValue = normalize(await snapshot(fixture)) as { md: string; frontmatter: unknown };
    const externalValue = normalize(await externalMdFrontmatterSnapshot(absPath)) as {
      md: string;
      frontmatter: unknown;
    };

    expect(mapperValue.frontmatter).toEqual(externalValue.frontmatter);
    expect(mapperValue.md).toBe(externalValue.md);
  });

  test(`motherload mapper ≟ ${RECEIPT} (playground/fixtures/post-edge.md)`, async () => {
    const fixture = "playground/fixtures/post-edge.md";
    const absPath = absoluteFixturePath(fixture);

    const mapperValue = normalize(await snapshot(fixture)) as { md: string; frontmatter: unknown };
    const externalValue = normalize(await externalMdFrontmatterSnapshot(absPath)) as {
      md: string;
      frontmatter: unknown;
    };

    expect(mapperValue.frontmatter).toEqual(externalValue.frontmatter);
    expect(mapperValue.md).toBe(externalValue.md);
  });
});
