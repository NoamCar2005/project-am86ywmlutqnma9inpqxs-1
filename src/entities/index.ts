// Local Services (replacing Superdev entities)
import { CreativeService, ProjectService, CreditTransactionService } from '@/lib/localStorage';

export const Creative = CreativeService;
export const Project = ProjectService;
export const CreditTransaction = CreditTransactionService;
export const User = {
  // Mock user service
  getCurrentUser: () => ({ id: 'local-user', name: 'משתמש מקומי' }),
  updateProfile: async (data: any) => ({ ...data, id: 'local-user' })
};