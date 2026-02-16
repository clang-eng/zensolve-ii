export type UserRole = 'citizen' | 'admin' | 'department';

export type ComplaintStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolved' 
  | 'validated' 
  | 'rejected' 
  | 'reopened';

export type ComplaintCategory = 
  | 'Infrastructure'
  | 'Sanitation'
  | 'Public Safety'
  | 'Water Supply'
  | 'Electricity'
  | 'Roads & Transport'
  | 'Parks & Recreation'
  | 'Other';

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  points: number;
  badge: string;
  location?: Location;
  is_banned: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  location: Location;
  address?: string;
  images: string[];
  priority: number;
  assigned_to?: string;
  created_at: string;
  resolved_at?: string;
  updated_at: string;
}

export interface Validation {
  id: string;
  complaint_id: string;
  validator_id: string;
  validation_type: 'verified' | 'not_resolved';
  comment?: string;
  proof_images: string[];
  created_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points_change: number;
  transaction_type: 'complaint_resolved' | 'validation' | 'redemption' | 'fraud_penalty' | 'manual_adjustment';
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface BusinessPartner {
  id: string;
  business_name: string;
  contact_email?: string;
  contact_phone?: string;
  location?: Location;
  address?: string;
  offers: Array<{
    id: string;
    title: string;
    points_required: number;
    description: string;
    terms?: string;
  }>;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 
    | 'complaint_update' 
    | 'validation_request' 
    | 'point_earned' 
    | 'badge_unlocked' 
    | 'complaint_reopened' 
    | 'assignment' 
    | 'system_alert';
  title: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}
