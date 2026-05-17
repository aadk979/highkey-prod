export interface CollectionLocation {
  id: string;
  name: string;
  address: string;
  postalCode: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationPayload {
  name: string;
  address: string;
  postalCode?: string;
  instructions?: string;
  isActive?: boolean;
}

export type UpdateLocationPayload = Partial<CreateLocationPayload>;
