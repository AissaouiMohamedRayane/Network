# Generated by Django 4.2.7 on 2024-02-11 00:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_comment_poste_delete_post_user_liked_postes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]