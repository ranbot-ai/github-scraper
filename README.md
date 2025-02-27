# GitHub Scraper

This project is a GitHub scraper that uses Puppeteer to extract information about GitHub organizations and their repositories. It collects data such as organization details, top languages, and repository information.

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

1. Set the `ORG_NAME` environment variable to the GitHub organization you want to scrape:

   ```bash
   env ORG_NAME=ranbot-ai npx ts-node scraper.ts
   ```

## Features

- Extracts organization information including name, description, top languages, employee count, website, and social links.
- Scrapes repository data such as name, link, description, stars, forks, and pull requests.
- Handles pagination to scrape multiple pages of repositories.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
