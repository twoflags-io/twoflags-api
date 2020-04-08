import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import globals from 'rollup-plugin-node-globals'

export default {
  input: 'src/resolver/index.ts',
  output: [
    {
      file: 'build/index.js',
      format: 'es',
      exports: 'named',
      sourcemap: false
    }
  ],
  plugins: [
    globals(),
    external(),
    resolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: '**/__tests__/**',
      clean: true
    }),
    commonjs({
      include: ['node_modules/**']
    }),
    terser()
  ]
}
