import { useState } from 'react';
import AdaptiveHeader from '../components/AdaptiveHeader';
import AdaptiveSidebar from '../components/AdaptiveSidebar';
import { Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { useTheme } from '../context/ThemeContext';

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { designLibrary } = useTheme();

  // Estilos condicionales basados en la librería
  const wrapperClasses = designLibrary === 'bootstrap' 
    ? 'min-vh-100 d-flex' 
    : 'dark:bg-boxdark-2 dark:text-bodydark';

  const layoutClasses = designLibrary === 'bootstrap'
    ? 'd-flex w-100 vh-100 overflow-hidden'
    : 'flex h-screen overflow-hidden';

  const contentClasses = designLibrary === 'bootstrap'
    ? 'position-relative d-flex flex-column flex-fill overflow-auto'
    : 'relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden';

  const mainClasses = designLibrary === 'bootstrap'
    ? 'flex-fill p-3 p-md-4'
    : 'mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10';

  return (
    <Provider store={store}>
      <div className={wrapperClasses}>
        {/* <!-- ===== Page Wrapper Start ===== --> */}
        <div className={layoutClasses}>
          {/* <!-- ===== Sidebar Start ===== --> */}
          
          <AdaptiveSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* <!-- ===== Content Area Start ===== --> */}
          <div className={contentClasses}>
            {/* <!-- ===== Header Start ===== --> */}
            <AdaptiveHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Header End ===== --> */}

            {/* <!-- ===== Main Content Start ===== --> */}
            <main>
              <div className={mainClasses}>
                <Outlet />
              </div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </div>
    </Provider>
  );
};

export default DefaultLayout;
