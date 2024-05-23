import 'dotenv/config'
import config from 'config'

const cloudName = config.get<string>('cloudinary.cloudName')
const apiKey = config.get<string>('cloudinary.apiKey')
const apiSecret = config.get<string>('cloudinary.apiSecret')

const cldConfig = {
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
}

export default cldConfig
