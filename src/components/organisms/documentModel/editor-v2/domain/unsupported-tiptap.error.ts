export class UnsupportedTipTapStructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedTipTapStructureError';
  }
}
