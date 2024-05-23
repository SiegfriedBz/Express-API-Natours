export default {
  cors: {
    allowedOrigins: 'http://localhost:3000'
  },

  bcrypt: { saltWorkFactor: 10 },
  tokens: {
    accessTokenTimeToLive: '15m',
    refreshTokenTimeToLive: '1y'
  },
  cloudinary: {
    cloudName: 'CLOUDINARY_CLOUD_NAME',
    apiKey: 'CLOUDINARY_API_KEY',
    apiSecret: 'CLOUDINARY_API_SECRET'
  }
}
