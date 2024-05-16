<script lang="ts">
    export let number = 0
</script>

<div
    class="mx-0 my-0 mr-1 flex h-full max-w-[25px] cursor-pointer flex-row items-center self-center rounded-sm border-0 bg-gray-50 fill-black stroke-slate-800 p-[2px] text-[14px] shadow-lg dark:bg-slate-800 dark:fill-white"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        x="0px"
        y="0px"
        viewBox="0 0 60 60"
        style="enable-background:new 0 0 60 60;"
        xml:space="preserve"
    >
        <path
            d="M49,38h-7V22h7c6.065,0,11-4.935,11-11S55.065,0,49,0S38,4.935,38,11v7H22v-7c0-6.065-4.935-11-11-11S0,4.935,0,11  s4.935,11,11,11h7v16h-7C4.935,38,0,42.935,0,49s4.935,11,11,11s11-4.935,11-11v-7h16v7c0,6.065,4.935,11,11,11s11-4.935,11-11  S55.065,38,49,38z M42,11c0-3.859,3.14-7,7-7s7,3.141,7,7s-3.14,7-7,7h-7V11z M11,18c-3.86,0-7-3.141-7-7s3.14-7,7-7s7,3.141,7,7v7  H11z M18,49c0,3.859-3.14,7-7,7s-7-3.141-7-7s3.14-7,7-7h7V49z M22,38V22h16v16H22z M49,56c-3.86,0-7-3.141-7-7v-7h7  c3.86,0,7,3.141,7,7S52.86,56,49,56z"
        />
    </svg>
    <p>{number}</p>
</div>

<style lang="postcss">
    svg {
        @apply h-[14px] w-5 p-[1px];
    }
</style>
