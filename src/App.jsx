import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Calendar, Edit2, Settings, Cloud } from 'lucide-react';

export default function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [weeklyFocus, setWeeklyFocus] = useState({
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  });
  const [showWeekPlanner, setShowWeekPlanner] = useState(false);
  const [editingFocus, setEditingFocus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [gistId, setGistId] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  const today = new Date().getDay();

  useEffect(() => {
    // Load GitHub settings
    const savedToken = localStorage.getItem('githubToken');
    const savedGistId = localStorage.getItem('gistId');
    if (savedToken) setGithubToken(savedToken);
    if (savedGistId) setGistId(savedGistId);

    // Load local data first
    const saved = localStorage.getItem('dailyTasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading tasks:', e);
      }
    }
    
    const savedFocus = localStorage.getItem('weeklyFocus');
    if (savedFocus) {
      try {
        setWeeklyFocus(JSON.parse(savedFocus));
      } catch (e) {
        console.error('Error loading focus:', e);
      }
    }

    // Load from Gist if configured
    if (savedToken && savedGistId) {
      loadFromGist(savedToken, savedGistId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
    if (githubToken && gistId) {
      saveToGist();
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('weeklyFocus', JSON.stringify(weeklyFocus));
    if (githubToken && gistId) {
      saveToGist();
    }
  }, [weeklyFocus]);

  const addTask = (e) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
      setInput('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateFocus = (day, value) => {
    setWeeklyFocus({...weeklyFocus, [day]: value});
  };

  const saveToGist = async () => {
    if (!githubToken || !gistId) return;
    
    try {
      setSyncStatus('Syncing...');
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'tasks.json': {
              content: JSON.stringify({ tasks, weeklyFocus }, null, 2)
            }
          }
        })
      });

      if (response.ok) {
        setSyncStatus('✓ Synced');
        setTimeout(() => setSyncStatus(''), 2000);
      } else {
        setSyncStatus('✗ Sync failed');
      }
    } catch (error) {
      console.error('Error syncing to Gist:', error);
      setSyncStatus('✗ Sync failed');
    }
  };

  const loadFromGist = async (token, id) => {
    try {
      setSyncStatus('Loading...');
      const response = await fetch(`https://api.github.com/gists/${id}`, {
        headers: {
          'Authorization': `token ${token}`,
        }
      });

      if (response.ok) {
        const gist = await response.json();
        const content = gist.files['tasks.json']?.content;
        if (content) {
          const data = JSON.parse(content);
          if (data.tasks) setTasks(data.tasks);
          if (data.weeklyFocus) setWeeklyFocus(data.weeklyFocus);
          setSyncStatus('✓ Loaded');
          setTimeout(() => setSyncStatus(''), 2000);
        }
      }
    } catch (error) {
      console.error('Error loading from Gist:', error);
      setSyncStatus('');
    }
  };

  const saveGithubSettings = () => {
    localStorage.setItem('githubToken', githubToken);
    localStorage.setItem('gistId', gistId);
    setShowSettings(false);
    if (githubToken && gistId) {
      loadFromGist(githubToken, gistId);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header with Settings */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            {syncStatus && (
              <span className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                {syncStatus}
              </span>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 bg-white border border-stone-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-stone-800 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Cloud size={18} />
                GitHub Sync
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-400 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Gist ID
                </label>
                <input
                  type="text"
                  value={gistId}
                  onChange={(e) => setGistId(e.target.value)}
                  placeholder="abc123def456..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-400 text-sm"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded p-3 text-xs text-stone-600 space-y-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <p className="font-medium">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                  <li>Generate new token with 'gist' scope</li>
                  <li>Create a new <strong>private</strong> Gist at gist.github.com</li>
                  <li>Name the file <code className="bg-stone-200 px-1 rounded">tasks.json</code> with content: <code className="bg-stone-200 px-1 rounded">{`{}`}</code></li>
                  <li>Copy the Gist ID from the URL (the long hash after your username)</li>
                </ol>
              </div>

              <button
                onClick={saveGithubSettings}
                className="w-full px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Save & Sync
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light text-stone-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Today
          </h1>
          <p className="text-stone-500 text-sm mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          
          {/* Today's Focus */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg">
            <Calendar size={16} className="text-stone-600" />
            <span className="text-stone-800 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
              {weeklyFocus[today]}
            </span>
            <button 
              onClick={() => setShowWeekPlanner(!showWeekPlanner)}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <Edit2 size={14} />
            </button>
          </div>
        </div>

        {/* Week Planner Modal */}
        {showWeekPlanner && (
          <div className="mb-8 bg-white border border-stone-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                Weekly Focus
              </h2>
              <button 
                onClick={() => setShowWeekPlanner(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 0].map(day => (
                <div key={day} className="flex items-center gap-3">
                  <span className={`w-20 text-sm ${day === today ? 'font-medium text-stone-800' : 'text-stone-500'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    {dayNames[day]}
                  </span>
                  {editingFocus === day ? (
                    <input
                      type="text"
                      value={weeklyFocus[day]}
                      onChange={(e) => updateFocus(day, e.target.value)}
                      onBlur={() => setEditingFocus(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingFocus(null);
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded focus:outline-none focus:border-stone-400 text-sm"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingFocus(day)}
                      className="flex-1 text-left px-3 py-1.5 rounded hover:bg-stone-50 transition-colors text-sm text-stone-700"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {weeklyFocus[day]}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={addTask} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTask();
                }
              }}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 transition-colors text-stone-800 placeholder-stone-400"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-stone-200 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-stone-300 transition-colors"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.done 
                    ? 'bg-stone-800 border-stone-800' 
                    : 'border-stone-300 hover:border-stone-400'
                }`}
              >
                {task.done && <Check size={14} className="text-white" />}
              </button>
              
              <span
                className={`flex-1 transition-all ${
                  task.done 
                    ? 'text-stone-400 line-through' 
                    : 'text-stone-800'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {task.text}
              </span>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-stone-400" style={{ fontFamily: "'Inter', sans-serif" }}>
            Your day is clear. Add a task to get started.
          </div>
        )}
      </div>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
    </div>
  );
}
