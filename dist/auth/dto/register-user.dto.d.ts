export declare enum Role {
    SELLER = "SELLER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER"
}
export declare class RegisterUserDto {
    name: string;
    email: string;
    password: string;
    branchId: string;
    role?: Role;
}
