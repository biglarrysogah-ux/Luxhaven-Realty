export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  images: string[]; // URLs or base64
  videos: string[]; // URLs or base64
  beds: number;
  baths: number;
  sqft: number;
  features: string[];
  dateAdded: string;
}

export interface Booking {
  id: string;
  fullName: string;
  whatsappNumber: string;
  phoneNumber: string;
  propertyId: string;
  propertyName: string;
  preferredDate: string;
  preferredTime: string;
  additionalNotes: string;
  dateAdded: string;
}

export interface HomeVideo {
  id: string;
  url: string;
  updatedAt: string;
}

export interface OwnerPhoto {
  id: string;
  url: string;
  updatedAt: string;
}
