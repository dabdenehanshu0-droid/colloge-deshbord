"""AI Academic Assistant Service for Teachers and Students."""

import re
from typing import List, Tuple
from sqlalchemy.orm import Session
from backend.schemas.intelligence import AIAssistantResponse

# Grounded Knowledge snippets for Neural Networks & Academic Operations
KNOWLEDGE_BASE = {
    "backprop": (
        "Backpropagation applies the multivariate calculus chain rule to compute gradients "
        "of the loss function with respect to every weight (∂L/∂W = ∂L/∂a · ∂a/∂z · ∂z/∂W). "
        "These gradients allow gradient descent optimizers (like Adam or SGD) to update the weights in reverse order."
    ),
    "activation": (
        "Activation functions introduce non-linearity into neural networks, enabling them to learn complex decision boundaries. "
        "Common types: ReLU (max(0, x), avoids vanishing gradient in deep layers), Sigmoid (maps values to (0,1), used in binary classification), "
        "and Softmax (normalizes layer logits into class probability distributions)."
    ),
    "gradient_descent": (
        "Gradient Descent iteratively adjusts network parameters in the opposite direction of the loss gradient: "
        "W_new = W_old - η · ∇L(W), where η is the learning rate. A rate that is too high causes oscillation/divergence; "
        "too low causes painfully slow convergence."
    ),
    "loss": (
        "Loss functions quantify the disparity between model predictions (ŷ) and ground truth labels (y). "
        "Regression uses Mean Squared Error (MSE), whereas Multi-class classification uses Categorical Cross-Entropy: "
        "L = -∑ yᵢ · log(ŷᵢ)."
    ),
    "matrix": (
        "During forward propagation, z = W · x + b. In backpropagation, the gradient with respect to input activations is "
        "computed via transposition: ∂L/∂x = Wᵀ · (∂L/∂z). Maintaining correct matrix dimensions (e.g., [batch, hidden]) "
        "is critical to avoid shape mismatches."
    ),
    "qr_class": (
        "To start an online class session with QR:\n"
        "1. Open Smart Classroom from Teacher portal.\n"
        "2. The interactive QR code is live for Session #101.\n"
        "3. Students can scan the QR on phone or click 'Start / Join Online Class' to join synchronized live slides.\n"
        "4. Teacher controls slides, concept polls, and exit quiz."
    ),
    "add_student": (
        "To add a new student:\n"
        "1. Go to 'My Courses' or 'Student Directory' in the Teacher portal.\n"
        "2. Click '+ Add Student'.\n"
        "3. Enter Full Name, Official Roll Number, Email, and Section (5-A or 5-B).\n"
        "4. Click 'Save to Database' — the student is immediately stored in SQL with live mastery tracking initialized."
    ),
    "quiz_help": (
        "Formative Quiz Recommendation on LO4 Backpropagation:\n"
        "• Question 1: What does the chain rule term ∂a/∂z represent? (Answer: Derivative of activation function)\n"
        "• Question 2: Why do we multiply by Wᵀ during backpropagation? (Answer: To project errors back to preceding layer)\n"
        "• Question 3: What is the gradient vanishing problem in deep Sigmoid networks? (Answer: Derivatives approach 0 for large inputs)"
    ),
    "remedial_help": (
        "10-Minute Remedial Action for Section 5-A:\n"
        "1. Re-derive 1-layer gradient on the whiteboard (3 mins).\n"
        "2. Step-by-step numeric trace with 2 weights and 1 bias (4 mins).\n"
        "3. Paired-concept check with active student feedback (3 mins)."
    ),
}


