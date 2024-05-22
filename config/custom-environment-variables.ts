import * as process from 'process'

const ENV = process.env.NODE_ENV

const MONGO_URL = `MONGO_${ENV?.toUpperCase() || 'DEVELOPMENT'}_DB_URL`

export default {
  port: 'PORT',
  serverDomainName: 'SERVER_DOMAIN_NAME',
  dbUri: MONGO_URL,
  cors: { allowedOrigins: 'CORS_ALLOWED_ORIGINS' },
  email: {
    from: 'EMAIL_FROM',
    brevo: {
      emailAdmin: 'BREVO_EMAIL_ADMIN',
      emailSmtpKey: 'BREVO_EMAIL_SMTP_KEY'
    },
    mailtrap: {
      emailHost: 'MAILTRAP_EMAIL_HOST',
      emailPort: 'MAILTRAP_EMAIL_PORT',
      emailUsername: 'MAILTRAP_EMAIL_USERNAME',
      emailPassword: 'MAILTRAP_EMAIL_PASSWORD'
    }
  },
  stripe: {
    stripePrivateKey: 'STRIPE_PRIVATE_KEY',
    stripePublicKey: 'STRIPE_PUBLIC_KEY',
    stripeWebhookEndpointSecret: 'STRIPE_WEBHOOK_ENDPOINT_SECRET'
  },
  tokens: {
    passwordResetToken: {
      expiresIn: 'PASSWORD_RESET_TOKEN_EXPIRES_IN'
    },
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
