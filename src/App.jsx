import React, { useState, useEffect, createContext, useContext } from 'react';
import { Camera, User, Lock, Bell, Plus, Trash2, Edit, Eye, LogOut, Check, X, Calendar, FileText, Home, BarChart2, Menu, Moon, Sun } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import MDEditor from '@uiw/react-md-editor';

// ==================== API Configuration ====================
// Gunakan relative path untuk proxy, atau fallback ke env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ==================== API Functions ====================
const api = {
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  async register(username, password) {
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async getBoards() {
    const res = await fetch(`${API_BASE_URL}/api/boards`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return res.json();
  },

  async createBoard(board) {
    const res = await fetch(`${API_BASE_URL}/api/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(board)
    });
    return res.json();
  },

  async updateBoard(id, board) {
    const res = await fetch(`${API_BASE_URL}/api/boards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(board)
    });
    return res.json();
  },

  async deleteBoard(id) {
    const res = await fetch(`${API_BASE_URL}/api/boards/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return res.json();
  },

  async getBoard(id) {
    const res = await fetch(`${API_BASE_URL}/api/boards/${id}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return res.json();
  },

  async createLog(boardId, actions) {
    const res = await fetch(`${API_BASE_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ boardId, actions })
    });
    return res.json();
  },

  async getBoardLogs(boardId) {
    const res = await fetch(`${API_BASE_URL}/api/logs/${boardId}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return res.json();
  },

  async getNotifications(boardId) {
    const res = await fetch(`${API_BASE_URL}/api/notify/${boardId}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return res.json();
  },

  async dismissNotification(id) {
    const res = await fetch(`${API_BASE_URL}/api/notify/${id}/dismiss`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return res.json();
  }
};

// ==================== Context ====================
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// ==================== Utils ====================
const MarkdownRenderer = ({ content, darkMode, className = '' }) => {
  return (
    <div className={`markdown-preview ${className}`}>
    <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[rehypeKatex, rehypeRaw]}
    components={{
      h1: ({node, ...props}) => <h1 className={`text-3xl font-bold mt-6 mb-4 pb-2 border-b-2 ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-slate-800'}`} {...props} />,
          h2: ({node, ...props}) => <h2 className={`text-2xl font-bold mt-5 mb-3 pb-2 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-slate-800'}`} {...props} />,
          h3: ({node, ...props}) => <h3 className={`text-xl font-semibold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`} {...props} />,
          h4: ({node, ...props}) => <h4 className={`text-lg font-semibold mt-3 mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`} {...props} />,
          h5: ({node, ...props}) => <h5 className={`text-base font-semibold mt-2 mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`} {...props} />,
          h6: ({node, ...props}) => <h6 className={`text-sm font-semibold mt-2 mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`} {...props} />,
          p: ({node, ...props}) => <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`} {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4" {...props} />,
          li: ({node, ...props}) => <li className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`} {...props} />,
          a: ({node, ...props}) => <a className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline`} {...props} />,
          blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-4 py-2 mb-4 italic ${darkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-50 text-slate-700'}`} {...props} />,
          code: ({node, inline, ...props}) =>
          inline
          ? <code className={`${darkMode ? 'bg-slate-700 text-pink-400' : 'bg-gray-100 text-red-600'} px-1.5 py-0.5 rounded text-sm font-mono`} {...props} />
          : <code className={`block ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-900 text-gray-100'} p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm`} {...props} />,
          pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto" {...props} />,
          table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full border-collapse" {...props} /></div>,
          th: ({node, ...props}) => <th className={`${darkMode ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-gray-100 border-gray-300 text-slate-800'} border px-4 py-2 font-semibold text-left`} {...props} />,
          td: ({node, ...props}) => <td className={`${darkMode ? 'border-slate-600 text-gray-300' : 'border-gray-300 text-slate-700'} border px-4 py-2`} {...props} />,
          img: ({node, ...props}) => <img className="max-w-full h-auto rounded-lg shadow-md my-4" {...props} />,
          hr: ({node, ...props}) => <hr className={`my-6 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} {...props} />,
    }}
    >
    {content}
    </ReactMarkdown>
    </div>
  );
};

const parseMarkdown = (markdown) => {
  if (!markdown) return '';

  let html = markdown
  .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
  .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
  .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')
  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  .replace(/\n\n/g, '</p><p class="mb-2">')
  .replace(/\n/g, '<br/>');

  return `<p class="mb-2">${html}</p>`;
};

// ==================== Components ====================
const Navbar = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 shadow-sm`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
    <div className="flex items-center space-x-3">
    <FileText className="w-8 h-8 text-blue-500" />
    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>MarkDash</span>
    </div>

    {user && (
      <>
      <div className="hidden md:flex items-center space-x-6">
      <a href="#dashboard" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} transition flex items-center space-x-2`}>
      <Home className="w-4 h-4" />
      <span>Dashboard</span>
      </a>
      <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
      {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>
      <div className="flex items-center space-x-3">
      <User className="w-5 h-5 text-blue-500" />
      <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{user.username}</span>
      <button onClick={onLogout} className="text-red-500 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50">
      <LogOut className="w-5 h-5" />
      </button>
      </div>
      </div>

      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
      <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-slate-800'}`} />
      </button>
      </>
    )}
    </div>
    </div>

    {mobileMenuOpen && user && (
      <div className={`md:hidden ${darkMode ? 'bg-slate-800' : 'bg-gray-50'} border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} p-4 space-y-3`}>
      <a href="#dashboard" className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} hover:text-blue-600`}>Dashboard</a>
      <button onClick={toggleDarkMode} className="flex items-center space-x-2">
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
      <button onClick={onLogout} className="text-red-500 flex items-center space-x-2">
      <LogOut className="w-5 h-5" />
      <span>Logout</span>
      </button>
      </div>
    )}
    </nav>
  );
};

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="max-w-6xl mx-auto px-4 py-16">
    {/* Hero Section */}
    <div className="text-center mb-16">
    <div className="flex justify-center mb-6">
    <FileText className="w-20 h-20 text-blue-500" />
    </div>
    <h1 className="text-5xl font-bold text-slate-800 mb-4">MarkDash</h1>
    <p className="text-xl text-slate-600 mb-8">Your daily markdown dashboard</p>
    <div className="flex justify-center space-x-4">
    <button onClick={() => onNavigate('login')} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg font-semibold">
    Login
    </button>
    <button onClick={() => onNavigate('register')} className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition shadow-lg font-semibold">
    Register
    </button>
    </div>
    </div>

    {/* How it works */}
    <div className="mb-16">
    <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">Cara Kerja</h2>
    <div className="grid md:grid-cols-4 gap-6">
    {[
      { icon: User, title: 'Buat Akun', desc: 'Daftar dengan username & password' },
      { icon: FileText, title: 'Buat Catatan', desc: 'Tulis markdown dengan checklist' },
      { icon: Check, title: 'Auto Reset', desc: 'Checklist harian reset otomatis' },
      { icon: BarChart2, title: 'Lihat Log', desc: 'Track progres aktivitas Anda' }
    ].map((step, i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
      <div className="flex justify-center mb-4">
      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
      <step.icon className="w-7 h-7 text-blue-600" />
      </div>
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
      <p className="text-sm text-slate-600">{step.desc}</p>
      </div>
    ))}
    </div>
    </div>

    {/* Sample boards */}
    <div>
    <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">Contoh Board</h2>
    <div className="grid md:grid-cols-3 gap-6">
    {[
      { title: 'Daily Tasks', desc: 'Checklist harian untuk produktivitas', type: 'daily' },
      { title: 'Weekly Plan', desc: 'Rencana mingguan dan goals', type: 'weekly' },
      { title: 'Learning Notes', desc: 'Catatan belajar dengan markdown', type: 'custom' }
    ].map((board, i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-slate-800">{board.title}</h3>
      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">{board.type}</span>
      </div>
      <p className="text-sm text-slate-600 mb-4">{board.desc}</p>
      <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1">
      <Eye className="w-4 h-4" />
      <span>View Example</span>
      </button>
      </div>
    ))}
    </div>
    </div>
    </div>

    {/* Footer */}
    <footer className="bg-slate-800 text-white py-8 mt-16">
    <div className="max-w-6xl mx-auto px-4 text-center">
    <p className="text-sm">© 2025 MarkDash. Built with React + Vite</p>
    </div>
    </footer>
    </div>
  );
};

const LoginPage = ({ onNavigate, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(username, password);
      if (result.success) {
        onLogin(result.data.user);
      } else {
        setError('Login gagal. Periksa username dan password Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Pastikan backend sudah berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center px-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
    <div className="text-center mb-8">
    <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
    <h2 className="text-2xl font-bold text-slate-800">Login ke MarkDash</h2>
    <p className="text-slate-600 mt-2">Masuk untuk mengelola dashboard Anda</p>
    </div>

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
      {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-4">
    <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
    <div className="relative">
    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
    <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="john"
    required
    />
    </div>
    </div>

    <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
    <div className="relative">
    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
    <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="••••••••"
    required
    />
    </div>
    </div>

    <button
    type="submit"
    disabled={loading}
    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
    >
    {loading ? 'Loading...' : 'Login'}
    </button>
    </form>

    <div className="mt-6 text-center">
    <button onClick={() => onNavigate('register')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
    Belum punya akun? Daftar di sini
    </button>
    </div>

    <div className="mt-4 text-center">
    <button onClick={() => onNavigate('home')} className="text-slate-600 hover:text-slate-800 text-sm">
    ← Kembali ke Home
    </button>
    </div>
    </div>
    </div>
  );
};

const RegisterPage = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const result = await api.register(username, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => onNavigate('login'), 2000);
      } else {
        setError('Registrasi gagal. Username mungkin sudah digunakan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Pastikan backend sudah berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center px-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
    <div className="text-center mb-8">
    <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
    <h2 className="text-2xl font-bold text-slate-800">Daftar MarkDash</h2>
    <p className="text-slate-600 mt-2">Buat akun untuk memulai</p>
    </div>

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
      {error}
      </div>
    )}

    {success && (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
      Registrasi berhasil! Mengalihkan ke login...
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-4">
    <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
    <div className="relative">
    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
    <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="john"
    required
    />
    </div>
    </div>

    <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
    <div className="relative">
    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
    <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="••••••••"
    required
    />
    </div>
    </div>

    <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password</label>
    <div className="relative">
    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
    <input
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="••••••••"
    required
    />
    </div>
    </div>

    <button
    type="submit"
    disabled={loading}
    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
    >
    {loading ? 'Loading...' : 'Daftar'}
    </button>
    </form>

    <div className="mt-6 text-center">
    <button onClick={() => onNavigate('login')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
    Sudah punya akun? Login di sini
    </button>
    </div>

    <div className="mt-4 text-center">
    <button onClick={() => onNavigate('home')} className="text-slate-600 hover:text-slate-800 text-sm">
    ← Kembali ke Home
    </button>
    </div>
    </div>
    </div>
  );
};

const DashboardPage = ({ darkMode }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [viewingBoard, setViewingBoard] = useState(null);
  const [viewingLogs, setViewingLogs] = useState(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const result = await api.getBoards();
      if (result.success) {
        setBoards(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus board ini?')) {
      await api.deleteBoard(id);
      loadBoards();
    }
  };

  const handleEdit = (board) => {
    setEditingBoard(board);
    setShowEditor(true);
  };

  const handleView = (board) => {
    setViewingBoard(board);
  };

  const handleViewLogs = (board) => {
    setViewingLogs(board);
  };

  if (viewingLogs) {
    return <LogsPage board={viewingLogs} onBack={() => setViewingLogs(null)} darkMode={darkMode} />;
  }

  if (viewingBoard) {
    return <BoardViewPage board={viewingBoard} onBack={() => setViewingBoard(null)} onRefresh={loadBoards} darkMode={darkMode} />;
  }

  if (showEditor) {
    return (
      <EditorPage
      board={editingBoard}
      onBack={() => {
        setShowEditor(false);
        setEditingBoard(null);
      }}
      onSave={() => {
        setShowEditor(false);
        setEditingBoard(null);
        loadBoards();
      }}
      darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
    <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Dashboard</h1>
    <button
    onClick={() => setShowEditor(true)}
    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg font-semibold"
    >
    <Plus className="w-5 h-5" />
    <span>New Board</span>
    </button>
    </div>

    {loading ? (
      <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Loading boards...</p>
      </div>
    ) : boards.length === 0 ? (
      <div className={`text-center py-12 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md`}>
      <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <p className={`${darkMode ? 'text-gray-300' : 'text-slate-600'} mb-4`}>Belum ada board. Buat yang pertama!</p>
      <button
      onClick={() => setShowEditor(true)}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
      Buat Board
      </button>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <div key={board.id} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} p-6 rounded-xl shadow-md hover:shadow-lg transition border ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between mb-3">
        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>{board.title}</h3>
        <span className={`px-3 py-1 ${board.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'} rounded-full text-xs font-semibold`}>
        {board.visibility}
        </span>
        </div>
        <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} rounded-full text-sm font-medium`}>
        <Calendar className="w-4 h-4 mr-1" />
        {board.schedule}
        </span>
        </div>
        <div className="flex flex-wrap gap-2">
        <button
        onClick={() => handleView(board)}
        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
        <Eye className="w-4 h-4" />
        <span>Open</span>
        </button>
        <button
        onClick={() => handleEdit(board)}
        className={`flex items-center space-x-1 px-3 py-2 ${darkMode ? 'bg-slate-700 text-gray-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} rounded-lg transition text-sm`}
        >
        <Edit className="w-4 h-4" />
        <span>Edit</span>
        </button>
        <button
        onClick={() => handleViewLogs(board)}
        className={`flex items-center space-x-1 px-3 py-2 ${darkMode ? 'bg-slate-700 text-gray-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} rounded-lg transition text-sm`}
        >
        <BarChart2 className="w-4 h-4" />
        <span>Logs</span>
        </button>
        <button
        onClick={() => handleDelete(board.id)}
        className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition text-sm"
        >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
        </button>
        </div>
        </div>
      ))}
      </div>
    )}
    </div>
    </div>
  );
};

