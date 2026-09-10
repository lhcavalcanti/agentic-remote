import type { Parent, Root } from 'mdast'

export function remarkSafeBreaks() {
  return (tree: Root) => {
    function visit(parent: Parent): void {
      parent.children.forEach((node, index) => {
        if (node.type === 'html' && /^<br(?:\/| \/)?>$/i.test(node.value)) {
          parent.children[index] = { type: 'break', position: node.position }
        } else if ('children' in node) {
          visit(node)
        }
      })
    }
    visit(tree)
  }
}
