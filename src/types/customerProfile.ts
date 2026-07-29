export interface CustomerProfileData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  shippingAddress: string | null;
  totalPoints: number;
  createdAt: string | null;
}

export interface UpdateCustomerProfileInput {
  fullName: string;
  phoneNumber: string | null;
  shippingAddress: string | null;
}
