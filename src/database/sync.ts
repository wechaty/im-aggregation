import db from "./db";
import Account from "./models/Account";
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
