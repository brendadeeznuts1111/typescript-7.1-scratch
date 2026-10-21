/**
 * CSV IntelliSense demo — hover `posts` for header-typed rows (all strings).
 *
 * CLI: bun run typecheck:example-csv
 * Run: bun run example:csv
 */
import posts from "./posts.csv";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const expect = <T extends true>() => {};

expect<
  Equal<
    typeof posts,
    readonly {
      readonly slug: string;
      readonly title: string;
      readonly published: string;
    }[]
  >
>();

export function findBySlug(slug: string) {
  return posts.find((row) => row.slug === slug);
}

// @ts-expect-error CSV has no `views` column
posts[0]?.views;

console.log({
  count: posts.length,
  hello: findBySlug("hello")?.title,
  loaders: findBySlug("loaders")?.published,
});
