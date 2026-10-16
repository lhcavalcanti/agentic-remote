declare module 'sherpa-onnx-node' {
  export interface OnlineStream {
    acceptWaveform(input: {
      samples: Float32Array
      sampleRate: number
    }): void
    inputFinished(): void
    setOption(key: string, value: string): void
  }

  export interface OnlineRecognizerConfig {
    featConfig: {
      sampleRate: number
      featureDim: number
    }
    modelConfig: {
      transducer: {
        encoder: string
        decoder: string
        joiner: string
      }
      tokens: string
      numThreads: number
      provider: string
      debug: number
    }
    decodingMethod?: string
    maxActivePaths?: number
    enableEndpoint: boolean
    rule1MinTrailingSilence: number
    rule2MinTrailingSilence: number
    rule3MinUtteranceLength: number
  }

  export class OnlineRecognizer {
    constructor(config: OnlineRecognizerConfig)
    createStream(): OnlineStream
    isReady(stream: OnlineStream): boolean
    decode(stream: OnlineStream): void
    isEndpoint(stream: OnlineStream): boolean
    getResult(stream: OnlineStream): { text: string }
    reset(stream: OnlineStream): void
  }
}
