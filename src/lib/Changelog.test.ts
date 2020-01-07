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

test('Get most recent version', async () => {
  const ch = await Changelog.getChangelog(join(mocksPath, 'changelog.md'))
  expect(ch.getMostRecentVersion()).toEqual('0.1.0')
})

describe('Unreleased content operations', () => {
  test.each([
    ['changelog.md', 250, 338],
    ['changelog2.md', 0, 19],
    ['changelog3.md', 0, 19],
  ])('Get unreleased positions: %s - %s', async (changelogName, expectedIni, expectedEnd) => {
    const ch = await Changelog.getChangelog(join(mocksPath, changelogName))
    const { ini, end } = ch.getUnreleasedPositions()
    expect(ini).toBe(expectedIni)
    expect(end).toBe(expectedEnd)
  })

  test.each([['changelog.md'], ['changelog2.md'], ['changelog3.md']])(
    'Get content after new release: %s',
    async changelogName => {
      const ch = await Changelog.getChangelog(join(mocksPath, changelogName))
      const date = new Date('May 11,2014')
      expect(ch.getContentAfterNewRelease('1.0.0', date)).toMatchSnapshot()
    }
  )
})
