"""Curriculum routes (C01, C02, C03, C04, C05, S01)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.core.db import get_db
from backend.core.security import get_current_user_claims, require_role
from backend.modules.curriculum.service import (
    list_courses,
    get_course_detail,
    get_topic_detail,
    list_learning_outcomes,
    list_sections,
    list_approved_sources,
    create_student,
    list_students,
    delete_student,
    mark_student_attendance,
    list_teachers,
    create_teacher,
    delete_teacher,
    create_course,
    delete_course,
    create_student_query,
    list_student_queries,
    reply_student_query,
)
from backend.schemas.curriculum import (
    CourseSchema,
    CourseDetailSchema,
    TopicDetailSchema,
    OutcomeSchema,
    SectionSummarySchema,
    SourceSchema,
    StudentCreateRequest,
    StudentSummarySchema,
    StudentAttendanceRequest,
    TeacherCreateRequest,
    TeacherSummarySchema,
    CourseCreateRequest,
    StudentQueryCreateRequest,
    StudentQueryReplyRequest,
    StudentQuerySchema,
)

router = APIRouter(prefix="/api", tags=["Curriculum"])


@router.get("/courses", response_model=List[CourseSchema])
def get_courses(
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """C01: List all courses with sections and topic counts."""
    return list_courses(db)


@router.get("/courses/{id}", response_model=CourseDetailSchema)
def get_course(
    id: int,
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """C02: Get course details and topics."""
    return get_course_detail(id, db)


@router.get("/topics/{id}", response_model=TopicDetailSchema)
def get_topic(
    id: int,
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """C03: Get topic with learning outcomes (LO1–4) and prerequisites (P1, P2)."""
    return get_topic_detail(id, db)


@router.get("/learning-outcomes", response_model=List[OutcomeSchema])
def get_learning_outcomes(
    topic_id: Optional[int] = Query(None),
    kind: Optional[str] = Query(None),
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """C04: List learning outcomes filtered by topic and kind."""
    return list_learning_outcomes(topic_id, kind, db)


@router.get("/sections", response_model=List[SectionSummarySchema])
def get_sections(
    course_id: Optional[int] = Query(None),
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """C05: List class sections for course."""
    return list_sections(course_id, db)


@router.get("/sources", response_model=List[SourceSchema])
def get_sources(
    topic_id: Optional[int] = Query(None),
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """S01: List approved curriculum sources (citation fields only, body_text excluded)."""
    return list_approved_sources(topic_id, db)


@router.post("/students", response_model=StudentSummarySchema, status_code=status.HTTP_201_CREATED)
def add_student(
    data: StudentCreateRequest,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher/Admin adds a student into the SQLite database with live mastery tracking."""
    return create_student(data, db)


@router.get("/students", response_model=List[StudentSummarySchema])
def get_students(
    section_id: Optional[int] = Query(None),
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """List students in section with live mastery metrics."""
    return list_students(section_id, db)


@router.delete("/students/{id}")
def remove_student(
    id: int,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher/Admin removes a student from SQLite database."""
    return delete_student(id, db)


@router.post("/students/attendance")
def update_attendance(
    data: StudentAttendanceRequest,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Mark attendance (PRESENT / ABSENT) for student."""
    return mark_student_attendance(data.student_id, data.status, db)


@router.get("/teachers", response_model=List[TeacherSummarySchema])
def get_teachers(
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """List all faculty teachers."""
    return list_teachers(db)


@router.post("/teachers", response_model=TeacherSummarySchema, status_code=status.HTTP_201_CREATED)
def add_teacher(
    data: TeacherCreateRequest,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher/Admin adds a new faculty teacher into university SQLite database."""
    return create_teacher(data, db)


@router.delete("/teachers/{id}")
def remove_teacher(
    id: int,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher/Admin removes a faculty teacher."""
    return delete_teacher(id, db)


# --- COURSE / SUBJECT MANAGEMENT ---
@router.post("/courses", response_model=CourseSchema, status_code=status.HTTP_201_CREATED)
def add_course(
    data: CourseCreateRequest,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher/Admin adds a new course/subject into curriculum database."""
    return create_course(data, db)


@router.delete("/courses/{id}")
def remove_course(
    id: int,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher/Admin removes a course/subject."""
    return delete_course(id, db)


# --- STUDENT INBOUND EMAIL QUERIES ---
@router.post("/student-queries", response_model=StudentQuerySchema, status_code=status.HTTP_201_CREATED)
def submit_student_query(
    data: StudentQueryCreateRequest,
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """Student submits an academic query dispatched to teacher's email."""
    return create_student_query(data, claims, db)


@router.get("/student-queries", response_model=List[StudentQuerySchema])
def get_student_queries(
    teacher_email: Optional[str] = Query(None),
    student_id: Optional[int] = Query(None),
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db),
):
    """Retrieve student queries for teacher inbox or student tracking."""
    return list_student_queries(teacher_email, student_id, db)


@router.post("/student-queries/{id}/reply", response_model=StudentQuerySchema)
def reply_to_student_query(
    id: int,
    data: StudentQueryReplyRequest,
    claims: dict = Depends(require_role("TEACHER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Teacher replies to student query, marking it resolved."""
    return reply_student_query(id, data.reply, db)



