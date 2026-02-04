import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

function App() {
  // State for groups
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // State for tracking paid transactions (still using localStorage for simplicity)
  const [paidTransactions, setPaidTransactions] = useState(() => {
    const saved = localStorage.getItem('smartSplitPaidTransactions');
    return saved ? JSON.parse(saved) : {};
  });

  // State for showing algorithm explanation
  const [showAlgorithmExplanation, setShowAlgorithmExplanation] = useState(false);

  // Save paid transactions to localStorage
  useEffect(() => {
    localStorage.setItem('smartSplitPaidTransactions', JSON.stringify(paidTransactions));
  }, [paidTransactions]);

  // Load groups from Firebase on startup
  useEffect(() => {
    loadGroups();
  }, []);

  // Update selectedGroup when groups change
  useEffect(() => {
    if (selectedGroup) {
      const updatedGroup = groups.find(g => g.id === selectedGroup.id);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
      }
    }
  }, [groups]);

  // Load all groups from Firebase
  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsCollection = collection(db, 'groups');
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsList = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsList);
      setLoading(false);
    } catch (error) {
      console.error("Error loading groups:", error);
      alert("Error loading groups. Please refresh the page.");
      setLoading(false);
    }
  };

  // Create a new group
  const handleCreateGroup = async () => {
    if (newGroupName.trim() === '') {
      alert('Please enter a group name!');
      return;
    }

    try {
      const newGroup = {
        name: newGroupName,
        members: [],
        expenses: [],
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'groups'), newGroup);
      
      setGroups([...groups, { id: docRef.id, ...newGroup }]);
      setNewGroupName('');
      setShowCreateGroup(false);
      alert('Group created successfully!');
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Error creating group. Please try again.");
    }
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
  const handleAddMember = async () => {
    if (newMemberName.trim() === '') {
      alert('Please enter a member name!');
      return;
    }

    if (selectedGroup.members.includes(newMemberName.trim())) {
      alert('This member already exists in the group!');
      return;
    }

    try {
      const updatedMembers = [...selectedGroup.members, newMemberName.trim()];
      const groupRef = doc(db, 'groups', selectedGroup.id);
      
      await updateDoc(groupRef, {
        members: updatedMembers
      });

      await loadGroups();
      setNewMemberName('');
      setShowAddMember(false);
      alert('Member added successfully!');
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error adding member. Please try again.");
    }
  };

  // Remove member from group
  const handleRemoveMember = async (memberName) => {
    if (!window.confirm(`Remove ${memberName} from this group?`)) {
      return;
    }

    try {
      const updatedMembers = selectedGroup.members.filter(member => member !== memberName);
      const groupRef = doc(db, 'groups', selectedGroup.id);
      
      await updateDoc(groupRef, {
        members: updatedMembers
      });

      await loadGroups();
      alert('Member removed successfully!');
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Error removing member. Please try again.");
    }
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
  const handleAddExpense = async () => {
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

    try {
      const expense = {
        id: Date.now().toString(),
        description: newExpense.description.trim(),
        amount: parseFloat(newExpense.amount),
        paidBy: newExpense.paidBy,
        splitAmong: [...newExpense.splitAmong],
        date: new Date().toLocaleDateString('en-IN')
      };

      const updatedExpenses = [...selectedGroup.expenses, expense];
      const groupRef = doc(db, 'groups', selectedGroup.id);
      
      await updateDoc(groupRef, {
        expenses: updatedExpenses
      });

      await loadGroups();

      setNewExpense({
        description: '',
        amount: '',
        paidBy: '',
        splitAmong: []
      });
      setShowAddExpense(false);
      alert('Expense added successfully!');
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error adding expense. Please try again.");
    }
  };

  // Delete expense from group
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const updatedExpenses = selectedGroup.expenses.filter(expense => expense.id !== expenseId);
      const groupRef = doc(db, 'groups', selectedGroup.id);
      
      await updateDoc(groupRef, {
        expenses: updatedExpenses
      });

      await loadGroups();
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense. Please try again.");
    }
  };

  // Delete entire group
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? All expenses and members will be lost!')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'groups', groupId));
      
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(null);
      }

      await loadGroups();
      alert('Group deleted successfully!');
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Error deleting group. Please try again.");
    }
  };

  // Open add expense modal
  const openAddExpenseModal = () => {
    if (selectedGroup.members.length === 0) {
      alert('Please add members first before adding expenses!');
      return;
    }
    setShowAddExpense(true);
  };

  // Mark transaction as paid
  const markAsPaid = (from, to, amount) => {
    const key = `${selectedGroup.id}-${from}-${to}-${amount.toFixed(2)}`;
    setPaidTransactions({
      ...paidTransactions,
      [key]: !paidTransactions[key]
    });
  };

  // Check if transaction is paid
  const isTransactionPaid = (from, to, amount) => {
    const key = `${selectedGroup.id}-${from}-${to}-${amount.toFixed(2)}`;
    return paidTransactions[key] || false;
  };

  // ============================================
  // SETTLEMENT ALGORITHM - THE CORE FEATURE!
  // ============================================
  
  const calculateBalances = () => {
    const balances = {};
    selectedGroup.members.forEach(member => {
      balances[member] = 0;
    });

    selectedGroup.expenses.forEach(expense => {
      const payer = expense.paidBy;
      const totalAmount = expense.amount;
      const splitAmong = expense.splitAmong;
      const sharePerPerson = totalAmount / splitAmong.length;

      balances[payer] += totalAmount;

      splitAmong.forEach(person => {
        balances[person] -= sharePerPerson;
      });
    });

    return balances;
  };

  const minimizeTransactions = () => {
    const balances = calculateBalances();
    
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance > 0.01) {
        creditors.push({ person, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ person, amount: Math.abs(balance) });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const settleAmount = Math.min(creditor.amount, debtor.amount);

      transactions.push({
        from: debtor.person,
        to: creditor.person,
        amount: settleAmount
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return transactions;
  };

  const getTotalExpenses = () => {
    return selectedGroup.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getFairShare = () => {
    const total = getTotalExpenses();
    return selectedGroup.members.length > 0 ? total / selectedGroup.members.length : 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>💰 SmartSplit</h1>
          <p>Split expenses smartly with friends</p>
        </header>
        <div className="container">
          <div className="loading-state">
            <h2>Loading your groups...</h2>
            <p>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  // If showing settlement view
  if (selectedGroup && showSettlement) {
    const balances = calculateBalances();
    const transactions = minimizeTransactions();
    const totalExpenses = getTotalExpenses();
    const fairShare = getFairShare();
    const paidCount = transactions.filter(t => isTransactionPaid(t.from, t.to, t.amount)).length;

    return (
      <div className="App">
        <header className="app-header">
          <h1>💰 SmartSplit</h1>
          <p>Split expenses smartly with friends</p>
        </header>

        <div className="container">
          <button 
            className="btn-back"
            onClick={() => setShowSettlement(false)}
          >
            ← Back to Group Details
          </button>

          <div className="settlement-header">
            <h2>💸 Settlement Summary</h2>
            <p className="settlement-subtitle">{selectedGroup.name}</p>
          </div>

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

          <div className="transactions-section">
            <h3>🔄 Settlement Transactions</h3>
            <p className="transactions-subtitle">
              {transactions.length === 0 
                ? "Everyone is settled up! No transactions needed." 
                : `${paidCount} of ${transactions.length} transaction${transactions.length > 1 ? 's' : ''} completed`}
            </p>
            
            {transactions.length > 0 && (
              <div className="transactions-list">
                {transactions.map((transaction, index) => {
                  const isPaid = isTransactionPaid(transaction.from, transaction.to, transaction.amount);
                  
                  return (
                    <div 
                      key={index} 
                      className={`transaction-card ${isPaid ? 'paid' : ''}`}
                    >
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
                      <label className="paid-checkbox">
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={() => markAsPaid(transaction.from, transaction.to, transaction.amount)}
                        />
                        <span>{isPaid ? '✅ Paid' : '☐ Mark as Paid'}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="algorithm-explanation">
            <div 
              className="algorithm-header"
              onClick={() => setShowAlgorithmExplanation(!showAlgorithmExplanation)}
            >
              <h4>🧮 How the Algorithm Works</h4>
              <span className="toggle-icon">{showAlgorithmExplanation ? '▼' : '▶'}</span>
            </div>
            
            {showAlgorithmExplanation && (
              <ol className="algorithm-steps">
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
                  <strong>Result:</strong> Minimum number of transactions! This reduces from 
                  potentially O(n²) to O(n) transactions using a greedy algorithm approach.
                </li>
              </ol>
            )}
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
          <h1>💰 SmartSplit</h1>
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
        <h1>💰 SmartSplit</h1>
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
                      e.stopPropagation();
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