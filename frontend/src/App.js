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

  // State for adding expenses
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: []
  });

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

    if (selectedGroup.members.includes(newMemberName.trim())) {
      alert('This member already exists in the group!');
      return;
    }

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

  // Handle expense form input changes
  const handleExpenseChange = (field, value) => {
    setNewExpense({
      ...newExpense,
      [field]: value
    });
  };

  // Toggle member selection for split
  const toggleSplitMember = (member) => {
    const isSelected = newExpense.splitAmong.includes(member);
    
    if (isSelected) {
      // Remove member
      setNewExpense({
        ...newExpense,
        splitAmong: newExpense.splitAmong.filter(m => m !== member)
      });
    } else {
      // Add member
      setNewExpense({
        ...newExpense,
        splitAmong: [...newExpense.splitAmong, member]
      });
    }
  };

  // Add expense to group
  const handleAddExpense = () => {
    // Validation
    if (newExpense.description.trim() === '') {
      alert('Please enter expense description!');
      return;
    }

    if (newExpense.amount === '' || parseFloat(newExpense.amount) <= 0) {
      alert('Please enter a valid amount!');
      return;
    }

    if (newExpense.paidBy === '') {
      alert('Please select who paid!');
      return;
    }

    if (newExpense.splitAmong.length === 0) {
      alert('Please select at least one person to split among!');
      return;
    }

    // Create expense object
    const expense = {
      id: Date.now(),
      description: newExpense.description.trim(),
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitAmong: [...newExpense.splitAmong],
      date: new Date().toLocaleDateString('en-IN')
    };

    // Update groups
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          expenses: [...group.expenses, expense]
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    
    // Update selected group
    setSelectedGroup({
      ...selectedGroup,
      expenses: [...selectedGroup.expenses, expense]
    });

    // Reset form
    setNewExpense({
      description: '',
      amount: '',
      paidBy: '',
      splitAmong: []
    });
    setShowAddExpense(false);
  };

  // Open add expense modal
  const openAddExpenseModal = () => {
    if (selectedGroup.members.length === 0) {
      alert('Please add members first before adding expenses!');
      return;
    }
    setShowAddExpense(true);
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

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => setShowAddMember(true)}
            >
              + Add Member
            </button>
            <button 
              className="btn-primary"
              onClick={openAddExpenseModal}
            >
              + Add Expense
            </button>
          </div>

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

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="modal" onClick={() => setShowAddExpense(false)}>
              <div className="modal-content expense-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Add Expense</h2>
                
                {/* Description */}
                <input
                  type="text"
                  placeholder="Description (e.g., Hotel booking, Dinner)"
                  value={newExpense.description}
                  onChange={(e) => handleExpenseChange('description', e.target.value)}
                  className="input-field"
                />

                {/* Amount */}
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={newExpense.amount}
                  onChange={(e) => handleExpenseChange('amount', e.target.value)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />

                {/* Paid By */}
                <div className="form-group">
                  <label>Paid by:</label>
                  <select
                    value={newExpense.paidBy}
                    onChange={(e) => handleExpenseChange('paidBy', e.target.value)}
                    className="select-field"
                  >
                    <option value="">Select member</option>
                    {selectedGroup.members.map((member, index) => (
                      <option key={index} value={member}>{member}</option>
                    ))}
                  </select>
                </div>

                {/* Split Among */}
                <div className="form-group">
                  <label>Split among:</label>
                  <div className="checkbox-group">
                    {selectedGroup.members.map((member, index) => (
                      <label key={index} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newExpense.splitAmong.includes(member)}
                          onChange={() => toggleSplitMember(member)}
                        />
                        <span>{member}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="modal-buttons">
                  <button 
                    className="btn-primary"
                    onClick={handleAddExpense}
                  >
                    Add Expense
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowAddExpense(false);
                      setNewExpense({
                        description: '',
                        amount: '',
                        paidBy: '',
                        splitAmong: []
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
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

          {/* Expenses Section */}
          <div className="expenses-section">
            <h3>Expenses</h3>
            
            {selectedGroup.expenses.length === 0 ? (
              <div className="empty-state">
                <p>💵 No expenses yet.</p>
                <p>Add your first expense to start tracking!</p>
              </div>
            ) : (
              <div className="expenses-list">
                {selectedGroup.expenses.map((expense) => {
                  const sharePerPerson = expense.amount / expense.splitAmong.length;
                  return (
                    <div key={expense.id} className="expense-card">
                      <div className="expense-header">
                        <h4>{expense.description}</h4>
                        <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
                      </div>
                      <div className="expense-details">
                        <p>💳 Paid by: <strong>{expense.paidBy}</strong></p>
                        <p>📅 Date: {expense.date}</p>
                        <p>👥 Split among: {expense.splitAmong.join(', ')}</p>
                        <p>💰 Each person pays: <strong>₹{sharePerPerson.toFixed(2)}</strong></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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