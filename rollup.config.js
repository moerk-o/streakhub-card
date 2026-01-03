import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/streakhub-card.ts',
  output: {
    file: 'dist/streakhub-card.js',
    format: 'es',
    sourcemap: !production
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        '__VERSION__': pkg.version
      }
    }),
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      sourceMap: !production
    }),
    production && terser({
      format: {
        comments: false
      }
    })
  ].filter(Boolean)
};