const EditorPage = ({ board, onBack, onSave, darkMode }) => {
  const [title, setTitle] = useState(board?.title || '');
  const [markdown, setMarkdown] = useState(board?.markdown || '');
  const [visibility, setVisibility] = useState(board?.visibility || 'private');
  const [schedule, setSchedule] = useState(board?.schedule || 'daily');
  const [resetTime, setResetTime] = useState(board?.resetTime || '00:00');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { title, markdown, visibility, schedule, resetTime };
      if (board?.id) {
        await api.updateBoard(board.id, data);
      } else {
        await api.createBoard(data);
      }
      onSave();
    } catch (err) {
      alert('Gagal menyimpan board');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
    <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
    {board ? 'Edit Board' : 'New Board'}
    </h1>
    <button onClick={onBack} className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-gray-200' : 'bg-slate-200 text-slate-700'} rounded-lg hover:bg-slate-300 transition`}>
    ← Back
    </button>
    </div>

    <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
    <div className="space-y-6">
    <div>
    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'} mb-2`}>Judul Board</label>
    <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
    placeholder="Daily Tasks"
    />
    </div>

    <div className="grid md:grid-cols-3 gap-4">
    <div>
    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'} mb-2`}>Visibility</label>
    <select
    value={visibility}
    onChange={(e) => setVisibility(e.target.value)}
    className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500`}
    >
    <option value="private">Private</option>
    <option value="public">Public</option>
    </select>
    </div>

    <div>
    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'} mb-2`}>Schedule</label>
    <select
    value={schedule}
    onChange={(e) => setSchedule(e.target.value)}
    className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500`}
    >
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="custom">Custom</option>
    </select>
    </div>

    <div>
    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'} mb-2`}>Reset Time</label>
    <input
    type="time"
    value={resetTime}
    onChange={(e) => setResetTime(e.target.value)}
    className={`w-full px-4 py-2 ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500`}
    />
    </div>
    </div>

    <div>
    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'} mb-2`}>
    Markdown Content
    </label>
    <div className="mb-4 text-sm text-gray-500">
    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
    ✨ Tips: Gunakan toolbar untuk formatting, support LaTeX dengan <code className="bg-gray-700 px-1 py-0.5 rounded">$...$</code> inline atau <code className="bg-gray-700 px-1 py-0.5 rounded">$...$</code> block
    </p>
    </div>

    <div data-color-mode={darkMode ? 'dark' : 'light'}>
    <MDEditor
    value={markdown}
    onChange={setMarkdown}
    height={500}
    preview="live"
    previewOptions={{
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex, rehypeRaw],
    }}
    />
    </div>
    </div>

    <div className="flex justify-end space-x-3 pt-4">
    <button onClick={onBack} className={`px-6 py-2 ${darkMode ? 'bg-slate-700 text-gray-200' : 'bg-slate-200 text-slate-700'} rounded-lg hover:bg-slate-300 transition`}>
    Cancel
    </button>
    <button
    onClick={handleSave}
    disabled={saving}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
    >
    {saving ? 'Saving...' : 'Save Board'}
    </button>
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

