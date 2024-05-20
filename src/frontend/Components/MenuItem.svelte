<script>
    export let title = ""
</script>

<div
    {title}
    class=" bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
    dark:text-gray-200 
    even:dark:border-gray-800 
    even:dark:bg-slate-900"
>
    <slot />
</div>
