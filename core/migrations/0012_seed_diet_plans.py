from django.db import migrations


def seed_diet_plans(apps, schema_editor):
    DietPlan = apps.get_model("core", "DietPlan")
    Meal = apps.get_model("core", "Meal")

    plans = [
        {
            "name": "Lean Cut Plan",
            "goal_type": "weight_loss",
            "daily_calories": 1600,
            "meals": [
                {
                    "meal_type": "breakfast",
                    "name": "Greek Yogurt Bowl",
                    "calories": 350,
                    "protein": 28,
                    "carbs": 42,
                    "fat": 8,
                    "ingredients": ["Greek Yogurt", "Blueberries", "Almonds", "Honey"],
                    "image_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
                },
                {
                    "meal_type": "lunch",
                    "name": "Grilled Chicken & Quinoa",
                    "calories": 450,
                    "protein": 45,
                    "carbs": 40,
                    "fat": 12,
                    "ingredients": ["Grilled Chicken", "Quinoa", "Broccoli", "Olive Oil"],
                    "image_url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop",
                },
                {
                    "meal_type": "dinner",
                    "name": "Salmon & Veggies",
                    "calories": 400,
                    "protein": 35,
                    "carbs": 28,
                    "fat": 14,
                    "ingredients": ["Salmon", "Asparagus", "Sweet Potato", "Lemon"],
                    "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
                },
            ],
        },
        {
            "name": "Muscle Gain Fuel",
            "goal_type": "muscle_gain",
            "daily_calories": 2400,
            "meals": [
                {
                    "meal_type": "breakfast",
                    "name": "Protein Oatmeal Stack",
                    "calories": 500,
                    "protein": 35,
                    "carbs": 55,
                    "fat": 12,
                    "ingredients": ["Oats", "Protein Powder", "Banana", "Peanut Butter"],
                    "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
                },
                {
                    "meal_type": "lunch",
                    "name": "Steak Buddha Bowl",
                    "calories": 650,
                    "protein": 48,
                    "carbs": 50,
                    "fat": 24,
                    "ingredients": ["Sirloin Steak", "Brown Rice", "Avocado", "Spinach"],
                    "image_url": "https://images.unsplash.com/photo-1481931098730-318b6f776db0?q=80&w=1200&auto=format&fit=crop",
                },
                {
                    "meal_type": "dinner",
                    "name": "Pasta Primavera",
                    "calories": 620,
                    "protein": 38,
                    "carbs": 70,
                    "fat": 18,
                    "ingredients": ["Whole Grain Pasta", "Turkey Meatballs", "Tomato Sauce", "Zucchini"],
                    "image_url": "https://images.unsplash.com/photo-1514516345957-556ca7d90a5a?q=80&w=1200&auto=format&fit=crop",
                },
            ],
        },
    ]

    for plan_data in plans:
        plan, _ = DietPlan.objects.get_or_create(
            name=plan_data["name"],
            defaults={
                "goal_type": plan_data["goal_type"],
                "daily_calories": plan_data["daily_calories"],
                "meals_per_day": len(plan_data["meals"]),
            },
        )
        for meal_data in plan_data["meals"]:
            Meal.objects.update_or_create(
                diet_plan=plan,
                meal_type=meal_data["meal_type"],
                defaults={
                    "name": meal_data["name"],
                    "calories": meal_data["calories"],
                    "protein": meal_data["protein"],
                    "carbs": meal_data["carbs"],
                    "fat": meal_data["fat"],
                    "ingredients": meal_data["ingredients"],
                    "image_url": meal_data["image_url"],
                },
            )


def remove_diet_plans(apps, schema_editor):
    DietPlan = apps.get_model("core", "DietPlan")
    Meal = apps.get_model("core", "Meal")
    plan_names = ["Lean Cut Plan", "Muscle Gain Fuel"]
    Meal.objects.filter(diet_plan__name__in=plan_names).delete()
    DietPlan.objects.filter(name__in=plan_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0011_meal_image_url"),
    ]

    operations = [
        migrations.RunPython(seed_diet_plans, remove_diet_plans),
    ]


