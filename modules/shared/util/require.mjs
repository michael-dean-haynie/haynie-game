// These lines make "require" available
import { createRequire } from 'module'
export const require = createRequire(import.meta.url)
