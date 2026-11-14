import { modelFamily } from '../shared/model-family'
import { ModelFamilyIcon } from './ModelFamilyIcon'
import { usePreviewFeature } from './preview-features'

export function RuntimeModelName({ modelId }: { modelId: string }) {
  const showFamily = usePreviewFeature('composerRefresh')
  return (
    <span className={showFamily ? 'composer-runtime-model' : undefined}>
      {showFamily ? <ModelFamilyIcon family={modelFamily(modelId)} /> : null}
      {modelId}
    </span>
  )
}
