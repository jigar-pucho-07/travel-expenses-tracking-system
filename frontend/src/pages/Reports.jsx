import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [generating, setGenerating] = useState(null); // trip_id being generated
  const [report, setReport] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await triggerWorkflow('list_trips', { user_id: user?.user_id || 'USR-1001' });
      if (res.success) {
        const raw = typeof res.trips === 'string' ? JSON.parse(res.trips) : (res.trips || []);
        setCompletedTrips(raw.filter(t => t.status === 'Completed'));
      }
    } catch (e) {
      console.error('Failed to load trips', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, [user]);

  const handleGenerate = async (tripId) => {
    setGenerating(tripId);
    try {
      const res = await triggerWorkflow('complete_trip', { trip_id: tripId });
      if (res.success) {
        setReport({ ...res, trip_id: tripId });
        toast.success('Report generated!');
      } else {
        toast.error(res.error || 'Failed to generate report');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl h-48 animate-pulse" />
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
            <p className="text-xs text-ink-muted">Download PDF reports for completed trips</p>
          </div>
        </div>

        {completedTrips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-ink-muted">No completed trips yet. Complete a trip to generate its report.</p>
            <button onClick={() => navigate('/trips')}
              className="mt-3 h-9 px-4 rounded-full text-sm font-medium text-brand bg-brand-50 hover:bg-brand-100 transition-colors">
              View Trips
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTrips.map(trip => (
              <div key={trip.trip_id} className="flex items-center justify-between p-3 rounded-xl bg-canvas-soft">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ok-bg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-ok" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{trip.trip_name}</p>
                    <p className="text-xs text-ink-muted">{trip.destination} · {trip.start_date} — {trip.end_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink">₹{(trip.budget || 0).toLocaleString('en-IN')}</span>
                  <button onClick={() => handleGenerate(trip.trip_id)} disabled={generating === trip.trip_id}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium text-brand bg-brand-50 hover:bg-brand-100 transition-colors disabled:opacity-60">
                    {generating === trip.trip_id ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Download className="w-3.5 h-3.5" /> Download PDF</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {report && (
        <Card>
          <h3 className="text-sm font-semibold text-ink mb-4">Report Summary — {report.trip_id}</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-canvas-soft rounded-xl p-3">
              <p className="text-xs text-ink-muted">Total Budget</p>
              <p className="text-lg font-bold text-ink">₹{(report.budget || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-canvas-soft rounded-xl p-3">
              <p className="text-xs text-ink-muted">Total Spent</p>
              <p className="text-lg font-bold text-ink">₹{(report.total || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-canvas-soft rounded-xl p-3">
              <p className="text-xs text-ink-muted">Remaining</p>
              <p className="text-lg font-bold text-ok">₹{(report.remaining || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          {report.report_url && (
            <p className="text-xs text-ink-muted">
              Report URL: <a href={report.report_url} target="_blank" rel="noopener noreferrer" className="text-brand underline break-all">{report.report_url}</a>
            </p>
          )}
        </Card>
      )}
    </div>
  );
}