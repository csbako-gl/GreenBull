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

export interface Privilage {
    id : number;
    name : string;
}

export interface LoggedUser {
    id : number;
    firstName : string;
    lastName : string;
    email : string;
    privileges : Privilage[];
}