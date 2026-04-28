//  const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://finalbackend-02as.onrender.com/api'
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(data: RegisterData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getProfile() {
    return this.request<User>('/profile');
  }

  async getUsers() {
    return this.request<{ users: User[] }>('/users');
  }

  async getOnlineUsers() {
    return this.request<{ users: User[] }>('/users/online');
  }

  // Teams
  async getTeams() {
    return this.request<{ teams: Team[] }>('/teams');
  }

  async createTeam(name: string, description?: string, memberIds?: number[]) {
    return this.request<{ team: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify({ name, description, member_ids: memberIds }),
    });
  }

  async getTeamMembers(teamId: number) {
    return this.request<{ members: TeamMember[] }>(`/teams/${teamId}/members`);
  }

  // Messages
  async getConversations() {
    return this.request<{ conversations: Conversation[] }>('/messages/conversations');
  }

  async getDirectMessages(userId: number) {
    return this.request<{ messages: Message[] }>(`/messages/direct/${userId}`);
  }

  async getTeamMessages(teamId: number) {
    return this.request<{ messages: Message[] }>(`/messages/team/${teamId}`);
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: Notification[] }>('/notifications');
  }

  async markNotificationRead(notifId: number) {
    return this.request(`/notifications/${notifId}/read`, { method: 'POST' });
  }

  // Admin
  async getAdminDashboard() {
    return this.request<{ stats: DashboardStats }>('/admin/dashboard');
  }

  async getLoginAttempts() {
    return this.request<{ attempts: LoginAttempt[] }>('/admin/login-attempts');
  }

  async getFileAccess() {
    return this.request<{ accesses: FileAccess[] }>('/admin/file-access');
  }

  async getRiskUsers() {
    return this.request<{ risk_users: RiskUser[] }>('/admin/risk-users');
  }

  async suspendUser(userId: number) {
    return this.request(`/admin/user/${userId}/suspend`, { method: 'POST' });
  }
}

export const api = new ApiClient();

// Types
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  is_online?: boolean;
  last_seen?: string;
  avatar_color: string;
  risk_score?: number;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  department?: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
}

export interface TeamMember extends User {
  role: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name?: string;
  sender_username?: string;
  sender_avatar?: string;
  receiver_id?: number;
  team_id?: number;
  content: string;
  is_read?: boolean;
  timestamp: string;
}

export interface Conversation {
  user: User;
  last_message: {
    content: string;
    timestamp: string;
  };
  unread_count: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  timestamp: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  online_users: number;
  today_logins: number;
  failed_logins: number;
  blocked_files: number;
  risk_users: number;
}

export interface LoginAttempt {
  id: number;
  username: string;
  ip_address: string;
  device_info: string;
  location: string;
  status: 'success' | 'failed' | 'suspicious';
  is_suspicious: boolean;
  timestamp: string;
}

export interface FileAccess {
  id: number;
  username: string;
  file_path: string;
  action: string;
  risk_level: string;
  is_authorized: boolean;
  timestamp: string;
}

export interface RiskUser {
  id: number;
  username: string;
  email: string;
  risk_score: number;
  status: 'critical' | 'high' | 'medium';
  reasons: string;
  last_login: string;
}
