"""Tests for student management in SQL and role-aware AI Assistant."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_teacher_add_student_sql(client: AsyncClient, teacher_auth):
    """Verify teacher can add student, persists in SQLite, and assigns default mastery."""
    payload = {
        "name": "Karan Malhotra",
        "email": "karan.malhotra@sgsu.edu.in",
        "roll_no": "0101CS221999",
        "section_id": 1,
    }

    # Add student
    res = await client.post("/api/students", json=payload, headers=teacher_auth)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Karan Malhotra"
    assert data["email"] == "karan.malhotra@sgsu.edu.in"
    assert data["roll_no"] == "0101CS221999"
    assert data["section_id"] == 1
    assert data["status"] == "DEVELOPING"
    assert data["mastery_avg"] == 55

    # Verify duplicate email rejected
    dup_res = await client.post("/api/students", json=payload, headers=teacher_auth)
    assert dup_res.status_code == 422

    # Query list
    list_res = await client.get("/api/students?section_id=1", headers=teacher_auth)
    assert list_res.status_code == 200
    students = list_res.json()
    assert any(s["email"] == "karan.malhotra@sgsu.edu.in" for s in students)


@pytest.mark.asyncio
async def test_ai_assistant_teacher_and_student(client: AsyncClient, teacher_auth, student_auth):
    """Verify AI Assistant answers role-specific queries for teacher and student."""
    # Teacher query
    t_res = await client.post(
        "/api/ai/assistant",
        json={"message": "How do I add a new student?", "role": "TEACHER"},
        headers=teacher_auth,
    )
    assert t_res.status_code == 200
    t_data = t_res.json()
    assert "Add Student" in t_data["reply"] or "student" in t_data["reply"].lower()
    assert len(t_data["suggestions"]) > 0

    # Student query
    s_res = await client.post(
        "/api/ai/assistant",
        json={"message": "Explain backpropagation in neural networks", "role": "STUDENT"},
        headers=student_auth,
    )
    assert s_res.status_code == 200
    s_data = s_res.json()
    assert "chain rule" in s_data["reply"].lower() or "gradient" in s_data["reply"].lower()
    assert len(s_data["suggestions"]) > 0


@pytest.mark.asyncio
async def test_student_id_login(client: AsyncClient):
    """Verify student can login directly with Roll Number."""
    res = await client.post("/api/auth/student-login", json={"student_id": "2024-CSE-5A-01"})
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "STUDENT"
    assert "access_token" in data


@pytest.mark.asyncio
async def test_student_attendance_and_remove(client: AsyncClient, teacher_auth):
    """Verify marking attendance and removing student."""
    # 1. Create student to delete
    payload = {
        "name": "Temporary Student",
        "email": "temp.student@sgsu.edu.in",
        "roll_no": "TEMP-999",
        "section_id": 1,
    }
    create_res = await client.post("/api/students", json=payload, headers=teacher_auth)
    assert create_res.status_code == 201
    st_id = create_res.json()["id"]

    # 2. Mark attendance
    att_res = await client.post("/api/students/attendance", json={"student_id": st_id, "status": "ABSENT"}, headers=teacher_auth)
    assert att_res.status_code == 200
    assert att_res.json()["status"] == "ABSENT"

    # 3. Delete student
    del_res = await client.delete(f"/api/students/{st_id}", headers=teacher_auth)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True


@pytest.mark.asyncio
async def test_teacher_crud_and_six_sections(client: AsyncClient, admin_auth, teacher_auth):
    """Verify adding/removing teachers and ensuring 6 sections exist."""
    # 1. Ensure 6 sections
    sec_res = await client.get("/api/sections", headers=teacher_auth)
    assert sec_res.status_code == 200
    sec_data = sec_res.json()
    sec_names = [s["name"] for s in sec_data]
    assert all(name in sec_names for name in ["5-A", "5-B", "5-C", "5-D", "5-E", "5-F"])

    # 2. Add teacher
    t_payload = {
        "name": "Dr. Ramesh Verma",
        "email": "ramesh.verma@sgsu.edu.in",
        "department": "Artificial Intelligence",
    }
    t_add = await client.post("/api/teachers", json=t_payload, headers=admin_auth)
    assert t_add.status_code == 201
    t_id = t_add.json()["id"]

    # 3. List teachers
    t_list = await client.get("/api/teachers", headers=admin_auth)
    assert t_list.status_code == 200
    assert any(t["email"] == "ramesh.verma@sgsu.edu.in" for t in t_list.json())

    # 4. Remove teacher
    t_del = await client.delete(f"/api/teachers/{t_id}", headers=admin_auth)
    assert t_del.status_code == 200
    assert t_del.json()["success"] is True

