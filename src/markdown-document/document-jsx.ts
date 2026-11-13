import type { Root } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import type { Components as JsxComponents } from 'hast-util-to-jsx-runtime'
import { Fragment } from 'react'
import type { ReactElement } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import type { Components } from 'react-markdown'

/** Turns a rendered document tree into elements with ReactMarkdown's own options. */
export function documentJsx(tree: Root, components?: Components): ReactElement {
  return toJsxRuntime(tree, {
    Fragment,
    components: components as JsxComponents | undefined,
    ignoreInvalidStyle: true,
    jsx,
    jsxs,
    passKeys: true,
    passNode: true,
  })
}
