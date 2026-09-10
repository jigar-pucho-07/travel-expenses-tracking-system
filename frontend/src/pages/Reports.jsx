import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, CheckCircle, ExternalLink } from 'lucide-react';
import { triggerWorkflow } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-line shadow-card p-5 ${className}`}>{children}</div>;
}

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await triggerWorkflow('list_trips', { user_id: user?.user_id || 'U001' });
      if (res.success) {
        const raw = typeof res.trips === 'string' ? JSON.parse(res.trips) : (res.trips || []);
        // Show all completed trips — display existing report_url if available
        const completed = raw.filter(t => (t.status || t.Status) === 'Completed');
        setCompletedTrips(completed);
      } else {
        setError('Failed to load reports');
      }
    } catch (e) {
      setError(e.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, [user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl h-48 animate-pulse" />
        {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Expense Reports</h2>
            <p className="text-xs text-ink-muted">View and download PDF reports for completed trips</p>
          </div>
        </div>

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-err mb-2">{error}</p>
            <button onClick={fetchTrips} className="h-9 px-4 rounded-full text-sm font-medium text-brand bg-brand-50 hover:bg-brand-100">Retry</button>
          </div>
        )}

        {!error && completedTrips.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-ink-muted">No completed trips yet. Complete a trip to generate its report.</p>
            <button onClick={() => navigate('/trips')}
              className="mt-3 h-9 px-4 rounded-full text-sm font-medium text-brand bg-brand-50 hover:bg-brand-100 transition-colors">
              View Trips
            </button>
          </div>
        )}

        {!error && completedTrips.length > 0 && (
          <div className="space-y-3">
            {completedTrips.map(trip => {
              const hasReport = !!(trip.report_url || trip.Report_URL);
              const reportUrl = trip.report_url || trip.Report_URL || '';

              return (
                <div key={trip.trip_id} className="flex items-center justify-between p-4 rounded-xl bg-canvas-soft">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${hasReport ? 'bg-ok-bg' : 'bg-off-bg'}`}>
                      <CheckCircle className={`w-5 h-5 ${hasReport ? 'text-ok' : 'text-off'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink truncate">{trip.trip_name}</p>
                        {!hasReport && <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">No Report</span>}
                      </div>
                      <p className="text-xs text-ink-muted truncate">{trip.destination} · {trip.trip_id} · {trip.start_date} — {trip.end_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-sm font-medium text-ink whitespace-nowrap">₹{(trip.budget || 0).toLocaleString('en-IN')}</span>
                    {hasReport ? (
                      <a href={reportUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium text-white transition-all hover:brightness-105 whitespace-nowrap"
                        style={{ background: 'linear-gradient(180deg,#5833EF 0%,#3A10CE 100%)' }}>
                        <Download className="w-3.5 h-3.5" /> Download Report
                      </a>
                    ) : (
                      <button onClick={() => navigate('/trips', { state: { tripId: trip.trip_id, trip } })}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium text-ink-muted bg-white border border-gray-200 hover:bg-canvas-soft transition-colors whitespace-nowrap">
                        <ExternalLink className="w-3.5 h-3.5" /> Complete Trip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-ink-muted text-center pt-2">
              Reports are generated when you complete a trip from Trip Details. Download existing reports above.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}