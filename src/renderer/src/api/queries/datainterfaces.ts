// import exp from "constants"

export interface Customer {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
  country?: string
  phoneNumber?: string
  profilePicture?: string | null
  gender?: string
  role?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  password?: string
  agent?: Agent
  KycStateTwo?: KycStateTwo
  AccountActivity?: AccountActivity[]
  inappNotification?: InappNotification[]
  status: string
}
export interface InappNotification {
  id: number
  title: string
  description: string
  type: string
  createdAt: string
}

export interface KycStateTwo {
  id: number
  userId: number
  bvn: string
  surName: string
  firtName: string
  dob?: string
  status?: string
  state: string
}
// export intergac
export interface Department {
  id: number
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
export interface AssignedDepartments {
  departmentId: number
  title?: string
}
export interface Agent {
  id: number
  userId: number
  AgentStatus: string
  user: Customer
  assignedDepartments: AssignedDepartments[]
}
export interface TeamMember {
  id: number
  userId: number
  customRoleId: number
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
  subCategory: {
    id: number
    title: string
  }

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
export interface SIngleCustomerResponse {
  status: string
  message: string
  data: Customer
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
export interface SIngleDepartmentResponse {
  status: string
  message: string
  data: Department
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
export interface TeamResponse2 {
  status: string
  message: string
  data: Customer[]
}
export interface CategroiesResponse {
  status: string
  message: string
  data: Category[]
}
export interface SubcategoriesResponse {
  status: string
  message: string
  data: SubCategory[]
}

export interface AlluserResponse {
  status: string
  message: string
  data: Customer[]
}
export interface PostCustomerData {
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
}

export interface UPdateCustomerResponse {
  status: string
  message: string
  datta: any
}

export interface CreateCategoryResponse {
  status: string
  message: string
  datta: Category
}
export interface CategoryDepartment {
  department: Department
}

// Define Single Category Interface
export interface SingleCategory {
  id: number
  title: string
  subTitle: string
  image: string
  createdAt: string
  updatedAt: string
  departments: CategoryDepartment[]
}

export interface SingleCategoryResponse {
  status: string
  message: string
  data: SingleCategory
}
export interface CreateSubCategoryResponse {
  status: string
  message: string
  data: SubCategory
}
// export interface

export interface CreateDepartmentResponse {
  status: string
  message: string
  data: Department
}
export interface Banner {
  id: number
  imgae: string
  createdAt?: string
}
export interface CreateBannerResponse {
  status: string
  message: string
  datta: Banner
}
export interface AllBannerResponse {
  status: string
  message: string
  datta: Banner[]
}

export interface DeleteBannerResponse {
  status: string
  message: string
}

// Notification Interface
export interface Notification {
  id: number
  title: string
  message: string
  type: 'customer' | 'agent' | string
  isSingle: boolean
  image: string
  userId?: number | null
  createdAt?: string
}

// API Response Interface
export interface NotificationsResponse {
  status: string
  message: string
  data: Notification[]
}

export interface createAgentResponse {
  status: string
  message: string
  data: Agent
}

export interface AccountAcitivityResponse {
  status: string
  message: string
  data: AccountActivity[]
}
export interface AccountActivity {
  id: number
  userId: number
  description: string
  createdAt: string
}

export interface AgentToCustomerChatResponse {
  status: string
  message: string
  data: AgentToCustomerChatData[]
}
export interface AgentToCustomerChatData {
  id: number
  customer: {
    id: number
    username: string
    firstname: string
    lastname: string
    role: string
    profilePicture: string
  }
  recentMessage: {
    id: number
    message: string
    createdAt: string
  } | null
  recentMessageTimestamp: string | null
  chatStatus: string
  department: {
    id: number
    title: string
    Type: string
    niche: string
  }
  messagesCount: number
  transactions?: {
    id: number
    amount: number
    amountNaira: number
  }[]
  agent: {
    id: number
    username: string
    firstname: string
    lastname: string
    role: string
    profilePicture: string
  }
  createdAt: string
}

export interface AgentToAgentChatResponse {
  status: string // Indicates the status of the API call
  message: string // Message describing the API response
  data: AgentToAgentChatData[]
}
export interface AgentToAgentChatData {
  id: number // Unique identifier for the chat
  recentMessage: {
    id: number // Unique identifier for the message
    message: string // Content of the message
    createdAt: string // Timestamp of the message
  }
  recentMessageTimestamp: string // Timestamp of the most recent message
  chatStatus: string | null // Status of the chat
  department: {
    id: number // Unique identifier for the department
    title: string // Title of the department
  } | null
  messagesCount: number // Count of messages in the chat
  transactions: {
    id: number // Unique identifier for the transaction
    amount: number // Transaction amount
    amountNaira: number // Transaction amount in Naira
  }[]
  otherParticipants: {
    user: {
      id: number // Unique identifier for the user
      username: string // Username of the user
      firstname: string // First name of the user
      lastname: string // Last name of the user
      role: string // Role of the user (e.g., admin, agent)
      profilePicture: string // URL or filename of the profile picture
    }
  }[]
}

export interface CustomerToAgentChatDetailResponse {
  status: string // Status of the response
  message: string // Response message
  data: {
    id: number // Chat ID
    customer: {
      id: number // Customer ID
      username: string // Customer username
      firstname: string // Customer first name
      lastname: string // Customer last name
      profilePicture: string // Customer profile picture URL
      role: string // Customer role
    }
    agent: {
      id: number // Agent ID
      username: string // Agent username
      firstname: string // Agent first name
      lastname: string // Agent last name
      profilePicture: string // Agent profile picture URL
      role: string // Agent role
    }
    messages: Message[] // Array of messages
    chatDetails: {
      id: number // Chat Details ID
      chatId: number // Chat ID associated with the details
      departmentId: number // Department ID
      categoryId: number // Category ID
      status: string // Chat status
      createdAt: string // Timestamp of creation
      updatedAt: string // Timestamp of last update
      category: {
        id: number // Category ID
        title: string // Category title
        subTitle: string // Category subtitle
        image: string // Category image URL
        status: string // Category status
        createdAt: string // Timestamp of category creation
        updatedAt: string // Timestamp of category update
      }
      department: {
        id: number // Department ID
        title: string // Department title
        description: string // Department description
        icon: string // Department icon URL
        createdAt: string // Timestamp of department creation
        updatedAt: string // Timestamp of department update
        status: string // Department status
        Type: string // Department type
        niche: string // Department niche
      }
    }
    chatType: string // Type of chat (e.g., customer_to_agent)
    createdAt: string // Chat creation timestamp
    updatedAt: string // Chat update timestamp
  }
}

// Separate interface for a message
export interface Message {
  id: number // Message ID
  senderId: number // ID of the sender
  receiverId: number // ID of the receiver
  chatId: number // ID of the chat the message belongs to
  message: string // Message content
  image: string | null // Image URL (if any)
  isRead: boolean // Whether the message has been read
  createdAt: string // Timestamp of message creation
  updatedAt: string // Timestamp of last message update
}

export interface TeamChatDetailsResponse {
  status: string // Status of the API response
  message: string // Response message
  data: {
    id: number // Chat ID
    agent1: {
      id: number // Agent 1 ID
      username: string // Agent 1 username
      firstname: string // Agent 1 first name
      lastname: string // Agent 1 last name
      profilePicture: string // Agent 1 profile picture URL
      role: string // Agent 1 role
    }
    agent2: {
      id: number // Agent 2 ID
      username: string // Agent 2 username
      firstname: string // Agent 2 first name
      lastname: string // Agent 2 last name
      profilePicture: string // Agent 2 profile picture URL
      role: string // Agent 2 role
    }
    messages: Message[] // Array of messages
    chatDetails: {
      id: number // Chat Details ID
      chatId: number // Associated Chat ID
      departmentId?: number // Optional Department ID
      categoryId?: number // Optional Category ID
      status?: string // Chat status
      category?: {
        id: number // Category ID
        title: string // Category title
        subTitle: string // Category subtitle
        image: string // Category image URL
        status: string // Category status
        createdAt: string // Timestamp of category creation
        updatedAt: string // Timestamp of category update
      }
      department?: {
        id: number // Department ID
        title: string // Department title
        description: string // Department description
        icon: string // Department icon URL
        createdAt: string // Timestamp of department creation
        updatedAt: string // Timestamp of department update
        status: string // Department status
        Type: string // Department type
        niche: string // Department niche
      }
      createdAt: string // Timestamp of chat details creation
      updatedAt: string // Timestamp of chat details update
    } | null
    chatType: string // Type of chat (e.g., team_chat)
    createdAt: string // Chat creation timestamp
    updatedAt: string // Chat last update timestamp
  }
}

export interface ChatStats {
  status: string // Status of the API response
  message: string // Response message
  data: {
    totalChats: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    successfulTransactions: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    pendingChats: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    declinedChats: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
    unsuccessfulChats: {
      count: number
      change: 'positive' | 'negative'
      percentage: number
    }
  }
}

export interface ApiResponse {
  status: 'success' | 'error'
  message: string
  token?: string
}
export interface IUser {
  id: number
  username: string
  firstname: string
  lastname: string
  profilePicture: string | null
}
export interface ITeamChatDetailsResponse extends ApiResponse {
  data: {
    id: number
    _count: {
      messages: number
    }
    chatType: string
    participants: {
      user: IUser
    }[]
    messages: {
      id: number
      createdAt: Date
      updatedAt: Date
      chatId: number
      image: string
      message: string
      senderId: number
      receiverId: number
      isRead: boolean
    }[]
    chatGroup: {
      groupName: string
      groupProfile: string | null
      adminId: number
    } | null
  }
}

export interface ITeamChatResponse extends ApiResponse {
  data: ITeamChatDetailsResponse['data'][]
}

export interface IResMessage {
  id: number
  createdAt: Date
  updatedAt: Date
  chatId: number
  message: string
  senderId: number
  receiverId: number
  isRead: boolean
  image?: string
}

export interface ISendMessageToTeamResponse extends ApiResponse {
  data: IResMessage
}

export interface IUser {
  id: number
  username: string
  firstname: string
  lastname: string
  profilePicture: string | null
}
export interface AllAgentsResponse extends ApiResponse {
  data: {
    user: IUser
    id: number
    assignedDepartments: {
      departmentId: number
    }[]
    AgentStatus: AgentStatus
  }[]
}

enum AgentStatus {
  online = 'online',
  offline = 'offline'
}

export interface Role {
  id: number
  name: string // Role name (e.g., "Manager", "Accountant")
  permissions: Permission[] // List of permissions associated with the role
  createdAt: string // ISO string of creation timestamp
  updatedAt: string // ISO string of update timestamp
}
export interface Permission {
  moduleName: string // Name of the module (e.g., "Customer", "Chat")
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canSee: boolean
}
export interface RolesResponse {
  status: string
  message: string
  data: Role[]
}

export interface CreatePermissionsRequest {
  roleName: string // Name of the role (e.g., "Manager", "Accountant")
  permissions: Permission[] // Array of permissions associated with the role
}
