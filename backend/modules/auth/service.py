"""Auth service: demo login, token generation, and audit logging."""

import logging
from typing import Any, Dict
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.errors import ValidationError
from backend.core.security import create_access_token
from backend.models.curriculum import User, Student, Teacher
from backend.models.governance import AuditLog
from backend.schemas.common import UserResponse, TokenResponse

logger = logging.getLogger("sgsu.auth")


def authenticate_demo_role(role: str, db: Session) -> TokenResponse:
    """Log in as one of the three predefined demo users: TEACHER, STUDENT, or ADMIN."""
    role = role.upper().strip()
    if role not in ("TEACHER", "STUDENT", "ADMIN"):
        raise ValidationError(f"Invalid demo role '{role}'. Allowed roles: TEACHER, STUDENT, ADMIN")

    user = db.query(User).filter(User.role == role).order_by(User.id.asc()).first()
    if not user:
        raise ValidationError(f"No seeded user exists for role '{role}'")

    student_id = user.student.id if user.student else None
    teacher_id = user.teacher.id if user.teacher else None
    section_id = user.student.section_id if user.student else None

    token = create_access_token(
        user_id=user.id,
        role=user.role,
        student_id=student_id,
        teacher_id=teacher_id,
        section_id=section_id,
    )

    # Record login in audit log
    audit = AuditLog(
        action="LOGIN",
        user_id=user.id,
        role=user.role,
        entity="USER",
        entity_id=user.id,
        detail={"demo_login": True, "role": role},
    )
    db.add(audit)
    db.commit()

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        student_id=student_id,
        teacher_id=teacher_id,
        section_id=section_id,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_TTL_HOURS * 3600,
        user=user_resp,
    )


def authenticate_student_by_id(identifier: str, db: Session) -> TokenResponse:
    """Log in student directly via their student ID or roll number."""
    clean_id = identifier.strip().upper()
    if not clean_id:
        raise ValidationError("Student ID or Roll Number cannot be empty")

    student = db.query(Student).filter(Student.roll_no == clean_id).first()
    if not student:
        student = db.query(Student).join(User, Student.user_id == User.id).filter(
            (Student.roll_no.ilike(f"%{clean_id}%")) | 
            (User.email.ilike(f"%{clean_id}%"))
        ).first()

    if not student and clean_id.isdigit():
        student = db.query(Student).filter(Student.id == int(clean_id)).first()

    if not student:
        raise ValidationError(f"Student with ID/Roll Number '{identifier}' not found in SGSU records")

    user = student.user
    token = create_access_token(
        user_id=user.id,
        role="STUDENT",
        student_id=student.id,
        teacher_id=None,
        section_id=student.section_id,
    )

    audit = AuditLog(
        action="LOGIN",
        user_id=user.id,
        role="STUDENT",
        entity="STUDENT",
        entity_id=student.id,
        detail={"student_id_login": True, "roll_no": student.roll_no},
    )
    db.add(audit)
    db.commit()

    user_resp = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        student_id=student.id,
        teacher_id=None,
        section_id=student.section_id,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_TTL_HOURS * 3600,
        user=user_resp,
    )

