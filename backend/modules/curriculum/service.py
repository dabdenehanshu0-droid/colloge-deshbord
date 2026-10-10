"""Curriculum service: queries courses, topics, learning outcomes, sections, and approved sources."""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.core.errors import NotFoundError, ValidationError
from backend.models.curriculum import (
    Course,
    ClassSection,
    Topic,
    LearningOutcome,
    PrerequisiteEdge,
    User,
    Student,
    Teacher,
    StudentQuery,
)
from backend.models.learner import Mastery, SectionOutcomeStats
from backend.models.content import Source
from backend.models.assessment import Response
from backend.models.evidence import LearningEvent
from backend.schemas.curriculum import (
    CourseSchema,
    CourseDetailSchema,
    SectionSummarySchema,
    TopicSummarySchema,
    TopicDetailSchema,
    OutcomeSchema,
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


def list_courses(db: Session) -> List[CourseSchema]:
    courses = db.query(Course).all()
    result = []
    for c in courses:
        sections = [
            SectionSummarySchema(id=s.id, name=s.name, course_id=s.course_id, enrolled_count=s.enrolled_count)
            for s in c.sections
        ]
        result.append(
            CourseSchema(
                id=c.id,
                code=c.code,
                name=c.name,
                programme=c.programme,
                semester=c.semester,
                sections=sections,
                topic_count=len(c.topics),
            )
        )
    return result


def get_course_detail(course_id: int, db: Session) -> CourseDetailSchema:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundError(f"Course {course_id} not found")

    sections = [
        SectionSummarySchema(id=s.id, name=s.name, course_id=s.course_id, enrolled_count=s.enrolled_count)
        for s in course.sections
    ]
    topics = [
        TopicSummarySchema(
            id=t.id,
            seq=t.seq,
            title=t.title,
            outcome_count=len([o for o in t.learning_outcomes if o.kind == "OUTCOME"]),
        )
        for t in course.topics
    ]
    return CourseDetailSchema(
        id=course.id,
        code=course.code,
        name=course.name,
        programme=course.programme,
        semester=course.semester,
        sections=sections,
        topic_count=len(course.topics),
        topics=topics,
    )


def get_topic_detail(topic_id: int, db: Session) -> TopicDetailSchema:
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise NotFoundError(f"Topic {topic_id} not found")

    outcomes = []
    prerequisites = []

    for lo in topic.learning_outcomes:
        # Find prerequisite edges
        edges = db.query(PrerequisiteEdge).filter(PrerequisiteEdge.outcome_id == lo.id).all()
        prereq_ids = [e.prerequisite_id for e in edges]
        schema = OutcomeSchema(
            id=lo.id,
            code=lo.code,
            statement=lo.statement,
            kind=lo.kind,
            prerequisite_ids=prereq_ids,
        )
        if lo.kind == "OUTCOME":
            outcomes.append(schema)
        else:
            prerequisites.append(schema)

    return TopicDetailSchema(
        id=topic.id,
        title=topic.title,
        course_id=topic.course_id,
        outcomes=outcomes,
        prerequisites=prerequisites,
    )


def list_learning_outcomes(topic_id: Optional[int], kind: Optional[str], db: Session) -> List[OutcomeSchema]:
    query = db.query(LearningOutcome)
    if topic_id:
        query = query.filter(LearningOutcome.topic_id == topic_id)
    if kind:
        query = query.filter(LearningOutcome.kind == kind)

    results = []
    for lo in query.order_by(LearningOutcome.code.asc()).all():
        edges = db.query(PrerequisiteEdge).filter(PrerequisiteEdge.outcome_id == lo.id).all()
        prereq_ids = [e.prerequisite_id for e in edges]
        results.append(
            OutcomeSchema(
                id=lo.id,
                code=lo.code,
                statement=lo.statement,
                kind=lo.kind,
                prerequisite_ids=prereq_ids,
            )
        )
    return results


STUDENT_ATTENDANCE_STATE = {}


def ensure_six_sections(course: Course, db: Session):
    """Ensure all 6 sections (5-A through 5-F) exist in SQLite database with realistic student enrollment."""
    specs = [
        ("5-A", 35),
        ("5-B", 42),
        ("5-C", 38),
        ("5-D", 30),
        ("5-E", 45),
        ("5-F", 28),
    ]
    teacher = db.query(Teacher).first()
    teacher_id = teacher.id if teacher else None
    existing = {s.name: s for s in db.query(ClassSection).filter(ClassSection.course_id == course.id).all()}
    
    created_any = False
    for name, enrolled in specs:
        if name not in existing:
            sec = ClassSection(
                course_id=course.id,
                name=name,
                teacher_id=teacher_id,
                enrolled_count=enrolled,
            )
            db.add(sec)
            created_any = True
    if created_any:
        db.commit()


def list_sections(course_id: Optional[int], db: Session) -> List[SectionSummarySchema]:
    course = db.query(Course).first()
    if course:
        ensure_six_sections(course, db)
    query = db.query(ClassSection)
    if course_id:
        query = query.filter(ClassSection.course_id == course_id)
    return [
        SectionSummarySchema(id=s.id, name=s.name, course_id=s.course_id, enrolled_count=s.enrolled_count)
        for s in query.order_by(ClassSection.name.asc()).all()
    ]


def list_approved_sources(topic_id: Optional[int], db: Session) -> List[SourceSchema]:
    query = db.query(Source).filter(Source.approved == True)
    if topic_id:
        query = query.filter(Source.topic_id == topic_id)
    return [
        SourceSchema(id=s.id, title=s.title, citation=s.citation, approved=s.approved)
        for s in query.all()
    ]


def create_student(data: StudentCreateRequest, db: Session) -> StudentSummarySchema:
    """Store new student in SQL database (users, students, and baseline mastery)."""
    clean_email = data.email.strip().lower()
    clean_roll = data.roll_no.strip().upper()

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise ValidationError(f"User with email '{clean_email}' already exists.")

    existing_student = db.query(Student).filter(Student.roll_no == clean_roll).first()
    if existing_student:
        raise ValidationError(f"Student with roll number '{clean_roll}' already exists.")

    section = db.query(ClassSection).filter(ClassSection.id == data.section_id).first()
    if not section:
        raise NotFoundError(f"Class Section {data.section_id} not found.")

    user = User(
        name=data.name.strip(),
        email=clean_email,
        role="STUDENT",
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        roll_no=clean_roll,
        section_id=section.id,
        is_live=True,
        is_named=True,
    )
    db.add(student)
    db.flush()

    section.enrolled_count = (section.enrolled_count or 0) + 1

    outcomes = db.query(LearningOutcome).filter(LearningOutcome.kind == "OUTCOME").all()
    for lo in outcomes:
        mastery = Mastery(
            student_id=student.id,
            learning_outcome_id=lo.id,
            estimate=0.55,
            percent=55,
            status="DEVELOPING",
            prior_estimate=0.55,
            prior_weight=2.0,
            provenance="LIVE",
            evidence_count=0,
        )
        db.add(mastery)

    db.commit()
    db.refresh(student)

    return StudentSummarySchema(
        id=student.id,
        user_id=user.id,
        name=user.name,
        email=user.email,
        roll_no=student.roll_no,
        section_id=section.id,
        section_name=section.name,
        created_at=student.created_at.isoformat() if student.created_at else None,
        mastery_avg=55,
        status="DEVELOPING",
        attendance="PRESENT",
    )


def delete_student(student_id: int, db: Session) -> dict:
    """Remove student record from SQLite database and decrement section count."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise NotFoundError(f"Student {student_id} not found in database.")

    section = student.section
    if section and section.enrolled_count > 0:
        section.enrolled_count -= 1

    user_id = student.user_id
    user = student.user

    db.query(Mastery).filter(Mastery.student_id == student.id).delete()
    db.query(Response).filter(Response.student_id == student.id).delete()
    db.query(LearningEvent).filter(LearningEvent.student_id == student.id).delete()

    db.delete(student)
    if user:
        db.delete(user)

    if student_id in STUDENT_ATTENDANCE_STATE:
        del STUDENT_ATTENDANCE_STATE[student_id]

    db.commit()
    return {"success": True, "student_id": student_id, "message": "Student successfully removed from SQL database"}


def mark_student_attendance(student_id: int, status: str, db: Session) -> dict:
    """Mark student attendance as PRESENT or ABSENT."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise NotFoundError(f"Student {student_id} not found.")

    clean_status = status.upper().strip()
    if clean_status not in ("PRESENT", "ABSENT"):
        clean_status = "PRESENT"

    STUDENT_ATTENDANCE_STATE[student_id] = clean_status
    return {"success": True, "student_id": student_id, "status": clean_status}


def list_students(section_id: Optional[int], db: Session) -> List[StudentSummarySchema]:
    """Retrieve students from SQL database with live mastery overview and attendance."""
    query = db.query(Student).join(User, Student.user_id == User.id)
    if section_id:
        query = query.filter(Student.section_id == section_id)
    students = query.order_by(Student.id.desc()).all()

    results = []
    for s in students:
        sec = s.section
        m_records = s.mastery_records
        if m_records:
            avg_mastery = int(sum(m.percent for m in m_records) / len(m_records))
        else:
            avg_mastery = 55
        status_label = "STRONG" if avg_mastery >= 70 else ("WEAK" if avg_mastery < 50 else "DEVELOPING")
        attendance_val = STUDENT_ATTENDANCE_STATE.get(s.id, "PRESENT")

        results.append(
            StudentSummarySchema(
                id=s.id,
                user_id=s.user.id,
                name=s.user.name,
                email=s.user.email,
                roll_no=s.roll_no,
                section_id=s.section_id,
                section_name=sec.name if sec else "5-A",
                created_at=s.created_at.isoformat() if s.created_at else None,
                mastery_avg=avg_mastery,
                status=status_label,
                attendance=attendance_val,
            )
        )
    return results


def list_teachers(db: Session) -> List[TeacherSummarySchema]:
    """Retrieve all faculty teachers from SQLite database."""
    teachers = db.query(Teacher).all()
    results = []
    for t in teachers:
        u = t.user
        sec_names = [s.name for s in t.sections]
        results.append(
            TeacherSummarySchema(
                id=t.id,
                user_id=u.id,
                name=u.name,
                email=u.email,
                department=t.department,
                sections=sec_names,
                created_at=t.created_at.isoformat() if t.created_at else None,
            )
        )
    return results


def create_teacher(data: TeacherCreateRequest, db: Session) -> TeacherSummarySchema:
    """Store new teacher in SQL database (users and teachers tables)."""
    clean_email = data.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise ValidationError(f"User with email '{clean_email}' already exists.")

    user = User(
        name=data.name.strip(),
        email=clean_email,
        role="TEACHER",
    )
    db.add(user)
    db.flush()

    teacher = Teacher(
        user_id=user.id,
        department=data.department or "Computer Science & Engineering",
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return TeacherSummarySchema(
        id=teacher.id,
        user_id=user.id,
        name=user.name,
        email=user.email,
        department=teacher.department,
        sections=[],
        created_at=teacher.created_at.isoformat() if teacher.created_at else None,
    )


def delete_teacher(teacher_id: int, db: Session) -> dict:
    """Remove teacher from SQLite database and detach any sections."""
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise NotFoundError(f"Teacher {teacher_id} not found.")

    total_teachers = db.query(Teacher).count()
    if total_teachers <= 1:
        raise ValidationError("Cannot remove the primary demonstration faculty member.")

    for sec in teacher.sections:
        sec.teacher_id = None

    user = teacher.user
    db.delete(teacher)
    if user:
        db.delete(user)

    db.commit()
    return {"success": True, "teacher_id": teacher_id, "message": "Teacher removed from university records."}


def create_course(data: CourseCreateRequest, db: Session) -> CourseSchema:
    """Add a new course / academic subject to SQLite database."""
    clean_code = data.code.strip().upper()
    existing = db.query(Course).filter(Course.code == clean_code).first()
    if existing:
        raise ValidationError(f"Course code '{clean_code}' already exists.")

    course = Course(
        code=clean_code,
        name=data.name.strip(),
        programme=data.programme or "B.Tech Computer Science & Engineering",
        semester=data.semester or 5,
    )
    db.add(course)
    db.flush()

    # Create default section 5-A for this new subject
    teacher = db.query(Teacher).filter(Teacher.id == data.teacher_id).first() if data.teacher_id else db.query(Teacher).first()
    sec = ClassSection(
        course_id=course.id,
        name="5-A",
        teacher_id=teacher.id if teacher else None,
        enrolled_count=35,
    )
    db.add(sec)

    # Create a foundational default topic
    topic = Topic(
        course_id=course.id,
        seq=1,
        title=f"Module 1: Foundations of {course.name}",
    )
    db.add(topic)
    db.commit()
    db.refresh(course)

    return CourseSchema(
        id=course.id,
        code=course.code,
        name=course.name,
        programme=course.programme,
        semester=course.semester,
        sections=[SectionSummarySchema(id=sec.id, name=sec.name, course_id=course.id, enrolled_count=sec.enrolled_count)],
        topic_count=1,
    )


def delete_course(course_id: int, db: Session) -> dict:
    """Remove a course / subject from SQLite database."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundError(f"Course {course_id} not found.")

    if db.query(Course).count() <= 1:
        raise ValidationError("Cannot remove the primary demonstration course.")

    # Remove child sections, topics, etc.
    for sec in course.sections:
        db.delete(sec)
    for top in course.topics:
        db.delete(top)
    db.delete(course)
    db.commit()
    return {"success": True, "course_id": course_id, "message": "Course successfully removed from university records."}


def create_student_query(data: StudentQueryCreateRequest, claims: dict, db: Session) -> StudentQuerySchema:
    """Create student academic query and simulate dispatch to teacher email."""
    # Lookup teacher email
    teacher_email = data.teacher_email
    if not teacher_email:
        teacher = db.query(Teacher).first()
        teacher_email = teacher.user.email if teacher and teacher.user else "sharma@sgsu.ac.in"

    user_id = claims.get("user_id") or claims.get("sub")
    student = db.query(Student).filter(Student.user_id == user_id).first() if user_id else None

    student_name = student.user.name if student and student.user else "Riya Sharma"
    student_roll = student.roll_no if student else "2024-CSE-5A-01"
    student_id = student.id if student else None

    query = StudentQuery(
        student_id=student_id,
        student_name=student_name,
        student_roll=student_roll,
        teacher_email=teacher_email,
        subject=data.subject.strip(),
        question=data.question.strip(),
        priority=data.priority or "NORMAL",
        status="OPEN",
    )
    db.add(query)
    db.commit()
    db.refresh(query)

    return StudentQuerySchema(
        id=query.id,
        student_id=query.student_id,
        student_name=query.student_name,
        student_roll=query.student_roll,
        teacher_email=query.teacher_email,
        subject=query.subject,
        question=query.question,
        priority=query.priority,
        status=query.status,
        reply=query.reply,
        created_at=query.created_at.isoformat() if query.created_at else "",
        replied_at=query.replied_at.isoformat() if query.replied_at else None,
    )


def list_student_queries(teacher_email: Optional[str], student_id: Optional[int], db: Session) -> List[StudentQuerySchema]:
    """Retrieve all student queries submitted to faculty."""
    q = db.query(StudentQuery)
    if teacher_email:
        q = q.filter(StudentQuery.teacher_email == teacher_email)
    if student_id:
        q = q.filter(StudentQuery.student_id == student_id)
    records = q.order_by(StudentQuery.id.desc()).all()

    return [
        StudentQuerySchema(
            id=r.id,
            student_id=r.student_id,
            student_name=r.student_name,
            student_roll=r.student_roll,
            teacher_email=r.teacher_email,
            subject=r.subject,
            question=r.question,
            priority=r.priority,
            status=r.status,
            reply=r.reply,
            created_at=r.created_at.isoformat() if r.created_at else "",
            replied_at=r.replied_at.isoformat() if r.replied_at else None,
        )
        for r in records
    ]


def reply_student_query(query_id: int, reply: str, db: Session) -> StudentQuerySchema:
    """Teacher answers student query, updating status to RESOLVED."""
    query = db.query(StudentQuery).filter(StudentQuery.id == query_id).first()
    if not query:
        raise NotFoundError(f"Student query {query_id} not found.")

    query.reply = reply.strip()
    query.status = "RESOLVED"
    from datetime import datetime, timezone
    query.replied_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(query)

    return StudentQuerySchema(
        id=query.id,
        student_id=query.student_id,
        student_name=query.student_name,
        student_roll=query.student_roll,
        teacher_email=query.teacher_email,
        subject=query.subject,
        question=query.question,
        priority=query.priority,
        status=query.status,
        reply=query.reply,
        created_at=query.created_at.isoformat() if query.created_at else "",
        replied_at=query.replied_at.isoformat() if query.replied_at else None,
    )





