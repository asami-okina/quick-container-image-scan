import { createSafeActionClient } from "next-safe-action";
import { BusinessError } from "./error";
class SessionExpiredError extends Error {
  constructor() {
    super();
  }
}

export const actionClient = createSafeActionClient({
  handleServerError: (e: Error) => {
    if (e instanceof BusinessError) {
      return {
        serverError: e.message,
      };
    }
    return {
      serverError: `Something went wrong while executing the operation: ${e.message}`,
    };
  },
});
