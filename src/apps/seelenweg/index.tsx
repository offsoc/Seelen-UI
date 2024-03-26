import { wrapConsole } from '../ConsoleWrapper';
import { registerDocumentEvents, setWindowSize } from './events';
import { SeelenWeg } from './modules/bar';
import { emitTo } from '@tauri-apps/api/event';
import { ConfigProvider, theme } from 'antd';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { loadStore, registerStoreEvents, store } from './modules/shared/store/infra';

import './styles/colors.css';
import './styles/reset.css';
import './styles/global.css';

async function Main() {
  wrapConsole();
  setWindowSize();
  await registerStoreEvents();
  await loadStore();
  registerDocumentEvents();

  const WrappedRoot = () => {
    useEffect(() => {
      emitTo('seelenweg-hitbox', 'init');
    }, []);

    return (
      <Provider store={store}>
        <ConfigProvider
          componentSize="small"
          theme={{
            algorithm: window.matchMedia('(prefers-color-scheme: dark)').matches
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
          }}
        >
          <SeelenWeg />
        </ConfigProvider>
      </Provider>
    );
  };

  const container = document.getElementById('root') || document.body;
  createRoot(container).render(<WrappedRoot />);
}

Main();
