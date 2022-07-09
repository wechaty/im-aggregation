import db from "./db";
import Account from "./models/Account";
import Configuration from "./models/Configuration";
import Message from "./models/Message";

db.sync({
    force: true,
});

Account.sync({
    force: true,
});

Message.sync({
    force: true,
});

Configuration.sync({
    force: true,
});
