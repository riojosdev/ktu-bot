const { Telegraf } = require('telegraf');
const puppeteer = require('puppeteer');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN); 

const pgp = require('pg-promise')();
const cn = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
}
const db = pgp(cn);

bot.start(async (ctx) => {
    scraper()
    .then((scraped) => {
        formatter(scraped[0])
        .then((format) => {
            insertDBRow(format)
            .then(sendMess(ctx, format))
            .catch((err) => {
                console.log(err);
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });
});

bot.launch();

async function scraper() {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto(process.env.KTU_URL, { waitUntil: 'load', timeout: 0 });

    const content = await page.evaluate(() => {
        let data = [];

        let rows = document.querySelectorAll('.ktu-news tr');

        rows.forEach((row) => {
            if (row.innerText.includes('MBA')) {
                let linkList = [];
                let section = row.innerText;
                if (row.querySelectorAll('a').length > 0) {
                    const links = row.querySelectorAll('a');
                    links.forEach((link) => {
                        linkList.push(link.href);
                    })
                } else {
                    linkList.push("No Links Provided/Founded! Please confirm with official website or admin");
                }
                data.push({
                    section,
                    linkList
                });
            }
        });
        return data;
    });

    // ? output first 10 items in content (JSON format)
    let onlyTen = [];
    for (let i = 0; i < content.length; i++) {
        await onlyTen.push(JSON.stringify(content[i]));
    }

    let objecto = [];
    await extractor(onlyTen, objecto);
    await browser.close();
    return objecto;
}

async function extractor(input, output) {
    let day = [];
    let month = [];
    let year = [];
    let heading = [];
    let details = [];
    let tags = [];
    let links = [];

    for (let i = 0; i < input.length; i++) {
        const date_N_body = input[i].split('\\n\\t\\n');
        const date = date_N_body[0].replace('{"section":"', '').split('\\n') // TODO: COULD BE AVOIDED

        const body_N_links = date_N_body[1].split('","linkList":["');
        const body_N_tags = body_N_links[0].split('\\n\\n');
        const body = body_N_tags[0];
        let tagList = [];
        for (let j = 1; j < body_N_tags.length; j++) {
            tagList.push(body_N_tags[j])
        }
        if (body.includes('\\n')) {
            const heading_N_details = body.split('\\n')
            heading.push(heading_N_details[0]);
            details.push(heading_N_details[1]);
        } else {
            heading.push(body);
            details.push(' --- ');
        }
        if (body_N_links[1].includes('","http')) {
            links.push(body_N_links[1].replace('"]}', '').split('","'));
        } else {
            links.push([body_N_links[1].replace('"]}', '')]);
        }

        tags.push(tagList);
        month.push(date[0]);
        day.push(date[1]);
        year.push(date[2]);
    }

    // ? store values to object
    for (let i = 0; i < input.length; i++) {
        output.push({ day: day[i], month: month[i], year: year[i], heading: heading[i], details: details[i], tags: tags[i], links: links[i] });
    }
}

async function formatter(input) {
    let output = await `🔔 <b>${input.day} ${input.month.toUpperCase()} ${input.year}</b>\n\n<b><u>${input.heading}</u></b>\n\n${input.details}\n`;

    for (let i = 0; i < input.links.length; i++) {
        if (input.links[i] === "No Links Provided/Founded! Please confirm with official website or admin") {
            const element = await `\n🔗 <b>No Links Provided/Founded! Please confirm with official website or admin.</b>`;
            output = output.concat(element);
        } else {
            const element = await `\n🔗 <b><a href="${input.links[i]}">${input.tags[i]}</a></b>`;
            output = output.concat(element);
        }
    }
    return output;
}

async function insertDBRow(format) {
    db.none('INSERT INTO announcements(MESSAGE, DATE) VALUES($1, $2)', [format, 'NOW()'])
    .then(() => {
        // success;
        console.log('success!');
    })
    .catch((error) => {
        // error;
        throw error;
    });
    
    return;
}

async function sendMess(ctx, format) {
    await ctx.telegram.sendMessage(ctx.message.chat.id, format, { parse_mode: 'HTML' });
    console.log(ctx.message.chat.id);
}