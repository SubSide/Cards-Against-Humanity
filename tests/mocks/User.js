class User {
    constructor() {
        this.username = "test user";
        this.role =  3;
    }


    getTransmitData() {
        return {};
    }

    updateGlobal() {}
    leaveRoom() {}
    sendPacket(packet) {}

    canDo(text, cooldown) {
        return true;
    }

    sendUpdateState() {}

    sendPartialUpdate(props) {}

    createOwnState() {
        return {}
    }
}

exports.default = User;