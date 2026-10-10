"""Curriculum schemas: courses, sections, topics, outcomes, sources."""

from typing import List, Optional
from pydantic import BaseModel, Field


class OutcomeSchema(BaseModel):
    id: int
    code: str
    statement: str
    kind: str = "OUTCOME"  # OUTCOME | PREREQUISITE
    prerequisite_ids: List[int] = Field(default_factory=list)


class SectionSummarySchema(BaseModel):
    id: int
    name: str
    course_id: Optional[int] = None
    enrolled_count: int = 57


class TopicSummarySchema(BaseModel):
    id: int
    seq: int
    title: str
    outcome_count: int = 0


class CourseSchema(BaseModel):
    id: int
    code: str
    name: str
    programme: str
    semester: int
    sections: List[SectionSummarySchema] = Field(default_factory=list)
    topic_count: int = 1


class CourseDetailSchema(CourseSchema):
    topics: List[TopicSummarySchema] = Field(default_factory=list)


class TopicDetailSchema(BaseModel):
    id: int
    title: str
    course_id: int
    outcomes: List[OutcomeSchema] = Field(default_factory=list)
    prerequisites: List[OutcomeSchema] = Field(default_factory=list)


class SourceSchema(BaseModel):
    id: int
    title: str
    citation: str
    approved: bool = True
    content_length: Optional[int] = 0


class StudentCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    roll_no: str = Field(..., min_length=2, max_length=50)
    section_id: int


class StudentSummarySchema(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    roll_no: str
    section_id: int
    section_name: Optional[str] = "5-A"
    created_at: Optional[str] = None
    mastery_avg: Optional[int] = 50
    status: Optional[str] = "DEVELOPING"
    attendance: Optional[str] = "PRESENT"


class StudentAttendanceRequest(BaseModel):
    student_id: int
    status: str = "PRESENT"  # PRESENT | ABSENT


class TeacherCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    department: Optional[str] = "Computer Science & Engineering"


class TeacherSummarySchema(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    department: str
    sections: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None


class CourseCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=3, max_length=150)
    programme: Optional[str] = "B.Tech Computer Science & Engineering"
    semester: Optional[int] = 5
    department: Optional[str] = "Computer Science & Engineering"
    teacher_id: Optional[int] = None


class StudentQueryCreateRequest(BaseModel):
    subject: str = Field(..., min_length=2, max_length=200)
    question: str = Field(..., min_length=5)
    teacher_email: Optional[str] = None
    priority: Optional[str] = "NORMAL"


class StudentQueryReplyRequest(BaseModel):
    reply: str = Field(..., min_length=2)


class StudentQuerySchema(BaseModel):
    id: int
    student_id: Optional[int] = None
    student_name: str
    student_roll: str
    teacher_email: str
    subject: str
    question: str
    priority: str
    status: str
    reply: Optional[str] = None
    created_at: str
    replied_at: Optional[str] = None



