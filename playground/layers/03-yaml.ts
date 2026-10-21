import app from "../fixtures/app.yaml";
import multi from "../fixtures/multi.yaml";

import { type Equal, expect } from "../lib/assert.ts";

expect<Equal<typeof app.production, { readonly retries: 3; readonly timeout: 1.5; readonly host: "example.com" }>>();
expect<Equal<typeof app.yes_is_a_string, "yes">>();
expect<
  Equal<
    typeof multi,
    readonly [{ readonly kind: "Service" }, { readonly kind: "Deployment"; readonly replicas: 2 }]
  >
>();

export function layerYaml() {
  return {
    layer: "03-yaml",
    productionHost: app.production.host,
    yesLiteral: app.yes_is_a_string,
    multiKinds: multi.map((doc) => doc.kind),
  };
}
