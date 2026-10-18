interface FakeVadWindow extends Window {
  __oracleVoiceE2E?: {
    vad?: {
      beginSpeech(): Promise<void>
      pushAudio(samples: number[]): Promise<void>
      endSpeech(): void
      speak(): Promise<void>
      misfire(): void
    }
  }
}

interface FakeVadOptions {
  onFrameProcessed(
    probabilities: { isSpeech: number; notSpeech: number },
    frame: Float32Array,
  ): void
  onSpeechStart(): void
  onSpeechRealStart(): void
  onSpeechEnd(audio: Float32Array): void
  onVADMisfire(): void
}

export const MicVAD = {
  async new(options: FakeVadOptions) {
    const target = window as FakeVadWindow
    const frame = new Float32Array(320).fill(0.25)
    let pushedAudio = false
    const vad = {
      async beginSpeech() {
        pushedAudio = false
        options.onSpeechStart()
        await Promise.resolve()
        options.onSpeechRealStart()
      },
      async pushAudio(samples: number[]) {
        pushedAudio = true
        const input = Float32Array.from(samples)
        for (let offset = 0; offset < input.length; offset += 1_280) {
          options.onFrameProcessed(
            { isSpeech: 0.99, notSpeech: 0.01 },
            input.slice(offset, offset + 1_280),
          )
          await new Promise((resolve) => setTimeout(resolve, 0))
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      },
      endSpeech() {
        if (!pushedAudio) {
          options.onFrameProcessed({ isSpeech: 0.99, notSpeech: 0.01 }, frame)
        }
        options.onSpeechEnd(frame)
      },
      async speak() {
        await this.beginSpeech()
        this.endSpeech()
      },
      misfire() {
        options.onSpeechStart()
        options.onVADMisfire()
      },
    }
    target.__oracleVoiceE2E ??= {}
    target.__oracleVoiceE2E.vad = vad
    return {
      async destroy() {
        if (target.__oracleVoiceE2E?.vad === vad) {
          target.__oracleVoiceE2E.vad = undefined
        }
      },
    }
  },
}
