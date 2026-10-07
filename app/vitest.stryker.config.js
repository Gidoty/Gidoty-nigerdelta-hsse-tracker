import { defineConfig } from 'vitest/config'

// Used only by Stryker (see stryker.conf.json). Mutation testing targets
// just methaneCalc.js and integrity.js, so this restricts the test run to
// their own direct unit tests — crossImplementation.test.js and
// integrity.propertyMutation.test.js reach outside app/ into ../../../validation,
// which doesn't exist inside Stryker's sandboxed copy of this directory.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/utils/methaneCalc.test.js', 'src/utils/integrity.test.js'],
  },
})
