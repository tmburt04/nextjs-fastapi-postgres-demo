
export interface ChatThread {
    id: number;
    name: string;
    owner_id: number;
    created_date: number;
}

export interface ChatThreadMessage {
    id?: number
    content: string
    created_date?: number
    role: string
    author?: User
    author_id: string
}

export interface User {
    id?: string;
    name: string;
    created_date?: number;
};