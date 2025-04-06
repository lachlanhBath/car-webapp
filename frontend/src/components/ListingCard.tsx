import { Link } from 'react-router-dom';

interface Vehicle {
  make?: string;
  model?: string;
  year?: number;
  fuel_type?: string;
  transmission?: string;
  mileage?: number;
  original_purchase_price?: number;
}

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  thumbnail_url?: string;
  post_date: string;
  vehicle?: Vehicle;
}

const ListingCard = ({ id, title, price, location, thumbnail_url, post_date, vehicle }: ListingCardProps) => {
  return (
    <div className="listing-card">
      <Link to={`/listings/${id}`}>
        <img 
          src={thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={title} 
          className="card-image" 
        />
      </Link>
      <div className="card-content">
        <h3 className="card-title">
          <Link to={`/listings/${id}`}>{title}</Link>
        </h3>
        <p className="card-price">£{price.toLocaleString()}</p>
        <p>{location}</p>
        {vehicle && (
          <div className="card-details">
            <p>
              {vehicle.year} • {vehicle.mileage?.toLocaleString()} miles • {vehicle.fuel_type} • {vehicle.transmission}
            </p>
          </div>
        )}
        <p className="card-date">Posted: {new Date(post_date).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default ListingCard; 