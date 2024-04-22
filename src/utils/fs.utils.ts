import fs from 'fs'
import path from 'path'

export const readFilePromise = (filePath: string) => {
  return new Promise<string>((resolve, reject) => {
    const pathToFile = path.resolve(__dirname, `../../${filePath}`)
    fs.readFile(pathToFile, 'utf-8', (error, data) => {
      if (error) reject(error)

      resolve(data)
    })
  })
}

export const writeFilePromise = (filePath: string, data: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(`${__dirname}/${filePath}`, data, 'utf-8', (error) => {
      if (error) reject(error)

      resolve()
    })
  })
}

module.exports = { readFilePromise, writeFilePromise }
