const puppeteer = require('puppeteer');
const $ = require('cheerio');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');

const url = 'https://www.bestbuy.com/site/nvidia-geforce-rtx-3080-10gb-gddr6x-pci-express-4-0-graphics-card-titanium-and-black/6429440.p?skuId=6429440';

async function startTracking() {
  const page = await configureBrowser();
  let job = new CronJob('*/15 * * * * *', function() { //every 15 seconds
    checkInventory(page);
  }, null, false, null, null, false);
  job.start();
}

async function configureBrowser() {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', (request) => {
      if (request.resourceType() === 'document') {
          request.continue();
      } else {
          request.abort();
      }
  });

  await page.goto(url);
  return page;
}

async function checkInventory(page) {
  await page.reload();
  let html = await page.evaluate(() => document.body.innerHTML);

  $('.add-to-cart-button', html).each(function() {
    let stock = $(this).text();
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    console.log("Sold Out" + " " + today.toLocaleTimeString()
    );
    if(stock == 'Add to Cart') {
      sendNotification();
    }
  });
}

async function sendNotification() {
  let transporter = nodemailer.createTransport({
    service: '',
    auth: {
      user: '',
      pass: ''
    }
  });

  let info = await transporter.sendMail({
    from: '"" <>',
    to: "",
    text: `${url}`
  });

  console.log("Message sent");
}

startTracking();