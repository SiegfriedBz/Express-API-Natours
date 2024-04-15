import * as process from 'process'

const ENV = process.env.NODE_ENV

const MONGO_URL = `MONGO_${ENV?.toUpperCase() || 'DEVELOPMENT'}_DB_URL`

export default {
  port: 'PORT',
  appDomainName: 'APP_DOMAIN_NAME',
  dbUri: MONGO_URL,
  cors: { allowedOrigins: 'CORS_ALLOWED_ORIGINS' },
  tokens: {
    accessTokenPrivateKey: 'ACCESS_TOKEN_PRIVATE_KEY',
    accessTokenPublicKey: 'ACCESS_TOKEN_PUBLIC_KEY',
    refreshTokenPrivateKey: 'REFRESH_TOKEN_PRIVATE_KEY',
    refreshTokenPublicKey: 'REFRESH_TOKEN_PUBLIC_KEY'
  },
  google: {
    clientId: 'GOOGLE_CLIENT_ID',
    clientSecret: 'GOOGLE_CLIENT_SECRET',
    redirectUri: 'GOOGLE_OAUTH_REDIRECT_URI'
  }
}
