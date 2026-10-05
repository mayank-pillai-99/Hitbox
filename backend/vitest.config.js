import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        // The integration files share one database and each wipes it.
        fileParallelism: false,
        setupFiles: ['tests/setup.js'],
    },
});
