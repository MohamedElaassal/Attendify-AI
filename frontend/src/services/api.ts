const API_BASE_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:5000';

export interface Student {
  student_id: number;
  name: string;
  email: string;
  class: string;
  created_at: string;
}

export interface Professor {
  professor_id: number;
  professor_name: string;
  email: string;
  department: string | null;
  subject: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AttendanceResult {
  success: boolean;
  message: string;
  session_id: number;
  total_students: number;
  present: number;
  absent: number;
  present_students: Array<{
    student_id: number;
    name: string;
    status: string;
    confidence: number;
  }>;
  absent_students: Array<{
    student_id: number;
    name: string;
    status: string;
  }>;
}

export const api = {
  // Health check
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  },

  // Student endpoints
  async registerStudent(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/api/students/register`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async getAllStudents(): Promise<{ success: boolean; students: Student[] }> {
    const response = await fetch(`${API_BASE_URL}/api/students/`);
    return response.json();
  },

  async getStudentsByClass(className: string): Promise<{ success: boolean; students: Student[] }> {
    const response = await fetch(`${API_BASE_URL}/api/students/class/${className}`);
    return response.json();
  },

  async deleteStudent(studentId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Attendance endpoints
  async verifyAttendance(formData: FormData): Promise<AttendanceResult> {
    const response = await fetch(`${API_BASE_URL}/api/attendance/verify`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to verify attendance');
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  },

  // Professor endpoints
  async registerProfessor(data: {
    name: string;
    email: string;
    password: string;
    department?: string;
    subject?: string;
  }): Promise<{ success: boolean; message: string; professor_id: number }> {
    const response = await fetch(`${API_BASE_URL}/api/professors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async loginProfessor(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    professor?: Professor;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/professors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getAllProfessors(): Promise<{ success: boolean; professors: Professor[] }> {
    const response = await fetch(`${API_BASE_URL}/api/professors/`);
    return response.json();
  },

  async getProfessor(professorId: number): Promise<{ success: boolean; professor: Professor }> {
    const response = await fetch(`${API_BASE_URL}/api/professors/${professorId}`);
    return response.json();
  },

  async updateProfessor(professorId: number, data: {
    name?: string;
    email?: string;
    department?: string;
    subject?: string;
    is_active?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/professors/${professorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteProfessor(professorId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/professors/${professorId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
