const puppeteer = require('puppeteer');
const { profiles } = require('./profiles');
const { getRandomHero } = require('./heroes');

const sorteios = [
  {
    description: "320 green",
    url: "https://www.instagram.com/p/CL14Hb5JKL_/",
    responseUrl: "https://www.instagram.com/web/comments/2519166368174351103/add/"
  }
];

// https://www.instagram.com/p/CMrx29fhsaV/?igshid=dh5dwaavi87g

const BLACKLIST = [];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const initBrowser = async () => {
  // Starting browser
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(120000);

  await page.setRequestInterception(true);
  page.on('request', (request) => {
      if (['image'].indexOf(request.resourceType()) !== -1) {
          request.abort();
      } else {
          request.continue();
      }
  });

  return { browser, page };
};

const login = async (profile, page) => {
  // Login flow
  await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', profile.name, { delay: 100 });
  await page.type('input[name="password"]', profile.password, { delay: 100 });
  await page.click('button[type="submit"]');

  // Waiting for page to refresh
  await page.waitForNavigation();
}

const comment = async (profile, page, sorteio) => {
  await page.goto(sorteio.url, { timeout: 120000 });
  await page.waitForSelector('textarea');
  await page.type('textarea', `${getRandomHero()} @polarblack_ff`, { delay: 100 });
  await page.click('button[type="submit"]');

  page.on('response', async (response) => {
    if (response && response.url() === sorteio.responseUrl){
      const jsonResponse = await response.json();

      if (jsonResponse.status === 'ok') {
        // console.log(`[${sorteio.description}] - ${profile.name} - ${jsonResponse.status} (${new Date()})`);
      } else {
        BLACKLIST.push(profile.name)
        console.log(`[${sorteio.description}] - ${profile.name} - ${jsonResponse.status} - ${jsonResponse.message} [added to blacklist]`);
        // await browser.close();
      }
    }
  });
};

const run = async (profile) => {
  const { browser, page } = await initBrowser();

  try {
    await login(profile,page);

    let runing = true;
    let count = 1;

    while(runing) {
      if(!BLACKLIST.includes(profile.name)) {
        console.log(`\n[${count}] START ${profile.name}`);
        await comment(profile, page, sorteios[0]);
        await sleep(profile.tryin);

        count ++;
      } else {
        runing = false;
      }
    }
  } catch (error) {
    console.log('error: ', error);
    await browser.close();
  }
};

process.setMaxListeners(0);


run(profiles[0]);  // ivoneijr
run(profiles[1]);  // polarblack_ff
run(profiles[2]);  // oultimocoupe
run(profiles[3]);  // sokazin
run(profiles[4]);  // pugrc206
run(profiles[5]);  // insta01.ivoneijr
run(profiles[6]);  // insta02.ivoneijr
run(profiles[7]);  // sort1.ivoneijr
run(profiles[8]);  // sort2.ivoneijr
run(profiles[9]);  // sort3.ivoneijr
run(profiles[10]); // sort4.ivoneijr
run(profiles[11]); // sort5.ivoneijr
