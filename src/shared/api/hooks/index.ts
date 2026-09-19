export {
  userSummaryQueryKey,
  useUserSummary,
  type OperationSummary,
  type UseUserSummaryResponse,
} from './useGlobalBalance';
export { useAccounts, accountsQueryKey, type UseAccountsResponse } from './useAccounts';
export { useCapital } from './useCapital';
export {
  capitalDynamicsQueryKey,
  useCapitalDynamics,
  type CapitalMonth,
  type UseCapitalDynamicsResponse,
} from './useCapitalDynamics';
export { useProfile, type UseProfileResponse } from './useProfile';
export {
  consentStatusQueryKey,
  useConsentStatus,
  useDeleteAccount,
  useGrantConsent,
  useRevokeConsent,
  type ConsentStatus,
  type UseConsentStatusResponse,
} from './useConsent';
export {
  legalDocumentQueryKey,
  useLegalDocument,
  type LegalDocument,
  type UseLegalDocumentResponse,
} from './useLegalDocument';
export { useCurrency } from './useCurrency';
export { useAdminStatus } from './useAdminStatus';
export { useExchangeRates, type UseExchangeRatesResponse } from './useExchangeRates';
export {
  bootstrapQueryKey,
  invalidateHomeCaches,
  useBootstrap,
  type BootstrapOnboarding,
  type BootstrapProfile,
  type UseBootstrapResponse,
} from './useBootstrap';
export {
  monthCategorySummaryQueryKey,
  useMonthCategorySummary,
  type MonthCategorySummaryRow,
  type UseMonthCategorySummaryResponse,
} from './useMonthCategorySummary';
export {
  operationMonthsQueryKey,
  useOperationMonths,
  type UseOperationMonthsResponse,
} from './useOperationMonths';

export { useGoals, goalsQueryKey } from './useGoals';
