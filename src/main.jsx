import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import './index.css';
import './theme/theme.css';

import { RouterProvider } from 'react-router';
import router from './router';
import { AppProvider } from './contexts/AppProvider.jsx';
import easyTradeTheme from './theme/easyTradeTheme.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={easyTradeTheme}>
      <AntApp>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
