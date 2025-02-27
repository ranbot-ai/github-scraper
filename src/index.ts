import puppeteer from "puppeteer";
import { scrapeGitHubOrg } from "./pages/organization";
import { scrapeGitHubUser } from "./pages/person";

// Example usage
const permalink = process.env.PERMALINK;
const withRepositories = process.env.WITH_REPOS === "true";

async function scrapeOrganization() {
  if (permalink) {
    const browser = await puppeteer.launch({ headless: true });

    try {
      const page = await browser.newPage();

      await page.goto(`https://github.com/${permalink}`, {
        waitUntil: "networkidle2",
      });

      const isOrg: boolean = await page.evaluate(() => {
        return document.querySelector(
          "div.application-main main div[itemtype='http://schema.org/Organization']"
        )
          ? true
          : false;
      });

      if (isOrg) {
        await scrapeGitHubOrg(page, permalink, withRepositories);
      } else {
        await scrapeGitHubUser(page, permalink, withRepositories);
      }
      await page.close();
    } catch (error) {
      console.error("// Error scraping GitHub:", error);
    } finally {
      await browser.close();
    }
  } else {
    console.error("// PERMALINK environment variable is not defined.");
  }
}

scrapeOrganization();
