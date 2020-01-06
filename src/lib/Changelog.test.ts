import { join } from 'path'
import { Changelog } from './Changelog'

const mocksPath = join(__dirname, '__mocks__')

describe('Get version changes', () => {
  test.each([['0.0.1'], ['0.1.0-beta.0'], ['0.1.0']])('Version %s', async version => {
    const ch = await Changelog.getChangelog(join(mocksPath, 'changelog.md'))
    expect(ch.getVersionContent(version).split('\n')).toMatchSnapshot()
  })

  test(`Throws error when version doesn't exist`, async () => {
    const ch = await Changelog.getChangelog(join(mocksPath, 'changelog.md'))
    expect(() => ch.getVersionContent('0.0.0')).toThrow('Version 0.0.0 not found')
  })
})
