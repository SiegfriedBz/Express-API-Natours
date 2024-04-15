// Expected by SERVICE createUser
const userInputFixture = () => {
  return {
    name: 'Jess',
    email: `jess-${crypto.randomUUID()}@example.com`,
    password: '123456'
  }
}

export default userInputFixture
