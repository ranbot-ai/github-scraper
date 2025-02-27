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
   env PERMALINK=ranbot-ai WITH_REPOS=true npx ts-node src/index.ts
   env PERMALINK=encoreshao WITH_REPOS=true npx ts-node src/index.ts
   ```

## Features

- Extracts organization/user information including name, description, top languages, employee count, website, and social links.
- Scrapes repository data such as name, link, description, stars, forks, and pull requests.
- Handles pagination to scrape multiple pages of repositories.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
