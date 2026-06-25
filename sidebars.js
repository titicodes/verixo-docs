/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'quickstart',
      label: '⚡ Quick Start',
    },
    {
      type: 'doc',
      id: 'authentication',
      label: '🔐 Authentication',
    },
    {
      type: 'category',
      label: '📚 Examples',
      collapsed: false,
      items: [
        { type: 'doc', id: 'examples/node',   label: 'Node.js' },
        { type: 'doc', id: 'examples/python', label: 'Python' },
        { type: 'doc', id: 'examples/php',    label: 'PHP' },
        { type: 'doc', id: 'examples/otp',    label: 'Full OTP Flow' },
        { type: 'doc', id: 'examples/esim',   label: 'eSIM Provisioning' },
      ],
    },
  ],
};

module.exports = sidebars;
