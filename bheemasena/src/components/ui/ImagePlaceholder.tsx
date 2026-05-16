// Back-compat shim — kept so existing imports of `ImagePlaceholder` keep
// resolving to the same file path. The implementation lives in
// MediaPlaceholder.tsx, which accepts an optional `src` (image or video).
// Existing callers that pass no `src` render the original cream box exactly
// as before, so behavior on /menu, /blog, /login, /orders is unchanged.
export { MediaPlaceholder as ImagePlaceholder } from './MediaPlaceholder'
