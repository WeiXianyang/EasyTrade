import { useState } from 'react';

export default function FancySearch({ onSearch, placeholder }) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  return (
    <div className="fancy-search-container">
      <input
        className="fancy-search-input"
        placeholder={placeholder || '搜索...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
