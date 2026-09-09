import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, MapPin, FileText, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { triggerWorkflow, createTripReal } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Input({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-muted">{label}</label>}
      <div className="flex items-center gap-2.5 h-[48px] px-4 rounded-2xl bg-white/80 border border-gray-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all">
        {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
        <input className="flex-1 bg-transparent border-none outline-none text-ink placeholder:text-gray-400 text-sm" {...props} />
      </div>
    </div>
  );
}

function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl border border-line shadow-card p-5 ${className}`}>{children}</div>;
}

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    trip_name: '', source: '', destination: '', start_date: '', end_date: '', purpose: '', budget: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createTripReal({
        ...form, user_id: user?.user_id || 'U001', budget: parseFloat(form.budget) || 0
      });
      if (res.success) {
        toast.success(res.message || 'Trip created successfully!');
        navigate('/trips', { state: { tripId: res.trip_id || res.trip?.trip_id, trip: res.trip } });
      } else {
        const errMsg = res.message || (res.errors && res.errors.join(', ')) || 'Failed to create trip';
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Plane className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Create New Trip</h2>
            <p className="text-xs text-ink-muted">Enter trip details to get started</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Trip Name" name="trip_name" placeholder="e.g. Mumbai Business Trip" value={form.trip_name} onChange={handleChange} icon={FileText} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Source" name="source" placeholder="e.g. Ahmedabad" value={form.source} onChange={handleChange} icon={MapPin} required />
            <Input label="Destination" name="destination" placeholder="e.g. Mumbai" value={form.destination} onChange={handleChange} icon={MapPin} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="start_date" type="date" value={form.start_date} onChange={handleChange} icon={Calendar} required />
            <Input label="End Date" name="end_date" type="date" value={form.end_date} onChange={handleChange} icon={Calendar} required />
          </div>
          <Input label="Purpose of Trip" name="purpose" placeholder="e.g. Client Meeting" value={form.purpose} onChange={handleChange} icon={FileText} />
          <Input label="Estimated Budget (₹)" name="budget" type="number" placeholder="e.g. 25000" value={form.budget} onChange={handleChange} icon={IndianRupee} required />

          <button type="submit" disabled={loading}
            className="w-full h-[48px] flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(180deg,#5833EF 0%,#3A10CE 100%)', boxShadow: '0 4px 9px rgba(58,16,206,0.25)' }}>
            <Plane className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </Card>

      <p className="text-center text-xs text-ink-muted">
        All trip data is stored securely. You can add expenses after creating the trip.
      </p>
    </div>
  );
}