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

  // State for showing settlement
  const [showSettlement, setShowSettlement] = useState(false);

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
    setShowSettlement(false);
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
      setNewExpense({
        ...newExpense,
        splitAmong: newExpense.splitAmong.filter(m => m !== member)
      });
    } else {
      setNewExpense({
        ...newExpense,
        splitAmong: [...newExpense.splitAmong, member]
      });
    }
  };

  // Add expense to group
  const handleAddExpense = () => {
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

    const expense = {
      id: Date.now(),
      description: newExpense.description.trim(),
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitAmong: [...newExpense.splitAmong],
      date: new Date().toLocaleDateString('en-IN')
    };

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
    
    setSelectedGroup({
      ...selectedGroup,
      expenses: [...selectedGroup.expenses, expense]
    });

    setNewExpense({
      description: '',
      amount: '',
      paidBy: '',
      splitAmong: []
    });
    setShowAddExpense(false);
  };
  // Delete expense from group
  const handleDeleteExpense = (expenseId) => {
    // Ask for confirmation
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          expenses: group.expenses.filter(expense => expense.id !== expenseId)
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    
    setSelectedGroup({
      ...selectedGroup,
      expenses: selectedGroup.expenses.filter(expense => expense.id !== expenseId)
    });

    alert('Expense deleted successfully!');
  };

  // Delete entire group
  const handleDeleteGroup = (groupId) => {
    // Ask for confirmation
    if (!window.confirm('Are you sure you want to delete this group? All expenses and members will be lost!')) {
      return;
    }

    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    
    // If we're viewing this group, go back to list
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup(null);
    }

    alert('Group deleted successfully!');
  };

  // Open add expense modal
  const openAddExpenseModal = () => {
    if (selectedGroup.members.length === 0) {
      alert('Please add members first before adding expenses!');
      return;
    }
    setShowAddExpense(true);
  };

  // ============================================
  // SETTLEMENT ALGORITHM - THE CORE FEATURE!
  // ============================================
  
  const calculateBalances = () => {
    // Initialize balances for all members
    const balances = {};
    selectedGroup.members.forEach(member => {
      balances[member] = 0;
    });

    // Calculate net balance for each person
    selectedGroup.expenses.forEach(expense => {
      const payer = expense.paidBy;
      const totalAmount = expense.amount;
      const splitAmong = expense.splitAmong;
      const sharePerPerson = totalAmount / splitAmong.length;

      // Payer gets credited (they paid the full amount)
      balances[payer] += totalAmount;

      // Each person who shared the expense gets debited
      splitAmong.forEach(person => {
        balances[person] -= sharePerPerson;
      });
    });

    return balances;
  };

  const minimizeTransactions = () => {
    const balances = calculateBalances();
    
    // Separate into creditors (should receive) and debtors (should pay)
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0.01) { // Small threshold for floating point
        creditors.push({ person, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ person, amount: Math.abs(balance) });
      }
    });

    // Sort both arrays by amount (descending) - Greedy approach
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Generate minimum transactions
    const transactions = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      // Settle the minimum of what debtor owes and creditor is owed
      const settleAmount = Math.min(creditor.amount, debtor.amount);

      transactions.push({
        from: debtor.person,
        to: creditor.person,
        amount: settleAmount
      });

      // Update remaining amounts
      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      // Move to next if fully settled
      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return transactions;
  };

  // Calculate total expenses
  const getTotalExpenses = () => {
    return selectedGroup.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Calculate fair share per person
  const getFairShare = () => {
    const total = getTotalExpenses();
    return selectedGroup.members.length > 0 ? total / selectedGroup.members.length : 0;
  };

  // If showing settlement view
  if (selectedGroup && showSettlement) {
    const balances = calculateBalances();
    const transactions = minimizeTransactions();
    const totalExpenses = getTotalExpenses();
    const fairShare = getFairShare();

    return (
      <div className="App">
        <header className="app-header">
          <h1>💰 Expense Splitter</h1>
          <p>Split expenses smartly with friends</p>
        </header>

        <div className="container">
          <button 
            className="btn-back"
            onClick={() => setShowSettlement(false)}
          >
            ← Back to Group Details
          </button>

          {/* Settlement Header */}
          <div className="settlement-header">
            <h2>💸 Settlement Summary</h2>
            <p className="settlement-subtitle">{selectedGroup.name}</p>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">💵</div>
              <div className="summary-content">
                <p className="summary-label">Total Expenses</p>
                <p className="summary-value">₹{totalExpenses.toFixed(2)}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-content">
                <p className="summary-label">Total Members</p>
                <p className="summary-value">{selectedGroup.members.length}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">⚖️</div>
              <div className="summary-content">
                <p className="summary-label">Fair Share Each</p>
                <p className="summary-value">₹{fairShare.toFixed(2)}</p>
              </div>
            </div>

            <div className="summary-card highlight">
              <div className="summary-icon">🎯</div>
              <div className="summary-content">
                <p className="summary-label">Transactions Needed</p>
                <p className="summary-value">{transactions.length}</p>
              </div>
            </div>
          </div>

          {/* Individual Balances */}
          <div className="balances-section">
            <h3>📊 Individual Balances</h3>
            <div className="balances-grid">
              {Object.entries(balances).map(([person, balance]) => (
                <div 
                  key={person} 
                  className={`balance-card ${balance > 0.01 ? 'positive' : balance < -0.01 ? 'negative' : 'settled'}`}
                >
                  <div className="balance-person">
                    <span className="balance-avatar">
                      {person.charAt(0).toUpperCase()}
                    </span>
                    <span className="balance-name">{person}</span>
                  </div>
                  <div className="balance-amount">
                    {balance > 0.01 ? (
                      <>
                        <span className="balance-label">Gets back</span>
                        <span className="balance-value positive">+₹{balance.toFixed(2)}</span>
                      </>
                    ) : balance < -0.01 ? (
                      <>
                        <span className="balance-label">Owes</span>
                        <span className="balance-value negative">₹{Math.abs(balance).toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span className="balance-label">Status</span>
                        <span className="balance-value settled">✓ Settled</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Transactions */}
          <div className="transactions-section">
            <h3>🔄 Settlement Transactions</h3>
            <p className="transactions-subtitle">
              {transactions.length === 0 
                ? "Everyone is settled up! No transactions needed." 
                : `Only ${transactions.length} transaction${transactions.length > 1 ? 's' : ''} needed to settle all debts!`}
            </p>
            
            {transactions.length > 0 && (
              <div className="transactions-list">
                {transactions.map((transaction, index) => (
                  <div key={index} className="transaction-card">
                    <div className="transaction-number">{index + 1}</div>
                    <div className="transaction-flow">
                      <div className="transaction-person from">
                        <span className="person-avatar">
                          {transaction.from.charAt(0).toUpperCase()}
                        </span>
                        <span className="person-name">{transaction.from}</span>
                      </div>
                      <div className="transaction-arrow">
                        <span className="arrow-line">→</span>
                        <span className="transaction-amount">₹{transaction.amount.toFixed(2)}</span>
                      </div>
                      <div className="transaction-person to">
                        <span className="person-avatar">
                          {transaction.to.charAt(0).toUpperCase()}
                        </span>
                        <span className="person-name">{transaction.to}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Algorithm Explanation */}
          <div className="algorithm-explanation">
            <h4>🧮 How the Algorithm Works</h4>
            <ol>
              <li>
                <strong>Calculate Net Balance:</strong> For each person, we calculate 
                (Total amount they paid) - (Their fair share of all expenses)
              </li>
              <li>
                <strong>Separate Creditors & Debtors:</strong> People with positive balance 
                should receive money, people with negative balance should pay
              </li>
              <li>
                <strong>Greedy Matching:</strong> Match the person who owes the most with 
                the person who should receive the most, settle the smaller amount
              </li>
              <li>
                <strong>Result:</strong> Minimum number of transactions (often reduces from 
                O(n²) to O(n) transactions!)
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // If a group is selected, show group details
  if (selectedGroup) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>💰 Expense Splitter</h1>
          <p>Split expenses smartly with friends</p>
        </header>

        <div className="container">
          <button 
            className="btn-back"
            onClick={closeGroupDetails}
          >
            ← Back to Groups
          </button>

          <div className="group-details-header">
            <h2>{selectedGroup.name}</h2>
            <p className="group-stats">
              👥 {selectedGroup.members.length} members · 
              💵 {selectedGroup.expenses.length} expenses
            </p>
          </div>

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
            {selectedGroup.expenses.length > 0 && (
              <button 
                className="btn-settlement"
                onClick={() => setShowSettlement(true)}
              >
                💸 Settle Up
              </button>
            )}
          </div>

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

          {showAddExpense && (
            <div className="modal" onClick={() => setShowAddExpense(false)}>
              <div className="modal-content expense-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Add Expense</h2>
                
                <input
                  type="text"
                  placeholder="Description (e.g., Hotel booking, Dinner)"
                  value={newExpense.description}
                  onChange={(e) => handleExpenseChange('description', e.target.value)}
                  className="input-field"
                />

                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={newExpense.amount}
                  onChange={(e) => handleExpenseChange('amount', e.target.value)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />

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
          <div className="expense-header-right">
            <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
            <button 
              className="btn-delete-expense"
              onClick={() => handleDeleteExpense(expense.id)}
              title="Delete expense"
            >
              🗑️
            </button>
          </div>
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
      <header className="app-header">
        <h1>💰 Expense Splitter</h1>
        <p>Split expenses smartly with friends</p>
      </header>

      <div className="container">
        <button 
          className="btn-primary"
          onClick={() => setShowCreateGroup(true)}
        >
          + Create New Group
        </button>

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
    >
      <div onClick={() => openGroupDetails(group)} style={{ flex: 1 }}>
        <h3>{group.name}</h3>
        <p className="group-info">
          👥 {group.members.length} members · 
          💵 {group.expenses.length} expenses
        </p>
      </div>
      <button 
        className="btn-delete-group"
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening group
          handleDeleteGroup(group.id);
        }}
        title="Delete group"
      >
        🗑️
      </button>
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