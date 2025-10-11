<script lang="ts">
    import { onMount } from 'svelte'
    import { events, eventsToBackend } from '../events'
    import { appName, totpConfirmInfo } from '../stores'
    import Icons from './icons/Icons.svelte'

    let code = ''

    onMount(() => {})

    const onKeyEnter = async (e: KeyboardEvent) => {
        if (e.key == 'Enter') {
            sendRequest()
        }
    }
    const clickHandler = (e: Event) => {
        sendRequest()
    }
    const sendRequest = () => {
        events.notifyBackend(eventsToBackend.confirm2fa, code, $totpConfirmInfo.totp.token)
    }
</script>

<div class="container mx-auto flex justify-center">
    <div
        class="absolute inset-0 flex items-center justify-center bg-neutral-700 bg-opacity-50 text-zinc-900 dark:bg-zinc-900 dark:text-neutral-100"
    >
        <div class="max-w-sm bg-white p-6 dark:bg-rock">
            <div class="flex h-12 flex-row items-center justify-center">
                <Icons icon="logo" centered={false} size="12" />
                <h1 class="pl-1 text-2xl">
                    {$appName}
                </h1>
            </div>
            <div class="mt-3 flex flex-col gap-4">
                <p>2FA setup is unfinished!</p>
                <p>Scan the QR code to continue</p>
                <img src={$totpConfirmInfo.totp.qr} alt="totp secret: {$totpConfirmInfo.totp.secret}" />

                <div class="flex flex-row">
                    <p>Can't scan? Use the</p>
                    <div
                        title="setup key: {$totpConfirmInfo.totp.secret}. Click to copy."
                        class="text-blue-800 ml-2 font-bold"
                        on:click={() => events.notifyBackend(eventsToBackend.pasteText, $totpConfirmInfo.totp.secret)}
                    >
                        setup key
                    </div>
                </div>
                <input
                    bind:value={code}
                    on:keypress={onKeyEnter}
                    class="border-1 dark:focus:bg-neutral-800focus:outline-none w-full appearance-none border-neutral-300 bg-neutral-100 px-3 py-3 pr-16 font-mono leading-tight text-neutral-700 focus:border-neutral-500 focus:bg-neutral-200 dark:bg-zinc-800 dark:text-neutral-200 dark:focus:bg-zinc-700"
                    type="text"
                    placeholder="6 digit code"
                    autocomplete="off"
                />
                <button
                    class="mr-2 mt-2 w-full border border-neutral-400 px-5 py-2.5 text-center text-sm font-medium  text-neutral-700 hover:bg-neutral-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-neutral-300 dark:border-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white dark:focus:ring-neutral-800"
                    on:click={clickHandler}>confirm</button
                >
            </div>
        </div>
    </div>
</div>
