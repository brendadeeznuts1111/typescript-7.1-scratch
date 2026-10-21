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

    const mapperRaw = (await snapshot(fixture)) as { md: string; frontmatter: Record<string, unknown> };
    const externalRaw = (await externalMdFrontmatterSnapshot(absPath)) as {
      md: string;
      frontmatter: Record<string, unknown>;
    };
    // published: 2024-01-15 — raw arms both string (YAML 1.2); not Date coercion hidden by mdShapeKeySort.
    expect(typeof mapperRaw.frontmatter.published).toBe("string");
    expect(typeof externalRaw.frontmatter.published).toBe("string");
    expect(mapperRaw.frontmatter.published).toBe("2024-01-15");

    const mapperValue = normalize(mapperRaw);
    const externalValue = normalize(externalRaw);

    expect(mapperValue).toEqual(externalValue);
  });
});
