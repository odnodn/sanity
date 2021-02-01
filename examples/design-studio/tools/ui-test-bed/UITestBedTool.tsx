import {_tones} from '@sanity/base'
import {COLOR_TINTS} from '@sanity/color'
import {ComposeIcon} from '@sanity/icons'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Code,
  Flex,
  Heading,
  Inline,
  Stack,
  TextInput,
} from '@sanity/ui'

import React from 'react'

const TONE_KEYS = ['default', 'primary', 'positive', 'caution', 'critical']
const RENDER_PALETTES = true
const RENDER_TONES = false

export function UITestBedTool() {
  return (
    <Card>
      <Box padding={4}>
        <Heading as="h1">UITestBedTool</Heading>
      </Box>

      {RENDER_PALETTES && (
        <details>
          <summary>color palettes</summary>

          <Flex padding={4}>
            {TONE_KEYS.map((toneKey) => (
              <Box flex={1} key={toneKey}>
                <Box marginBottom={1}>
                  <Code muted size={1}>
                    state.default.{toneKey}
                  </Code>
                </Box>
                {COLOR_TINTS.map((tintKey) => (
                  <Box
                    key={tintKey}
                    style={{backgroundColor: _tones.state.default[toneKey][tintKey], height: 10}}
                  />
                ))}
              </Box>
            ))}
          </Flex>

          <Flex padding={4}>
            {TONE_KEYS.map((toneKey) => (
              <Box flex={1} key={toneKey}>
                <Box marginBottom={1}>
                  <Code muted size={1}>
                    state.navbar.{toneKey}
                  </Code>
                </Box>
                {COLOR_TINTS.map((tintKey) => (
                  <Box
                    key={tintKey}
                    style={{backgroundColor: _tones.state.navbar[toneKey][tintKey], height: 10}}
                  />
                ))}
              </Box>
            ))}
          </Flex>

          <Flex padding={4}>
            {TONE_KEYS.map((toneKey) => (
              <Box flex={1} key={toneKey}>
                <Box marginBottom={1}>
                  <Code muted size={1}>
                    button.default.{toneKey}
                  </Code>
                </Box>
                {COLOR_TINTS.map((tintKey) => (
                  <Box
                    key={tintKey}
                    style={{backgroundColor: _tones.button.default[toneKey][tintKey], height: 10}}
                  />
                ))}
              </Box>
            ))}
          </Flex>

          <Flex padding={4}>
            {TONE_KEYS.map((toneKey) => (
              <Box flex={1} key={toneKey}>
                <Box marginBottom={1}>
                  <Code muted size={1}>
                    button.navbar.{toneKey}
                  </Code>
                </Box>
                {COLOR_TINTS.map((tintKey) => (
                  <Box
                    key={tintKey}
                    style={{backgroundColor: _tones.button.navbar[toneKey][tintKey], height: 10}}
                  />
                ))}
              </Box>
            ))}
          </Flex>
        </details>
      )}

      {RENDER_TONES && (
        <details>
          <summary>_tones</summary>

          <Card overflow="auto" padding={4} tone="transparent">
            <Code language="json">{JSON.stringify(_tones, null, 2)}</Code>
          </Card>
        </details>
      )}

      <Box padding={4}>
        <Card padding={2} scheme="dark">
          <Inline space={2}>
            <Button mode="bleed" text="Sanity.io" />
            <Button mode="bleed" icon={ComposeIcon} />
            <TextInput />
            <Box>
              <Avatar />
            </Box>
          </Inline>
        </Card>
      </Box>

      <Flex>
        <Card borderTop flex={1} padding={4}>
          <ThemeExample />
        </Card>

        <Card borderTop flex={1} padding={4} scheme="dark">
          <ThemeExample />
        </Card>
      </Flex>
    </Card>
  )
}

function ThemeExample() {
  return (
    <>
      <Stack space={4}>
        <Card padding={4} radius={3} shadow={3}>
          <UIExample />
        </Card>

        <Card padding={4} radius={3} shadow={3} tone="transparent">
          <UIExample />
        </Card>

        <Card padding={4} radius={3} shadow={3} tone="primary">
          <UIExample />
        </Card>

        <Card padding={4} radius={3} shadow={3} tone="positive">
          <UIExample />
        </Card>

        <Card padding={4} radius={3} shadow={3} tone="caution">
          <UIExample />
        </Card>

        <Card padding={4} radius={3} shadow={3} tone="critical">
          <UIExample />
        </Card>
      </Stack>
    </>
  )
}

function UIExample() {
  return (
    <>
      <Stack space={2}>
        <Inline space={2}>
          <Badge>Default</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="positive">Positive</Badge>
          <Badge tone="caution">Caution</Badge>
          <Badge tone="critical">Critical</Badge>
        </Inline>

        <Inline space={2}>
          <Badge mode="outline">Default</Badge>
          <Badge mode="outline" tone="primary">
            Primary
          </Badge>
          <Badge mode="outline" tone="positive">
            Positive
          </Badge>
          <Badge mode="outline" tone="caution">
            Caution
          </Badge>
          <Badge mode="outline" tone="critical">
            Critical
          </Badge>
        </Inline>
      </Stack>

      <Box marginTop={4}>
        <Card padding={4} shadow={1} tone="inherit">
          <Code language="ts">{`console.log('hello, world')`}</Code>
        </Card>
      </Box>

      <Box marginTop={4}>
        <Inline space={2}>
          <Button text="Label" />
          <Button text="Label" tone="primary" />
          <Button text="Label" tone="positive" />
          <Button text="Label" tone="caution" />
          <Button text="Label" tone="critical" />
        </Inline>
      </Box>

      <Box marginTop={4}>
        <Inline space={2}>
          <Button mode="bleed" text="Label" />
          <Button mode="bleed" text="Label" tone="primary" />
          <Button mode="bleed" text="Label" tone="positive" />
          <Button mode="bleed" text="Label" tone="caution" />
          <Button mode="bleed" text="Label" tone="critical" />
        </Inline>
      </Box>

      <Box marginTop={4}>
        <Inline space={2}>
          <Button mode="ghost" text="Label" />
          <Button mode="ghost" text="Label" tone="primary" />
          <Button mode="ghost" text="Label" tone="positive" />
          <Button mode="ghost" text="Label" tone="caution" />
          <Button mode="ghost" text="Label" tone="critical" />
        </Inline>
      </Box>
    </>
  )
}
