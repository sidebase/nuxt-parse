/// <reference types="vitest" />
import { defineConfig } from "vite"

export default defineConfig({
  test: {
    threads: false,
    coverage: {
      enabled: false,
      lines: 90,
      functions: 90,
      branches: 90,
      // We want to catch all js/ts/... files, not only the ones imported in some tests
      // see https://github.com/bcoe/c8#checking-for-full-source-coverage-using---all
      all: true,
    },
  }
})