const BoardViewPage = ({ board, onBack, onRefresh, darkMode }) => {
  const [markdown, setMarkdown] = useState(board.markdown);
  const [checkedItems, setCheckedItems] = useState([]);

  useEffect(() => {
    const matches = markdown.match(/- \[(x| )\] (.*)/gi) || [];
    const checked = matches.map((item, idx) => item.includes('[x]'));
    setCheckedItems(checked);
  }, [markdown]);

  const handleCheckToggle = async (lineIndex) => {
    const lines = markdown.split('\n');

    if (lines[lineIndex] && lines[lineIndex].match(/- \[(x| )\]/)) {
      const isChecked = lines[lineIndex].includes('[x]');
      lines[lineIndex] = lines[lineIndex].replace(isChecked ? '[x]' : '[ ]', isChecked ? '[ ]' : '[x]');

      const taskMatch = lines[lineIndex].match(/- \[(x| )\] (.*)/);
      const taskName = taskMatch ? taskMatch[2] : 'task';

      await api.createLog(board.id, [{
        type: isChecked ? 'uncheck' : 'check',
        task: taskName,
        time: new Date().toISOString()
      }]);

      setMarkdown(lines.join('\n'));
    }
  };

  const renderMarkdownWithInteractiveCheckboxes = () => {
    const lines = markdown.split('\n');
    let inCodeBlock = false;
    let codeBlockContent = [];
    let codeBlockLang = '';
    let inList = false;
    let listItems = [];
    let inTable = false;
    let currentSection = [];
    const elements = [];

    const flushCodeBlock = (index) => {
      if (codeBlockContent.length > 0) {
        const code = codeBlockContent.join('\n');
        elements.push(
          <pre key={`code-${index}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="font-mono text-sm">{code}</code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLang = '';
      }
    };

    const flushList = (index) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside mb-4 pl-4">
          {listItems.map((item, i) => (
            <li key={i} className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            <MarkdownRenderer content={item} darkMode={darkMode} />
            </li>
          ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushSection = (index) => {
      if (currentSection.length > 0) {
        const content = currentSection.join('\n');
        elements.push(
          <MarkdownRenderer
          key={`section-${index}`}
          content={content}
          darkMode={darkMode}
          />
        );
        currentSection = [];
      }
    };

    lines.forEach((line, lineIndex) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // Start code block
          flushSection(lineIndex);
          flushList(lineIndex);
          inCodeBlock = true;
          codeBlockLang = line.trim().replace(/```/g, '');
        } else {
          // End code block
          inCodeBlock = false;
          flushCodeBlock(lineIndex);
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Detect table start (line with pipes)
      if (line.includes('|') && !inTable) {
        flushList(lineIndex);
        inTable = true;
      }

      // Detect table end (empty line or non-table line after table)
      if (inTable && !line.includes('|') && line.trim() !== '') {
        inTable = false;
        flushSection(lineIndex);
      }

      // Handle checkboxes - render as interactive
      if (line.match(/- \[(x| )\]/)) {
        flushSection(lineIndex);
        flushList(lineIndex);

        const isChecked = line.includes('[x]');
        const text = line.replace(/- \[(x| )\] /, '');

        elements.push(
          <div key={`checkbox-${lineIndex}`} className="flex items-start space-x-3 mb-2">
          <button
          onClick={() => handleCheckToggle(lineIndex)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition flex-shrink-0 ${
            isChecked
            ? 'bg-blue-600 border-blue-600'
            : darkMode ? 'border-slate-500 hover:border-blue-500' : 'border-slate-300 hover:border-blue-500'
          }`}
          >
          {isChecked && <Check className="w-4 h-4 text-white" />}
          </button>
          <span className={`flex-1 ${isChecked ? 'line-through text-slate-400' : darkMode ? 'text-gray-200' : 'text-slate-700'}`}>
          <MarkdownRenderer content={text} darkMode={darkMode} />
          </span>
          </div>
        );
        return;
      }

      // Handle regular bullet lists (non-checkbox) - detect by asterisk or dash
      if (line.match(/^[\*\-] (?!\[)/) && !inTable) {
        flushSection(lineIndex);
        if (!inList) inList = true;
        listItems.push(line.replace(/^[\*\-] /, ''));
        return;
      }

      // If we were in a list but this line isn't a list item, flush the list
      if (inList && !line.match(/^[\*\-] /)) {
        flushList(lineIndex);
      }

      // Handle empty lines
      if (line.trim() === '') {
        // Empty line might end a table
        if (inTable) {
          currentSection.push(line);
          flushSection(lineIndex);
          inTable = false;
        } else if (currentSection.length > 0) {
          currentSection.push(line);
        }
        return;
      }

      // All other content (headers, paragraphs, LaTeX, tables, etc.)
      // Add to current section for batch processing with MarkdownRenderer
      currentSection.push(line);
    });

    // Flush any remaining content
    flushCodeBlock(lines.length);
    flushList(lines.length);
    flushSection(lines.length);

    return elements;
  };

  const handleReset = async () => {
    if (confirm('Reset semua checklist?')) {
      const resetMarkdown = markdown.replace(/\[x\]/g, '[ ]');
      setMarkdown(resetMarkdown);

      await api.createLog(board.id, [{
        type: 'reset',
        task: 'All tasks',
        time: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
    <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
    <div>
    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{board.title}</h1>
    <div className="flex items-center space-x-2 mt-2">
    <span className={`px-3 py-1 ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} rounded-full text-sm font-medium`}>
    {board.schedule}
    </span>
    <span className={`px-3 py-1 ${board.visibility === 'public' ? 'bg-green-100 text-green-700' : darkMode ? 'bg-slate-700 text-gray-300' : 'bg-slate-100 text-slate-700'} rounded-full text-sm font-medium`}>
    {board.visibility}
    </span>
    </div>
    </div>
    <button onClick={onBack} className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-gray-200' : 'bg-slate-200 text-slate-700'} rounded-lg hover:bg-slate-300 transition`}>
    ← Back
    </button>
    </div>

    <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg p-8 mb-6`}>
    {/* Render semua konten dengan urutan yang benar */}
    {renderMarkdownWithInteractiveCheckboxes()}
    </div>

    <div className="flex space-x-3">
    <button
    onClick={handleReset}
    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
    >
    Reset Checklist
    </button>
    </div>
    </div>
    </div>
  );
};

const LogsPage = ({ board, onBack, darkMode }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [groupedLogs, setGroupedLogs] = useState({});

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await api.getBoardLogs(board.id);
      if (result.success) {
        const logData = result.data || [];
        setLogs(logData);

        // Group logs by date
        const grouped = {};
        logData.forEach(log => {
          log.actions.forEach(action => {
            const date = new Date(action.time).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });

            if (!grouped[date]) {
              grouped[date] = [];
            }

            grouped[date].push({
              ...action,
              logId: log.id
            });
          });
        });

        setGroupedLogs(grouped);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTaskCount = (date) => {
    return groupedLogs[date]?.length || 0;
  };

  const getActionStats = (date) => {
    const actions = groupedLogs[date] || [];
    const stats = {
      check: 0,
      uncheck: 0,
      reset: 0,
      done: 0
    };

    actions.forEach(action => {
      if (stats.hasOwnProperty(action.type)) {
        stats[action.type]++;
      }
    });

    return stats;
  };

  if (selectedDate) {
    const dateActions = groupedLogs[selectedDate] || [];

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
      <div>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      Log Details - {selectedDate}
      </h1>
      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
      {board.title}
      </p>
      </div>
      <button
      onClick={() => setSelectedDate(null)}
      className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-gray-200' : 'bg-slate-200 text-slate-700'} rounded-lg hover:bg-slate-300 transition`}
      >
      ← Back to Dates
      </button>
      </div>

      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      <div className="overflow-x-auto">
      <table className="w-full">
      <thead className={`${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
      <tr>
      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>Time</th>
      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>Task</th>
      <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>Action</th>
      </tr>
      </thead>
      <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
      {dateActions.map((action, idx) => (
        <tr key={`${action.logId}-${idx}`} className={darkMode ? 'hover:bg-slate-750' : 'hover:bg-slate-50'}>
        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
        {formatTime(action.time)}
        </td>
        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
        {action.task}
        </td>
        <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          action.type === 'check'
          ? 'bg-green-100 text-green-700'
          : action.type === 'uncheck'
          ? 'bg-yellow-100 text-yellow-700'
          : action.type === 'reset'
          ? 'bg-orange-100 text-orange-700'
          : 'bg-blue-100 text-blue-700'
        }`}>
        {action.type}
        </span>
        </td>
        </tr>
      ))}
      </tbody>
      </table>
      </div>
      </div>

      <div className={`mt-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 shadow-md`}>
      <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(getActionStats(selectedDate)).map(([type, count]) => (
        <div key={type} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
        <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{count}</div>
        <div className={`text-xs uppercase font-semibold ${
          type === 'check' ? 'text-green-600' :
          type === 'uncheck' ? 'text-yellow-600' :
          type === 'reset' ? 'text-orange-600' : 'text-blue-600'
        }`}>{type}</div>
        </div>
      ))}
      </div>
      </div>
      </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
    <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Logs - {board.title}</h1>
    <button onClick={onBack} className={`px-4 py-2 ${darkMode ? 'bg-slate-700 text-gray-200' : 'bg-slate-200 text-slate-700'} rounded-lg hover:bg-slate-300 transition`}>
    ← Back
    </button>
    </div>

    {loading ? (
      <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    ) : Object.keys(groupedLogs).length === 0 ? (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-12 text-center`}>
      <BarChart2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
      <p className={`${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Belum ada log untuk board ini</p>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.keys(groupedLogs).sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = new Date(groupedLogs[a][0].time);
        const dateB = new Date(groupedLogs[b][0].time);
        return dateB - dateA;
      }).map((date) => {
        const stats = getActionStats(date);
        const totalActions = getTaskCount(date);

        return (
          <div
          key={date}
          className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl shadow-md hover:shadow-lg transition p-6`}
          >
          <div className="flex items-start justify-between mb-4">
          <div>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          {date}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          {totalActions} {totalActions === 1 ? 'activity' : 'activities'}
          </p>
          </div>
          <Calendar className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.check > 0 && (
            <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {stats.check} checked
            </span>
            </div>
          )}
          {stats.uncheck > 0 && (
            <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-yellow-600" />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {stats.uncheck} unchecked
            </span>
            </div>
          )}
          {stats.reset > 0 && (
            <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-orange-600" />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {stats.reset} reset
            </span>
            </div>
          )}
          {stats.done > 0 && (
            <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
            {stats.done} done
            </span>
            </div>
          )}
          </div>

          <button
          onClick={() => setSelectedDate(date)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
          >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
          </button>
          </div>
        );
      })}
      </div>
    )}
    </div>
    </div>
  );
};

// ==================== Main App ====================
export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (api.isAuthenticated()) {
      setUser(api.getUser());
      setPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setPage('home');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
    {user && <Navbar user={user} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}

    {page === 'home' && <HomePage onNavigate={setPage} />}
    {page === 'login' && <LoginPage onNavigate={setPage} onLogin={handleLogin} />}
    {page === 'register' && <RegisterPage onNavigate={setPage} />}
    {page === 'dashboard' && user && <DashboardPage darkMode={darkMode} />}
    </div>
  );
}
