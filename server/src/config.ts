export const CONFIG = {
  port: process.env.PORT || 3000,
  mongo: {
    url: process.env.DB_HOST as string
  },
  user: {
    initialAccount: process.env.USER_EMAIL as string,
    secret: process.env.SECRET as string
  }
};
