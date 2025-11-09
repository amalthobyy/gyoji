from decimal import Decimal

from django.core.files.base import ContentFile
from django.db import migrations


TRAINERS = [
    {
        "username": "arjun.sharma",
        "first_name": "Arjun",
        "last_name": "Sharma",
        "email": "arjun.sharma@example.com",
        "specialization": "Strength Training",
        "experience_years": 8,
        "hourly_rate": Decimal("1200.00"),
        "rating": Decimal("4.9"),
        "certifications": "Certified Strength & Conditioning Specialist (CSCS)\nKettlebell Level 2",
        "bio": "Arjun specialises in powerlifting and corrective strength routines. He has helped over 200 clients build muscle while staying injury free.",
        "color": "#f97316",
        "availability": {
            "monday": ["06:00", "18:00"],
            "wednesday": ["07:00", "19:30"],
            "friday": ["06:30", "17:30"],
        },
    },
    {
        "username": "sneha.iyer",
        "first_name": "Sneha",
        "last_name": "Iyer",
        "email": "sneha.iyer@example.com",
        "specialization": "Cardio & Endurance",
        "experience_years": 6,
        "hourly_rate": Decimal("950.00"),
        "rating": Decimal("4.7"),
        "certifications": "ACE Certified Personal Trainer\nRRCA Distance Running Coach",
        "bio": "Sneha coaches distance runners and triathletes with a focus on sustainable progress and mobility.",
        "color": "#10b981",
        "availability": {
            "tuesday": ["06:00", "19:00"],
            "thursday": ["06:00", "19:00"],
            "saturday": ["08:00", "11:00"],
        },
    },
    {
        "username": "meera.nair",
        "first_name": "Meera",
        "last_name": "Nair",
        "email": "meera.nair@example.com",
        "specialization": "Yoga & Flexibility",
        "experience_years": 10,
        "hourly_rate": Decimal("1100.00"),
        "rating": Decimal("4.8"),
        "certifications": "RYT 500 Yoga Alliance\nPrenatal Yoga Specialist",
        "bio": "Meera blends traditional Hatha yoga with breathwork and mobility drills to help clients feel balanced and pain-free.",
        "color": "#14b8a6",
        "availability": {
            "monday": ["07:30", "20:00"],
            "wednesday": ["07:30", "20:00"],
            "sunday": ["09:00", "11:00"],
        },
    },
    {
        "username": "kabir.singh",
        "first_name": "Kabir",
        "last_name": "Singh",
        "email": "kabir.singh@example.com",
        "specialization": "Strength Training",
        "experience_years": 5,
        "hourly_rate": Decimal("900.00"),
        "rating": Decimal("4.6"),
        "certifications": "ISSA Certified Trainer\nCrossFit Level 1",
        "bio": "Kabir helps young professionals build lean muscle with hybrid functional training routines that fit busy schedules.",
        "color": "#6366f1",
        "availability": {
            "tuesday": ["07:00", "18:30"],
            "thursday": ["07:00", "18:30"],
            "saturday": ["08:30", "12:00"],
        },
    },
    {
        "username": "priya.verma",
        "first_name": "Priya",
        "last_name": "Verma",
        "email": "priya.verma@example.com",
        "specialization": "Cardio & Endurance",
        "experience_years": 7,
        "hourly_rate": Decimal("1000.00"),
        "rating": Decimal("4.8"),
        "certifications": "ACSM Certified Trainer\nPrecision Nutrition Level 1",
        "bio": "Priya trains working mothers and recreational runners, combining interval work with tailored nutrition habits.",
        "color": "#f59e0b",
        "availability": {
            "monday": ["06:30", "19:30"],
            "wednesday": ["06:30", "19:30"],
            "saturday": ["07:30", "10:30"],
        },
    },
    {
        "username": "ananya.desai",
        "first_name": "Ananya",
        "last_name": "Desai",
        "email": "ananya.desai@example.com",
        "specialization": "Yoga & Flexibility",
        "experience_years": 4,
        "hourly_rate": Decimal("850.00"),
        "rating": Decimal("4.5"),
        "certifications": "Iyengar Yoga Teacher Training\nPilates Mat Instructor",
        "bio": "Ananya guides beginners into yoga with mindful sequencing, posture correction, and calming breath sessions.",
        "color": "#ec4899",
        "availability": {
            "tuesday": ["07:30", "20:00"],
            "thursday": ["07:30", "20:00"],
            "sunday": ["08:30", "10:30"],
        },
    },
]


def _build_svg(name: str, color: str) -> bytes:
    initials = "".join(part[0] for part in name.split()[:2]).upper()
    svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="48" fill="url(#grad)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="110" font-weight="700">{initials}</text>
</svg>
""".strip()
    return svg.encode("utf-8")


def seed_trainers(apps, schema_editor):
    User = apps.get_model("core", "User")
    Trainer = apps.get_model("core", "Trainer")
    TrainerProfile = apps.get_model("core", "TrainerProfile")

    for data in TRAINERS:
        if User.objects.filter(username=data["username"]).exists():
            continue

        user = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password="trainer123",
            first_name=data["first_name"],
            last_name=data["last_name"],
            role="trainer",
        )
        user.bio = data["bio"]
        full_name = f"{data['first_name']} {data['last_name']}"
        svg_bytes = _build_svg(full_name, data["color"])
        user.profile_picture.save(f"{data['username']}.svg", ContentFile(svg_bytes), save=True)
        user.save()

        Trainer.objects.create(
            user=user,
            specialization=data["specialization"],
            experience_years=data["experience_years"],
            hourly_rate=data["hourly_rate"],
            certifications=data["certifications"],
            rating=data["rating"],
        )
        TrainerProfile.objects.update_or_create(
            user=user,
            defaults={
                "specialization": data["specialization"],
                "certifications": data["certifications"],
                "bio": data["bio"],
                "rating": data["rating"],
                "availability_schedule": data["availability"],
            },
        )


def remove_trainers(apps, schema_editor):
    User = apps.get_model("core", "User")
    usernames = [data["username"] for data in TRAINERS]
    User.objects.filter(username__in=usernames).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0012_seed_diet_plans"),
    ]

    operations = [
        migrations.RunPython(seed_trainers, remove_trainers),
    ]


