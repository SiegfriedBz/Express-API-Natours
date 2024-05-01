export default {
  cors: {
    allowedOrigins: 'http://localhost:3000'
  },

  bcrypt: { saltWorkFactor: 10 },
  // cookies: {
  //   accessTokenCookieTimeToLive: 1000 * 60 * 15, // 15min
  //   refreshTokenCookieTimeToLive: 1000 * 60 * 60 * 24 * 365 // 1year
  // },,

  tokens: {
    accessTokenTimeToLive: '15m',
    refreshTokenTimeToLive: '1y'
  }
}
