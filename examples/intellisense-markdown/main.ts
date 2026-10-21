/**
 * Markdown IntelliSense demo — hover `notes` (screenshot parity).
 *
 * CLI: bun run typecheck:example
 * Run: bun run example:intellisense
 */
import notes from "./notes.md";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const expect = <T extends true>() => {};

expect<
  Equal<
    typeof notes,
    {
      readonly md: string;
      readonly frontmatter: {
        readonly title: "Release notes";
        readonly tags: readonly ["beta"];
      };
    }
  >
>();

// @ts-expect-error tags is readonly ["beta"], not a wider string array
const loose: string[] = notes.frontmatter.tags;

console.log({
  title: notes.frontmatter.title,
  tags: notes.frontmatter.tags,
  body: notes.md.trim(),
});
