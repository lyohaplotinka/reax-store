import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";

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
            nodeResolve({
                browser: false
            }),
        ]
    }
]
