import React, { useState } from 'react';
import './App.css';

function App() {
  // This stores our groups in memory (like a variable that React watches)
  const [groups, setGroups] = useState([]);
  
  // This controls if the "Create Group" popup is shown
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  
  // This stores the new group name when user types
  const [newGroupName, setNewGroupName] = useState('');

  // Function to create a new group
  const handleCreateGroup = () => {
    if (newGroupName.trim() === '') {
      alert('Please enter a group name!');
      return;
    }

    // Create new group object
    const newGroup = {
      id: Date.now(), // Simple unique ID using timestamp
      name: newGroupName,
      members: [],
      expenses: []
    };

    // Add to groups list
    setGroups([...groups, newGroup]);
    
    // Reset and close
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <h1>💰 Expense Splitter</h1>
        <p>Split expenses smartly with friends</p>
      </header>

      {/* Main Content */}
      <div className="container">
        {/* Create Group Button */}
        <button 
          className="btn-primary"
          onClick={() => setShowCreateGroup(true)}
        >
          + Create New Group
        </button>

        {/* Create Group Modal/Popup */}
        {showCreateGroup && (
          <div className="modal" onClick={() => setShowCreateGroup(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Group</h2>
              
              <input
                type="text"
                placeholder="Enter group name (e.g., Goa Trip, Hostel Food)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="input-field"
              />

              <div className="modal-buttons">
                <button 
                  className="btn-primary"
                  onClick={handleCreateGroup}
                >
                  Create Group
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateGroup(false);
                    setNewGroupName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="groups-list">
          <h2>Your Groups ({groups.length})</h2>
          
          {groups.length === 0 ? (
            <div className="empty-state">
              <p>📁 No groups yet.</p>
              <p>Create your first group to start tracking expenses!</p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(group => (
                <div key={group.id} className="group-card">
                  <h3>{group.name}</h3>
                  <p className="group-info">
                    👥 {group.members.length} members · 
                    💵 {group.expenses.length} expenses
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;