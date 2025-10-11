<script lang="ts">
    import { onMount } from 'svelte'
    import { events, eventsToBackend } from '../events'
    import {
        appName,
        currentPage,
        isPasswordIncorrect,
        isUserRemembered,
        loginPageMessage,
        passwordButtonText,
        showPassword
    } from '../stores'
    import { IPages } from '../types'
    import Icons from './icons/Icons.svelte'

    function togglePasswordInput() {
        $passwordButtonText === 'show' ? ($passwordButtonText = 'hide') : ($passwordButtonText = 'show')
        $showPassword === true ? ($showPassword = false) : ($showPassword = true)
    }
    let username: string = ''
    let userPassword: string = ''
    let userPasswordConfirm: string = ''

    let code2fa = ''
    let userIsRegistering = false

    let rememberLogin = false

    let loginMessage = 'Got an account? <br/><b>Click to login</b>'
    let registerMessage = 'New here? <br/><b>Click to register!</b>'

    function showConfirmWindow() {
        userIsRegistering = !userIsRegistering
        updateMessage()
    }
    let buttonText = 'LOGIN'
    function updateMessage() {
        if (userIsRegistering) {
            buttonText = 'REGISTER'
            loginPageMessage.set(loginMessage)
        } else {
            buttonText = 'LOGIN'
            loginPageMessage.set(registerMessage)
        }
    }
    onMount(() => {
        usernameField.focus()
    })
    loginPageMessage.set(registerMessage)

    export const validateInput = (pass: string, isRegisterPass = false): boolean => {
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
            if ($isUserRemembered) {
                unlock()
            } else {
                sendRequest()
            }
        }
    }
    const onOkay = (e: Event) => {
        sendRequest()
    }
    function logOut() {
        events.notifyBackend(eventsToBackend.userLogout)
    }
    function unlock() {
        events.notifyBackend(eventsToBackend.userLogin, { password: userPassword, wasRemembered: true, rememberLogin: false })
    }
    const sendRequest = () => {
        if (!validateInput(userPassword)) {
            return
        }
        if (userIsRegistering && !passwordsMatch()) {
            return
        }

        // TODO remove when we have the server working.
        if (userIsRegistering) {
            events.notifyBackend(eventsToBackend.userRegister, { name: username, password: userPassword })
        } else {
            events.notifyBackend(eventsToBackend.userLogin, { name: username, password: userPassword, code: code2fa, rememberLogin })
        }
        buttonText = 'Loading...'
        console.log('login request sent!')
    }
    isPasswordIncorrect.subscribe((value) => {
        if (value) {
            buttonText = 'Password incorrect!'
        } else {
            updateMessage()
        }
    })
    let usernameField: HTMLElement
</script>

