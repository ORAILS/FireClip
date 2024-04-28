<script lang="ts">
    import { onMount } from 'svelte'
    import { ipcRenderer } from '../KeyboardEventUtil'
    import { appName, isPasswordIncorrect, passwordButtonText, showPassword } from '../stores'

    function togglePasswordInput() {
        $passwordButtonText === 'show' ? ($passwordButtonText = 'hide') : ($passwordButtonText = 'show')
        $showPassword === true ? ($showPassword = false) : ($showPassword = true)
    }
    let userPassword: string = ''
    let username: string = ''

    export const validatePassword = (pass: string, isRegisterPass = false): boolean => {
        if (username.length < 1) {
            error = 'username cannot be empty'
            return false
        }
        if (!pass || pass.length < 1) {
            error = 'password cannot be empty'
            return false
        }
        if (!isRegisterPass) return true
        // TODO -> add validation for register password
        return false
    }

    function resetPasswordCorrect() {
        error = ''
        $isPasswordIncorrect = false
    }
    const onKeyEnter = async (e: KeyboardEvent) => {
        if (e.key == 'Enter') {
            sendLoginRequest()
        }
    }
    const onOkay = (e: Event) => {
        sendLoginRequest()
    }
    const sendLoginRequest = () => {
        if (validatePassword(userPassword)) {
            // TODO remove when we have the server working.
            ipcRenderer.send('loginUser', { name: username, password: userPassword })
        }
    }

    let error = ''
</script>

<div class="container mx-auto flex justify-center">
    <div
        class="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 text-slate-900 dark:bg-slate-900 dark:text-gray-100"
    >
        <div class="max-w-sm bg-white p-6 dark:bg-rock">
            <div class="">
                <h3 class="text-center text-2xl">
                    {$appName} is locked
                </h3>
            </div>
            <div class="mt-2">
                <p class="text-center text-sm">Use password to decrypt data</p>
                <div class="relative my-3 w-full ">
                    <input
                        bind:value={username}
                        on:input={resetPasswordCorrect}
                        class="border-1 w-full appearance-none border-gray-300 bg-gray-100 px-3 py-3 pr-16 font-mono  leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 focus:outline-none  dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-gray-800"
                        type="text"
                        autocomplete="off"
                        placeholder="username"
                    />
                </div>
                <div class="relative my-3 w-full ">
                    <div class="absolute inset-y-0 right-0 flex items-center px-2">
                        <input class="js-$password-toggle hidden" id="toggle" type="checkbox" />
                        <label
                            on:click={togglePasswordInput}
                            class="js-$password-label cursor-pointer bg-gray-300 px-2 py-1 font-mono text-sm text-gray-600 hover:bg-gray-400 dark:bg-slate-900 dark:text-gray-200 hover:dark:bg-slate-800"
                            for="toggle">{$passwordButtonText}</label
                        >
                    </div>
                    {#if $showPassword}
                        <input
                            bind:value={userPassword}
                            on:input={resetPasswordCorrect}
                            on:keypress={onKeyEnter}
                            class="border-1 w-full appearance-none border-gray-300 bg-gray-100 px-3 py-3 pr-16 font-mono  leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 focus:outline-none  dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-gray-800"
                            type="text"
                            placeholder="password"
                            autocomplete="off"
                        />
                    {:else}
                        <input
                            bind:value={userPassword}
                            on:input={resetPasswordCorrect}
                            on:keypress={onKeyEnter}
                            class="border-1 dark:focus:bg-gray-800focus:outline-none w-full appearance-none border-gray-300 bg-gray-100 px-3 py-3 pr-16 font-mono leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-slate-700"
                            type="password"
                            placeholder="password"
                            autocomplete="off"
                        />
                    {/if}
                </div>
                <div class="m-1 h-6">
                    <p class="text-red text-sm">{error}</p>
                </div>
                {#if $isPasswordIncorrect}
                    <button
                        class="border-red-500 text-red-700 hover:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800 mr-2 mt-2 w-full border px-5  py-2.5 text-center text-sm font-medium hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white"
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
