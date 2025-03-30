export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}
