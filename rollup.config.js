import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import {terser} from "rollup-plugin-terser";

export default [
    {
        input: 'src/index.ts',
        external: ['redux', 'react-redux'],
        output: [
            {
                dir: './dist',
                format: 'es',
                sourcemap: false,
            }
        ],
        plugins: [
            typescript({
                outDir: 'dist'
            }),
            commonjs({
                extensions: ['.js', '.ts']
            }),
            babel({
                babelHelpers: 'bundled',
            }),
            nodeResolve({
                browser: false
            }),
            terser({
                mangle: true
            })
        ]
    }
]