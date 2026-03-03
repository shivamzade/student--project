import prisma from "../prisma.js";

// CREATE MARK
export const createMark = async (req, res, next) => {
  try {
    const { subject, score, memberId } = req.body;

    const mark = await prisma.mark.create({
      data: { subject, score, memberId: Number(memberId) }
    });

    res.status(201).json(mark);
  } catch (error) {
    next(error);
  }
};
