import { theme as antTheme } from 'antd';

const sharedTokens = {
  colorPrimary: '#f04f3e',
  colorInfo: '#256d5a',
  colorSuccess: '#2f9e44',
  colorWarning: '#d99a1b',
  borderRadius: 8,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  controlHeight: 40,
};

const sharedComponents = {
  Button: {
    borderRadius: 8,
    controlHeight: 40,
  },
  Card: {
    borderRadiusLG: 8,
  },
  Menu: {
    itemBorderRadius: 8,
    itemSelectedColor: '#f04f3e',
  },
  Tag: {
    borderRadiusSM: 6,
  },
};

/** 亮色主题 */
export const lightTheme = {
  token: {
    ...sharedTokens,
    colorText: '#1f2933',
    colorTextSecondary: '#64748b',
    colorBgLayout: '#f6f7f9',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#eef1f4',
    colorBorderSecondary: '#edf1f5',
  },
  components: {
    ...sharedComponents,
    Button: {
      ...sharedComponents.Button,
      primaryShadow: '0 8px 20px rgba(240, 79, 62, 0.18)',
    },
    Card: {
      ...sharedComponents.Card,
      boxShadowTertiary: '0 10px 26px rgba(31, 41, 51, 0.08)',
    },
    Table: {
      headerBg: '#f7f9fb',
      headerColor: '#334155',
      rowHoverBg: '#fff7f5',
    },
    Form: {
      labelColor: '#334155',
    },
    Menu: {
      ...sharedComponents.Menu,
      itemSelectedBg: '#fff1ee',
    },
  },
};

/** 暗色主题 */
export const darkTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    ...sharedTokens,
    colorText: '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    colorBgLayout: '#0f172a',
    colorBgContainer: '#1e293b',
    colorBgElevated: '#1e293b',
    colorBorder: '#334155',
    colorBorderSecondary: '#334155',
  },
  components: {
    ...sharedComponents,
    Button: {
      ...sharedComponents.Button,
      primaryShadow: '0 8px 20px rgba(240, 79, 62, 0.25)',
    },
    Card: {
      ...sharedComponents.Card,
      boxShadowTertiary: '0 10px 26px rgba(0, 0, 0, 0.3)',
    },
    Table: {
      headerBg: '#1a2332',
      headerColor: '#e2e8f0',
      rowHoverBg: '#253349',
    },
    Form: {
      labelColor: '#e2e8f0',
    },
    Menu: {
      ...sharedComponents.Menu,
      itemSelectedBg: '#3b1f1a',
    },
  },
};

export default lightTheme;
