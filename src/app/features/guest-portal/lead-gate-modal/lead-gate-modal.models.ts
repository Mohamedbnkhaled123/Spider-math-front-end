import { IUnlockPlacementResult } from '../../../core/services/public-discovery.models';

export interface ILeadGateFormData {
  fullName: string;
  phone: string;
  email?: string;
  googleId?: string;
}

export type { IUnlockPlacementResult };
