import puppeteer, { Page } from "puppeteer";

interface OrgInfo {
  name: string;
  description: string;
  topLanguages: string[];
  peopleCount: number;
  followers: number;
  location: string;
  website: string;
  socialLinks: string[];
  repositories?: RepoData[];
  totalRepositoriesCount?: number;
}

interface RepoData {
  name: string;
  link: string;
  about?: string;
  stars?: string;
  forks?: string;
  docsPulls?: string;
}

async function scrapeGitHubOrg(orgName: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const orgInfo = await getOrgInfo(orgName, page);
    orgInfo.repositories = await scrapeAllRepos(orgName, page);
    orgInfo.totalRepositoriesCount = orgInfo.repositories.length;

    console.log("// Organization Info with Repos:", orgInfo);
  } catch (error) {
    console.error("// Error scraping GitHub:", error);
  } finally {
    await browser.close();
  }
}

async function getOrgInfo(orgName: string, page: Page): Promise<OrgInfo> {
  await page.goto(`https://github.com/${orgName}`, {
    waitUntil: "networkidle2",
  });

  return await page.evaluate(() => {
    const name =
      document
        .querySelector("div.application-main main header h1")
        ?.textContent?.trim() || "";
    const description =
      document
        .querySelector("div.application-main main header h1 + div div")
        ?.textContent?.trim() || "";
    const topLanguages = Array.from(
      document.querySelectorAll(
        "a > span > span[itemprop='programmingLanguage']"
      )
    )
      .map((lang) => lang.textContent)
      .filter((lang): lang is string => lang !== null);
    const followers =
      parseInt(
        document
          .querySelector('a[href$="/followers"]')
          ?.textContent?.trim()
          ?.replace(/[^\d]/g, "") || "0"
      ) || 0;
    const peopleCount =
      parseInt(
        document
          .querySelector('a[href$="/people"]')
          ?.textContent?.trim()
          ?.replace(/[^\d]/g, "") || "0"
      ) || 0;
    const location =
      document
        .querySelector('li span[itemprop="location"]')
        ?.textContent?.trim() || "";
    const website =
      document
        .querySelector('li a[href^="http"][itemprop="url"]')
        ?.getAttribute("href") || "";
    const socialLinks = Array.from(
      document.querySelectorAll(
        'a[href^="http"].Link--primary:not([itemprop="url"])'
      )
    )
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => href !== null)
      .filter((href) => href && !href.includes("github.com"));

    return {
      name,
      description,
      topLanguages,
      followers,
      peopleCount,
      website,
      location,
      socialLinks,
    };
  });
}

async function scrapeAllRepos(
  orgName: string,
  page: Page
): Promise<RepoData[]> {
  const allRepos: RepoData[] = [];
  let pageNumber = 1;
  const MAX_PAGES = 50;

  while (pageNumber <= MAX_PAGES) {
    await page.goto(
      pageNumber === 1
        ? `https://github.com/orgs/${orgName}/repositories`
        : `https://github.com/orgs/${orgName}/repositories?page=${pageNumber}`,
      {
        waitUntil: "networkidle2",
      }
    );

    console.log(`// Scraping page ${pageNumber}...`);

    const pageRepos = await page.evaluate((): RepoData[] => {
      const cleanText = (el?: Element | null) =>
        el?.textContent?.replace(/\s+/g, " ").trim();

      return Array.from(
        document.querySelectorAll("ul[data-listview-component='items-list'] li")
      ).map((repo) => ({
        name: cleanText(repo.querySelector("h4 a")) || "",
        link: repo.querySelector("h4 a")?.getAttribute("href") || "",
        about: cleanText(repo.querySelector('div[class^="Description-"]')),
        stars: cleanText(repo.querySelector('a[href$="/stargazers"]')),
        forks: cleanText(repo.querySelector('a[href$="/forks"]')),
        docsPulls: cleanText(repo.querySelector('a[href$="/docs/pulls"]')),
      }));
    });

    allRepos.push(...pageRepos.filter((r) => r.name));

    const nextPage = await page.$('a[rel="next"]:not([aria-disabled="true"])');
    if (!nextPage) break;

    let retries = 3;
    while (retries--) {
      try {
        await Promise.all([
          nextPage.click(),
          page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: 15000,
          }),
        ]);
        pageNumber++;
        break;
      } catch (err) {
        if (retries === 0) throw err;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(`// Total repositories scraped: ${allRepos.length}`);
  return allRepos;
}

// Example usage
const orgName = process.env.ORG_NAME;
if (orgName) {
  scrapeGitHubOrg(orgName);
} else {
  console.error("// ORG_NAME environment variable is not defined.");
}
