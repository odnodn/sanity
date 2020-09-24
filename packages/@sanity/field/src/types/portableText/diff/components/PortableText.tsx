import React, {useMemo} from 'react'
import {flatten, uniq} from 'lodash'
import {PortableTextBlock, PortableTextChild, PortableTextDiff, StringSegment} from '../types'
import {
  ANNOTATION_SYMBOLS,
  createChildMap,
  findMarksDiff,
  getChildSchemaType,
  getDecorators,
  getInlineObjects,
  INLINE_SYMBOLS,
  isDecorator,
  MARK_SYMBOLS
} from '../helpers'

import {ArrayDiff, DiffCard, ObjectDiff} from '../../../../diff'
import {ObjectSchemaType, SchemaType} from '../../../../types'

import Block from './Block'
import Annotation from './Annotation'
import Decorator from './Decorator'
import {InlineObject} from './InlineObject'

const markSymbolsFlattened = flatten(MARK_SYMBOLS)
const markSymbolsStart = MARK_SYMBOLS.map(set => set[0])
const markSymbolsEnd = MARK_SYMBOLS.map(set => set[1])
const annotationSymbolsStart = ANNOTATION_SYMBOLS.map(set => set[0])
const annotationSymbolsEnd = ANNOTATION_SYMBOLS.map(set => set[1])

type Props = {
  diff: PortableTextDiff
  schemaType: ObjectSchemaType
}

export default function PortableText(props: Props): JSX.Element {
  const {diff, schemaType} = props
  const childMap = useMemo(() => createChildMap(diff.origin, schemaType), [diff, schemaType])
  const block = diff.displayValue

  const inlineObjects = diff.origin.toValue
    ? getInlineObjects(diff.origin.toValue as PortableTextBlock)
    : []

  const renderChild = (child: PortableTextChild) => {
    const spanSchemaType = getChildSchemaType(schemaType.fields, child)
    let decoratorTypes: {title: string; value: string}[] = []
    if (spanSchemaType) {
      decoratorTypes = getDecorators(spanSchemaType)
      const childrenDiff = diff.fields.children as ArrayDiff
      const segments =
        (childrenDiff.items[0].diff &&
          childrenDiff.items[0].diff.type === 'object' &&
          childrenDiff.items[0].diff.fields.text.type === 'string' &&
          childrenDiff.items[0].diff.fields.text.segments) ||
        []
      const returnedChildren: any[] = []
      let activeMarks: string[] = []
      let removedMarks: string[] = []

      // TODO: clean up this complexity!
      segments.forEach(seg => {
        const isInline = INLINE_SYMBOLS.includes(seg.text)
        const isMarkStart =
          markSymbolsStart.includes(seg.text) || annotationSymbolsStart.includes(seg.text)
        const isMarkEnd =
          markSymbolsEnd.includes(seg.text) || annotationSymbolsEnd.includes(seg.text)
        if (isMarkStart) {
          const mark = markSymbolsFlattened.includes(seg.text[0])
            ? decoratorTypes[markSymbolsStart.indexOf(seg.text[0])]?.value
            : diff.toValue &&
              diff.toValue.markDefs[annotationSymbolsStart.indexOf(seg.text[0])]?._key
          if (seg.action === 'removed') {
            removedMarks.push(mark)
          } else {
            activeMarks.push(mark)
          }
        } else if (isMarkEnd) {
          if (seg.action === 'removed') {
            removedMarks = removedMarks.slice(0, -1)
          } else {
            activeMarks = activeMarks.slice(0, -1)
          }
        } else if (isInline) {
          const indexOfSymbol = INLINE_SYMBOLS.findIndex(sym => sym === seg.text)
          const key = inlineObjects[indexOfSymbol]?._key
          const originChild = (diff.origin.toValue || diff.origin.fromValue).children.find(
            cld => cld._key === key
          ) as PortableTextChild
          if (key) {
            const objectDiff = childMap[key]?.diff as ObjectDiff
            const objectSchemaType = childMap[key]?.schemaType as ObjectSchemaType
            if (!objectSchemaType) {
              throw new Error('Schema type required')
            }
            returnedChildren.push(
              <InlineObject
                key={`inline-object-${child._key}`}
                object={originChild}
                diff={objectDiff}
                schemaType={objectSchemaType}
              />
            )
          }
        } else if (seg.action === 'unchanged') {
          returnedChildren.push(
            renderWithMarks(diff.origin, activeMarks, removedMarks, seg.text, spanSchemaType)
          )
        } else if (seg.action === 'removed') {
          const textDiffAnnotation = findTextAnnotationFromSegment(diff, seg)
          returnedChildren.push(
            <DiffCard
              annotation={textDiffAnnotation || seg.annotation}
              as="del"
              tooltip={{description: 'Removed text'}}
            >
              {renderWithMarks(diff.origin, activeMarks, removedMarks, seg.text, spanSchemaType)}
            </DiffCard>
          )
        } else if (seg.action === 'added') {
          const textDiffAnnotation = findTextAnnotationFromSegment(diff, seg)
          returnedChildren.push(
            <DiffCard
              annotation={textDiffAnnotation || seg.annotation}
              as="ins"
              tooltip={{description: 'Added text'}}
            >
              {renderWithMarks(diff.origin, activeMarks, removedMarks, seg.text, spanSchemaType)}
            </DiffCard>
          )
        }
      })
      return React.createElement('div', {key: block._key}, ...returnedChildren)
    }
    throw new Error("'span' schemaType not found")
  }

  return (
    <Block block={block} diff={diff}>
      {(diff.displayValue.children || []).map(child => renderChild(child))}
    </Block>
  )
}

function findTextAnnotationFromSegment(diff: ObjectDiff, segment: StringSegment) {
  const childrenDiff = diff.fields.children as ArrayDiff
  const childItem = childrenDiff.items.find(
    item =>
      item.diff.isChanged &&
      item.diff.type === 'object' &&
      item.diff.fields.text &&
      item.diff.fields.text.type === 'string' &&
      item.diff.fields.text.action !== 'unchanged' &&
      item.diff.fields.text.segments.find(seg => seg.text === segment.text)
  )
  if (
    childItem &&
    childItem.diff.type === 'object' &&
    childItem.diff.fields.text &&
    childItem.diff.fields.text.action !== 'unchanged'
  ) {
    return childItem.diff.fields.text.annotation
  }
  return undefined
}

function renderWithMarks(
  diff: ObjectDiff,
  activeMarks: string[],
  removedMarks: string[],
  text: string,
  spanSchemaType: SchemaType
): JSX.Element {
  if (text === '\n') {
    return <br />
  }
  let returned = <>{text}</>
  const allMarks = uniq([...activeMarks, ...removedMarks])
  if (allMarks.length) {
    allMarks.forEach(mark => {
      if (isDecorator(mark, spanSchemaType)) {
        const marksDiff = findMarksDiff(diff, mark, text)
        returned = (
          <Decorator diff={marksDiff} mark={mark} text={text}>
            {returned}
          </Decorator>
        )
      } else {
        const annotationDiff =
          ((diff.fields.markDefs &&
            diff.fields.markDefs.isChanged &&
            diff.fields.markDefs.type === 'array' &&
            diff.fields.markDefs.items.find(
              item =>
                item.diff &&
                item.diff.type === 'object' &&
                item.diff.toValue &&
                item.diff.toValue._key &&
                item.diff.toValue._key === mark
            )?.diff) as ObjectDiff) || undefined
        returned = <Annotation diff={annotationDiff}>{returned}</Annotation>
      }
    })
  }
  return returned
}