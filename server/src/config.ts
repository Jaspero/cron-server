export const CONFIG = {
  port: process.env.PORT || 3000,
  mongo: {
    url: process.env.DB_HOST as string
  },
  user: {
    initialAccount: process.env.USER_EMAIL as string,
    initialAccountPassword: process.env.USER_PASSWORD as string,
    secret: process.env.SECRET as string
  },
  startupStrategy: {
    useStartup: JSON.parse(process.env.USE_STARTUP || 'true'),
    /*In minutes*/
    lowerLimit: parseFloat(process.env.LOWER_LIMIT || '10'),
    upperLimit: parseFloat(process.env.UPPER_LIMIT || '60'),
  },
  runnerId: process.env.RUNNER_ID || '1',

  /**
   * When defined jobs with a specific date are pulled
   * in to memory every tickInterval if falsy all jobs
   * are loaded at startup
   */
  tickInterval: (process.env.TICK_INTERVAL || '15 seconds'),
  startTime: Date.now(),
  apiKey: process.env.API_KEY as string
};
