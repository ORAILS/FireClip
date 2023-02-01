import App from './App.svelte'
import { appSettings } from './AppSettings'

const app = new App({
    target: document.body,
    props: {
        name: appSettings.name
    }
})

export default app
