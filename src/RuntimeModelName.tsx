import { modelFamily } from '../shared/model-family'
import { ModelFamilyIcon } from './ModelFamilyIcon'

export function RuntimeModelName({ modelId }: { modelId: string }) {
  return (
    <span className="composer-runtime-model">
      <ModelFamilyIcon family={modelFamily(modelId)} />
      {modelId}
    </span>
  )
}
