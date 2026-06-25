// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'VerifiedCore Docs',
  tagline: 'OTP delivery · eSIM provisioning · calling — first API call in 5 minutes',
  favicon: 'img/favicon.ico',

  // GitHub Pages URL — update organizationName/projectName to match your repo
  url: 'https://titicodes.github.io',
  baseUrl: '/verixo-docs/',
  organizationName: 'titicodes',
  projectName: 'verixo-docs',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

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
          // Serve docs at root so /quickstart, /authentication, etc. work
          routeBasePath: '/',
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
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'VerifiedCore',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://verifiedcore.com',
            label: 'Platform',
            position: 'right',
          },
          {
            href: 'https://github.com/titicodes',
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
              { label: 'Quick Start', to: '/quickstart' },
              { label: 'Authentication', to: '/authentication' },
              { label: 'Node.js Example', to: '/examples/node' },
              { label: 'OTP Guide', to: '/examples/otp' },
              { label: 'eSIM Guide', to: '/examples/esim' },
            ],
          },
          {
            title: 'Platform',
            items: [
              { label: 'Dashboard', href: 'https://verifiedcore.com/dashboard' },
              { label: 'Sandbox', href: 'https://verifiedcore.com/sandbox' },
              { label: 'Status', href: 'https://verifiedcore.com/status' },
              { label: 'Live API Reference', href: 'https://api.verifiedcore.com/swagger-ui.html' },
            ],
          },
          {
            title: 'SDKs',
            items: [
              { label: 'npm — @verixo/sdk', href: 'https://www.npmjs.com/package/@verixo/sdk' },
              { label: 'PyPI — verixo', href: 'https://pypi.org/project/verixo' },
              { label: 'Packagist — verixo/sdk', href: 'https://packagist.org/packages/verixo/sdk' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} VerifiedCore. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['php', 'java', 'bash', 'json', 'python'],
      },
    }),
};

module.exports = config;
