<script>
    export let title = ''
    export let extraClass = ''
</script>

<div
    {title}
    class="cursor-pointer bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
    dark:text-gray-200 
    dark:border-gray-800 
    {extraClass}
    even:dark:bg-slate-900"
>
    <slot />
</div>
