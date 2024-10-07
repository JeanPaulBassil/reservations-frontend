export interface User {
    id: string
    username: string
    role: UserRole
    companyId: string
}

export enum UserRole {
    ADMIN = "ADMIN",
    EMPLOYEE = "EMPLOYEE",
    OWNER = "OWNER"
}

export interface CreateUser {
    username: string
    password: string
}

export interface Employee extends User {
    entityId: string
}

export interface CreateEmployee extends CreateUser {
    entityId: string
}
