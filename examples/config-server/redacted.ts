/** Value redacted everywhere Bun.inspect / console.log walks the object graph. */
export class Redacted {
  constructor(readonly value: string) {}

  [Bun.inspect.custom]() {
    return "<redacted>";
  }
}
