import { PackageJson, ReleaseType } from './PackageJson'

describe('Version bump', () => {
  test.each([
    ['0.0.0', '0.0.1', 'patch', true],
    ['1.0.0', '1.0.1', 'patch', true],
    ['1.0.0', '1.1.0', 'minor', true],
    ['1.0.0', '2.0.0', 'major', true],
    ['1.0.0', '1.0.1-beta.0', 'patch', false],
    ['1.0.0', '1.1.0-beta.0', 'minor', false],
    ['1.0.0', '2.0.0-beta.0', 'major', false],
    ['1.0.1-beta.0', '1.0.1', 'patch', true],
    ['1.1.0-beta.0', '1.1.0', 'minor', true],
    ['2.0.0-beta.0', '2.0.0', 'major', true],
    ['1.0.1-beta.0', '1.0.1-beta.1', 'prerelease', false],
    ['1.0.1-beta.0', '1.0.1', 'patch', true],
    ['1.0.1-beta.0', '1.1.0', 'minor', true],
    ['1.0.1-beta.0', '2.0.0', 'major', true],
  ] as Array<[string, string, ReleaseType, boolean]>)(
    '%s => %s - %s %s',
    (version, expectedNextVersion, type, stable) => {
      expect(PackageJson.getNextVersion(version, type, stable)).toBe(expectedNextVersion)
    }
  )
})