<div class="container mx-auto flex justify-center">
    <div
        class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-700 bg-opacity-50 text-neutral-900 dark:bg-zinc-900 dark:text-zinc-100"
    >
        <div class="mb-5 flex h-12 flex-row items-center justify-center">
            <Icons
                icon="logo"
                centered={false}
                size="12"
                on:click={() => {
                    currentPage.set(IPages.settings)
                }}
            />
            <h1 class="pl-1 text-2xl">
                {$appName}
            </h1>
        </div>
        {#if $isUserRemembered}
            <div class="dark:bg-zincw-80 bg-white p-6">
                <div class="flex w-full flex-col items-center space-y-3">
                    <p>Your clipboard manager is locked</p>
                    <div class="relative my-3 w-full ">
                        <div class="absolute inset-y-0 right-0 flex items-center px-2">
                            <input class="js-$password-toggle hidden" id="toggle" type="checkbox" />
                            <label
                                on:click={togglePasswordInput}
                                class="js-$password-label cursor-pointer bg-zinc-300 px-2 py-1 font-mono text-sm text-zinc-600 hover:bg-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 hover:dark:bg-zinc-800"
                                for="toggle">{$passwordButtonText}</label
                            >
                        </div>
                        {#if $showPassword}
                            <input
                                bind:value={userPassword}
                                on:input={resetPasswordCorrect}
                                on:keypress={onKeyEnter}
                                class="border-1 w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono  leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 focus:outline-none  dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-zinc-800"
                                type="text"
                                placeholder="password"
                                autocomplete="off"
                            />
                        {:else}
                            <input
                                bind:value={userPassword}
                                on:input={resetPasswordCorrect}
                                on:keypress={onKeyEnter}
                                class="border-1 dark:focus:bg-zinc-800focus:outline-none w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-neutral-700"
                                type="password"
                                placeholder="password"
                                autocomplete="off"
                            />
                        {/if}
                    </div>
                    <button
                        class="mt-2 w-full px-5 py-2.5 text-center text-sm font-medium text-zinc-700  hover:bg-zinc-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-zinc-300 dark:bg-indigo-950  dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white dark:focus:ring-zinc-800"
                        on:click={unlock}>Unlock</button
                    >
                    <p>or</p>
                    <button
                        class="mt-2 w-full border border-zinc-400 px-5 py-2.5 text-center text-sm font-medium  text-zinc-700 hover:bg-zinc-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-zinc-300 dark:border-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white dark:focus:ring-zinc-800"
                        on:click={logOut}>Log out</button
                    >
                </div>
            </div>
        {:else}
            <div class="h-96 w-80">
                <div class="dark:bg-zincw-full bg-white p-6">
                    <div class="mt-2">
                        <p class="text-center text-sm">Login or Register</p>
                        <div class="inputs">
                            <div class="relative my-3 w-full ">
                                <input
                                    bind:this={usernameField}
                                    bind:value={username}
                                    on:input={resetPasswordCorrect}
                                    class="border-1 w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono  leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 focus:outline-none  dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-zinc-800"
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
                                        class="js-$password-label cursor-pointer bg-zinc-300 px-2 py-1 font-mono text-sm text-zinc-600 hover:bg-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 hover:dark:bg-zinc-800"
                                        for="toggle">{$passwordButtonText}</label
                                    >
                                </div>
                                {#if $showPassword}
                                    <input
                                        bind:value={userPassword}
                                        on:input={resetPasswordCorrect}
                                        on:keypress={onKeyEnter}
                                        class="border-1 w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono  leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 focus:outline-none  dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-zinc-800"
                                        type="text"
                                        placeholder="password"
                                        autocomplete="off"
                                    />
                                {:else}
                                    <input
                                        bind:value={userPassword}
                                        on:input={resetPasswordCorrect}
                                        on:keypress={onKeyEnter}
                                        class="border-1 dark:focus:bg-zinc-800focus:outline-none w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-neutral-700"
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
                                        class="border-1 w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono  leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 focus:outline-none  dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-zinc-800"
                                        type="text"
                                        placeholder="confirm password"
                                        autocomplete="off"
                                    />
                                {:else}
                                    <input
                                        bind:value={userPasswordConfirm}
                                        on:input={resetPasswordCorrect}
                                        on:keypress={onKeyEnter}
                                        class="border-1 dark:focus:bg-zinc-800focus:outline-none w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-neutral-700"
                                        type="password"
                                        placeholder="confirm password"
                                        autocomplete="off"
                                    />
                                {/if}
                            </div>
                            <div class="relative {userIsRegistering ? 'hidden' : ''} my-3 w-full ">
                                <input
                                    bind:value={code2fa}
                                    on:keypress={onKeyEnter}
                                    class="border-1 w-full appearance-none border-zinc-300 bg-zinc-100 px-3 py-3 pr-16 font-mono  leading-tight text-zinc-700 focus:border-zinc-500 focus:bg-zinc-200 focus:outline-none  dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-zinc-800"
                                    type="text"
                                    placeholder="2-FA code"
                                    autocomplete="off"
                                />
                                <div class="my-3 flex w-full flex-row items-center">
                                    <input type="checkbox" bind:checked={rememberLogin} class="h-5 w-5 rounded-none" />
                                    <p class="ml-3">remember me for 30 days</p>
                                </div>
                            </div>
                        </div>
                        <button
                            class="mr-2 mt-2 w-full border border-zinc-400 px-5 py-2.5 text-center text-sm font-medium  text-zinc-700 hover:bg-zinc-400 hover:text-white focus:outline-none focus:ring-4 focus:ring-zinc-300 dark:border-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white dark:focus:ring-zinc-800"
                            on:click={onOkay}>{buttonText}</button
                        >
                    </div>
                </div>
                <div class="dark:bg-zincmt-3 w-full bg-white p-3">
                    <p class="my-2 text-center" on:click={showConfirmWindow}>
                        {@html $loginPageMessage}
                    </p>
                </div>
            </div>
        {/if}
    </div>
</div>
