<script>
    export let title = ''
    export let extraClass = ''
</script>

<div
    {title}
    class="cursor-pointer bg-neutral-100 px-2 py-2 pl-3 text-neutral-900 even:border-y even:bg-white dark:border-neutral-800 
    dark:bg-neutral-900 
    dark:text-neutral-200 
    {extraClass}
    even:dark:bg-zinc-900"
>
    <slot />
</div>
