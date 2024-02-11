from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=20,)
    liked_postes=models.ManyToManyField('Post',related_name='liking_users', blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def __str__(self):
        return self.username

def get_current_time():
    return timezone.now().time()
class Post(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name="post")
    text=models.CharField(max_length=1000)
    likes=models.IntegerField(default=0)
    date=models.DateField(default=timezone.now)
    time=models.TimeField(default=get_current_time)
    def __str__(self):
        return f"{self.user}: {self.text}"

class Comment(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_user')
    text=models.CharField( max_length=1000)
    post=models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comment_post', default=1)
    likes=models.IntegerField(default=0)
    replies=models.ManyToManyField('self', blank=True)
    def serialize(self):
        serialized_replies = [reply.serialize() for reply in self.replies.all()]
        return {
            "username": self.user.username,
            "text": self.text,
            "likes": self.likes,
            "replies": serialized_replies
        }
    def __str__(self):
        return f"{self.text}"