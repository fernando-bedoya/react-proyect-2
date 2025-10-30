import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import HeaderBootstrap from './HeaderBootstrap';

interface AdaptiveHeaderProps {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}

const AdaptiveHeader = (props: AdaptiveHeaderProps) => {
  const { designLibrary } = useTheme();
  const sidebarOpenBool = Boolean(props.sidebarOpen);

  if (designLibrary === 'bootstrap') {
    return <HeaderBootstrap sidebarOpen={sidebarOpenBool} setSidebarOpen={props.setSidebarOpen} />;
  }

  return <Header sidebarOpen={props.sidebarOpen} setSidebarOpen={props.setSidebarOpen} />;
};

export default AdaptiveHeader;
