import aider from '@/assets/tool-logos/aider.png'
import claudeCode from '@/assets/tool-logos/claude-code.svg'
import claudeDesktop from '@/assets/tool-logos/claude-desktop.svg'
import codex from '@/assets/tool-logos/codex.svg'
import dsh from '@/assets/tool-logos/dsh.svg'
import geminiCli from '@/assets/tool-logos/gemini-cli.svg'
import grokBuild from '@/assets/tool-logos/grok-build.svg'
import hermes from '@/assets/tool-logos/hermes.svg'
import kimiCli from '@/assets/tool-logos/kimi-cli.svg'
import minimaxCode from '@/assets/tool-logos/minimax-code.svg'
import openclaw from '@/assets/tool-logos/openclaw.svg'
import opencode from '@/assets/tool-logos/opencode.svg'
import pi from '@/assets/tool-logos/pi.svg'
import qwenCode from '@/assets/tool-logos/qwen-code.svg'
import { cn } from '@/lib/utils'

/**
 * Published product marks. Colored files are the Lobe Icons SVGs unchanged.
 * Single-color files are the same paths with a solid fill so a CSS mask can
 * follow the surrounding text color. Kimi's color file is white ink, so it
 * sits on a black tile. Sources are recorded in THIRD_PARTY_NOTICES.md.
 */
const COLOR_MARKS: Record<string, string> = {
  'claude-code': claudeCode,
  'claude-desktop': claudeDesktop,
  codex,
  'gemini-cli': geminiCli,
  openclaw,
  'minimax-code': minimaxCode,
  dsh,
  'qwen-code': qwenCode,
}

const MONO_MARKS: Record<string, string> = {
  'grok-build': grokBuild,
  opencode,
  hermes,
  pi,
}

export type ToolMark =
  | { kind: 'image'; src: string }
  | { kind: 'mask'; src: string }
  | { kind: 'letter'; letter: string }

/** Source used when a poster must paint the same mark as `ToolLogo`. */
export function toolMark(toolId: string): ToolMark {
  if (toolId === 'kimi-cli' || toolId === 'aider') {
    return {
      kind: 'image',
      src: toolId === 'kimi-cli' ? kimiCli : aider,
    }
  }
  const color = COLOR_MARKS[toolId]
  if (color) return { kind: 'image', src: color }
  const mono = MONO_MARKS[toolId]
  if (mono) return { kind: 'mask', src: mono }
  const letter = (toolId.replace(/[^a-z0-9]/gi, '')[0] ?? '?').toUpperCase()
  return { kind: 'letter', letter }
}

export function ToolLogo({
  toolId,
  className,
}: {
  toolId: string
  className?: string
}) {
  if (toolId === 'kimi-cli') {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-black',
          className
        )}
      >
        <img
          src={kimiCli}
          alt=""
          draggable={false}
          className="size-[88%] object-contain"
        />
      </span>
    )
  }

  if (toolId === 'aider') {
    return (
      <img
        src={aider}
        alt=""
        draggable={false}
        className={cn('size-4 shrink-0 rounded-[4px] object-cover', className)}
      />
    )
  }

  const color = COLOR_MARKS[toolId]
  if (color) {
    return (
      <img
        src={color}
        alt=""
        draggable={false}
        className={cn('size-4 shrink-0 object-contain', className)}
      />
    )
  }

  const mono = MONO_MARKS[toolId]
  if (mono) {
    return (
      <span
        aria-hidden="true"
        className={cn('inline-block size-4 shrink-0 bg-current', className)}
        style={{
          maskImage: `url("${mono}")`,
          WebkitMaskImage: `url("${mono}")`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
        }}
      />
    )
  }

  const letter = (toolId.replace(/[^a-z0-9]/gi, '')[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid size-4 shrink-0 place-items-center rounded-[4px] bg-muted text-[10px] font-medium text-muted-foreground',
        className
      )}
    >
      {letter}
    </span>
  )
}
