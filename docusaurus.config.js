// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const projectName = 'binsec-tutorial'
const locationEvent = '@ POPL 2026'
const baseUrl = projectName ? '/' + projectName + '/' : '/'

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'BINSEC',
  tagline: 'Binary code analysis platform',
  favicon: 'img/favicon.ico',
  customFields: {
    locationEvent,
  },

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://binsec.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: baseUrl,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'binsec', // Usually your GitHub org/user name.
  projectName: projectName, // Usually your repo name.

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: locationEvent,
        logo: {
          alt: 'BINSEC',
          src: 'img/binsec_logo.svg',
          srcDark: 'img/binsec_logo_dark.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            href: 'https://github.com/binsec/binsec/blob/master/doc/sse/references.md',
            label: 'Cheatsheet',
            position: 'left'
          },
          /* { to: 'playground', label: 'Playground', position: 'left' }, */
          {
            href: 'https://github.com/binsec/binsec',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Ressources',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/setup',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/binsec/binsec/tree/master/doc',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'People',
                href: 'https://binsec.github.io/#people',
              },
              {
                label: 'X',
                href: 'https://twitter.com/BinsecTool',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'News',
                href: 'https://binsec.github.io/#news',
              },
              {
                label: 'Publications',
                href: 'https://binsec.github.io/publications',
              },
            ],
          },
        ],
        /* copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`, */
      },
      prism: {
        /* theme: prismThemes.github,
        darkTheme: prismThemes.dracula, */
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.oneDark,
        additionalLanguages: ['toml'],
      },
    }),
  clientModules: [
    require.resolve('./src/components/Binsec/Runner.js'),
  ],
  scripts: [
    baseUrl+'coi-serviceworker.min.js',
    baseUrl+'js/client.bc.js',
  ],
};

export default config;
