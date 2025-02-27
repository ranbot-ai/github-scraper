# GitHub Scraper

This project is a GitHub scraper that uses Puppeteer to extract information about GitHub organizations/users and their repositories.

It collects data such as organization/user details, top languages, and repository information.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ranbot-ai/github-scraper.git
   cd github-scraper
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Set the `PERMALINK` & `WITH_REPOS` environment variable to the GitHub organization/user you want to scrape:

   ```bash
   ➜  github-scraper git:(main) env PERMALINK=ranbot-ai WITH_REPOS=false npx ts-node src/index.ts
   // Organization Info with Repos: {
   name: 'RanBOT Lab',
   picImageURL: 'https://avatars.githubusercontent.com/u/85019129?s=200&v=4',
   description: 'RanBOT uses AI/ML to transform web content into structured data.',
   topLanguages: [ 'TypeScript', 'JavaScript', 'CSS' ],
   followers: 4,
   peopleCount: 1,
   website: 'https://ranbot.online',
   location: 'China',
   socialLinks: [
    'https://linkedin.com/company/ranbot-ai',
    'https://x.com/ranbotai',
    'https://www.tiktok.com/@ranbotai'
   ]
   }
   ```

   ```bash
   ➜  github-scraper git:(main) env PERMALINK=encoreshao WITH_REPOS=false npx ts-node src/index.ts
   // User Info with Repos: {
   name: 'Encore Shao',
   nickname: 'encoreshao',
   picImageURL: 'https://avatars.githubusercontent.com/u/745929?v=4',
   followers: 26,
   following: 35,
   website: 'https://icmoc.com',
   location: 'Shanghai, China',
   currentCompany: 'Ekohe',
   position: 'Engineer Manager | Researcher',
   organizations: [
    {
      name: 'ekohe',
      link: '/ekohe',
      orgImageURL: 'https://avatars.githubusercontent.com/u/1390403?s=64&v=4'
    },
    {
      name: 'ranbot-ai',
      link: '/ranbot-ai',
      orgImageURL: 'https://avatars.githubusercontent.com/u/85019129?s=64&v=4'
    },
    {
      name: '',
      link: '/encoreshao?tab=overview&org=ranbot-ai',
      orgImageURL: 'https://avatars.githubusercontent.com/u/85019129?s=40&v=4'
    },
    {
      name: '',
      link: '/encoreshao?tab=overview&org=ekohe',
      orgImageURL: 'https://avatars.githubusercontent.com/u/1390403?s=40&v=4'
    },
    {
      name: '',
      link: '/encoreshao?tab=overview&org=linktr-ai',
      orgImageURL: 'https://avatars.githubusercontent.com/u/178542156?s=40&v=4'
    }
   ]
   }
   ```

## Features

- Extracts organization/user information including name, description, top languages, employee count, website, and social links.
- Scrapes repository data such as name, link, description, stars, forks, and pull requests.
- Handles pagination to scrape multiple pages of repositories.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