def process_assistant_query(
    message: str,
    role: str = "STUDENT",
    context: str = None,
    db: Session = None,
) -> AIAssistantResponse:
    """Generate role-aware, grounded assistant response with actionable suggestions."""
    msg_lower = message.lower()
    norm_role = (role or "STUDENT").upper()

    if norm_role == "TEACHER":
        # Teacher assistance logic
        if any(w in msg_lower for w in ["student", "add", "enroll", "banao", "daal", "bachha"]):
            reply = (
                "Students can be enrolled directly via the Teacher portal. Use the 'Add Student' form to enter "
                "the student's Name, Roll Number, Email, and Section. Once submitted, the record is immediately "
                "stored in the SQL database, and baseline mastery is initialized for LO1–LO4."
            )
            suggestions = [
                "Show enrolled students in Section 5-A",
                "How to bulk add students?",
                "View class mastery analytics",
            ]
        elif any(w in msg_lower for w in ["qr", "online class", "classroom", "live", "start"]):
            reply = (
                "You can initiate the Online Class right from the Smart Classroom. The platform provides a dynamic "
                "QR code that students can scan from mobile or desktop to join instantly. You can launch slides, "
                "trigger live concept polls, and open the exit quiz when ready."
            )
            suggestions = [
                "Start online class with QR now",
                "How to launch live concept poll?",
                "Push in-class prompt to students",
            ]
        elif any(w in msg_lower for w in ["quiz", "test", "question", "assessment"]):
            reply = KNOWLEDGE_BASE["quiz_help"]
            suggestions = [
                "Launch Exit Quiz on Section 5-A",
                "Show question difficulty statistics",
                "Suggest 10-minute remedial segment",
            ]
        elif any(w in msg_lower for w in ["remedial", "weak", "reteach", "support", "help student"]):
            reply = KNOWLEDGE_BASE["remedial_help"]
            suggestions = [
                "Generate automated re-teach slides",
                "Assign practice set to weak cohort",
                "View LO4 gap breakdown",
            ]
        else:
            reply = (
                f"Hello Professor! I am your AI Teaching Assistant for SGSU. I can help you add students to your class, "
                f"launch online classes with the interactive QR code, draft formative quizzes, or formulate remedial strategies for Section 5-A."
            )
            suggestions = [
                "How to add students to Section 5-A?",
                "Start Online Class via QR code",
                "Draft 3 formative quiz questions on LO4",
                "Remedial teaching tips for backpropagation",
            ]

    else:
        # Student assistance logic
        if any(w in msg_lower for w in ["backprop", "chain rule", "gradient", "weight", "derive"]):
            reply = KNOWLEDGE_BASE["backprop"]
            suggestions = [
                "Why do we multiply by Wᵀ (transpose)?",
                "What is the gradient vanishing problem?",
                "Give me a step-by-step practice problem",
            ]
        elif any(w in msg_lower for w in ["activation", "relu", "sigmoid", "softmax"]):
            reply = KNOWLEDGE_BASE["activation"]
            suggestions = [
                "Why is ReLU preferred over Sigmoid in hidden layers?",
                "Explain the Softmax formula for multi-class classification",
                "What does dying ReLU mean?",
            ]
        elif any(w in msg_lower for w in ["matrix", "transpose", "dimension", "shape"]):
            reply = KNOWLEDGE_BASE["matrix"]
            suggestions = [
                "Show sample matrix multiplication in forward pass",
                "How does the chain rule apply to matrix equations?",
            ]
        elif any(w in msg_lower for w in ["loss", "cost", "mse", "cross-entropy"]):
            reply = KNOWLEDGE_BASE["loss"]
            suggestions = [
                "When should I use Cross-Entropy vs MSE?",
                "Explain gradient descent updates mathematically",
            ]
        elif any(w in msg_lower for w in ["class", "join", "qr", "online"]):
            reply = (
                "You can join the live online lecture by scanning the teacher's QR code or navigating to "
                "'Smart Classroom'. You will automatically see the live slides, be able to participate in real-time "
                "polls, and submit the 5-question exit quiz."
            )
            suggestions = [
                "Open Smart Classroom now",
                "How does the live exit quiz work?",
                "View my personal learning gaps",
            ]
        else:
            reply = (
                "Hello! I am your AI Academic Tutor for CS-501 Neural Networks at SGSU. "
                "Ask me any question about Backpropagation, Gradient Descent, Activation Functions, "
                "or your learning gaps in LO1–LO4!"
            )
            suggestions = [
                "Explain backpropagation simply",
                "Why do we need activation functions?",
                "How does gradient descent update weights?",
                "What is my weakest learning outcome?",
            ]

    return AIAssistantResponse(
        reply=reply,
        suggestions=suggestions,
        role=norm_role,
        mode="LIVE",
    )
