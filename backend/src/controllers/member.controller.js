import prisma from "../prisma.js";

// CREATE MEMBER
export const createMember = async (req, res, next) => {
  try {
    const { memberName, memberEmail, memberAge, memberParentId } = req.body;

    const member = await prisma.member.create({
      data: {
        memberName,
        memberEmail,
        memberAge: Number(memberAge),
        memberParentId: memberParentId ? Number(memberParentId) : null
      }
    });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

// GET ALL MEMBERS WITH PAGINATION
export const getMembers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await prisma.member.count();

    const members = await prisma.member.findMany({
      skip,
      take: limit,
      include: {
        marks: true,
        parent: {
          select: {
            id: true,
            memberName: true,
            memberEmail: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    res.json({
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      },
      data: members
    });
  } catch (error) {
    next(error);
  }
};

// GET MEMBER BY ID
export const getMemberById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        marks: true,
        parent: {
          select: {
            id: true,
            memberName: true,
            memberEmail: true
          }
        }
      }
    });

    if (!member) return res.status(404).json({ message: "Member not found" });

    res.json(member);
  } catch (error) {
    next(error);
  }
};

// UPDATE MEMBER
export const updateMember = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { memberName, memberEmail, memberAge, memberParentId } = req.body;

    const member = await prisma.member.update({
      where: { id },
      data: {
        memberName,
        memberEmail,
        memberAge: memberAge ? Number(memberAge) : undefined,
        memberParentId: memberParentId ? Number(memberParentId) : null
      }
    });

    res.json(member);
  } catch (error) {
    next(error);
  }
};

// DELETE MEMBER
export const deleteMember = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.member.delete({
      where: { id }
    });

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    next(error);
  }
};
