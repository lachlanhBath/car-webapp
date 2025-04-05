import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Find Your Perfect Car</h1>
        <p className="hero-subtitle">
          Browse thousands of listings to find the vehicle that's right for you
        </p>
        <Link to="/listings" className="button">Browse Listings</Link>
      </div>
      
      <div className="features-section">
        <div className="feature">
          <h2>Search by Make & Model</h2>
          <p>Find exactly what you're looking for with our powerful search filters.</p>
        </div>
        
        <div className="feature">
          <h2>Check Vehicle History</h2>
          <p>View detailed MOT history and vehicle information.</p>
        </div>
        
        <div className="feature">
          <h2>Vehicle Lookup</h2>
          <p>Enter a registration number to get full vehicle details.</p>
          <Link to="/vehicle-lookup" className="button">Try It Now</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 