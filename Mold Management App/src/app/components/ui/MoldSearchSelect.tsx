import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { moldsData } from '../../data/mockData';

interface MoldSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  filterInUseOnly?: boolean;
  placeholder?: string;
}

export function MoldSearchSelect({ 
  value, 
  onChange, 
  filterInUseOnly = false,
  placeholder = '请输入或选择模具编号'
}: MoldSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter molds based on search text
  const filteredMolds = moldsData
    .filter((m) => !filterInUseOnly || m.status === '在用')
    .filter((m) => {
      if (!searchText.trim()) return true;
      const search = searchText.toLowerCase();
      return (
        m.moldNumber.toLowerCase().includes(search) ||
        m.products.some(p => p.name.toLowerCase().includes(search)) ||
        m.type.toLowerCase().includes(search)
      );
    });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (moldNumber: string) => {
    onChange(moldNumber);
    setSearchText('');
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const displayValue = isOpen ? searchText : value;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={handleInputClick}
        style={{
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '11px 36px 11px 12px',
            background: '#F3F4F6',
            border: isOpen ? '1.5px solid #1A73E8' : '1.5px solid transparent',
            borderRadius: '10px',
            fontSize: '15px',
            color: value ? '#111827' : '#9CA3AF',
            fontWeight: value ? 600 : 400,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {isOpen ? (
          <Search
            size={16}
            color="#1A73E8"
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none' 
            }}
          />
        ) : (
          <ChevronDown
            size={16}
            color="#9CA3AF"
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none' 
            }}
          />
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '52px',
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 100,
            overflow: 'hidden',
            maxHeight: '240px',
            overflowY: 'auto',
            border: '1px solid #E5E7EB',
          }}
        >
          {filteredMolds.length > 0 ? (
            filteredMolds.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.moldNumber)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  background: value === m.moldNumber ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F3F4F6',
                }}
                onMouseEnter={(e) => {
                  if (value !== m.moldNumber) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== m.moldNumber) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: value === m.moldNumber ? '#1A73E8' : '#111827', 
                      margin: '0 0 2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {m.moldNumber}
                    </p>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#9CA3AF', 
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {m.products[0]?.name}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      marginLeft: '8px',
                      flexShrink: 0,
                      ...(m.type === '模压模具'
                        ? { background: '#EFF6FF', color: '#1A73E8' }
                        : m.type === '口型模具'
                        ? { background: '#ECFDF5', color: '#059669' }
                        : { background: '#FFF7ED', color: '#D97706' }),
                    }}
                  >
                    {m.type}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '14px',
              }}
            >
              <p style={{ margin: 0 }}>未找到匹配的模具</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>请尝试其他关键词</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
