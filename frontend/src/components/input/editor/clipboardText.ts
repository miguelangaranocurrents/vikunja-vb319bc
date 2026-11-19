import type {Fragment, Node as ProseMirrorNode} from '@tiptap/pm/model'

function serializeList(list: ProseMirrorNode, indent: string): string {
	const ordered = list.type.name === 'orderedList'
	const start = Number(list.attrs.start ?? 1)
	const lines: string[] = []

	list.forEach((item, _offset, index) => {
		const marker = ordered ? `${start + index}. ` : '- '
		const itemLines: string[] = []
		item.forEach(child => {
			if (child.type.name === 'bulletList' || child.type.name === 'orderedList') {
				itemLines.push(serializeList(child, indent + '  '))
			} else {
				itemLines.push(child.textBetween(0, child.content.size, '\n', leaf => leaf.isBlock ? '\n' : ''))
			}
		})
		const [first = '', ...rest] = itemLines
		lines.push(`${indent}${marker}${first}`)
		rest.forEach(line => lines.push(line.startsWith(indent + '  ') ? line : `${indent}  ${line}`))
	})

	return lines.join('\n')
}

/**
 * Serializes a slice to plain text while keeping list markers, which
 * ProseMirror's default text serializer drops.
 */
export function serializeSliceAsText(content: Fragment): string {
	const blocks: string[] = []
	content.forEach(node => {
		if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
			blocks.push(serializeList(node, ''))
		} else {
			blocks.push(node.textBetween(0, node.content.size, '\n', leaf => leaf.isBlock ? '\n' : ''))
		}
	})
	return blocks.join('\n\n')
}
