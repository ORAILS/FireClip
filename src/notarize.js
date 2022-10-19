/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { notarize } = require('electron-notarize')

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context
    if (electronPlatformName !== 'darwin') {
        return
    }

    const appName = context.packager.appInfo.productFilename
    const appPath = `${appOutDir}/${appName}.app`

    console.log(`\nApp to sign: ${appPath}`)
    console.log(`\nUsing accuont ${process.env.APPLEID}\n`)
    console.time('Signing')

    const interval = setInterval(() => {
        console.timeLog('Signing')
    }, 30 * 1000)
    try {
        const result = await notarize({
            appBundleId: 'com.orails.fireclip',
            appPath,
            appleId: process.env.APPLEID,
            appleIdPassword: process.env.APPLEIDPASS
        })

        clearInterval(interval)
        console.log('Total time:')
        console.timeEnd('Signing')

        return result
    } catch (error) {
        console.error(error)
    }
}
