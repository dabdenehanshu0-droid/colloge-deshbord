"""Evidence Service: creates and records learning events for student responses."""

import logging
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.models.assessment import Response, Question, QuestionOption
from backend.models.evidence import LearningEvent

logger = logging.getLogger("sgsu.evidence")


def create_learning_event_for_response(
    db: Session,
    resp: Response,
    is_seeded: bool = False,
) -> LearningEvent:
    """Create and persist a LearningEvent associated with an assessment Response."""
    if resp.context == "EXIT_QUIZ":
        weight = settings.W_EXIT_QUIZ
    elif resp.context == "LIVE_POLL":
        weight = settings.W_LIVE_POLL
    elif resp.context == "PRACTICE":
        weight = settings.W_PRACTICE
    else:
        weight = 0.5

    learning_outcome_id = None
    if resp.question and hasattr(resp.question, "learning_outcome_id"):
        learning_outcome_id = resp.question.learning_outcome_id
    elif resp.question_id:
        q = db.query(Question).filter(Question.id == resp.question_id).first()
        if q:
            learning_outcome_id = q.learning_outcome_id

    misconception_id = None
    if resp.option and hasattr(resp.option, "misconception_id") and resp.option.misconception_id:
        misconception_id = resp.option.misconception_id
    elif resp.option_id:
        opt = db.query(QuestionOption).filter(QuestionOption.id == resp.option_id).first()
        if opt and opt.misconception_id:
            misconception_id = opt.misconception_id

    event = LearningEvent(
        student_id=resp.student_id,
        learning_outcome_id=learning_outcome_id,
        question_id=resp.question_id,
        response_id=resp.id,
        score=1.0 if resp.is_correct else 0.0,
        is_correct=bool(resp.is_correct),
        weight=weight,
        source_type=resp.context,
        misconception_id=misconception_id,
        duration_ms=resp.duration_ms,
        is_seeded=is_seeded,
    )
    db.add(event)
    db.flush()
    return event
