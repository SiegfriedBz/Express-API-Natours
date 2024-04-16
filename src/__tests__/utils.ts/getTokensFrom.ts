export const getTokensFrom = (headers: { [index: string]: string }) => {
  let accessToken: string = ''
  let refreshToken: string = ''

  const cookies = headers?.['set-cookie'] as unknown as string[] | undefined

  cookies &&
    cookies.forEach((cookie) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [cookieNameAndValue, ...rest] = cookie.split(';')
      const [name, value] = cookieNameAndValue.split('=')

      if (name === 'accessToken') {
        accessToken = value
      }
      if (name === 'refreshToken') {
        refreshToken = value
      }
    })

  return { accessToken, refreshToken }
}
