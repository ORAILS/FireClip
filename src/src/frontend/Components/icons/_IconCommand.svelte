<script lang="ts">
    export let number = 0
</script>

<div class="svg-container flex flex-row">
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
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
    </svg>
    <p>{number}</p>
</div>

<style lang="postcss">
    .svg-container {
        @apply h-[18px] max-w-[25px] mx-0 px-[1px] my-0 rounded mr-1;
        fill: black;
        font-size: 14px;
        background-color: var(--background-color, theme('colors.gray.50'));
        stroke: var(--text-color, theme('colors.gray.800'));
        align-items: center;
        font-family: JetBrainsMono-Thin;
        border: 0px solid black;
    }
    svg {
        @apply h-[14px] w-5 p-[1px];
    }
    .svg-container:hover {
        @apply rounded;
        cursor: pointer;
    }
</style>
