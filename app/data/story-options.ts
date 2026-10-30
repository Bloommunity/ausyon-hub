import { AU_TYPES } from '~/utils/story-presentation'

export const auTypes = [...AU_TYPES]

export const platformFilters = [
  { label: 'Everything', value: 'Everything' },
  { label: 'AO3', value: 'AO3' },
  { label: 'Wattpad', value: 'Wattpad' },
  { label: 'X (formerly Twitter)', value: 'X' },
  { label: 'Other', value: 'Other' }
]

export const platformOptions = [
  { label: 'AO3', value: 'AO3' },
  { label: 'Wattpad', value: 'Wattpad' },
  { label: 'X (formerly Twitter)', value: 'X' },
  { label: 'Other', value: 'Other' }
]

export const auTypeOptions = [
  { label: 'Choose an AU type (optional)', value: '' },
  ...auTypes.map((type) => ({ label: type, value: type }))
]
