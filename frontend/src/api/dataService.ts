import apiClient from './apiClient';

export const dataService = {
    getDashboard: async () => {
        const response = await apiClient.get('/dashboard');
        return response.data;
    },

    getCourses: async () => {
        const response = await apiClient.get('/courses');
        return response.data;
    },

    getCourseById: async (id: string) => {
        const response = await apiClient.get(`/courses/${id}`);
        return response.data;
    },


    getTests: async () => {
        const response = await apiClient.get('/tests');
        return response.data;
    },

    getTestById: async (id: string) => {
        const response = await apiClient.get(`/tests/${id}`);
        return response.data;
    },

    submitTestScore: async (testId: string, answers: { questionId: string; selectedOption: number | null }[]) => {
        const response = await apiClient.post('/tests/submit', { testId, answers });
        return response.data;
    },

    getLeaderboard: async () => {
        const response = await apiClient.get('/users/leaderboard');
        return response.data;
    },

    getAnnouncements: async () => {
        const response = await apiClient.get('/announcements');
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: { mobile?: string; age?: string; city?: string; state?: string; pincode?: string; }) => {
        const response = await apiClient.put('/users/profile', data);
        return response.data;
    },

    getMyCourses: async () => {
        const response = await apiClient.get('/users/my-courses');
        return response.data;
    },

    getMyAttempts: async () => {
        const response = await apiClient.get('/users/my-attempts');
        return response.data;
    },

    uploadImage: async (formData: FormData) => {
        const response = await apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
