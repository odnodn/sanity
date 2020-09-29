/* eslint-disable complexity */
import React from 'react'
import {ArraySchemaType, isValidationMarker, Marker, Path, SchemaType} from '@sanity/types'
import {ChangeIndicatorScope} from '@sanity/base/lib/change-indicators'
import {ContextProvidedChangeIndicator} from '@sanity/base/lib/change-indicators/ChangeIndicator'
import LinkIcon from 'part:@sanity/base/link-icon'
import {FormFieldPresence, FieldPresence, PresenceOverlay} from '@sanity/base/presence'
import Button from 'part:@sanity/components/buttons/default'
import IntentButton from 'part:@sanity/components/buttons/intent'
import DefaultDialog from 'part:@sanity/components/dialogs/default'
import FullscreenDialog from 'part:@sanity/components/dialogs/fullscreen'
import Popover from 'part:@sanity/components/dialogs/popover'
import EditItemFold from 'part:@sanity/components/edititem/fold'
import {createDragHandle} from 'part:@sanity/components/lists/sortable'
import ValidationStatus from 'part:@sanity/components/validation/status'
import DragHandleIcon from 'part:@sanity/base/drag-handle-icon'
import * as PathUtils from '@sanity/util/paths'

import {FormBuilderInput} from '../../../FormBuilderInput'
import PatchEvent from '../../../PatchEvent'
import Preview from '../../../Preview'
import {resolveTypeName} from '../../../utils/resolveTypeName'
import ConfirmButton from '../ConfirmButton'
import {ItemValue} from '../typedefs'
import InvalidItem from '../InvalidItem'

import styles from './ArrayInputListItem.css'

const DragHandle = createDragHandle(() => (
  <span className={styles.dragHandle}>
    <Button icon={DragHandleIcon} kind="simple" padding="small" />
  </span>
))
// const CLOSE_ACTION = {
//   name: 'close',
//   title: 'Done',
//   inverted: true
// }
// const CANCEL_ACTION = {
//   name: 'close',
//   title: 'Cancel',
//   inverted: true
// }
// const DELETE_ACTION = {
//   name: 'delete',
//   title: 'Delete',
//   color: 'danger',
//   inverted: true,
//   secondary: true
// }
type Props = {
  type: ArraySchemaType
  value: ItemValue
  compareValue?: any[]
  level: number
  markers: Array<Marker>
  layout?: 'media' | 'default'
  onRemove: (arg0: ItemValue) => void
  onChange: (arg0: PatchEvent, arg1: ItemValue) => void
  onFocus: (arg0: Path) => void
  onBlur: () => void
  filterField: () => any
  readOnly: boolean | null
  focusPath: Path
  presence: FormFieldPresence[]
}
function pathSegmentFrom(value) {
  return {_key: value._key}
}
function hasFocusInPath(path, value) {
  return path.length === 1 && PathUtils.isSegmentEqual(path[0], pathSegmentFrom(value))
}
const IGNORE_KEYS = ['_key', '_type', '_weak']
function isEmpty(value) {
  return Object.keys(value).every(key => IGNORE_KEYS.includes(key))
}

