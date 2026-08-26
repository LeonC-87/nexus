// Fixed v0.1 navigation - see docs/NAV_STRUCTURE.md. Top-level nav is a
// product-shell decision, not a statement of technical module ownership
// (Core workspaces vs installable Modules, per Nexus Product Discovery).

export interface NavItem {
  id: string
  label: string
  path: string
  description: string
}

export const coreWorkspaces: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/overview',
    description:
      "High-level orientation point for the Nexus instance and the wider context Nexus eventually understands."
  },
  {
    id: 'today',
    label: 'Today',
    path: '/today',
    description: "The user's current-day focus surface for what matters now."
  },
  {
    id: 'inbox',
    label: 'Inbox',
    path: '/inbox',
    description:
      'Central entry and attention point for things arriving in Nexus or requiring review/routing.'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    description:
      'Configuration centre for the Nexus installation, user preferences, modules, integrations and application behaviour.'
  }
]

export const modules: NavItem[] = [
  {
    id: 'personal',
    label: 'Personal',
    path: '/modules/personal',
    description: "Optional domain module for the user's personal/life information and organisation."
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/modules/projects',
    description: "Optional domain module for organising and understanding the user's projects."
  },
  {
    id: 'device',
    label: 'Device',
    path: '/modules/device',
    description:
      'Workspace for understanding and controlling the device/environment on which Nexus is operating.'
  },
  {
    id: 'security',
    label: 'Security',
    path: '/modules/security',
    description: 'Workspace for Nexus security, access, permissions and trust-related controls.'
  },
  {
    id: 'email',
    label: 'Email',
    path: '/modules/email',
    description: "Optional domain module for the user's email and messaging."
  },
  {
    id: 'testing',
    label: 'Testing',
    path: '/modules/testing',
    description: 'Workspace for testing and trying out in-progress Nexus features.'
  }
]
