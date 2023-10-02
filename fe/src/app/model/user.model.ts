export interface User {
    username: string;
    password: string;
}

export interface UserCreateData {
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    matchingPassword: string;
}