import chalk from 'chalk';

/**
 * Log a message to the console with a prefix and color.
 */
function log(prefix: string, color: typeof chalk, message: string) {
  // eslint-disable-next-line no-console
  console.log(`${color(prefix + ':')} ${message}`);
}

/**
 * Logger utility.
 */
export const logger = {
  info(message: string) {
    log('info', chalk.bold.cyan, message);
  },
  success(message: string) {
    log('success', chalk.bold.green, message);
  },
  error(message: string | Error) {
    if (message instanceof Error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...stackLines] = message.stack?.split('\n') ?? '';

      // Print error name and message
      log(
        'error',
        chalk.bold.red,
        `${chalk.underline(message.name)}: ${message.message.trim()}`,
      );

      // Print stack
      // eslint-disable-next-line no-console
      console.debug(`\n${chalk.gray(stackLines.join('\n'))}\n`);
    } else {
      log('error', chalk.bold.red, message);
    }
  },
  warn(message: string) {
    log('warn', chalk.bold.yellow, message);
  },
  debug(message: string) {
    log('debug', chalk.bold.gray, message);
  },
  cmd(message: string) {
    log('cmd', chalk.bold.magenta, message);
  },
};
