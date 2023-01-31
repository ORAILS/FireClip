<script lang="ts">
    import { appSettings } from '../AppSettings'
    import { ipcRenderer, state } from './stores'

    function togglePasswordInput() {
        $state.passwordButtonText === 'show' ? ($state.passwordButtonText = 'hide') : ($state.passwordButtonText = 'show')
        $state.showPassword === true ? ($state.showPassword = false) : ($state.showPassword = true)
    }

    function resetPasswordCorrect() {
        $state.passwordIncorrect = false
    }
    const onKeyEnter = async (e: KeyboardEvent) => {
        if (e.key == 'Enter') {
            if ($state.password && $state.password.length > 0) {
                ipcRenderer.send('setPassword', $state.password)
            }
        }
    }
    const onOkay = (e: Event) => {
        if ($state.password && $state.password.length > 0) {
            ipcRenderer.send('setPassword', $state.password)
        }
    }
</script>

<div class="container mx-auto flex justify-center">
    <div
        class="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 text-slate-900 dark:bg-slate-900 dark:text-gray-100"
    >
        <div class="dark:bg-rock max-w-sm bg-white p-6">
            <div class="">
                <h3 class="text-center text-2xl">
                    {appSettings.name} is locked
                </h3>
            </div>
            <div class="mt-2">
                <p class="text-center text-sm">Use password to decrypt data</p>
                <div class="relative my-3 w-full ">
                    <div class="absolute inset-y-0 right-0 flex items-center px-2">
                        <input class="js-$state.password-toggle hidden" id="toggle" type="checkbox" />
                        <label
                            on:click={togglePasswordInput}
                            class="js-$state.password-label cursor-pointer bg-gray-300 px-2 py-1 font-mono text-sm text-gray-600 hover:bg-gray-400 dark:bg-slate-900 dark:text-gray-200 hover:dark:bg-slate-800"
                            for="toggle">{$state.passwordButtonText}</label
                        >
                    </div>
                    {#if $state.showPassword}
                        <input
                            bind:value={$state.password}
                            on:input={resetPasswordCorrect}
                            on:keypress={onKeyEnter}
                            class="border-1 w-full appearance-none border-gray-300 bg-gray-100 py-3 px-3 pr-16 font-mono  leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 focus:outline-none  dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-gray-800"
                            type="text"
                            autocomplete="off"
                        />
                    {:else}
                        <input
                            bind:value={$state.password}
                            on:input={resetPasswordCorrect}
                            on:keypress={onKeyEnter}
                            class="border-1 dark:focus:bg-gray-800focus:outline-none w-full appearance-none border-gray-300 bg-gray-100 py-3 px-3 pr-16 font-mono leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-slate-700"
                            type="password"
                            autocomplete="off"
                        />
                    {/if}
                </div>
                {#if $state.passwordIncorrect}
                    <button
                        class="mr-2 mt-2 w-full border border-red-500 px-5 py-2.5 text-center text-sm font-medium  text-red-700 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-800"
                        on:click={onOkay}>Password incorrect!</button
                    >
                {:else}
                    <button
                        class="mr-2 mt-2 w-full border border-gray-400 px-5 py-2.5 text-center text-sm font-medium  text-gray-700 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-slate-400 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus:ring-gray-800"
                        on:click={onOkay}>Unlock</button
                    >
                {/if}
            </div>
        </div>
    </div>
</div>
