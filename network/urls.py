
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("comments/<int:id>", views.get_comments, name="comments"),
    path("add_comment/<int:id>", views.add_comment, name='add_comment'),
    
]
