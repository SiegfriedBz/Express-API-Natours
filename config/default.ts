export default {
  port: '',
  appDomainName: '',
  dbUri: '',
  cors: { allowedOrigins: '' },
  bcrypt: { saltWorkFactor: 10 },
  cookies: {
    accessTokenCookieTimeToLive: 1000 * 60 * 15, // 15min
    refreshTokenCookieTimeToLive: 1000 * 60 * 60 * 24 * 365 // 1year
  },
  tokens: {
    accessTokenTimeToLive: '15m',
    refreshTokenTimeToLive: '1y',
    accessTokenPrivateKey: '',
    accessTokenPublicKey: '',
    refreshTokenPrivateKey: '',
    refreshTokenPublicKey: ''
  },
  google: {
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  }
}