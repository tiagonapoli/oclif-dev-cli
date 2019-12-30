import {Command, flags} from '@oclif/command'
import * as qq from 'qqjs'

import aws from '../../aws'
import {log} from '../../log'
import * as Tarballs from '../../tarballs'

export default class PublishDeb extends Command {
  static description = 'publish deb package built with pack:deb'

  static flags = {
    root: flags.string({char: 'r', description: 'path to oclif CLI root', default: '.', required: true}),
  }

  async run() {
    const {flags} = this.parse(PublishDeb)
    const buildConfig = await Tarballs.buildConfig(flags.root)
    const {s3Config, version, config} = buildConfig
    const dist = (f: string) => buildConfig.dist(qq.join('deb', f))
    if (!await qq.exists(dist('Release'))) this.error('run "oclif-dev pack:deb" before publishing')
    const S3Options = {
      Bucket: s3Config.bucket!,
      ACL: s3Config.acl || 'public-read',
    }

    const remoteBase = buildConfig.channel === 'stable' ? 'apt' : `channels/${buildConfig.channel}/apt`
    const upload = (file: string) => {
      return aws.s3.uploadFile(dist(file), {...S3Options, CacheControl: 'max-age=86400', Key: [remoteBase, file].join('/')})
    }
    const debVersion = `${buildConfig.version.split('-')[0]}-1`
    const uploadDeb = async (arch: 'amd64' | 'i386') => {
      const deb = `${config.bin}_${debVersion}_${arch}.deb`
      if (await qq.exists(dist(deb))) await upload(deb)
    }
    await uploadDeb('amd64')
    await uploadDeb('i386')
    await upload('Packages.gz')
    await upload('Packages.xz')
    await upload('Packages.bz2')
    await upload('Release')
    if (await qq.exists(dist('InRelease'))) await upload('InRelease')
    if (await qq.exists(dist('Release.gpg'))) await upload('Release.gpg')

    log(`published deb ${version}`)
  }
}
