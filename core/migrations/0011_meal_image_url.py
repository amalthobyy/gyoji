from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0010_seed_workouts"),
    ]

    operations = [
        migrations.AddField(
            model_name="meal",
            name="image_url",
            field=models.URLField(blank=True),
        ),
    ]


