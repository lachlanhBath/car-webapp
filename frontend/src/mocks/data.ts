// Mock data for development that matches the OpenAPI specification

// Vehicle makes for generating realistic data
const makes = ['Audi', 'BMW', 'Ford', 'Honda', 'Jaguar', 'Lexus', 'Mercedes', 'Nissan', 'Toyota', 'Volkswagen'];

// Define type for vehicle models
type VehicleModelsType = {
  [key: string]: string[];
};

const models: VehicleModelsType = {
  'Audi': ['A3', 'A4', 'Q5', 'TT', 'R8'],
  'BMW': ['1 Series', '3 Series', '5 Series', 'X3', 'X5'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Mustang'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Jazz', 'HR-V'],
  'Jaguar': ['XE', 'XF', 'F-PACE', 'I-PACE', 'E-PACE'],
  'Lexus': ['IS', 'ES', 'RX', 'NX', 'UX'],
  'Mercedes': ['A-Class', 'C-Class', 'E-Class', 'GLC', 'S-Class'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf'],
  'Toyota': ['Yaris', 'Corolla', 'RAV4', 'Prius', 'Camry'],
  'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'ID.3']
};
const colors = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Grey', 'Green'];
const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid'];
const transmissions = ['manual', 'automatic'];
const bodyTypes = ['hatchback', 'sedan', 'SUV', 'coupe', 'estate'];
const locations = ['London', 'Manchester', 'Birmingham', 'Bristol', 'Bath', 'Leeds', 'Liverpool', 'Edinburgh', 'Glasgow', 'Cardiff'];

// Generate a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random date within the last n days
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString();
};

// Generate a random future date within the next n days
const randomFutureDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + randomInt(1, daysAhead));
  return date.toISOString().split('T')[0]; // Return only the date part
};

// Generate a random UK registration number
const generateRegistration = () => {
  const letters1 = 'ABCDEFGHJKLMNOPRSTUVWXYZ';
  const letters2 = 'ABCDEFGHJKLMNOPRSTUVWXYZ';
  const year = randomInt(10, 23);
  const randomLetter1 = letters1.charAt(randomInt(0, letters1.length - 1));
  const randomLetter2 = letters2.charAt(randomInt(0, letters2.length - 1));
  return `${randomLetter1}${randomLetter2}${year} ${letters1.charAt(randomInt(0, letters1.length - 1))}${letters2.charAt(randomInt(0, letters2.length - 1))}${letters1.charAt(randomInt(0, letters1.length - 1))}`;
};

// Generate a random UK VIN
const generateVIN = () => {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars.charAt(randomInt(0, chars.length - 1));
  }
  return vin;
};

// Define vehicle type
interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuel_type: string;
  transmission: string;
  engine_size: string;
  body_type: string;
  doors: number;
  color: string;
  mileage: number;
  registration: string;
  vin: string;
  tax_status: string;
  tax_due_date: string;
  mot_status: string;
  mot_expiry_date: string;
  listing_id?: string;
}

// Generate a vehicle object
const generateVehicle = (id: string, withListingId = true): Vehicle => {
  const make = makes[randomInt(0, makes.length - 1)];
  const model = models[make][randomInt(0, models[make].length - 1)];
  const year = randomInt(2010, 2023);
  const fuel = fuelTypes[randomInt(0, fuelTypes.length - 1)];
  const transmission = transmissions[randomInt(0, transmissions.length - 1)];
  const color = colors[randomInt(0, colors.length - 1)];
  const mileage = randomInt(1000, 100000);
  const registration = generateRegistration();
  
  const vehicle: Vehicle = {
    id,
    make,
    model,
    variant: `${make} ${model} ${randomInt(1, 3)}.${randomInt(0, 9)} ${fuel === 'diesel' ? 'TDI' : fuel === 'petrol' ? 'TSI' : ''}`,
    year,
    fuel_type: fuel,
    transmission,
    engine_size: `${randomInt(1, 3)}.${randomInt(0, 9)}L`,
    body_type: bodyTypes[randomInt(0, bodyTypes.length - 1)],
    doors: randomInt(3, 5),
    color,
    mileage,
    registration,
    vin: generateVIN(),
    tax_status: Math.random() > 0.2 ? 'Taxed' : 'Untaxed',
    tax_due_date: randomFutureDate(365),
    mot_status: Math.random() > 0.2 ? 'Valid' : 'Expired',
    mot_expiry_date: randomFutureDate(365)
  };
  
  if (withListingId) {
    vehicle.listing_id = `listing${randomInt(1, 100)}`;
  }
  
  return vehicle;
};

