export function composerMaximumHeight(
  mobile: boolean,
  viewportHeight: number,
): number {
  return mobile ? (viewportHeight < 560 ? 72 : 104) : 180
}
