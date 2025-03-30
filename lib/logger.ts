type LogLevel = "info" | "error" | "warn" | "debug";

class Logger {
  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args
      .map((arg) => {
        if (arg instanceof Error) {
          return arg.stack || arg.message;
        }
        return JSON.stringify(arg, null, 2);
      })
      .join(" ");

    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${formattedArgs}`;
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage("info", message, ...args));
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage("error", message, ...args));
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage("warn", message, ...args));
  }

  debug(message: string, ...args: unknown[]): void {
    console.debug(this.formatMessage("debug", message, ...args));
  }
}

export const logger = new Logger();
