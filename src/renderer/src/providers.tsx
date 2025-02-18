import { ThemeProvider } from '@renderer/components/app/theme-provider'
import { Toaster } from '@renderer/components/ui/sonner'
import { client, trpc } from '@renderer/lib/trpc-link'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { PropsWithChildren, Suspense, useState } from 'react'
import SuspenseLoader from './components/ui/suspense-loader'
import { AppContextProvider } from './pages/components/app-context'
import { YTDLContextProvider } from './pages/components/ytdl-context'
import YTLDPObserver from './pages/components/ytdlp-worker'
export default function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => client)
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableColorScheme
        disableTransitionOnChange
        enableSystem
      >
        <Suspense fallback={<SuspenseLoader />}>
          <trpc.Provider client={trpcClient} queryClient={queryClient as any}>
            <QueryClientProvider client={queryClient}>
              <AppContextProvider value={{ selected: null } as any}>
                <YTDLContextProvider value={{} as any}>
                  <JotaiProvider>
                    {children}
                    <YTLDPObserver />
                  </JotaiProvider>
                </YTDLContextProvider>
              </AppContextProvider>
            </QueryClientProvider>
          </trpc.Provider>
        </Suspense>
        <Toaster />
      </ThemeProvider>
    </>
  )
}
