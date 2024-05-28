import 'dotenv/config'

export default {
  bcrypt: { saltWorkFactor: 10 },
  tokens: {
    accessTokenTimeToLive: '15m',
    refreshTokenTimeToLive: '1y'
  }
}
