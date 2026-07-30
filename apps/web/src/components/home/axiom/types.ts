export type AxiomType =
  | 'axiom'
  | 'singularity'
  | 'resonance'
  | 'entropy'
  | 'dimension'
  | 'constant'

export interface AxiomTheme {
  id: AxiomType
  accent: string
  accentDark: string
  caption: string
  title: string
  content: string
  captionEn: string
  titleEn: string
  contentEn: string
  illustrationLabel: string
  illustrationLabelEn: string
  drawingStatus: string
  drawingStatusEn: string
  ambientStatus: string
  ambientStatusEn: string
}

export type AxiomAnimationPhase = 'drawing' | 'ambient'