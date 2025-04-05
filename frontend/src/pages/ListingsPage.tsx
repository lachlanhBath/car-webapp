import { useState, useEffect } from 'react';
import { listingsService, ListingsParams } from '../api/listingsService';
import ListingCard from '../components/ListingCard';

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

const ListingsPage = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingsParams>({
    page: 1,
    per_page: 20,
    sort_by: 'posted_date',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    total_pages: 0,
    total_count: 0,
    per_page: 20
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await listingsService.getListings(filters);
      setListings(response.data.listings);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ListingsParams>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="listings-page">
      <h1>Car Listings</h1>
      
      {/* Search and Filter Controls - To be implemented */}
      <div className="filters-container">
        <button onClick={() => handleFilterChange({ sort_by: 'price', sort_order: 'asc' })}>
          Price: Low to High
        </button>
        <button onClick={() => handleFilterChange({ sort_by: 'price', sort_order: 'desc' })}>
          Price: High to Low
        </button>
        <button onClick={() => handleFilterChange({ sort_by: 'posted_date', sort_order: 'desc' })}>
          Newest First
        </button>
      </div>
      
      {loading && !listings.length ? (
        <div className="loading">Loading listings...</div>
      ) : error ? (
        <div className="error-message">Error: {error}</div>
      ) : (
        <>
          <div className="listings-grid">
            {listings.map(listing => (
              <ListingCard 
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                location={listing.location}
                thumbnail_url={listing.thumbnail_url}
                post_date={listing.post_date}
                vehicle={listing.vehicle}
              />
            ))}
          </div>
          
          {!listings.length && <p>No listings found matching your criteria.</p>}
          
          {/* Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
              >
                Previous
              </button>
              
              <span>
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListingsPage; 