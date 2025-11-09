from django.db import migrations


def seed_workouts(apps, schema_editor):
    WorkoutCategory = apps.get_model("core", "WorkoutCategory")
    Workout = apps.get_model("core", "Workout")

    workout_data = {
        "Strength Training": [
            {
                "title": "Upper Body Power",
                "description": "Challenging upper body session focused on push and pull strength with dumbbells.",
                "difficulty_level": "intermediate",
                "duration": 45,
                "calories_burned": 420,
                "equipment_needed": "Dumbbells, Bench",
                "video_url": "https://www.youtube.com/watch?v=I9nG-G4B5Bs",
                "exercises_list": [
                    "Incline Dumbbell Press",
                    "Bent Over Row",
                    "Seated Shoulder Press",
                    "Hammer Curl",
                    "Triceps Kickback",
                ],
            },
            {
                "title": "Strength & Conditioning Circuit",
                "description": "Total body conditioning circuit alternating strength and power movements.",
                "difficulty_level": "advanced",
                "duration": 40,
                "calories_burned": 520,
                "equipment_needed": "Kettlebell, Dumbbells, Mat",
                "video_url": "https://www.youtube.com/watch?v=UItWltVZZmE",
                "exercises_list": [
                    "Kettlebell Swings",
                    "Goblet Squats",
                    "Renegade Rows",
                    "Alternating Press",
                    "Plank Pull Through",
                ],
            },
            {
                "title": "Dumbbell Strength Foundations",
                "description": "Beginner friendly strength workout to master compound lifts and form.",
                "difficulty_level": "beginner",
                "duration": 35,
                "calories_burned": 320,
                "equipment_needed": "Light Dumbbells",
                "video_url": "https://www.youtube.com/watch?v=0JfYxMRsUCQ",
                "exercises_list": [
                    "Squat to Press",
                    "Reverse Lunge",
                    "Single Arm Row",
                    "Floor Press",
                    "Dead Bug Hold",
                ],
            },
        ],
        "Cardio": [
            {
                "title": "HIIT Cardio Burn",
                "description": "High intensity interval workout alternating plyometrics and active recovery.",
                "difficulty_level": "advanced",
                "duration": 30,
                "calories_burned": 480,
                "equipment_needed": "Bodyweight, Mat",
                "video_url": "https://www.youtube.com/watch?v=ml6cT4AZdqI",
                "exercises_list": [
                    "High Knees",
                    "Burpees",
                    "Mountain Climbers",
                    "Skater Jumps",
                    "Jump Squats",
                ],
            },
            {
                "title": "Low Impact Cardio Flow",
                "description": "Joint friendly cardio sequence with steady pace to build endurance.",
                "difficulty_level": "beginner",
                "duration": 28,
                "calories_burned": 260,
                "equipment_needed": "Bodyweight",
                "video_url": "https://www.youtube.com/watch?v=6EAdt0O7YjA",
                "exercises_list": [
                    "March & Reach",
                    "Side Step Punch",
                    "Hamstring Curl",
                    "Low Jack",
                    "Standing Crunch",
                ],
            },
            {
                "title": "Cardio Core Combo",
                "description": "Blend of core strength and cardio bursts to keep heart rate elevated.",
                "difficulty_level": "intermediate",
                "duration": 32,
                "calories_burned": 360,
                "equipment_needed": "Bodyweight, Mat",
                "video_url": "https://www.youtube.com/watch?v=s3F6R92s6_o",
                "exercises_list": [
                    "Plank Jacks",
                    "Russian Twist",
                    "Squat Reach",
                    "Mountain Climbers",
                    "Alternating Toe Touch",
                ],
            },
        ],
        "Flexibility": [
            {
                "title": "Full Body Mobility Reset",
                "description": "Gentle mobility sequence focusing on neck, shoulders, hips and ankles.",
                "difficulty_level": "beginner",
                "duration": 20,
                "calories_burned": 120,
                "equipment_needed": "Yoga Mat",
                "video_url": "https://www.youtube.com/watch?v=v7AYKMP6rOE",
                "exercises_list": [
                    "Cat Cow Stretch",
                    "World's Greatest Stretch",
                    "Hip Circles",
                    "Thread the Needle",
                    "Ankle Rolls",
                ],
            },
            {
                "title": "Athletic Stretch Flow",
                "description": "Dynamic flexibility routine ideal for post-strength sessions.",
                "difficulty_level": "intermediate",
                "duration": 25,
                "calories_burned": 180,
                "equipment_needed": "Yoga Mat, Strap (optional)",
                "video_url": "https://www.youtube.com/watch?v=VaoV1PrYft4",
                "exercises_list": [
                    "Walking Lunges",
                    "Hamstring Sweep",
                    "Spinal Twist",
                    "Deep Squat Hold",
                    "Shoulder Opener",
                ],
            },
            {
                "title": "Evening Recovery Stretch",
                "description": "Slow-paced sessions to unwind, improve flexibility and promote relaxation.",
                "difficulty_level": "beginner",
                "duration": 18,
                "calories_burned": 100,
                "equipment_needed": "Yoga Mat, Cushion",
                "video_url": "https://www.youtube.com/watch?v=4pKly2JojMw",
                "exercises_list": [
                    "Child's Pose",
                    "Seated Forward Fold",
                    "Supine Twist",
                    "Figure Four Stretch",
                    "Happy Baby",
                ],
            },
        ],
    }

    for category_name, workouts in workout_data.items():
        category, _ = WorkoutCategory.objects.get_or_create(name=category_name)
        for entry in workouts:
            Workout.objects.update_or_create(
                title=entry["title"],
                defaults={
                    "description": entry["description"],
                    "category": category,
                    "difficulty_level": entry["difficulty_level"],
                    "duration": entry["duration"],
                    "calories_burned": entry["calories_burned"],
                    "equipment_needed": entry["equipment_needed"],
                    "video_url": entry["video_url"],
                    "exercises_list": entry["exercises_list"],
                },
            )


def remove_seeded_workouts(apps, schema_editor):
    Workout = apps.get_model("core", "Workout")
    titles = [
        "Upper Body Power",
        "Strength & Conditioning Circuit",
        "Dumbbell Strength Foundations",
        "HIIT Cardio Burn",
        "Low Impact Cardio Flow",
        "Cardio Core Combo",
        "Full Body Mobility Reset",
        "Athletic Stretch Flow",
        "Evening Recovery Stretch",
    ]
    Workout.objects.filter(title__in=titles).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_trainerhiring_time_slot"),
    ]

    operations = [
        migrations.RunPython(seed_workouts, remove_seeded_workouts),
    ]