// Define MOT history type
interface MOTHistory {
  id: string;
  test_date: string;
  expiry_date: string;
  odometer: number;
  result: string;
  advisory_notes: string;
  failure_reasons: string | null;
}

// Generate a MOT history entry
const generateMOTHistory = (id: string, vehicleId: string, year: number): MOTHistory => {
  const testDate = new Date(year, randomInt(0, 11), randomInt(1, 28)).toISOString().split('T')[0];
  const expiryDate = new Date(year + 1, randomInt(0, 11), randomInt(1, 28)).toISOString().split('T')[0];
  const result = Math.random() > 0.2 ? 'pass' : 'fail';
  
  return {
    id,
    test_date: testDate,
    expiry_date: expiryDate,
    odometer: randomInt(10000, 100000),
    result,
    advisory_notes: result === 'pass' ? (Math.random() > 0.5 ? 'Brake pads wearing thin' : '') : '',
    failure_reasons: result === 'fail' ? 'Excessive play in steering rack' : null
  };
};

// Define listing type
interface VehicleSummary {
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  mileage: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  post_date: string;
  source_url: string;
  image_urls: string[];
  vehicle: VehicleSummary | Vehicle;
}

// Generate a listing object
const generateListing = (id: string): Listing => {
  const make = makes[randomInt(0, makes.length - 1)];
  const model = models[make][randomInt(0, models[make].length - 1)];
  const year = randomInt(2010, 2023);
  const price = randomInt(1000, 50000);
  const location = locations[randomInt(0, locations.length - 1)];
  const fuel = fuelTypes[randomInt(0, fuelTypes.length - 1)];
  const transmission = transmissions[randomInt(0, transmissions.length - 1)];
  const postDate = randomDate(30);
  
  return {
    id,
    title: `${year} ${make} ${model} ${randomInt(1, 3)}.${randomInt(0, 9)} ${fuel === 'diesel' ? 'TDI' : fuel === 'petrol' ? 'TSI' : ''}`,
    price,
    location: `${location}, UK`,
    description: `This ${year} ${make} ${model} is in excellent condition with full service history. Features include air conditioning, navigation system, bluetooth connectivity, and more. ${randomInt(1, 2)} previous owners. Please contact for more details or to arrange a viewing.`,
    post_date: postDate,
    source_url: `https://example-car-site.com/listing/${id}`,
    image_urls: [
      `https://images.unsplash.com/photo-${randomInt(1000000000, 9999999999)}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8JHttYWtlfSUyMCR7bW9kZWx9fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60`,
      `https://images.unsplash.com/photo-${randomInt(1000000000, 9999999999)}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8JHttYWtlfSUyMCR7bW9kZWx9fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60`,
      `https://images.unsplash.com/photo-${randomInt(1000000000, 9999999999)}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8JHttYWtlfSUyMCR7bW9kZWx9fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60`,
    ],
    vehicle: {
      make,
      model,
      year,
      fuel_type: fuel,
      transmission,
      mileage: randomInt(1000, 100000)
    }
  };
};

// Generate a list of listings
const generateListings = (count: number): Listing[] => {
  const listings = [];
  for (let i = 1; i <= count; i++) {
    listings.push(generateListing(`listing${i}`));
  }
  return listings;
};

// Generate a list of vehicles
const generateVehicles = (count: number): Vehicle[] => {
  const vehicles = [];
  for (let i = 1; i <= count; i++) {
    vehicles.push(generateVehicle(`vehicle${i}`));
  }
  return vehicles;
};

// Generate MOT history for a vehicle
const generateMOTHistories = (vehicleId: string, count: number): MOTHistory[] => {
  const histories = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < count; i++) {
    histories.push(generateMOTHistory(`mot${vehicleId}${i}`, vehicleId, currentYear - i));
  }
  
  return histories;
};

