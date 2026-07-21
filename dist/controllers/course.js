import { Prisma } from "../prisma/client.js";
export const GetAllCourse = async (req, res) => {
    const all_courses = await Prisma.course.findMany();
    return res.status(201).json({ courses: all_courses });
};
export const GetCourse = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Course id is required" });
    }
    const course = await Prisma.course.findFirst({
        where: {
            id,
        },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({ course });
};
//# sourceMappingURL=course.js.map