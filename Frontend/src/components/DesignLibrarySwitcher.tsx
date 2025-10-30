import { useTheme, DesignLibrary } from '../context/ThemeContext';
import { Palette } from 'lucide-react';

const DesignLibrarySwitcher = () => {
  const { designLibrary, setDesignLibrary } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDesignLibrary(e.target.value as DesignLibrary);
  };

  // Si está usando Bootstrap
  if (designLibrary === 'bootstrap') {
    return (
      <div className="d-flex align-items-center gap-2">
        <Palette size={20} style={{ color: '#10b981' }} />
        <select
          value={designLibrary}
          onChange={handleChange}
          className="form-select form-select-sm shadow-sm"
          style={{ 
            width: 'auto', 
            minWidth: '140px',
            fontSize: '0.875rem',
            borderColor: '#10b981',
          }}
        >
          <option value="tailwind">Tailwind CSS</option>
          <option value="bootstrap">Bootstrap</option>
        </select>
      </div>
    );
  }

  // Si está usando Tailwind
  return (
    <div className="flex items-center gap-2">
      <Palette size={20} className="text-primary" />
      <select
        value={designLibrary}
        onChange={handleChange}
        className="rounded border border-stroke bg-white py-1.5 px-3 text-sm font-medium text-black shadow-sm outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white dark:focus:border-primary"
        style={{ minWidth: '140px' }}
      >
        <option value="tailwind">Tailwind CSS</option>
        <option value="bootstrap">Bootstrap</option>
      </select>
    </div>
  );
};

export default DesignLibrarySwitcher;
