// @ts-check
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Edge Master',
  tagline: 'A lightweight framework for the edges',
  url: 'https://em.asanflow.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'sharif3271',
  projectName: 'edge-master',
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
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/sharif3271/edge-master/tree/main/docs',
          docItemComponent: require.resolve('./src/components/CustomDocItem/index.tsx'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    'docusaurus-plugin-sass',
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
      },
      navbar: {
        title: '',
        logo: {
          alt: 'edge master',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/', label: 'Home', position: 'left'},
          {type: 'doc', docId: 'index', position: 'left', label: 'Docs'},
          // {to: '/Contact', label: 'Contact Us', position: 'left'},
          {
            href: 'https://github.com/Sharif3271/edge-master',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/edge-master',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/sharif3271/edge-master',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} EdgeMaster. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  stylesheets: [
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=block',
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=block'
  ],
};

module.exports = config;
