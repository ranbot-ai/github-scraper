import puppeteer, { Page } from "puppeteer";

async function scrapeGitHubOrg(orgName: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the organization's page
    await page.goto(`https://github.com/${orgName}`, {
      waitUntil: "networkidle2",
    });
    let orgInfo: any = {};
    const cleanText = (el?: Element | null) =>
      el?.textContent?.replace(/\s+/g, " ").trim();

    // Extract organization information
    const baseInfo = await page.evaluate(() => {
      const name =
        document
          .querySelector("div.application-main main header h1")
          ?.textContent?.trim() || "";
      const description =
        document
          .querySelector("div.application-main main header h1 + div div")
          ?.textContent?.trim() || "";
      const topLanguages = Array.from(
        document.querySelectorAll('a[href$="?language="]')
      ).map((lang) => lang.textContent);
      const employeesCount =
        parseInt(
          document
            .querySelector('a[href$="/people"]')
            ?.textContent?.trim()
            ?.replace(/[^\d]/g, "") || "0"
        ) || 0;
      const website =
        document.querySelector('a[href^="http"]')?.getAttribute("href") || "";
      const socialLinks = Array.from(
        document.querySelectorAll('a[href^="http"]')
      )
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && !href.includes("github.com"));

      return {
        name,
        description,
        topLanguages,
        employeesCount,
        website,
        socialLinks,
      };
    });

    orgInfo = { ...baseInfo };

    await scrapeAllRepos(orgName, page).then(
      (repos) => (orgInfo.repositories = repos)
    );

    orgInfo.totalRepositoriesCount = orgInfo.repositories.length;

    await page.close();

    console.log("Organization Info with Repos:", orgInfo);
  } catch (error) {
    console.error("Error scraping GitHub:", error);
  } finally {
    await browser.close();
  }
}

interface RepoData {
  name: string;
  link: string;
  about?: string;
  stars?: string;
  forks?: string;
  docsPulls?: string;
}

async function scrapeAllRepos(orgName: string, page: Page) {
  const allRepos: RepoData[] = [];
  let pageNumber = 1;
  const MAX_PAGES = 50; // 安全防护防止无限循环

  try {
    while (pageNumber <= MAX_PAGES) {
      // Navigate to the repositories page
      await page.goto(
        pageNumber == 1
          ? `https://github.com/orgs/${orgName}/repositories`
          : `https://github.com/orgs/${orgName}/repositories?page=${pageNumber}`,
        {
          waitUntil: "networkidle2",
        }
      );

      console.log(`正在抓取第 ${pageNumber} 页...`);

      // 提取当前页数据
      const pageRepos = await page.evaluate((): RepoData[] => {
        const cleanText = (el?: Element | null) =>
          el?.textContent?.replace(/\s+/g, " ").trim();

        return Array.from(
          document.querySelectorAll(
            "ul[data-listview-component='items-list'] li"
          )
        ).map((repo) => ({
          name: cleanText(repo.querySelector("h4 a")) || "",
          link: repo.querySelector("h4 a")?.getAttribute("href") || "",
          about: cleanText(repo.querySelector('div[class^="Description-"]')),
          stars: cleanText(repo.querySelector('a[href$="/stargazers"]')),
          forks: cleanText(repo.querySelector('a[href$="/forks"]')),
          docsPulls: cleanText(repo.querySelector('a[href$="/docs/pulls"]')),
        }));
      });

      allRepos.push(...pageRepos.filter((r: { name: string }) => r.name));

      // 尝试翻页
      const nextPage = await page.$(
        'a[rel="next"]:not([aria-disabled="true"])'
      );
      if (!nextPage) break;

      // 带重试机制的点击
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
  } catch (error) {
    console.error("抓取中断:", error);
  }

  console.log(`共抓取 ${allRepos.length} 个仓库`);
  return allRepos;
}

// Example usage
const orgName = process.env.ORG_NAME;
if (orgName) {
  scrapeGitHubOrg(orgName);
} else {
  console.error("ORG_NAME environment variable is not defined.");
}
