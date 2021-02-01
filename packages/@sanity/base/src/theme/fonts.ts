import {studioTheme as defaults, ThemeFonts} from '@sanity/ui'
import legacyTheme from 'sanity:css-custom-properties'

export const fonts: ThemeFonts = {
  ...defaults.fonts,
  code: {
    ...defaults.fonts.code,
    family: legacyTheme['--font-family-monospace'] || defaults.fonts.code.family,
  },
  heading: {
    ...defaults.fonts.heading,
    family: legacyTheme['--font-family-base'] || defaults.fonts.code.family,
  },
  label: {
    ...defaults.fonts.label,
    family: legacyTheme['--font-family-base'] || defaults.fonts.code.family,
  },
  text: {
    ...defaults.fonts.text,
    family: legacyTheme['--font-family-base'] || defaults.fonts.code.family,
  },
}
