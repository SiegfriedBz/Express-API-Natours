export const CORRECT_PASSWORD = '123456'

export const inputFixtureUserAs = (as: 'user' | 'admin') => {
  const id = crypto.randomUUID()

  return {
    name: `I am a ${as}`,
    email: `${as}-${id}@example.com`,
    role: as,
    password: CORRECT_PASSWORD,
    passwordConfirmation: CORRECT_PASSWORD
  }
}
