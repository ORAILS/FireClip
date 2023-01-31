/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { notarize } = require('electron-notarize')

const APPLEID = process.env.APPLEID
const APPLEIDPASS = process.env.APPLEIDPASS
// required to push the package to GH
const GH_TOKEN = process.env.GH_TOKEN

if (!APPLEID) throw new Error('No APPLEID!')
if (!APPLEIDPASS) throw new Error('No APPLEIDPASS!')
if (!GH_TOKEN) throw new Error('No GH_TOKEN!')

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context
    if (electronPlatformName !== 'darwin') {
        return
    }

    const appName = context.packager.appInfo.productFilename
    const appPath = `${appOutDir}/${appName}.app`

    console.log(`\nApp to sign: ${appPath}`)
    console.log(`\nUsing accuont ${APPLEID}\n`)
    console.time('Signing')

    const interval = setInterval(() => {
        console.timeLog('Signing')
    }, 30 * 1000)
    try {
        const result = await notarize({
            appBundleId: 'com.orails.fireclip',
            appPath,
            appleId: APPLEID,
            appleIdPassword: APPLEIDPASS
        })

        clearInterval(interval)
        console.log('Total time:')
        console.timeEnd('Signing')

        return result
    } catch (error) {
        console.error(error)
    }
}