// Define search parameters type
interface SearchParams {
  make?: string;
  model?: string;
  min_price?: number;
  max_price?: number;
  year_from?: number;
  year_to?: number;
  fuel_type?: string;
  transmission?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Define search type
interface Search {
  id: string;
  query: {
    make: string;
    model: string;
    min_price: number;
    max_price: number;
    year_from: number;
    year_to: number;
    fuel_type: string;
    transmission: string;
  };
  created_at: string;
}

// Generate mock search results
const generateSearches = (count: number): Search[] => {
  const searches = [];
  for (let i = 1; i <= count; i++) {
    const make = Math.random() > 0.5 ? makes[randomInt(0, makes.length - 1)] : '';
    searches.push({
      id: `search${i}`,
      query: {
        make,
        model: make ? models[make][randomInt(0, models[make].length - 1)] : '',
        min_price: randomInt(1000, 20000),
        max_price: randomInt(20001, 50000),
        year_from: randomInt(2010, 2015),
        year_to: randomInt(2016, 2023),
        fuel_type: Math.random() > 0.5 ? fuelTypes[randomInt(0, fuelTypes.length - 1)] : '',
        transmission: Math.random() > 0.5 ? transmissions[randomInt(0, transmissions.length - 1)] : '',
      },
      created_at: randomDate(30)
    });
  }
  return searches;
};

// Mock data export
export const mockData = {
  // GET /listings
  getListings: (params: SearchParams = {}) => {
    const allListings = generateListings(50);
    let filteredListings = [...allListings];
    
    // Apply filters
    if (params.make) {
      filteredListings = filteredListings.filter(listing => 
        (listing.vehicle as VehicleSummary).make.toLowerCase() === params.make?.toLowerCase());
    }
    
    if (params.model) {
      filteredListings = filteredListings.filter(listing => 
        (listing.vehicle as VehicleSummary).model.toLowerCase().includes(params.model?.toLowerCase() || ''));
    }
    
    if (params.min_price) {
      filteredListings = filteredListings.filter(listing => 
        listing.price >= (params.min_price || 0));
    }
    
    if (params.max_price) {
      filteredListings = filteredListings.filter(listing => 
        listing.price <= (params.max_price || Number.MAX_VALUE));
    }
    
    if (params.year_from) {
      filteredListings = filteredListings.filter(listing => 
        (listing.vehicle as VehicleSummary).year >= (params.year_from || 0));
    }
    
    if (params.year_to) {
      filteredListings = filteredListings.filter(listing => 
        (listing.vehicle as VehicleSummary).year <= (params.year_to || Number.MAX_VALUE));
    }
    
    if (params.fuel_type) {
      filteredListings = filteredListings.filter(listing => 
        (listing.vehicle as VehicleSummary).fuel_type === params.fuel_type);
    }
    
    if (params.transmission) {
      filteredListings = filteredListings.filter(listing => 
        (listing.vehicle as VehicleSummary).transmission === params.transmission);
    }
    
    // Sort
    const sortBy = params.sort_by || 'post_date';
    const sortOrder = params.sort_order || 'desc';
    
    filteredListings.sort((a, b) => {
      let valueA: any, valueB: any;
      
      if (sortBy === 'post_date') {
        valueA = new Date(a.post_date).getTime();
        valueB = new Date(b.post_date).getTime();
      } else if (sortBy in a) {
        valueA = (a as any)[sortBy];
        valueB = (b as any)[sortBy];
      } else {
        valueA = 0;
        valueB = 0;
      }
      
      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    // Paginate
    const page = params.page || 1;
    const perPage = params.per_page || 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedListings = filteredListings.slice(startIndex, endIndex);
    
    return {
      status: 'success',
      data: {
        listings: paginatedListings,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(filteredListings.length / perPage),
          total_count: filteredListings.length,
          per_page: perPage
        }
      }
    };
  },
  
  // GET /listings/:id
  getListingById: (id: string) => {
    const listing = generateListing(id);
    const vehicleId = `vehicle${id.replace('listing', '')}`;
    const vehicle = generateVehicle(vehicleId, false);
    listing.vehicle = vehicle;
    
    return {
      status: 'success',
      data: {
        listing
      }
    };
  },
  
  // GET /vehicles/:id
  getVehicleById: (id: string) => {
    const vehicle = generateVehicle(id);
    
    return {
      status: 'success',
      data: {
        vehicle
      }
    };
  },
  
  // POST /vehicles/lookup
  lookupVehicleByRegistration: (registration: string) => {
    const vehicle = generateVehicle(`vehicle${randomInt(1, 100)}`);
    vehicle.registration = registration;
    
    return {
      status: 'success',
      data: {
        vehicle
      }
    };
  },
  
  // GET /vehicles/:id/mot_histories
  getVehicleMOTHistory: (id: string) => {
    const motHistories = generateMOTHistories(id, randomInt(1, 5));
    
    return {
      status: 'success',
      data: {
        mot_histories: motHistories
      }
    };
  },
  
  // POST /searches
  saveSearch: (searchParams: SearchParams) => {
    return {
      status: 'success',
      data: {
        search_id: `search${randomInt(1, 1000)}`
      }
    };
  },
  
  // GET /searches/recent
  getRecentSearches: () => {
    const searches = generateSearches(5);
    
    return {
      status: 'success',
      data: {
        searches
      }
    };
  }
};

export default mockData; 