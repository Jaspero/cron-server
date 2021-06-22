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
  runnerId: process.env.RUNNER_ID as string
};
