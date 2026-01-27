import React, { useState } from 'react';
import './App.css';

function App() {
  // State for groups
  const [groups, setGroups] = useState([]);
  
  // State for modals
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // State for viewing a specific group
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // State for adding members
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Create a new group
  const handleCreateGroup = () => {
    if (newGroupName.trim() === '') {
      alert('Please enter a group name!');
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      members: [],
      expenses: []
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  // Open group details
  const openGroupDetails = (group) => {
    setSelectedGroup(group);
  };

  // Close group details (go back to list)
  const closeGroupDetails = () => {
    setSelectedGroup(null);
  };

  // Add member to selected group
  const handleAddMember = () => {
    if (newMemberName.trim() === '') {
      alert('Please enter a member name!');
      return;
    }

    // Check if member already exists
    if (selectedGroup.members.includes(newMemberName.trim())) {
      alert('This member already exists in the group!');
      return;
    }

    // Update the group with new member
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          members: [...group.members, newMemberName.trim()]
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    
    // Update selectedGroup to reflect changes
    setSelectedGroup({
      ...selectedGroup,
      members: [...selectedGroup.members, newMemberName.trim()]
    });

    setNewMemberName('');
    setShowAddMember(false);
  };

  // Remove member from group
  const handleRemoveMember = (memberName) => {
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          members: group.members.filter(member => member !== memberName)
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    
    setSelectedGroup({
      ...selectedGroup,
      members: selectedGroup.members.filter(member => member !== memberName)
    });
  };

  // If a group is selected, show group details
  if (selectedGroup) {
    return (
      <div className="App">
        {/* Header */}
        <header className="app-header">
          <h1>💰 Expense Splitter</h1>
          <p>Split expenses smartly with friends</p>
        </header>

        {/* Group Details */}
        <div className="container">
          {/* Back Button */}
          <button 
            className="btn-back"
            onClick={closeGroupDetails}
          >
            ← Back to Groups
          </button>

          {/* Group Info */}
          <div className="group-details-header">
            <h2>{selectedGroup.name}</h2>
            <p className="group-stats">
              👥 {selectedGroup.members.length} members · 
              💵 {selectedGroup.expenses.length} expenses
            </p>
          </div>

          {/* Add Member Button */}
          <button 
            className="btn-primary"
            onClick={() => setShowAddMember(true)}
          >
            + Add Member
          </button>

          {/* Add Member Modal */}
          {showAddMember && (
            <div className="modal" onClick={() => setShowAddMember(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add Member</h2>
                
                <input
                  type="text"
                  placeholder="Enter member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="input-field"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddMember();
                  }}
                />

                <div className="modal-buttons">
                  <button 
                    className="btn-primary"
                    onClick={handleAddMember}
                  >
                    Add Member
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddMember(false);
                      setNewMemberName('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="members-section">
            <h3>Members</h3>
            
            {selectedGroup.members.length === 0 ? (
              <div className="empty-state">
                <p>👥 No members yet.</p>
                <p>Add members to start tracking expenses!</p>
              </div>
            ) : (
              <div className="members-list">
                {selectedGroup.members.map((member, index) => (
                  <div key={index} className="member-card">
                    <div className="member-info">
                      <span className="member-avatar">
                        {member.charAt(0).toUpperCase()}
                      </span>
                      <span className="member-name">{member}</span>
                    </div>
                    <button 
                      className="btn-delete"
                      onClick={() => handleRemoveMember(member)}
                      title="Remove member"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses Section (Coming in Day 4) */}
          <div className="expenses-section">
            <h3>Expenses</h3>
            <div className="empty-state">
              <p>💵 No expenses yet.</p>
              <p>Coming soon in Day 4!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default view: Groups List
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

        {/* Create Group Modal */}
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateGroup();
                }}
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
                <div 
                  key={group.id} 
                  className="group-card"
                  onClick={() => openGroupDetails(group)}
                >
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