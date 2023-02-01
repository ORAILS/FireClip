const colors = require('tailwindcss/colors')

module.exports = {
    content: ['./src/frontend/**/*'],
    darkMode: 'media',
    theme: {
        colors: {
            rock: '#131221',
            black: colors.black,
            white: colors.white,
            gray: colors.gray,
            emerald: colors.emerald,
            indigo: colors.indigo,
            yellow: colors.yellow,
            slate: colors.slate,
            green: colors.green,
            stone: colors.stone,
        },
        extend: {}
    },
    variants: {
        extend: {}
    },
    plugins: []
}
