import { platform as appPlatform } from '@electron-toolkit/utils'
import { appStore } from '@main/stores/app.store'
import { Endpoints } from '@octokit/types'
import { Logger } from '@shared/logger'
import { nt as calvNewerThan } from 'calver'
import { app } from 'electron'
import { platform } from 'os'
import path from 'path'
import YTDLWrapper from 'yt-dlp-wrap'
const YTDLP_PLATFORM = platform()
const ytdlpPath = app.getPath('userData')
const log = new Logger('YTDLP')
type GithubRelease = Endpoints['GET /repos/{owner}/{repo}/releases']['response']['data'][0]
enum YTDLP_STATE {
  NONE,
  READY,
  CONVERTING,
  DOWNLOADING,
  UPDATE_CHECKING,
  UPDATE_ERROR,
  ERROR
}
export class YTDLP {
  private _state: YTDLP_STATE = YTDLP_STATE.NONE
  private _ytd: YTDLWrapper = new YTDLWrapper();
  get state() {
    return this._state
  }
  constructor() {}
  async initialize() {
    log.info("initializing...")
    const ytdVersion = await this._ytd.getVersion()
    log.debug({ ytdVersion })
    await this.checkUpdates()
  }
  async checkUpdates(forceLatestUpdate?: boolean) {
    this._state = YTDLP_STATE.UPDATE_CHECKING
    const currentYtdlp = appStore.get('ytdlp')
    log.info("checking for ytdlp updates...")
    const latestRelease =
      ((forceLatestUpdate || currentYtdlp.checkForUpdate) &&
        (await YTDLWrapper.getGithubReleases(1, 1).then(([grelease]: [GithubRelease]) => {
          return {
            ...grelease,
            version: grelease.tag_name.replace(/^yt-dlp /, '')
          }
        }))) ||
      null
    log.debug('ytdlp version compare...', {
      latest: latestRelease?.version ?? '-',
      current: currentYtdlp.version,
      config: currentYtdlp
    })
    if (
      latestRelease &&
      (forceLatestUpdate ||
        !currentYtdlp?.version ||
        !calvNewerThan(currentYtdlp.version, latestRelease.version))
    ) {
      log.debug('found new version of ytdlp, trying to download...', {
        tag_name: latestRelease.tag_name,
        version: latestRelease.version
      })
      await this.downloadUpdate(latestRelease)
        .then(({ path, version }) => {
          appStore.set('ytdlp', { path, version, checkForUpdate: true })
        })
        .catch((err) => {
          log.error('failed to download update...\n', err)
        })
    }
    if (appStore.store.ytdlp?.path)
      this.ytdlp.setBinaryPath(appStore.store.ytdlp.path)
    this._state = YTDLP_STATE.READY
  }
  private async downloadUpdate(
    release: GithubRelease & { version: string }
  ): Promise<{ version: string; path: string }> {
    const newYtdlPath = path.join(ytdlpPath, appPlatform.isWindows ? 'ytdlp.exe' : 'ytdlp')
    await YTDLWrapper.downloadFromGithub(
      path.join(ytdlpPath, appPlatform.isWindows ? 'ytdlp.exe' : 'ytdlp'),
      release.version,
      YTDLP_PLATFORM
    )
    return { version: release.version, path: newYtdlPath }
  }
  get ytdlp() {
    return this._ytd
  }
  get currentDownloadPath() {
    return appStore.store.download?.selected
  }
}
