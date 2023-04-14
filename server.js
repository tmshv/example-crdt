import { Hocuspocus } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";

// Configure the server …
const server = new Hocuspocus({
    port: 1234,
    yDocOptions: {
        gc: true,
    },
    async connected() {
        console.log("connections:", server.getConnectionsCount());
    },
    async onChange(data) {
        // console.log("changed:", data.update)
    },
    async onConnect(data) {
        // console.log(`connect`);
    },
    async onDisconnect(data) {
        // Output some information
        // console.log(`"${data.context.user.name}" has disconnected.`);
        console.log(`"${data}" has disconnected.`);
    },
    extensions: [
        new SQLite({
            database: "store.db",
        }),
    ]
});

// and run it!
server.listen();
