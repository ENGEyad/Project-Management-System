import axios from 'axios';

// إعداد رابط السيرفر الأساسي (Laravel)
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// تصدير المهام الأساسية للمشاريع
export const getProjects = () => api.get('/projects');
export const createProject = (data) => api.get('/projects', data); 
export const addProject = (data) => api.post('/projects', data);
export const editProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// تصدير المهام الأساسية للمهام (Tasks)
export const getTasks = (projectId, status) => {
    let url = `/tasks/project/${projectId}`;
    if (status) url += `?status=${status}`; 
    return api.get(url);
};
export const addTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;
