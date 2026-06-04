const easyTradeTheme = {
  token: {
    colorPrimary: '#f04f3e',
    colorInfo: '#256d5a',
    colorSuccess: '#2f9e44',
    colorWarning: '#d99a1b',
    colorText: '#1f2933',
    colorBgLayout: '#f6f7f9',
    borderRadius: 8,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    controlHeight: 40,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      primaryShadow: '0 8px 20px rgba(240, 79, 62, 0.18)',
    },
    Card: {
      borderRadiusLG: 8,
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
      itemBorderRadius: 8,
      itemSelectedBg: '#fff1ee',
      itemSelectedColor: '#f04f3e',
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export default easyTradeTheme;