export default class RenderItemValue extends React.PureComponent<Props> {
  _focusArea: HTMLDivElement | null
  static defaultProps = {
    level: 0,
    markers: []
  }
  componentDidMount() {
    const {focusPath, value} = this.props
    if (value._key && hasFocusInPath(focusPath, value)) {
      this.focus()
    }
  }
  componentDidUpdate(prevProps) {
    const hadFocus = hasFocusInPath(prevProps.focusPath, prevProps.value)
    const hasFocus = hasFocusInPath(this.props.focusPath, this.props.value)
    if (!hadFocus && hasFocus) {
      this.focus()
    }
  }
  handleEditStart = event => {
    this.setFocus([PathUtils.FOCUS_TERMINATOR])
  }
  handleFocus = () => {
    this.setFocus()
  }
  handleEditStop = () => {
    if (isEmpty(this.props.value)) {
      this.handleRemove()
    } else {
      this.setFocus()
    }
  }
  handleKeyPress = (event: React.KeyboardEvent<any>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.setFocus([PathUtils.FOCUS_TERMINATOR])
    }
  }
  handleRemove = () => {
    const {onRemove, value} = this.props
    onRemove(value)
  }
  handleChange = (event: PatchEvent, valueOverride?: ItemValue) => {
    const {onChange, value} = this.props
    onChange(event, typeof valueOverride === 'undefined' ? value : valueOverride)
  }
  getMemberType(): SchemaType | null {
    const {value, type} = this.props
    const itemTypeName = resolveTypeName(value)
    return itemTypeName === 'object' && type.of.length === 1
      ? type.of[0]
      : type.of.find(memberType => memberType.name === itemTypeName)
  }
  getTitle(): string {
    const {readOnly} = this.props
    const memberType = this.getMemberType()
    if (readOnly || memberType.readOnly) {
      return memberType.title || ''
    }
    return memberType.title ? `Edit ${memberType.title}` : 'Edit'
  }
  setFocus(path: Path = []) {
    const {value, onFocus} = this.props
    onFocus([{_key: value._key}, ...path])
  }
  focus() {
    if (this._focusArea) {
      this._focusArea.focus()
    }
  }
  setFocusArea = (el: HTMLDivElement | null) => {
    this._focusArea = el
  }
  handleDialogAction = action => {
    if (action.name === 'close') {
      this.handleEditStop()
    }
    if (action.name === 'delete') {
      // Needs a proper confirm dialog later
      // eslint-disable-next-line no-alert
      if (window.confirm('Do you really want to delete?')) {
        this.handleRemove()
      }
    }
  }
  renderEditItemForm(item: ItemValue) {
    const {
      type,
      markers,
      focusPath,
      onFocus,
      onBlur,
      readOnly,
      filterField,
      presence,
      compareValue
    } = this.props
    const options = type.options || {}
    const memberType = this.getMemberType()
    const childMarkers = markers.filter(marker => marker.path.length > 1)
    const childPresence = presence.filter(_presence => _presence.path.length > 1)
    const content = (
      <FormBuilderInput
        type={memberType}
        level={0}
        value={isEmpty(item) ? undefined : item}
        onChange={this.handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        compareValue={compareValue}
        focusPath={focusPath}
        readOnly={readOnly || memberType.readOnly}
        markers={childMarkers}
        path={[{_key: item._key}]}
        filterField={filterField}
        presence={childPresence}
      />
    )
    // test focus issues by uncommenting the next line
    // return content

    const title = this.getTitle()

    if (options.editModal === 'fullscreen') {
      return (
        <FullscreenDialog title={title} onClose={this.handleEditStop} isOpen>
          {content}
        </FullscreenDialog>
      )
    }
    if (options.editModal === 'fold') {
      return (
        <div>
          <EditItemFold title={title} onClose={this.handleEditStop}>
            <PresenceOverlay margins={[0, 0, 1, 0]}>{content}</PresenceOverlay>
          </EditItemFold>
        </div>
      )
    }
    // const isItemEmpty = isEmpty(item)
    // const actions = [
    //   isItemEmpty ? CANCEL_ACTION : CLOSE_ACTION,
    //   !isItemEmpty && !readOnly && DELETE_ACTION
    // ].filter(Boolean)
    if (options.editModal === 'popover') {
      return (
        <div className={styles.popupAnchor}>
          <Popover
            title={title}
            onClose={this.handleEditStop}
            onEscape={this.handleEditStop}
            onClickOutside={this.handleEditStop}
            // actions={actions}
            onAction={this.handleDialogAction}
            placement="auto"
          >
            <PresenceOverlay margins={[0, 0, 1, 0]}>{content}</PresenceOverlay>
          </Popover>
        </div>
      )
    }

    return (
      <DefaultDialog
        onClose={this.handleEditStop}
        key={item._key}
        title={title}
        // actions={actions}
        onAction={this.handleDialogAction}
      >
        <PresenceOverlay margins={[0, 0, 1, 0]}>{content}</PresenceOverlay>
      </DefaultDialog>
    )
  }
  renderItem() {
    const {value, markers, type, readOnly, presence, focusPath} = this.props
    const options = type.options || {}
    const isGrid = options.layout === 'grid'
    const isSortable = !readOnly && !type.readOnly && options.sortable !== false
    const previewLayout = isGrid ? 'media' : 'default'
    const validation = markers.filter(isValidationMarker)
    const scopedValidation = validation
      .map(marker => {
        if (marker.path.length <= 1) {
          return marker
        }
        const level = marker.level === 'error' ? 'errors' : 'warnings'
        return Object.assign({}, marker, {
          item: marker.item.cloneWithMessage(`Contains ${level}`)
        })
      })
      .filter(Boolean)

    const hasItemFocus = PathUtils.isExpanded(pathSegmentFrom(value), focusPath)
    const memberType = this.getMemberType()
    if (!memberType) {
      return <InvalidItem onChange={this.handleChange} type={type} value={value} />
    }
    return (
      <ChangeIndicatorScope path={[{_key: value._key}]}>
        <div className={styles.inner}>
          {!isGrid && isSortable && <DragHandle />}
          <div
            tabIndex={0}
            onClick={value._key && this.handleEditStart}
            onKeyPress={this.handleKeyPress}
            className={styles.previewWrapper}
          >
            <div
              tabIndex={-1}
              ref={this.setFocusArea}
              className={styles.previewWrapperHelper}
              onFocus={this.handleFocus}
            >
              <ContextProvidedChangeIndicator compareDeep disabled={hasItemFocus}>
                {!value._key && <div className={styles.missingKeyMessage}>Missing key</div>}
                <Preview layout={previewLayout} value={value} type={memberType} />
              </ContextProvidedChangeIndicator>
            </div>
          </div>

          <div className={isGrid ? styles.functionsInGrid : styles.functions}>
            <ValidationStatus markers={scopedValidation} showSummary={!value._ref} />
            <FieldPresence presence={hasItemFocus ? [] : presence} maxAvatars={1} />
            {value._ref && (
              <IntentButton
                className={styles.linkToReference}
                icon={LinkIcon}
                intent="edit"
                kind={isGrid ? undefined : 'simple'}
                padding="small"
                params={{id: value._ref}}
              />
            )}
            {!readOnly && (
              <ConfirmButton
                kind={isGrid ? undefined : 'simple'}
                title="Remove this item"
                onConfirm={this.handleRemove}
              />
            )}
          </div>
        </div>
      </ChangeIndicatorScope>
    )
  }
  render() {
    const {value, focusPath, type} = this.props
    const options = type.options || {}
    const isGrid = options.layout === 'grid'
    const isExpanded = PathUtils.isExpanded(value, focusPath)
    return (
      <div className={isGrid ? styles.gridItem : styles.listItem}>
        {this.renderItem()}
        {isExpanded && this.renderEditItemForm(value)}
      </div>
    )
  }
}