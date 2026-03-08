import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Student {
    id: bigint;
    udiseCode: string;
    col1: string;
    col2: string;
    col3: string;
    grNo: string;
    name: string;
    aadharNo: string;
    apaarNo: string;
    penNo: string;
    rollNo: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStudent(rollNo: bigint, name: string, grNo: string, penNo: string, apaarNo: string, udiseCode: string, aadharNo: string, col1: string, col2: string, col3: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStudent(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStudents(): Promise<Array<Student>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateStudent(id: bigint, rollNo: bigint, name: string, grNo: string, penNo: string, apaarNo: string, udiseCode: string, aadharNo: string, col1: string, col2: string, col3: string): Promise<void>;
}
