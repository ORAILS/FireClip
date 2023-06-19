<script lang="ts">
    import { getKeyName } from '../KeyboardEventUtil'
    import { currentEvent, pressedKeys } from '../stores'
</script>

<div
    class="h-full w-full bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
dark:text-gray-200 
even:dark:border-gray-800 
even:dark:bg-slate-900"
>
    <h2>Event</h2>
    <p>
        {JSON.stringify($currentEvent, undefined, 2)}
        {#if $currentEvent}
            <!-- {keyNames[$currentEvent.keycode]}
            {qwertyToDvorak[keyNames[$currentEvent.keycode]]} -->
            {getKeyName($currentEvent.keycode, $currentEvent.rawcode, 'dvorak')}
            <p>
                {JSON.stringify($pressedKeys, undefined, 2)}
            </p>
        {/if}
    </p>
</div>
