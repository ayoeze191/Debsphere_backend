export declare const UserRole: {
    readonly ADMIN: 'ADMIN';
    readonly INSTRUCTOR: 'INSTRUCTOR';
    readonly STUDENT: 'STUDENT';
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const VideoStatus: {
    readonly UPLOADING: 'UPLOADING';
    readonly PROCESSING: 'PROCESSING';
    readonly READY: 'READY';
    readonly FAILED: 'FAILED';
};
export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];
export declare const AuthProvider: {
    readonly LOCAL: 'LOCAL';
    readonly GOOGLE: 'GOOGLE';
};
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
export declare const PaymentStatus: {
    readonly PENDING: 'PENDING';
    readonly SUCCESS: 'SUCCESS';
    readonly FAILED: 'FAILED';
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
//# sourceMappingURL=enums.d.ts.map