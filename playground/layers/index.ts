import { layerBunImportAttributes } from "./08-bun-import-attributes.ts";
import { layerEnvText } from "./06-env-text.ts";
import { layerJsonFamily } from "./04-json-family.ts";
import { layerMarkdown } from "./01-markdown.ts";
import { layerStack } from "./00-stack.ts";
import { layerTabular } from "./05-tabular.ts";
import { layerToml } from "./02-toml.ts";
import { layerTypeGuards } from "./07-type-guards.ts";
import { layerYaml } from "./03-yaml.ts";

export const layers = [
  layerStack,
  layerMarkdown,
  layerToml,
  layerYaml,
  layerJsonFamily,
  layerTabular,
  layerEnvText,
  layerTypeGuards,
  layerBunImportAttributes,
] as const;

export function runAllLayers() {
  return layers.map((run) => run());
}
