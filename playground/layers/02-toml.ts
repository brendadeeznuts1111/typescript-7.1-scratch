import config from "../fixtures/config.toml";

import { type Equal, expect } from "../lib/assert.ts";

expect<
  Equal<
    typeof config,
    {
      readonly name: "demo";
      readonly port: 8080;
      readonly ratio: 0.5;
      readonly debug: true;
      readonly tags: readonly ["a", "b"];
      readonly mixed: readonly [1, "two"];
      readonly big: 9007199254740993n;
      readonly started: Date;
      readonly day: "1979-05-27";
      readonly server: { readonly host: "localhost" };
    }
  >
>();

export function layerToml() {
  return {
    layer: "02-toml",
    name: config.name,
    port: config.port,
    big: String(config.big),
    started: config.started.toISOString(),
    day: config.day,
    tags: config.tags.length,
    host: config.server.host,
  };
}
