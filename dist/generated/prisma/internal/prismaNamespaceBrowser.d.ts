import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly User: 'User';
    readonly Course: 'Course';
    readonly Category: 'Category';
    readonly Section: 'Section';
    readonly Lesson: 'Lesson';
    readonly Video: 'Video';
    readonly Enrollment: 'Enrollment';
    readonly LessonProgress: 'LessonProgress';
    readonly Payment: 'Payment';
    readonly Certificate: 'Certificate';
    readonly Review: 'Review';
    readonly WebhookEvent: 'WebhookEvent';
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: 'ReadUncommitted';
    readonly ReadCommitted: 'ReadCommitted';
    readonly RepeatableRead: 'RepeatableRead';
    readonly Serializable: 'Serializable';
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: 'id';
    readonly firstName: 'firstName';
    readonly lastName: 'lastName';
    readonly email: 'email';
    readonly password: 'password';
    readonly role: 'role';
    readonly profileImage: 'profileImage';
    readonly googleId: 'googleId';
    readonly avatar: 'avatar';
    readonly provider: 'provider';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const CourseScalarFieldEnum: {
    readonly id: 'id';
    readonly title: 'title';
    readonly slug: 'slug';
    readonly description: 'description';
    readonly thumbnail: 'thumbnail';
    readonly price: 'price';
    readonly isPublished: 'isPublished';
    readonly duration: 'duration';
    readonly categoryId: 'categoryId';
    readonly instructorId: 'instructorId';
    readonly createdAt: 'createdAt';
    readonly updatedAt: 'updatedAt';
    readonly outcomes: 'outcomes';
};
export type CourseScalarFieldEnum = (typeof CourseScalarFieldEnum)[keyof typeof CourseScalarFieldEnum];
export declare const CategoryScalarFieldEnum: {
    readonly id: 'id';
    readonly name: 'name';
};
export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum];
export declare const SectionScalarFieldEnum: {
    readonly id: 'id';
    readonly title: 'title';
    readonly position: 'position';
    readonly courseId: 'courseId';
};
export type SectionScalarFieldEnum = (typeof SectionScalarFieldEnum)[keyof typeof SectionScalarFieldEnum];
export declare const LessonScalarFieldEnum: {
    readonly id: 'id';
    readonly title: 'title';
    readonly description: 'description';
    readonly duration: 'duration';
    readonly position: 'position';
    readonly videoId: 'videoId';
    readonly sectionId: 'sectionId';
};
export type LessonScalarFieldEnum = (typeof LessonScalarFieldEnum)[keyof typeof LessonScalarFieldEnum];
export declare const VideoScalarFieldEnum: {
    readonly id: 'id';
    readonly originalUrl: 'originalUrl';
    readonly hlsUrl: 'hlsUrl';
    readonly thumbnail: 'thumbnail';
    readonly duration: 'duration';
    readonly status: 'status';
    readonly createdAt: 'createdAt';
};
export type VideoScalarFieldEnum = (typeof VideoScalarFieldEnum)[keyof typeof VideoScalarFieldEnum];
export declare const EnrollmentScalarFieldEnum: {
    readonly id: 'id';
    readonly userId: 'userId';
    readonly courseId: 'courseId';
    readonly completedLessons: 'completedLessons';
    readonly totalLessons: 'totalLessons';
    readonly lastLessonId: 'lastLessonId';
    readonly enrolledAt: 'enrolledAt';
};
export type EnrollmentScalarFieldEnum = (typeof EnrollmentScalarFieldEnum)[keyof typeof EnrollmentScalarFieldEnum];
export declare const LessonProgressScalarFieldEnum: {
    readonly id: 'id';
    readonly userId: 'userId';
    readonly lessonId: 'lessonId';
    readonly watched: 'watched';
    readonly completedAt: 'completedAt';
};
export type LessonProgressScalarFieldEnum = (typeof LessonProgressScalarFieldEnum)[keyof typeof LessonProgressScalarFieldEnum];
export declare const PaymentScalarFieldEnum: {
    readonly id: 'id';
    readonly amount: 'amount';
    readonly reference: 'reference';
    readonly status: 'status';
    readonly userId: 'userId';
    readonly courseId: 'courseId';
    readonly createdAt: 'createdAt';
    readonly email: 'email';
    readonly phoneNumber: 'phoneNumber';
    readonly fullName: 'fullName';
};
export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum];
export declare const CertificateScalarFieldEnum: {
    readonly id: 'id';
    readonly userId: 'userId';
    readonly courseId: 'courseId';
    readonly certificateNo: 'certificateNo';
    readonly issuedAt: 'issuedAt';
};
export type CertificateScalarFieldEnum = (typeof CertificateScalarFieldEnum)[keyof typeof CertificateScalarFieldEnum];
export declare const ReviewScalarFieldEnum: {
    readonly id: 'id';
    readonly rating: 'rating';
    readonly comment: 'comment';
    readonly userId: 'userId';
    readonly courseId: 'courseId';
};
export type ReviewScalarFieldEnum = (typeof ReviewScalarFieldEnum)[keyof typeof ReviewScalarFieldEnum];
export declare const WebhookEventScalarFieldEnum: {
    readonly id: 'id';
    readonly eventId: 'eventId';
    readonly eventType: 'eventType';
    readonly payload: 'payload';
    readonly processedAt: 'processedAt';
    readonly createdAt: 'createdAt';
};
export type WebhookEventScalarFieldEnum = (typeof WebhookEventScalarFieldEnum)[keyof typeof WebhookEventScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: 'asc';
    readonly desc: 'desc';
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: 'default';
    readonly insensitive: 'insensitive';
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: 'first';
    readonly last: 'last';
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map