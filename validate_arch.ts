import { execSync } from 'child_process'

const main = async () => {
    const arch = execSync('arch', { encoding: 'utf-8' }).trim()
    const archNode = execSync('node -e "console.log(process.arch)"', { encoding: 'utf-8' }).trim()
    console.log(`arch: '${arch}'`)
    console.log(`node arch: '${archNode}'`)
    if (arch != archNode) {
        // macos scenario
        if (arch == 'i386' && archNode == 'x64') {
            return
        }
        throw new Error('OS/Node arch are diferent, build will fail!')
    }
}

main()
