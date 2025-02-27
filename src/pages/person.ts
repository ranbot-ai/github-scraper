import { Page } from "puppeteer";
import { IOrgRepoInfo, IUserInfo } from "../../types";

async function scrapeGitHubUser(
  page: Page,
  userName: string,
  withRepositories: boolean
) {
  const userInfo = await getUserInfo(page);
  if (withRepositories) {
    userInfo.repositories = await scrapeAllRepos(userName, page);
    userInfo.totalRepositoriesCount = userInfo.repositories.length;
  }

  console.log("// User Info with Repos:", userInfo);
}

async function getUserInfo(page: Page): Promise<IUserInfo> {
  return await page.evaluate(() => {
    const name =
      document
        .querySelector("div.application-main main h1.vcard-names span.p-name")
        ?.textContent?.trim() || "";
    const nickname =
      document
        .querySelector(
          "div.application-main main h1.vcard-names span.p-nickname"
        )
        ?.textContent?.trim() || "";
    const picImageURL =
      document
        .querySelector("div.application-main main a img.avatar-user")
        ?.getAttribute("src") || "";
    const followers =
      parseInt(
        document
          .querySelector('a[href$="tab=followers"] span')
          ?.textContent?.trim() || ""
      ) || 0;
    const following =
      parseInt(
        document
          .querySelector('a[href$="tab=following"] span')
          ?.textContent?.trim() || ""
      ) || 0;
    const location =
      document
        .querySelector('li[itemprop="homeLocation"]')
        ?.textContent?.trim() || "";
    const website =
      document.querySelector('li[itemprop="url"] a')?.getAttribute("href") ||
      "";
    const currentCompany =
      document.querySelector('li[itemprop="worksFor"]')?.textContent?.trim() ||
      "";
    const position =
      document
        .querySelector("div.user-profile-bio > div")
        ?.textContent?.trim() || "";
    const organizations = Array.from(
      document.querySelectorAll(
        "div.border-top a[data-hovercard-type='organization']"
      )
    ).map((org: any): { name: string; link: string; orgImageURL: string } => ({
      name: org.getAttribute("aria-label") || "",
      link: org.getAttribute("href") || "",
      orgImageURL: org.querySelector("img").getAttribute("src") || "",
    }));

    return {
      name,
      nickname,
      picImageURL,
      followers,
      following,
      website,
      location,
      currentCompany,
      position,
      organizations,
    };
  });
}

async function scrapeAllRepos(
  userName: string,
  page: Page
): Promise<IOrgRepoInfo[]> {
  const allRepos: IOrgRepoInfo[] = [];
  let pageNumber = 1;
  const MAX_PAGES = 50;

  while (pageNumber <= MAX_PAGES) {
    await page.goto(
      pageNumber === 1
        ? `https://github.com/${userName}?tab=repositories`
        : `https://github.com/${userName}?page=${pageNumber}&tab=repositories`,
      {
        waitUntil: "networkidle2",
      }
    );

    console.log(`// Scraping repositories with page ${pageNumber}...`);

    const pageRepos = await page.evaluate((): IOrgRepoInfo[] => {
      const cleanText = (el?: Element | null) =>
        el?.textContent?.replace(/\s+/g, " ").trim();

      return Array.from(
        document.querySelectorAll("li[itemtype='http://schema.org/Code']")
      ).map((repo) => ({
        name: cleanText(repo.querySelector("h3 a")) || "",
        link: repo.querySelector("h3 a")?.getAttribute("href") || "",
        description: cleanText(repo.querySelector('p[itemprop="description"]')),
        programmingLanguage: cleanText(
          repo.querySelector('span[itemprop="programmingLanguage"]')
        ),
        stars: cleanText(repo.querySelector('a[href$="/stargazers"]')),
        forks: cleanText(repo.querySelector('a[href$="/forks"]')),
      }));
    });

    allRepos.push(...pageRepos.filter((r) => r.name));

    const nextPage = await page.$('a[rel="next"]');
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

export { scrapeGitHubUser };
