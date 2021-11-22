const Bree = require('bree');
const Graceful = require('@ladjs/graceful');

const bree = new Bree({
    // root: false,
    jobs: [
        {
            name: 'bot',
            // path: path.join(__dirname, ''),
            interval: process.env.CRON_INTERVAL,
        }
    ]
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen;

bree.start();