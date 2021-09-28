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
    useStartup: process.env.USE_STARTUP || true,
    /*In minutes*/
    lowerLimit: parseFloat(process.env.LOWER_LIMIT || '10'),
    upperLimit: parseFloat(process.env.UPPER_LIMIT || '60'),
  },
  apiKey: process.env.API_KEY as string,
  runnerId: process.env.RUNNER_ID as string
};
