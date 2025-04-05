import { useState } from 'react';
import { vehiclesService } from '../api/vehiclesService';

const VehicleLookupPage = () => {
  const [registration, setRegistration] = useState('');
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registration.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehiclesService.lookupVehicleByRegistration(registration);
      setVehicle(response.data.vehicle);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup vehicle');
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="vehicle-lookup-page">
      <h1>Vehicle Lookup</h1>
      <p className="lookup-description">
        Enter a UK vehicle registration number to get detailed information about the vehicle,
        including MOT history, tax status, and more.
      </p>
      
      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="input-group">
          <input
            type="text"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="Enter registration (e.g., AB12CDE)"
            disabled={loading}
            className="lookup-input"
          />
          <button type="submit" disabled={loading || !registration.trim()} className="button">
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}
      </form>
      
      {vehicle && (
        <div className="vehicle-result">
          <h2>{vehicle.make} {vehicle.model} {vehicle.variant}</h2>
          
          <div className="vehicle-details">
            <div className="detail-group">
              <h3>Basic Information</h3>
              <ul>
                <li><strong>Registration:</strong> {vehicle.registration}</li>
                <li><strong>Year:</strong> {vehicle.year}</li>
                <li><strong>Fuel Type:</strong> {vehicle.fuel_type}</li>
                <li><strong>Transmission:</strong> {vehicle.transmission}</li>
                <li><strong>Engine Size:</strong> {vehicle.engine_size}</li>
                <li><strong>Color:</strong> {vehicle.color}</li>
              </ul>
            </div>
            
            <div className="detail-group">
              <h3>Status Information</h3>
              <ul>
                <li><strong>MOT Status:</strong> {vehicle.mot_status}</li>
                {vehicle.mot_expiry_date && (
                  <li><strong>MOT Expiry:</strong> {new Date(vehicle.mot_expiry_date).toLocaleDateString()}</li>
                )}
                <li><strong>Tax Status:</strong> {vehicle.tax_status}</li>
                {vehicle.tax_due_date && (
                  <li><strong>Tax Due Date:</strong> {new Date(vehicle.tax_due_date).toLocaleDateString()}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleLookupPage; 