<script lang="ts">
    import { onMount } from 'svelte'
    import { events, eventsToBackend } from '../events'
    import { appName, isPasswordIncorrect, loginPageMessage, passwordButtonText, showPassword } from '../stores'
    import Icons from './icons/Icons.svelte'

    function togglePasswordInput() {
        $passwordButtonText === 'show' ? ($passwordButtonText = 'hide') : ($passwordButtonText = 'show')
        $showPassword === true ? ($showPassword = false) : ($showPassword = true)
    }
    let username: string = ''
    let userPassword: string = ''
    let userPasswordConfirm: string = ''

    let userIsRegistering = false

    let loginMessage = 'Have an account? Login'
    let registerMessage = 'New here? Register!'

    function showConfirmWindow() {
        userIsRegistering = !userIsRegistering
        updateMessage()
    }

    function updateMessage() {
        if (userIsRegistering) {
            loginPageMessage.set(loginMessage)
        } else {
            loginPageMessage.set(registerMessage)
        }
    }
    onMount(() => {
        // on interval to clear up the errors
        setInterval(updateMessage, 5000)


    })
    loginPageMessage.set(registerMessage)

    export const validatePassword = (pass: string, isRegisterPass = false): boolean => {
        if (username.length < 3) {
            loginPageMessage.set('username should be at least 3 characters long')
            return false
        }
        if (!pass || pass.length < 5) {
            loginPageMessage.set('password should be at least 5 characters long')
            return false
        }
        // if (!isRegisterPass) return true
        // TODO -> add validation for register password
        return true
    }

    function passwordsMatch() {
        if (userPassword != userPasswordConfirm) {
            loginPageMessage.set("Passwords don't match!")
        }
        return userPasswordConfirm === userPassword
    }

    function resetPasswordCorrect() {
        // loginPageMessage.set('')
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
        if (!validatePassword(userPassword)) {
            return
        }
        if (userIsRegistering && !passwordsMatch()) {
            return
        }

        // TODO remove when we have the server working.
        if (userIsRegistering) {
            events.notifyBackend(eventsToBackend.userRegister, { name: username, password: userPassword })
        } else {
            events.notifyBackend(eventsToBackend.userLogin, { name: username, password: userPassword })
        }

        console.log('login request sent!')
    }
</script>

<div class="container mx-auto flex justify-center">
    <div
        class="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 text-slate-900 dark:bg-slate-900 dark:text-gray-100"
    >
        <div class="max-w-sm bg-white p-6 dark:bg-rock">
            <div class="flex h-12 flex-row items-center justify-center">
                <Icons icon="logo" centered={false} size="12" />
                <h1 class="pl-1 text-2xl">
                    {$appName}
                </h1>
            </div>
            <div class="mt-2">
                <p class="text-center text-sm">Login or Register</p>
                <div class="inputs">
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
                    <div class="relative {userIsRegistering ? '' : 'hidden'} my-3 w-full ">
                        {#if $showPassword}
                            <input
                                bind:value={userPasswordConfirm}
                                on:input={resetPasswordCorrect}
                                on:keypress={onKeyEnter}
                                class="border-1 w-full appearance-none border-gray-300 bg-gray-100 px-3 py-3 pr-16 font-mono  leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 focus:outline-none  dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-gray-800"
                                type="text"
                                placeholder="password confirmation"
                                autocomplete="off"
                            />
                        {:else}
                            <input
                                bind:value={userPasswordConfirm}
                                on:input={resetPasswordCorrect}
                                on:keypress={onKeyEnter}
                                class="border-1 dark:focus:bg-gray-800focus:outline-none w-full appearance-none border-gray-300 bg-gray-100 px-3 py-3 pr-16 font-mono leading-tight text-gray-700 focus:border-gray-500 focus:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:focus:bg-slate-700"
                                type="password"
                                placeholder="password confirmation"
                                autocomplete="off"
                            />
                        {/if}
                    </div>
                </div>
                <p class="my-2 text-center" on:click={showConfirmWindow}>
                    {$loginPageMessage}
                </p>
                <button
                    class="mr-2 mt-2 w-full border border-gray-400 px-5 py-2.5 text-center text-sm font-medium  text-gray-700 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-slate-400 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus:ring-gray-800"
                    on:click={onOkay}>{$isPasswordIncorrect ? 'Password incorrect! ' : userIsRegistering ? 'Register' : 'Login'}</button
                >
            </div>
        </div>
    </div>
</div>
