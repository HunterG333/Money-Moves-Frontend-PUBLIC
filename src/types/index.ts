  // ========================================
  // AUTHENTICATION TYPES
  // ========================================

  export enum AuthState {
    LOGGED_OUT = "LOGGED_OUT",
    LOGGED_IN = "LOGGED_IN", 
    FULLY_AUTHENTICATED = "FULLY_AUTHENTICATED"
  }

  export interface AuthStateDTO {
    state: AuthState;
  }

  // ========================================
  // ACCOUNT TYPES
  // ========================================

  export enum AccountType {
    INVESTMENT_ACCOUNT = "INVESTMENT_ACCOUNT",
    ASSET_ACCOUNT = "ASSET_ACCOUNT",
    DEBT_ACCOUNT = "DEBT_ACCOUNT",
  }

  export interface Account {
    id: number;
    accountName: string;
    userGivenDisplayName?: string | null;
    value: number;
    plaidAccount: boolean;
    accountType: AccountType;
    hidden: boolean;
  }

  export interface AccountDataDTO {
    investmentAccounts: Account[];
    assetAccounts: Account[];
    debtAccounts: Account[];
  }

   // ========================================
  // USER DATA TYPES
  // ========================================
  
  export interface UserDataDTO {
    email: string;
    name: string;
    completedTutorial: boolean;
  }

  // ========================================
  // NET WORTH TYPES
  // ========================================

  export interface NetWorthDTO {
    netWorth: number;
    date: string;
  }

  export interface NetWorthData {
    labels: string[];
    dataset: number[];
  }

  // ========================================
  // LOAN TYPES
  // ========================================

  export interface StudentLoanDTO {
    accountName: string;
    loanAmount: number;
    interestRate: number;
  }

  export interface CreditLoanDTO {
    accountName: string;
    loanAmount: number;
    interestRate: string;
  }

  export interface MortgageDTO {
    accountName: string;
    loanAmount: number;
    interestRate: number;
  }

  export interface AllLiabilitiesDTO {
    mortgages: MortgageDTO[];
    creditCards: CreditLoanDTO[];
    studentLoans: StudentLoanDTO[];
  }

  // ========================================
  // UI STATE TYPES
  // ========================================

  export interface UIState {
    isTestDataActive: boolean;
    selectedTimePeriod: string;
    numberOfGraphEntries: number;
  }

  // ========================================
  // API RESPONSE TYPES
  // ========================================

  export interface UpdateAccountResult {
    success: boolean;
    message?: string;
  }

  export type ApiResponse<T> = {
    ok: boolean;
    status: number;
    data: T | null;
  };

   // ========================================
  // PLAID TYPES
  // ========================================


  export interface PlaidItem {
  itemId: string;
  institutionName: string;
  institutionId: string;
  accounts: { accountId: string; name: string; value: number }[];
}