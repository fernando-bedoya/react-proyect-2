import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import SidebarBootstrap from './SidebarBootstrap';

interface AdaptiveSidebarProps {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}

const AdaptiveSidebar = (props: AdaptiveSidebarProps) => {
  const { designLibrary } = useTheme();
  const sidebarOpenBool = Boolean(props.sidebarOpen);

  if (designLibrary === 'bootstrap') {
    return <SidebarBootstrap sidebarOpen={sidebarOpenBool} setSidebarOpen={props.setSidebarOpen} />;
  }

  return <Sidebar sidebarOpen={sidebarOpenBool} setSidebarOpen={props.setSidebarOpen} />;
};

export default AdaptiveSidebar;
