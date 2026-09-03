import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

const [formData, setFormData] = useState({
  description: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: "",
  paymentMethod: "QRIS",
  notes: "",
});

  useEffect(() => {
    fetch("https://financialtracker-api-g931.onrender.com/api/transactions")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load transactions");
        }

        return response.json();
      })
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load transactions");
        setLoading(false);
      });
  }, []);

  const handleChange = (event) => {
  const { name, value } = event.target;

  setFormData((previousData) => ({
    ...previousData,
    [name]: value,
  }));
};

const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(
      "https://financialtracker-api-g931.onrender.com/api/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save transaction");
    }

    const newTransaction = await response.json();

    setTransactions((previousTransactions) => [
      newTransaction,
      ...previousTransactions,
    ]);

    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: "",
      paymentMethod: "QRIS",
      notes: "",
    });

    setShowForm(false);
  } catch (error) {
    console.error(error);
    alert("Failed to save transaction");
  }
};

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = income - expense;

  const categoryIcons = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "💡",
  Entertainment: "🎬",
  Health: "❤️",
  Sports: "🏃",
  Salary: "💰",
  Other: "📦",
};

const categoryTotals = transactions
  .filter((transaction) => transaction.type === "expense")
  .reduce((totals, transaction) => {
    const category = transaction.category;

    totals[category] =
      (totals[category] || 0) + transaction.amount;

    return totals;
  }, {});

const topCategories = Object.entries(categoryTotals)
  .sort(([, amountA], [, amountB]) => amountB - amountA)
  .slice(0, 5);

  const rupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <h2 className="logo">FinTrack</h2>

          <nav>
            <button className="nav-item active">Dashboard</button>
            <button className="nav-item">Transactions</button>
            <button className="nav-item">Budget</button>
            <button className="nav-item">Analytics</button>
            <button className="nav-item">Categories</button>
          </nav>
        </div>

        <button className="nav-item">Settings</button>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p className="subtitle">Personal Finance</p>
            <h1>Dashboard</h1>
          </div>

          <div className="header-actions">
            <select>
              <option>September 2026</option>
              <option>August 2026</option>
              <option>July 2026</option>
            </select>

            <button
  className="add-button"
  onClick={() => setShowForm(true)}
>
  + Add Transaction
</button>
          </div>
        </header>

        <section className="summary-grid">
          <div className="summary-card">
            <p>Total Income</p>
            <h2>{rupiah(income)}</h2>
            <span className="positive">Income this month</span>
          </div>

          <div className="summary-card">
            <p>Total Expense</p>
            <h2>{rupiah(expense)}</h2>
            <span className="negative">Expense this month</span>
          </div>

          <div className="summary-card">
            <p>Balance</p>
            <h2>{rupiah(balance)}</h2>
            <span>Current monthly balance</span>
          </div>

          <div className="summary-card">
            <p>Savings Rate</p>
            <h2>
              {income > 0
                ? Math.round(((income - expense) / income) * 100)
                : 0}
              %
            </h2>
            <span>of monthly income</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="subtitle">Overview</p>
                <h2>Monthly Spending</h2>
              </div>
            </div>

            <div className="chart-placeholder">
              <div>
                <strong>{rupiah(expense)}</strong>
                <p>Total spending this month</p>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="subtitle">Breakdown</p>
                <h2>Top Categories</h2>
              </div>
            </div>

            <div className="category-list">
  {topCategories.length === 0 ? (
    <p className="subtitle">No expenses yet</p>
  ) : (
    topCategories.map(([category, amount]) => (
      <div className="category" key={category}>
        <span>
          {categoryIcons[category] || "📦"} {category}
        </span>

        <strong>{rupiah(amount)}</strong>
      </div>
    ))
  )}
</div>
          </div>
        </section>

        <section className="panel transactions-panel">
          <div className="panel-header">
            <div>
              <p className="subtitle">Activity</p>
              <h2>Recent Transactions</h2>
            </div>

            <button className="text-button">View all</button>
          </div>

          <div className="transactions">
            {transactions.map((transaction) => (
              <div className="transaction" key={transaction._id}>
                <div className="transaction-info">
                  <div className="transaction-icon">
                    {transaction.type === "income" ? "💰" : "💳"}
                  </div>

                  <div>
                    <strong>{transaction.description}</strong>
                    <p>
                      {transaction.category} •{" "}
{new Date(transaction.date).toLocaleDateString("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})}
                    </p>
                  </div>
                </div>

                <strong
                  className={
                    transaction.type === "income" ? "positive" : "negative"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {rupiah(transaction.amount)}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </main>
      {showForm && (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-header">
        <div>
          <p className="subtitle">New transaction</p>
          <h2>Add Transaction</h2>
        </div>

        <button
          className="close-button"
          onClick={() => setShowForm(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Example: Lunch"
            required
          />
        </div>

        <div className="form-group">
          <label>Amount</label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="50000"
            min="0"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Sports">Sports</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Payment Method</label>

          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="QRIS">QRIS</option>
            <option value="Cash">Cash</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="E-Wallet">E-Wallet</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes</label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes"
            rows="3"
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>

          <button type="submit" className="save-button">
            Save Transaction
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

export default App;