const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch(
		{
			headless: false,
			slowMo: 25,
			defaultViewport: null,  // for maximized view of webpage
			args: ['--start-maximized'] // for maximized view of browser
		}
	);

	const page = await browser.newPage();
	await page.goto('https://hackerrank.com', { waitUntil: 'networkidle2' });

	await page.waitForSelector("a[data-event-action='Login']");
	await page.click("[data-event-action='Login']");

	await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
	await page.click('a[href="https://www.hackerrank.com/login"]');

	await page.waitForSelector("#input-1");
	await page.focus("#input-1");

	let JsonData = fs.readFileSync('credential.json', 'utf-8');
	let credential = JSON.parse(JsonData);

	await page.keyboard.type(credential.user_id);

	await page.waitForSelector("#input-2");
	await page.focus("#input-2");
	await page.keyboard.type(credential.password);

	await page.waitForSelector('button[data-analytics="LoginPassword"]');
	await page.click('button[data-analytics="LoginPassword"]');

	await page.waitForSelector('.nav-link.contests');
	await page.click('.nav-link.contests');

	await page.waitForSelector('.text-link.filter-item');
	await page.click('.text-link.filter-item');

	let curls = [];

	await page.waitForSelector('a.backbone.block-center');
	curls = await page.$$eval('a.backbone.block-center', function (atags) {
		let urls = [];

		for (let i = 0; i < atags.length; i++) {
			let url = atags[i].getAttribute("href");
			urls.push(url);
		}

		return urls;
	});

	console.log(curls);
	
	let initURL = 'https://hackerrank.com';

	for(let i = 0; i < curls.length; i++){
		let orgURL = initURL + curls[i];
		console.log(orgURL);
		let contestPage = await browser.newPage();
		await contestPage.goto(orgURL);
		await contestPage.bringToFront();

		await contestPage.waitForSelector("li[data-tab='moderators']");
		await contestPage.click("li[data-tab='moderators']");

		await contestPage.waitForSelector("#moderator");
		await contestPage.focus("#moderator");
		await contestPage.keyboard.type(credential.moderator);

		await contestPage.waitForSelector(".moderator-save");
		await contestPage.click('.moderator-save');
		await page.waitFor(2000);
		await contestPage.close();
	}

	// await browser.close();
})();
