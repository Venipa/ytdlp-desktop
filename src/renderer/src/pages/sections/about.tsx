import { Button } from '@renderer/components/ui/button'
import ClickableText from '@renderer/components/ui/clickable-text'
import { QTooltip } from '@renderer/components/ui/tooltip'
import { trpc } from '@renderer/lib/trpc-link'
import config, { NodeEnv } from '@shared/config'
import { formatDistanceToNow, isValid } from 'date-fns'
import { DotIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import Logo from '../../components/app/logo'

export const meta = {
  title: 'About',
  index: 99
}
export default function AboutTab() {
  const lastCommitDate = useMemo(
    () =>
      !config.git?.committer?.date ||
      !isValid(new Date((config.git?.committer?.date as any) * 1000)) ||
      formatDistanceToNow((config.git?.committer?.date as any) * 1000, { addSuffix: true }),
    []
  )
  const buildInfo = useMemo(
    () =>
      `v${config.appInfo.version} ${config.git.shortHash ? `#${config.git.shortHash}` : ''} (${NodeEnv})`,
    []
  )
  const { mutateAsync: checkForUpdates } = trpc.internals.checkUpdate.useMutation()
  const { mutateAsync: downloadUpdate } = trpc.internals.downloadUpdate.useMutation()
  const { mutateAsync: quitAndInstallUpdate } = trpc.internals.quitAndInstallUpdate.useMutation()
  const [checking, setChecking] = useState(false)
  const handleUpdatePromise = async () => {
    setChecking(true)
    try {
      const id = toast.loading('Checking for updates...', { duration: 0 })
      const updateData = await checkForUpdates()
      if (!updateData) toast.success('You are on the latest version 🙂', { id })
      else {
        const updateNow = await new Promise<boolean>((resolve) => {
          toast.info('A new version has been found', {
            action: (
              <div className="flex gap-1">
                <Button className="h-6 px-1" onClick={() => resolve(true)}>
                  Update Now
                </Button>
                <Button className="h-6 px-1" onClick={() => resolve(false)}>
                  Later
                </Button>
              </div>
            ),
            duration: 0,
            id
          })
        })
        if (updateNow) {
          toast.loading('Downloading update...', {
            id,
            dismissible: false,
            duration: 0
          })
          await downloadUpdate().then(() => {
            toast.success('Update downloaded...', { description: 'Awaiting installation.', id })
          })
          await quitAndInstallUpdate()
        } else {
          toast.info('Update postponed.', { id, duration: 5000 })
        }
      }
    } finally {
      setChecking(false)
    }
  }
  return (
    <div className="p-2 pt-16 flex flex-col space-y-4">
      <div className="flex items-center space-x-6 group">
        <QTooltip content="Open website" asChild>
          <a
            href="https://ytdlpd.venipa.net"
            target="_blank"
            rel="noopener"
            className="flex-shrink-0"
          >
            <Logo className="size-12 group-hover:opacity-100 opacity-80" />
          </a>
        </QTooltip>
        <div className="flex flex-col">
          <div>About {config.title}</div>
          <div className="text-xs pt-0.5 whitespace-nowrap text-muted-foreground flex items-center flex-wrap gap-x-2">
            <ClickableText
              onClick={() =>
                buildInfo &&
                navigator.clipboard.writeText(buildInfo).then(() => toast('Copied build info'))
              }
            >
              {buildInfo}
            </ClickableText>
            {!checking && (
              <>
                <DotIcon className="size-4 -mx-2" />
                <ClickableText onClick={handleUpdatePromise}>Check for updates</ClickableText>
              </>
            )}
            {lastCommitDate && (
              <>
                <DotIcon className="size-4 -mx-2" />
                <span>{lastCommitDate}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
