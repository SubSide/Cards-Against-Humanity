<template>
    <div class="col-md-6 col-12">
        <h4>{{ room.name }}</h4>
        <span>{{ room.playerCount }} / {{ room.maxPlayers }} players</span>
    </div>
</template>

<script>
    module.exports = {
        name: 'room',
        props: [ 'room' ],
    }
</script>