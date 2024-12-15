// import exp from "constants"

export interface Customer {
  id: number
  username: string
  email?: string
  firstname?: string
  lastname?: string
  country?: string
  phoneNumber?: string
  profilePicture?: string | null
  gender?: string
  role?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  password?: string
  agent?:Agent
}

// export intergac
export interface Department {
  id?: number
  title: string
  description?: string
  icon?: string
  status?: string
  noOfAgents?: number
  createdAt?: string
  updatedAt?: string
  Type?: string
  niche?: string
}
export interface CategoryDepartment {
  id: number
  departmentId: number
}

export interface Category {
  id: number
  title?: string
  subTitle?: string
  image?: string
  createdAt?: string
  updatedAt?: string
  departments?: CategoryDepartment[]
}

export interface CategorySummary {
  id: number
  title: string
}

export interface SubCategory {
  id: number
  title?: string
  price?: string
  createdAt?: string
  updatedAt?: string
  categories?: CategorySummary[] // Association with categories
}

export interface Country {
  id: number
  title?: string
}
export interface Agent {
  id: number
  userId: number
  AgentStatus: string
  user: Customer
}

interface Transaction {
  id: number
  departmentId: number
  categoryId: number
  subCategoryId: number
  countryId: number
  cardType: string
  cardNumber: string
  amount: number
  transactionId: string
  exchangeRate: number
  amountNaira: number
  agentId: number
  customerId: number
  cryptoAmount: number | null
  fromAddress: string | null
  toAddress: string | null
  status: string
  createdAt: string
  updatedAt: string

  // References
  department: Department
  category: Category
  agent?: Agent
  customer?: Customer
}

export interface Rate {
  id?: number // Unique identifier (optional)
  amount?: number // Transaction amount (optional)
  agent?: string // Agent's username (optional)
  rate?: number // Exchange rate (optional)
  amountNaira?: number // Equivalent amount in Naira (optional)
  chatId?: number // Associated chat ID (optional)
  createdAt?: string // Date and time of creation (optional)
}

export interface AllCustomerRespone {
  status: string
  message: string
  data: Customer[]
}
export interface CustomerTransactionResponse {
  status: string
  message: string
  data: Transaction[]
}
export interface DepartmentResponse {
  status: string
  message: string
  data: Department[]
}
export interface AgentByDepartmentResponse {
  status: string
  message: string
  data: Agent[]
}
export interface RateResponse {
  status: string
  message: string
  data: Rate[]
}

export interface TeamResponse {
  status: string
  message: string
  data: Agent[]
}
export interface CategroiesResponse {
  status: string
  message: string
  data: Category[]
}
export interface SubcategoriesResponse{
  status: string
  message: string
  data: SubCategory[]
}

export interface AlluserResponse {
  status: string
  message: string
  data:Customer[]
}
export interface PostCustomerData{
  id: number
  username: string
  email?: string
  firstname?: string
  lastname?: string
  country?: string
  phoneNumber?: string
  profilePicture?: string | null
  gender?: string
  role?: string

  password?: string
}

export interface UPdateCustomerResponse{
  status: string
  message: string
  datta:any
}

export interface CreateCategoryResponse{
  status: string
  message: string
  datta:Category
}
export interface CategoryDepartment {
  department: Department;
}

// Define Single Category Interface
export interface SingleCategory {
  id: number;
  title: string;
  subTitle: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  departments: CategoryDepartment[];
}


export interface SingleCategoryResponse {
  status: string;
  message: string;
  data: SingleCategory;
}
export interface CreateSubCategoryResponse {
  status: string;
  message: string;
  data: SubCategory;
}
// export interface

export interface CreateDepartmentResponse{
  status: string
  message: string
  data:Department
}
export interface Banner{
  id: number
  imgae: string
  createdAt?: string
}
export interface CreateBannerResponse{
  status: string
  message: string
  datta:Banner
}
export interface AllBannerResponse{
  status: string
  message: string
  datta:Banner[]
}

export interface DeleteBannerResponse{
  status: string
  message: string
}

// Notification Interface
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'customer' | 'agent' | string;
  isSingle: boolean;
  image: string;
  userId?: number | null;
  createdAt?: string;
}

// API Response Interface
export interface NotificationsResponse {
  status: string;
  message: string;
  data: Notification[];
}
