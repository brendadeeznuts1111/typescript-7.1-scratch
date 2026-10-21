/**
 * TOML IntelliSense demo — hover `plans` for literal `free` / `pro` shapes.
 *
 * CLI: bun run typecheck:example-toml
 * Run: bun run example:toml
 */
import plans from "./plans.toml";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const expect = <T extends true>() => {};

expect<
  Equal<
    typeof plans,
    {
      readonly free: { readonly price: 0; readonly seats: 1 };
      readonly pro: { readonly price: 12; readonly seats: 10 };
    }
  >
>();

export function planSummary(tier: keyof typeof plans) {
  const p = plans[tier];
  return `${tier}: $${p.price}/mo, ${p.seats} seat(s)`;
}

// @ts-expect-error pro price is literal 12, not 0
const wrong: 0 = plans.pro.price;

console.log({
  free: planSummary("free"),
  pro: planSummary("pro"),
});
