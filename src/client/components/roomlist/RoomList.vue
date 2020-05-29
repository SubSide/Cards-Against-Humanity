<template>
    <div class="row">
        <room v-for="room in rooms" :key="room.id" :room="room" />
        <div class="col" v-if="rooms.length < 1">
            No servers created yet! Click <button>here</button> to create your own.
        </div>
    </div>
</template>

<script>
    import Room from './Room.vue';
    
    module.exports = {
        name: 'room-list',
        props: ['rooms'],
        components: { 'room': Room }
    }
</script>