import ClickableText from '@renderer/components/ui/clickable-text'
import { trpc } from '@renderer/lib/trpc-link'
import { logger } from '@shared/logger'
import { LucideCog } from 'lucide-react'
import GroupSection from '../components/group-section'
import SettingsInput from '../components/settings-input'
import SettingsToggle from '../components/settings-toggle'

export const meta = {
  title: 'Settings',
  icon: LucideCog,
  index: 10,
  show: true
}
const Icon = meta.icon
export default function SettingsTab() {
  const { mutateAsync: checkUpdate } = trpc.internals.checkUpdate.useMutation()
  return (
    <div className="grid gap-8 p-2 h-full">
      <div className="grid gap-6 pt-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="size-5" />
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SettingsToggle
            name="beta"
            onChange={() => checkUpdate().then(logger.debug.bind(logger))}
          >
            <span>Sign up for Beta releases.</span>
          </SettingsToggle>

          <GroupSection title="Clipboard Monitor">
            <div className="flex flex-col gap-2">
              <SettingsToggle name="features.clipboardMonitor">
                <div className="flex flex-col gap-2">
                  <span>Enable Clipboard Monitor</span>
                  <span className="text-muted-foreground">
                    Automatically adds any link to the request form.
                  </span>
                </div>
              </SettingsToggle>
              <SettingsToggle name="features.clipboardMonitorAutoAdd">
                <div className="flex flex-col gap-2">
                  <span>Automatically add links to queue</span>

                  <span className="text-muted-foreground">
                    Activating this will Automatically start the download in the request form.
                  </span>
                </div>
              </SettingsToggle>
            </div>
          </GroupSection>
          <GroupSection title="Advanced Flags">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <SettingsToggle name="ytdlp.flags.mtime">
                  <div className="flex flex-col gap-2 text-pretty">
                    <span className="font-bold">--no-mtime</span>
                    <span className="text-muted-foreground leading-4 align-middle">
                      The{' '}
                      <code className="text-xs border border-primary/10 rounded p-px bg-input">
                        --no-mtime
                      </code>{' '}
                      flag in yt-dlp is used to prevent the program from setting the modification
                      time of the downloaded file to the original upload time of the video
                    </span>
                  </div>
                </SettingsToggle>
              </div>
              <SettingsInput
                name="ytdlp.flags.custom"
                title={
                  <>
                    Custom arguments, check{' '}
                    <ClickableText asChild>
                      <a
                        href="https://github.com/yt-dlp/yt-dlp"
                        target="_blank"
                        className="cursor-pointer"
                      >
                        yt-dlp docs
                      </a>
                    </ClickableText>{' '}
                    for more info ...
                  </>
                }
              />
            </div>
          </GroupSection>
        </div>
      </div>
    </div>
  )
}
