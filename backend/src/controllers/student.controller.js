import prisma from "../prisma.js";

// CREATE STUDENT
export const createStudent = async (req, res, next) => {
  try {
    const { name, email, age } = req.body;

    const student = await prisma.student.create({
      data: { name, email, age }
    });

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// GET ALL STUDENTS WITH PAGINATION
export const getStudents = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await prisma.student.count();

    const students = await prisma.student.findMany({
      skip,
      take: limit,
      include: { marks: true },
      orderBy: { id: "desc" }
    });

    res.json({
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      },
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// GET STUDENT BY ID
export const getStudentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const student = await prisma.student.findUnique({
      where: { id },
      include: { marks: true }
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (error) {
    next(error);
  }
};

// UPDATE STUDENT
export const updateStudent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const student = await prisma.student.update({
      where: { id },
      data: req.body
    });

    res.json(student);
  } catch (error) {
    next(error);
  }
};

// DELETE STUDENT
export const deleteStudent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.student.delete({
      where: { id }
    });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};