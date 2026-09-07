import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import ffmpeg from 'ffmpeg-static'

const { values } = parseArgs({
  options: { 'frames-dir': { type: 'string' }, help: { type: 'boolean' } },
})
if (values.help) {
  console.log('Render animated walkthroughs from captured UI frames.\nRequired: --frames-dir <after capture directory>')
  process.exit(0)
}
if (!values['frames-dir'] || !ffmpeg) {
  throw new Error('Provide --frames-dir and install the locked ffmpeg-static dependency.')
}

const directory = resolve(values['frames-dir'])
const workflows = [
  {
    name: 'desktop-session-ordering',
    width: 1152,
    frames: ['desktop-conversation', 'desktop-session-order', 'desktop-attention-order', 'desktop-custom-order'],
  },
  {
    name: 'desktop-document-reading',
    width: 1152,
    frames: ['desktop-expanded-reading', 'desktop-document-outline', 'desktop-markdown-source', 'desktop-markdown-code'],
  },
  {
    name: 'desktop-attention-flow',
    width: 1152,
    frames: ['desktop-conversation', 'desktop-needs-you', 'desktop-attention-question'],
  },
  {
    name: 'phone-reading-flow',
    width: 390,
    frames: ['phone-conversation', 'phone-reading', 'phone-file-question-draft'],
  },
  {
    name: 'phone-attention-flow',
    width: 390,
    frames: ['phone-sessions', 'phone-needs-you', 'phone-attention-question'],
  },
]
const scratch = await mkdtemp(join(directory, '.gif-'))
try {
  for (const workflow of workflows) {
    const images = workflow.frames.map((name) => join(directory, `${name}.png`))
    for (const image of images) {
      if (!(await stat(image)).isFile()) throw new Error(`Missing captured frame: ${image}`)
    }
    const quote = (path: string) => `'${path.replace(/'/g, "'\\''")}'`
    const manifest = join(scratch, `${workflow.name}.txt`)
    await writeFile(manifest, [
      'ffconcat version 1.0',
      ...images.flatMap((image) => [`file ${quote(image)}`, 'duration 3']),
      `file ${quote(images[images.length - 1]!)}`,
    ].join('\n'))
    const output = join(directory, `${workflow.name}.gif`)
    const result = spawnSync(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'concat', '-safe', '0', '-i', manifest,
      '-filter_complex',
      `fps=8,scale=${workflow.width}:-1:flags=lanczos,split[a][b];` +
        '[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
      '-loop', '0', output,
    ], { encoding: 'utf8' })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error(`GIF encoding failed: ${result.stderr}`)
    console.log(`Rendered ${output} (${(await stat(output)).size} bytes)`)
  }
} finally {
  await rm(scratch, { recursive: true, force: true })
}
