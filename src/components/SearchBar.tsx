import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SearchResult {
  id: string;
  type: 'device' | 'vulnerability' | 'report' | 'audit';
  title: string;
  subtitle?: string;
  link: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_URL}/api/search`, {
        params: { q: searchQuery },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      // Mock results for development
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'device',
          title: 'Smart Camera 01',
          subtitle: '192.168.1.100',
          link: '/devices/1'
        },
        {
          id: '2',
          type: 'vulnerability',
          title: 'Weak Default Credentials',
          subtitle: 'Critical - Smart Camera 01',
          link: '/vulnerabilities'
        },
        {
          id: '3',
          type: 'report',
          title: 'Security Audit Report',
          subtitle: 'Generated today',
          link: '/reports'
        }
      ];

      setResults(mockResults.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'device': return 'text-cyan-400';
      case 'vulnerability': return 'text-red-400';
      case 'report': return 'text-purple-400';
      case 'audit': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'device': return 'Device';
      case 'vulnerability': return 'Vulnerability';
      case 'report': return 'Report';
      case 'audit': return 'Audit';
      default: return 'Result';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search devices, vulnerabilities, reports... (Ctrl+K)"
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching && (
            <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
          {query && !isSearching && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {results.length === 0 && !isSearching && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No results found for "{query}"</p>
            </div>
          )}

          {results.map(result => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getTypeColor(result.type)}`}>
                  {getTypeLabel(result.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{result.title}</div>
                  {result.subtitle && (
                    <div className="text-gray-400 text-sm truncate">{result.subtitle}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}