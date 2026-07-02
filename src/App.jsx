import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Check, X, CheckSquare, Square } from 'lucide-react';
import './index.css';

const getRelativeDate = (isoString) => {
  const date = new Date(isoString);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
};

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [newTaskText, setNewTaskText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    
    const newTask = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = (id) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    
    setTasks(tasks.map(t => t.id === id ? { ...t, text: trimmed } : t));
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true : 
      filter === 'completed' ? task.completed : 
      !task.completed;
    return matchesSearch && matchesFilter;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="app-container">
      <div className="glass-panel">
        <header className="app-header">
          <h1>TaskFlow</h1>
          <p className="subtitle">Advanced Todo Application</p>
        </header>

        <form className="add-task-form" onSubmit={handleAddTask}>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <button type="submit" className="add-btn" disabled={!newTaskText.trim()}>
              <Plus size={20} />
              <span>Add</span>
            </button>
          </div>
        </form>

        <div className="controls">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filters">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
            <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
          </div>
        </div>

        <div className="stats">
          <span className="stat-badge total">Total: {totalCount}</span>
          <span className="stat-badge completed">Completed: {completedCount}</span>
          <span className="stat-badge pending">Pending: {pendingCount}</span>
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet.</p>
              <p>Add your first task!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-checkbox" onClick={() => handleToggleComplete(task.id)}>
                  {task.completed ? <CheckSquare size={22} className="check-icon" /> : <Square size={22} className="uncheck-icon" />}
                </div>
                
                <div className="task-content">
                  {editingId === task.id ? (
                    <div className="edit-mode">
                      <input 
                        type="text" 
                        value={editingText} 
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(task.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={() => saveEdit(task.id)} className="icon-btn save-btn"><Check size={18} /></button>
                        <button onClick={cancelEdit} className="icon-btn cancel-btn"><X size={18} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="task-text">{task.text}</span>
                      <span className="task-date">Created: {getRelativeDate(task.createdAt)}</span>
                    </>
                  )}
                </div>
                
                {editingId !== task.id && (
                  <div className="task-actions">
                    <button className="action-btn edit-btn" onClick={() => startEditing(task)}>
                      <Edit2 size={16} /> Edit
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
