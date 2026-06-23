import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Users, DollarSign, Heart, ShoppingBag } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/analytics')
      ]);

      setSummary(statsRes.data.summary);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error fetching analytics records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getLineChartData = () => {
    const data = analytics?.revenueTimeline || [];
    const labels = data.length > 0 ? data.map(d => d.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const values = data.length > 0 ? data.map(d => parseFloat(d.revenue)) : [15000, 24000, 18000, 35000, 42000, 50000];

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Revenue (₹)',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getDoughnutChartData = () => {
    const data = analytics?.categoryDistribution || [];
    const labels = data.length > 0 ? data.map(d => d.category) : ['Electronics', 'Clothing', 'Home', 'Books'];
    const values = data.length > 0 ? data.map(d => d.count) : [10, 15, 8, 5];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#3b82f6', '#818cf8', '#10b981', '#f59e0b', '#ec4899'],
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)'
        }
      ]
    };
  };

  const getBarChartData = () => {
    const data = analytics?.topSelling || [];
    const labels = data.length > 0 ? data.map(d => d.product.substring(0, 15) + '...') : ['Headphones', 'Keyboard', 'Jacket', 'Chair', 'Book'];
    const values = data.length > 0 ? data.map(d => parseInt(d.sales_count)) : [12, 19, 8, 5, 15];

    return {
      labels,
      datasets: [
        {
          label: 'Quantity Sold',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Compiling analytics dashboards...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px' }}>
        <BarChart3 size={36} color="var(--accent-primary)" />
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Store Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Visual analytics timelines of revenue, items popularity, and categories distributions</p>
        </div>
      </div>

      {/* Summary Widgets Panel */}
      {summary && (
        <div className="admin-grid-5" style={{ marginBottom: '40px' }}>
          <div className="glass-panel admin-widget">
            <DollarSign size={24} style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--text-muted)' }} />
            <div className="widget-title">Total Revenue</div>
            <div className="widget-value">₹{parseFloat(summary.revenue).toLocaleString('en-IN')}</div>
          </div>
          <div className="glass-panel admin-widget">
            <ShoppingBag size={24} style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--text-muted)' }} />
            <div className="widget-title">Orders Placed</div>
            <div className="widget-value">{summary.orders}</div>
          </div>
          <div className="glass-panel admin-widget">
            <Package size={24} style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--text-muted)' }} />
            <div className="widget-title">Total Products</div>
            <div className="widget-value">{summary.products}</div>
          </div>
          <div className="glass-panel admin-widget">
            <Users size={24} style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--text-muted)' }} />
            <div className="widget-title">Total Users</div>
            <div className="widget-value">{summary.users}</div>
          </div>
          <div className="glass-panel admin-widget">
            <Heart size={24} style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--text-muted)' }} />
            <div className="widget-title">Total Reviews</div>
            <div className="widget-value">{summary.reviews}</div>
          </div>
        </div>
      )}

      {/* Charts Display Grid */}
      <div className="analytics-grid">
        
        {/* Line Chart: Revenue */}
        <div className="glass-panel chart-card">
          <h4 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-primary)" /> Revenue Timelines
          </h4>
          <div className="chart-container-inner">
            <Line data={getLineChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart: Categories Distribution */}
        <div className="glass-panel chart-card">
          <h4 className="chart-title">Categories Shares</h4>
          <div className="chart-container-inner">
            <Doughnut
              data={getDoughnutChartData()}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { ...chartOptions.plugins.legend, position: 'right' }
                }
              }}
            />
          </div>
        </div>

        {/* Bar Chart: Best Selling Items */}
        <div className="glass-panel chart-card" style={{ gridColumn: 'span 2' }}>
          <h4 className="chart-title">Top Selling Products</h4>
          <div className="chart-container-inner">
            <Bar data={getBarChartData()} options={chartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}

