'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

import { cn } from '@renderer/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const QTooltip = React.forwardRef<
  React.ElementRef<typeof Tooltip>,
  React.ComponentPropsWithoutRef<typeof TooltipContent> &
    React.PropsWithChildren<{ content: string | React.ReactNode }>
>(({ className, children, content, asChild, ...props }, ref) => {
  return (
    <Tooltip delayDuration={350} {...props}>
      <TooltipTrigger disabled={!content} asChild={asChild} className='cursor-auto'>
        {children}
      </TooltipTrigger>
      <TooltipContent align="center" sideOffset={4} updatePositionStrategy="optimized" ref={ref} className='bg-white dark:bg-background-2 border border-muted dark:border-muted/60 shadow-md p-2.5 text-primary'>
        {typeof content === 'string' ? <div>{content}</div> : content}
      </TooltipContent>
    </Tooltip>
  )
})

export { QTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
